import { WASocket, makeWASocket, useMultiFileAuthState, DisconnectReason, WAMessage } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

export interface AdminSessionState {
    socket: WASocket | null;
    qrCode: string | null;
    phoneNumber: string | null;
    connected: boolean;
    connecting: boolean;
    lastError: string | null;
    lastConnected: Date | null;
    messagesSentToday: number;
    customerCount: number;
}

export interface MessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

class AdminSessionManager {
    private sessionState: AdminSessionState;
    private readonly sessionPath: string;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 5000;

    constructor() {
        this.sessionPath = path.join(process.env.WHATSAPP_ADMIN_SESSION_DIR || './whatsapp-admin-session');
        this.sessionState = {
            socket: null,
            qrCode: null,
            phoneNumber: null,
            connected: false,
            connecting: false,
            lastError: null,
            lastConnected: null,
            messagesSentToday: 0,
            customerCount: 0
        };

        // Ensure session directory exists
        if (!fs.existsSync(this.sessionPath)) {
            fs.mkdirSync(this.sessionPath, { recursive: true });
        }
    }

    public async connect(): Promise<{ success: boolean; qrCode?: string; phone?: string; error?: string }> {
        if (this.sessionState.connected) {
            return { 
                success: true, 
                phone: this.sessionState.phoneNumber || undefined 
            };
        }

        if (this.sessionState.connecting) {
            return { 
                success: true, 
                qrCode: this.sessionState.qrCode || undefined 
            };
        }

        try {
            console.log('[Admin WhatsApp] Starting connection...');
            this.sessionState.connecting = true;
            this.sessionState.lastError = null;

            const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
            
            const socket = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: undefined
            });

            this.sessionState.socket = socket;

            // Handle QR code generation
            socket.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    try {
                        this.sessionState.qrCode = await QRCode.toDataURL(qr);
                        console.log('[Admin WhatsApp] QR code generated');
                    } catch (error) {
                        console.error('[Admin WhatsApp] Failed to generate QR code:', error);
                        this.sessionState.lastError = 'Failed to generate QR code';
                    }
                }

                if (connection === 'close') {
                    this.sessionState.connected = false;
                    this.sessionState.connecting = false;
                    this.sessionState.socket = null;
                    
                    const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    
                    if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
                        console.log(`[Admin WhatsApp] Connection closed, attempting reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
                        this.reconnectAttempts++;
                        
                        setTimeout(() => {
                            this.connect();
                        }, this.reconnectDelay * this.reconnectAttempts);
                    } else {
                        console.log('[Admin WhatsApp] Connection closed, not reconnecting');
                        this.sessionState.lastError = 'Connection lost';
                        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                            this.sessionState.lastError = 'Max reconnection attempts reached';
                        }
                    }
                } else if (connection === 'open') {
                    console.log('[Admin WhatsApp] Connected successfully');
                    this.sessionState.connected = true;
                    this.sessionState.connecting = false;
                    this.sessionState.lastConnected = new Date();
                    this.sessionState.phoneNumber = socket.user?.id?.split(':')[0] || null;
                    this.sessionState.qrCode = null;
                    this.reconnectAttempts = 0;
                }
            });

            socket.ev.on('creds.update', saveCreds);

            // Wait a moment to see if we get QR or connect immediately
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (this.sessionState.connected) {
                return { 
                    success: true, 
                    phone: this.sessionState.phoneNumber || undefined 
                };
            } else if (this.sessionState.qrCode) {
                return { 
                    success: true, 
                    qrCode: this.sessionState.qrCode 
                };
            } else {
                return { 
                    success: false, 
                    error: 'Failed to generate QR code or connect' 
                };
            }

        } catch (error) {
            console.error('[Admin WhatsApp] Connection error:', error);
            this.sessionState.connecting = false;
            this.sessionState.lastError = error instanceof Error ? error.message : 'Unknown error';
            return { 
                success: false, 
                error: this.sessionState.lastError 
            };
        }
    }

    public async disconnect(): Promise<{ success: boolean; error?: string }> {
        try {
            if (this.sessionState.socket) {
                await this.sessionState.socket.logout();
                this.sessionState.socket = null;
            }

            // Clean up session files
            if (fs.existsSync(this.sessionPath)) {
                fs.rmSync(this.sessionPath, { recursive: true });
            }

            this.sessionState = {
                socket: null,
                qrCode: null,
                phoneNumber: null,
                connected: false,
                connecting: false,
                lastError: null,
                lastConnected: null,
                messagesSentToday: 0,
                customerCount: 0
            };

            console.log('[Admin WhatsApp] Disconnected and cleaned up');
            return { success: true };

        } catch (error) {
            console.error('[Admin WhatsApp] Disconnect error:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }

    public async sendMessage(phoneNumber: string, message: string): Promise<MessageResult> {
        if (!this.sessionState.connected || !this.sessionState.socket) {
            return { success: false, error: 'WhatsApp not connected' };
        }

        try {
            // Format phone number for WhatsApp
            const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
            const whatsappId = `${formattedNumber}@s.whatsapp.net`;

            const result = await this.sessionState.socket.sendMessage(whatsappId, { 
                text: message 
            });

            this.sessionState.messagesSentToday++;
            
            return { 
                success: true, 
                messageId: result?.key?.id || undefined
            };

        } catch (error) {
            console.error('[Admin WhatsApp] Send message error:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            };
        }
    }

    public getStatus(): AdminSessionState {
        return { ...this.sessionState };
    }

    public getCurrentQR(): string | null {
        return this.sessionState.qrCode;
    }

    public updateStats(customerCount: number) {
        this.sessionState.customerCount = customerCount;
    }

    public resetDailyStats() {
        this.sessionState.messagesSentToday = 0;
    }
}

// Export singleton instance
export const adminSessionManager = new AdminSessionManager();