/**
 * WhatsApp Reminder Service
 * Handles finding and processing reminders from Teable databases
 */

import { decryptToken } from '../encryption.js';
import { sendReminderToSelf, isConnected } from './sessionManager.js';

// Teable API base URL (default)
const DEFAULT_TEABLE_URL = 'https://table.resultmarketing.asia';

// Expected field names in Reminders table
const FIELD_MESSAGE = 'Message';
const FIELD_DATE = 'Date';
const FIELD_TIME = 'Time';
const FIELD_STATUS = 'Status';
const FIELD_SENT_AT = 'Sent_At';

// Status values
const STATUS_PENDING = 'Pending';
const STATUS_SENT = 'Sent';
const STATUS_FAILED = 'Failed';

/**
 * Interface for a Teable customer with WhatsApp enabled
 */
export interface WhatsAppCustomer {
	id: string;
	mcp_key: string;
	email: string;
	encrypted_token: string;
	teable_base_url: string;
	whatsapp_connected: boolean;
	whatsapp_phone: string | null;
	reminder_enabled: boolean;
}

/**
 * Interface for a reminder record
 */
export interface ReminderRecord {
	id: string;
	fields: {
		[FIELD_MESSAGE]?: string;
		[FIELD_DATE]?: string;
		[FIELD_TIME]?: string;
		[FIELD_STATUS]?: string;
		[FIELD_SENT_AT]?: string;
	};
}

/**
 * Make an authenticated request to Teable API
 */
async function teableRequest(
	baseUrl: string,
	accessToken: string,
	endpoint: string,
	options: RequestInit = {}
): Promise<any> {
	const url = `${baseUrl}/api${endpoint}`;

	const response = await fetch(url, {
		...options,
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
			...options.headers
		}
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`Teable API error: ${response.status} - ${error}`);
	}

	return response.json();
}

/**
 * Find the "Reminders" table in a customer's Teable base
 */
export async function findRemindersTable(
	baseUrl: string,
	accessToken: string
): Promise<{ tableId: string; baseId: string } | null> {
	try {
		// Get all spaces
		const spaces = await teableRequest(baseUrl, accessToken, '/space');

		if (!spaces || !Array.isArray(spaces) || spaces.length === 0) {
			console.log('[Reminders] No spaces found');
			return null;
		}

		// Search through each space for a "Reminders" table
		for (const space of spaces) {
			// Get bases in this space
			const basesResponse = await teableRequest(baseUrl, accessToken, `/space/${space.id}/base`);
			const bases = basesResponse?.bases || basesResponse || [];

			if (!Array.isArray(bases)) continue;

			for (const base of bases) {
				// Get tables in this base
				const tablesResponse = await teableRequest(baseUrl, accessToken, `/base/${base.id}/table`);
				const tables = tablesResponse?.tables || tablesResponse || [];

				if (!Array.isArray(tables)) continue;

				// Look for "Reminders" table
				const remindersTable = tables.find(
					(t: any) => t.name?.toLowerCase() === 'reminders'
				);

				if (remindersTable) {
					console.log(`[Reminders] Found Reminders table: ${remindersTable.id} in base: ${base.id}`);
					return {
						tableId: remindersTable.id,
						baseId: base.id
					};
				}
			}
		}

		console.log('[Reminders] No Reminders table found');
		return null;
	} catch (error) {
		console.error('[Reminders] Error finding Reminders table:', error);
		return null;
	}
}

/**
 * Validate that the Reminders table has the required fields
 */
export async function validateRemindersTable(
	baseUrl: string,
	accessToken: string,
	tableId: string
): Promise<{ valid: boolean; missingFields: string[] }> {
	try {
		const table = await teableRequest(baseUrl, accessToken, `/table/${tableId}`);
		const fields = table?.fields || [];

		const requiredFields = [FIELD_MESSAGE, FIELD_DATE, FIELD_TIME, FIELD_STATUS];
		const fieldNames = fields.map((f: any) => f.name);

		const missingFields = requiredFields.filter(
			required => !fieldNames.some((name: string) => name.toLowerCase() === required.toLowerCase())
		);

		return {
			valid: missingFields.length === 0,
			missingFields
		};
	} catch (error) {
		console.error('[Reminders] Error validating table:', error);
		return { valid: false, missingFields: ['Unable to validate'] };
	}
}

/**
 * Get due reminders from a table
 * Due = Date <= today AND Time <= current hour AND Status = Pending
 */
export async function getDueReminders(
	baseUrl: string,
	accessToken: string,
	tableId: string
): Promise<ReminderRecord[]> {
	try {
		const now = new Date();
		const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
		const currentHour = now.getHours().toString().padStart(2, '0') + ':00';

		// Build filter for due reminders
		// Note: Teable filter syntax may vary - adjust as needed
		const filter = JSON.stringify({
			conjunction: 'and',
			filterSet: [
				{
					fieldId: FIELD_DATE,
					operator: 'isLessEqual',
					value: today
				},
				{
					fieldId: FIELD_TIME,
					operator: 'isLessEqual',
					value: currentHour
				},
				{
					fieldId: FIELD_STATUS,
					operator: 'is',
					value: STATUS_PENDING
				}
			]
		});

		const response = await teableRequest(
			baseUrl,
			accessToken,
			`/table/${tableId}/record?filter=${encodeURIComponent(filter)}&maxRecords=50`
		);

		const records = response?.records || [];
		console.log(`[Reminders] Found ${records.length} due reminders`);

		return records;
	} catch (error) {
		console.error('[Reminders] Error getting due reminders:', error);
		return [];
	}
}

/**
 * Get pending reminders count
 */
export async function getPendingRemindersCount(
	baseUrl: string,
	accessToken: string,
	tableId: string
): Promise<number> {
	try {
		const filter = JSON.stringify({
			conjunction: 'and',
			filterSet: [
				{
					fieldId: FIELD_STATUS,
					operator: 'is',
					value: STATUS_PENDING
				}
			]
		});

		const response = await teableRequest(
			baseUrl,
			accessToken,
			`/table/${tableId}/record?filter=${encodeURIComponent(filter)}&maxRecords=1000`
		);

		return response?.records?.length || 0;
	} catch (error) {
		console.error('[Reminders] Error counting pending reminders:', error);
		return 0;
	}
}

/**
 * Mark a reminder as sent
 */
export async function markReminderSent(
	baseUrl: string,
	accessToken: string,
	tableId: string,
	recordId: string
): Promise<void> {
	try {
		const updateData = {
			records: [{
				id: recordId,
				fields: {
					[FIELD_STATUS]: STATUS_SENT,
					[FIELD_SENT_AT]: new Date().toISOString()
				}
			}]
		};

		await teableRequest(
			baseUrl,
			accessToken,
			`/table/${tableId}/record`,
			{
				method: 'PATCH',
				body: JSON.stringify(updateData)
			}
		);

		console.log(`[Reminders] Marked reminder ${recordId} as sent`);
	} catch (error) {
		console.error('[Reminders] Error marking reminder as sent:', error);
		throw error;
	}
}

/**
 * Mark a reminder as failed
 */
export async function markReminderFailed(
	baseUrl: string,
	accessToken: string,
	tableId: string,
	recordId: string
): Promise<void> {
	try {
		const updateData = {
			records: [{
				id: recordId,
				fields: {
					[FIELD_STATUS]: STATUS_FAILED
				}
			}]
		};

		await teableRequest(
			baseUrl,
			accessToken,
			`/table/${tableId}/record`,
			{
				method: 'PATCH',
				body: JSON.stringify(updateData)
			}
		);

		console.log(`[Reminders] Marked reminder ${recordId} as failed`);
	} catch (error) {
		console.error('[Reminders] Error marking reminder as failed:', error);
	}
}

/**
 * Process reminders for a single customer
 */
export async function processCustomerReminders(
	customer: WhatsAppCustomer
): Promise<{ sent: number; failed: number }> {
	const result = { sent: 0, failed: 0 };

	// Check if WhatsApp is connected for this customer
	if (!isConnected(customer.mcp_key)) {
		console.log(`[Reminders] Skipping ${customer.email} - WhatsApp not connected`);
		return result;
	}

	try {
		// Decrypt the Teable access token
		const accessToken = decryptToken(customer.encrypted_token);
		const baseUrl = customer.teable_base_url || DEFAULT_TEABLE_URL;

		// Find the Reminders table
		const tableInfo = await findRemindersTable(baseUrl, accessToken);
		if (!tableInfo) {
			console.log(`[Reminders] No Reminders table for ${customer.email}`);
			return result;
		}

		// Get due reminders
		const reminders = await getDueReminders(baseUrl, accessToken, tableInfo.tableId);
		if (reminders.length === 0) {
			return result;
		}

		console.log(`[Reminders] Processing ${reminders.length} reminders for ${customer.email}`);

		// Send each reminder
		for (const reminder of reminders) {
			const message = reminder.fields[FIELD_MESSAGE];

			if (!message) {
				console.log(`[Reminders] Skipping reminder ${reminder.id} - no message`);
				continue;
			}

			try {
				// Send the reminder to self
				await sendReminderToSelf(customer.mcp_key, message);

				// Mark as sent
				await markReminderSent(baseUrl, accessToken, tableInfo.tableId, reminder.id);
				result.sent++;

				console.log(`[Reminders] Sent reminder to ${customer.email}: ${message.substring(0, 50)}...`);

				// Small delay between messages to avoid rate limits
				await new Promise(resolve => setTimeout(resolve, 1000));
			} catch (error) {
				console.error(`[Reminders] Failed to send reminder ${reminder.id}:`, error);

				// Mark as failed
				await markReminderFailed(baseUrl, accessToken, tableInfo.tableId, reminder.id);
				result.failed++;
			}
		}
	} catch (error) {
		console.error(`[Reminders] Error processing reminders for ${customer.email}:`, error);
	}

	return result;
}

/**
 * Get reminder table status for a customer
 */
export async function getRemindersStatus(
	encryptedToken: string,
	teableBaseUrl: string
): Promise<{
	tableFound: boolean;
	tableId: string | null;
	baseId: string | null;
	valid: boolean;
	missingFields: string[];
	pendingCount: number;
}> {
	const result = {
		tableFound: false,
		tableId: null as string | null,
		baseId: null as string | null,
		valid: false,
		missingFields: [] as string[],
		pendingCount: 0
	};

	try {
		const accessToken = decryptToken(encryptedToken);
		const baseUrl = teableBaseUrl || DEFAULT_TEABLE_URL;

		// Find the Reminders table
		const tableInfo = await findRemindersTable(baseUrl, accessToken);
		if (!tableInfo) {
			return result;
		}

		result.tableFound = true;
		result.tableId = tableInfo.tableId;
		result.baseId = tableInfo.baseId;

		// Validate the table structure
		const validation = await validateRemindersTable(baseUrl, accessToken, tableInfo.tableId);
		result.valid = validation.valid;
		result.missingFields = validation.missingFields;

		// Get pending count if table is valid
		if (validation.valid) {
			result.pendingCount = await getPendingRemindersCount(baseUrl, accessToken, tableInfo.tableId);
		}
	} catch (error) {
		console.error('[Reminders] Error getting status:', error);
	}

	return result;
}
