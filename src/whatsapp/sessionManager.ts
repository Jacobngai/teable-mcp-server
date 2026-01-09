/**
 * WhatsApp Session Manager
 * Manages Baileys WhatsApp sessions for multiple customers
 */

import makeWASocket, {
	useMultiFileAuthState,
	DisconnectReason,
	WASocket,
	ConnectionState,
	AuthenticationState
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

// Session storage directory
const SESSIONS_DIR = process.env.WHATSAPP_SESSIONS_DIR || './whatsapp-sessions';

// Ensure sessions directory exists
if (!fs.existsSync(SESSIONS_DIR)) {
	fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

// Logger
const logger = pino({ level: 'warn' });

// Session state interface
export interface SessionState {
	socket: WASocket | null;
	qrCode: string | null;
	phoneNumber: string | null;
	connected: boolean;
	connecting: boolean;
	lastError: string | null;
	lastConnected: Date | null;
}

// Store active sessions
const sessions = new Map<string, SessionState>();

// Store QR code callbacks for polling
const qrCallbacks = new Map<string, (qr: string) => void>();

// Store connection callbacks
const connectionCallbacks = new Map<string, (connected: boolean, phone?: string) => void>();

/**
 * Initialize session state for a customer
 */
function initSessionState(customerId: string): SessionState {
	const state: SessionState = {
		socket: null,
		qrCode: null,
		phoneNumber: null,
		connected: false,
		connecting: false,
		lastError: null,
		lastConnected: null
	};
	sessions.set(customerId, state);
	return state;
}

/**
 * Get session state for a customer
 */
export function getSessionState(customerId: string): SessionState | undefined {
	return sessions.get(customerId);
}

/**
 * Create or get a WhatsApp session for a customer
 */
export async function createSession(
	customerId: string,
	onQRCode?: (qr: string) => void,
	onConnection?: (connected: boolean, phone?: string) => void
): Promise<SessionState> {
	let state = sessions.get(customerId);

	// Return existing connected session
	if (state?.connected && state.socket) {
		return state;
	}

	// Don't create duplicate connections
	if (state?.connecting) {
		// Register callbacks if provided
		if (onQRCode) qrCallbacks.set(customerId, onQRCode);
		if (onConnection) connectionCallbacks.set(customerId, onConnection);
		return state;
	}

	// Initialize new state
	state = initSessionState(customerId);
	state.connecting = true;

	// Register callbacks
	if (onQRCode) qrCallbacks.set(customerId, onQRCode);
	if (onConnection) connectionCallbacks.set(customerId, onConnection);

	const sessionPath = path.join(SESSIONS_DIR, customerId);

	try {
		// Get auth state
		const { state: authState, saveCreds } = await useMultiFileAuthState(sessionPath);

		// Create socket
		const sock = makeWASocket({
			auth: authState,
			printQRInTerminal: false,
			logger,
			browser: ['Result Marketing AI', 'Chrome', '120.0.0'],
			connectTimeoutMs: 60000,
			defaultQueryTimeoutMs: 60000,
			keepAliveIntervalMs: 30000,
			markOnlineOnConnect: false
		});

		state.socket = sock;

		// Handle credentials update
		sock.ev.on('creds.update', saveCreds);

		// Handle connection updates
		sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
			const { connection, qr, lastDisconnect } = update;

			// QR code received
			if (qr) {
				console.log(`[WhatsApp] QR code generated for customer: ${customerId}`);
				try {
					const qrDataUrl = await QRCode.toDataURL(qr, { width: 256 });
					state!.qrCode = qrDataUrl;

					// Call QR callback if registered
					const callback = qrCallbacks.get(customerId);
					if (callback) callback(qrDataUrl);
				} catch (err) {
					console.error(`[WhatsApp] Failed to generate QR code:`, err);
				}
			}

			// Connection opened
			if (connection === 'open') {
				console.log(`[WhatsApp] Connected for customer: ${customerId}`);
				const phoneNumber = sock.user?.id?.split(':')[0] || sock.user?.id?.split('@')[0];

				state!.connected = true;
				state!.connecting = false;
				state!.phoneNumber = phoneNumber || null;
				state!.qrCode = null;
				state!.lastError = null;
				state!.lastConnected = new Date();

				// Call connection callback
				const callback = connectionCallbacks.get(customerId);
				if (callback) callback(true, phoneNumber);
			}

			// Connection closed
			if (connection === 'close') {
				const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
				const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

				console.log(`[WhatsApp] Connection closed for customer: ${customerId}, code: ${statusCode}, reconnect: ${shouldReconnect}`);

				state!.connected = false;
				state!.connecting = false;

				if (statusCode === DisconnectReason.loggedOut) {
					// User logged out - clear session
					state!.phoneNumber = null;
					state!.lastError = 'Logged out from WhatsApp';

					// Delete session files
					try {
						if (fs.existsSync(sessionPath)) {
							fs.rmSync(sessionPath, { recursive: true });
						}
					} catch (err) {
						console.error(`[WhatsApp] Failed to delete session:`, err);
					}

					// Notify callback
					const callback = connectionCallbacks.get(customerId);
					if (callback) callback(false);
				} else if (shouldReconnect) {
					// Auto-reconnect
					state!.lastError = 'Connection lost, reconnecting...';
					setTimeout(() => {
						createSession(customerId);
					}, 5000);
				}
			}
		});

		return state;
	} catch (error) {
		console.error(`[WhatsApp] Failed to create session for customer: ${customerId}`, error);
		state.connecting = false;
		state.lastError = error instanceof Error ? error.message : 'Unknown error';
		throw error;
	}
}

/**
 * Get connection status for a customer
 */
export function getConnectionStatus(customerId: string): {
	connected: boolean;
	connecting: boolean;
	phoneNumber: string | null;
	qrCode: string | null;
	lastError: string | null;
} {
	const state = sessions.get(customerId);

	if (!state) {
		return {
			connected: false,
			connecting: false,
			phoneNumber: null,
			qrCode: null,
			lastError: null
		};
	}

	return {
		connected: state.connected,
		connecting: state.connecting,
		phoneNumber: state.phoneNumber,
		qrCode: state.qrCode,
		lastError: state.lastError
	};
}

/**
 * Check if a customer's session is connected
 */
export function isConnected(customerId: string): boolean {
	const state = sessions.get(customerId);
	return state?.connected === true && state.socket !== null;
}

/**
 * Get the current QR code for a customer (if pending)
 */
export function getQRCode(customerId: string): string | null {
	const state = sessions.get(customerId);
	return state?.qrCode || null;
}

/**
 * Get the phone number for a connected customer
 */
export function getPhoneNumber(customerId: string): string | null {
	const state = sessions.get(customerId);
	return state?.phoneNumber || null;
}

/**
 * Disconnect and clear a customer's WhatsApp session
 */
export async function disconnectSession(customerId: string): Promise<void> {
	const state = sessions.get(customerId);

	if (state?.socket) {
		try {
			await state.socket.logout();
		} catch (err) {
			console.error(`[WhatsApp] Logout error for ${customerId}:`, err);
		}

		try {
			state.socket.end(undefined);
		} catch (err) {
			// Ignore end errors
		}
	}

	// Clear session data
	const sessionPath = path.join(SESSIONS_DIR, customerId);
	try {
		if (fs.existsSync(sessionPath)) {
			fs.rmSync(sessionPath, { recursive: true });
		}
	} catch (err) {
		console.error(`[WhatsApp] Failed to delete session files:`, err);
	}

	// Clear state
	sessions.delete(customerId);
	qrCallbacks.delete(customerId);
	connectionCallbacks.delete(customerId);

	console.log(`[WhatsApp] Session disconnected and cleared for: ${customerId}`);
}

/**
 * Send a message to a phone number
 */
export async function sendMessage(
	customerId: string,
	phone: string,
	message: string
): Promise<boolean> {
	const state = sessions.get(customerId);

	if (!state?.socket || !state.connected) {
		throw new Error('WhatsApp not connected');
	}

	try {
		// Format phone number as JID
		const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;

		await state.socket.sendMessage(jid, { text: message });
		console.log(`[WhatsApp] Message sent to ${phone} for customer: ${customerId}`);
		return true;
	} catch (error) {
		console.error(`[WhatsApp] Failed to send message:`, error);
		throw error;
	}
}

/**
 * Send a reminder message to self (the connected phone)
 */
export async function sendReminderToSelf(
	customerId: string,
	message: string
): Promise<boolean> {
	const state = sessions.get(customerId);

	if (!state?.socket || !state.connected || !state.phoneNumber) {
		throw new Error('WhatsApp not connected');
	}

	const formattedMessage = `*Reminder*\n\n${message}`;
	return sendMessage(customerId, state.phoneNumber, formattedMessage);
}

/**
 * Restore sessions for customers with WhatsApp enabled
 * Call this on server startup
 */
export async function restoreSessions(customerIds: string[]): Promise<void> {
	console.log(`[WhatsApp] Restoring ${customerIds.length} sessions...`);

	for (const customerId of customerIds) {
		const sessionPath = path.join(SESSIONS_DIR, customerId);

		// Only restore if session files exist
		if (fs.existsSync(sessionPath)) {
			try {
				await createSession(customerId);
				// Small delay between session restores
				await new Promise(resolve => setTimeout(resolve, 2000));
			} catch (err) {
				console.error(`[WhatsApp] Failed to restore session for ${customerId}:`, err);
			}
		}
	}

	console.log(`[WhatsApp] Session restoration complete`);
}

/**
 * Get all active session customer IDs
 */
export function getActiveSessionIds(): string[] {
	const activeIds: string[] = [];
	sessions.forEach((state, customerId) => {
		if (state.connected) {
			activeIds.push(customerId);
		}
	});
	return activeIds;
}

/**
 * Clean up all sessions (for graceful shutdown)
 */
export async function cleanupAllSessions(): Promise<void> {
	console.log(`[WhatsApp] Cleaning up all sessions...`);

	for (const [customerId, state] of sessions) {
		if (state.socket) {
			try {
				state.socket.end(undefined);
			} catch (err) {
				// Ignore errors during cleanup
			}
		}
	}

	sessions.clear();
	qrCallbacks.clear();
	connectionCallbacks.clear();

	console.log(`[WhatsApp] All sessions cleaned up`);
}
