/**
 * WhatsApp Reminder Cron Job
 * Runs periodically to process and send due reminders
 */

import cron from 'node-cron';
import { getCustomersWithRemindersEnabled } from '../supabase.js';
import { processCustomerReminders, WhatsAppCustomer } from './reminderService.js';
import { restoreSessions, cleanupAllSessions, getActiveSessionIds } from './sessionManager.js';

// Cron job instance
let reminderCron: cron.ScheduledTask | null = null;

// Processing state
let isProcessing = false;

// Stats
let lastRunTime: Date | null = null;
let lastRunStats = { customersProcessed: 0, remindersSent: 0, remindersFailed: 0 };

/**
 * Process reminders for all enabled customers
 */
async function processAllReminders(): Promise<void> {
	if (isProcessing) {
		console.log('[Cron] Skipping - previous run still in progress');
		return;
	}

	isProcessing = true;
	const startTime = Date.now();
	const stats = { customersProcessed: 0, remindersSent: 0, remindersFailed: 0 };

	try {
		console.log('[Cron] Starting reminder processing...');

		// Get all customers with reminders enabled
		const customers = await getCustomersWithRemindersEnabled();
		console.log(`[Cron] Found ${customers.length} customers with reminders enabled`);

		// Process each customer
		for (const customer of customers) {
			// Skip if missing required fields
			if (!customer.encrypted_token || !customer.mcp_key) {
				continue;
			}

			try {
				const whatsappCustomer: WhatsAppCustomer = {
					id: customer.id,
					mcp_key: customer.mcp_key,
					email: customer.email,
					encrypted_token: customer.encrypted_token,
					teable_base_url: customer.teable_base_url,
					whatsapp_connected: customer.whatsapp_connected,
					whatsapp_phone: customer.whatsapp_phone,
					reminder_enabled: customer.reminder_enabled
				};
				const result = await processCustomerReminders(whatsappCustomer);
				stats.customersProcessed++;
				stats.remindersSent += result.sent;
				stats.remindersFailed += result.failed;
			} catch (error) {
				console.error(`[Cron] Error processing customer ${customer.email}:`, error);
			}
		}

		const duration = Date.now() - startTime;
		console.log(`[Cron] Completed in ${duration}ms - Processed: ${stats.customersProcessed}, Sent: ${stats.remindersSent}, Failed: ${stats.remindersFailed}`);
	} catch (error) {
		console.error('[Cron] Error in reminder processing:', error);
	} finally {
		isProcessing = false;
		lastRunTime = new Date();
		lastRunStats = stats;
	}
}

/**
 * Start the reminder cron job
 * @param schedule - Cron schedule expression (default: every 5 minutes)
 */
export function startReminderCron(schedule: string = '*/5 * * * *'): void {
	if (reminderCron) {
		console.log('[Cron] Reminder cron already running');
		return;
	}

	// Validate schedule
	if (!cron.validate(schedule)) {
		console.error(`[Cron] Invalid cron schedule: ${schedule}`);
		return;
	}

	console.log(`[Cron] Starting reminder cron with schedule: ${schedule}`);

	reminderCron = cron.schedule(schedule, async () => {
		await processAllReminders();
	}, {
		scheduled: true,
		timezone: 'Asia/Kuala_Lumpur' // Malaysia timezone
	});

	console.log('[Cron] Reminder cron started successfully');
}

/**
 * Stop the reminder cron job
 */
export function stopReminderCron(): void {
	if (reminderCron) {
		reminderCron.stop();
		reminderCron = null;
		console.log('[Cron] Reminder cron stopped');
	}
}

/**
 * Manually trigger reminder processing (for testing)
 */
export async function triggerReminderProcessing(): Promise<typeof lastRunStats> {
	await processAllReminders();
	return lastRunStats;
}

/**
 * Get cron status
 */
export function getCronStatus(): {
	running: boolean;
	isProcessing: boolean;
	lastRunTime: Date | null;
	lastRunStats: typeof lastRunStats;
	activeSessionCount: number;
} {
	return {
		running: reminderCron !== null,
		isProcessing,
		lastRunTime,
		lastRunStats,
		activeSessionCount: getActiveSessionIds().length
	};
}

/**
 * Initialize WhatsApp service
 * Call this on server startup when WHATSAPP_ENABLED=true
 */
export async function initializeWhatsAppService(): Promise<void> {
	console.log('[WhatsApp] Initializing WhatsApp service...');

	try {
		// Get customers with reminders enabled
		const customers = await getCustomersWithRemindersEnabled();
		const customerIds = customers.map((c: any) => c.mcp_key);

		console.log(`[WhatsApp] Found ${customerIds.length} customers with WhatsApp enabled`);

		// Restore sessions for enabled customers
		if (customerIds.length > 0) {
			await restoreSessions(customerIds);
		}

		// Start the cron job
		const schedule = process.env.WHATSAPP_CRON_SCHEDULE || '*/5 * * * *';
		startReminderCron(schedule);

		console.log('[WhatsApp] WhatsApp service initialized successfully');
	} catch (error) {
		console.error('[WhatsApp] Failed to initialize WhatsApp service:', error);
	}
}

/**
 * Shutdown WhatsApp service
 * Call this on server shutdown
 */
export async function shutdownWhatsAppService(): Promise<void> {
	console.log('[WhatsApp] Shutting down WhatsApp service...');

	// Stop cron
	stopReminderCron();

	// Clean up all sessions
	await cleanupAllSessions();

	console.log('[WhatsApp] WhatsApp service shut down');
}

// Handle process termination
process.on('SIGINT', async () => {
	await shutdownWhatsAppService();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	await shutdownWhatsAppService();
	process.exit(0);
});
