/**
 * Admin WhatsApp Reminder Service
 * Processes reminders from the admin_reminder_queue and sends them via admin WhatsApp
 */

import cron from 'node-cron';
import { 
	getPendingAdminReminders, 
	updateAdminReminderStatus, 
	AdminReminderQueue 
} from '../supabase.js';
import { adminSessionManager } from './adminSessionManager.js';

// Cron job instance
let reminderCron: cron.ScheduledTask | null = null;

// Processing state
let isProcessing = false;

// Stats
let lastRunTime: Date | null = null;
let lastRunStats = { remindersProcessed: 0, remindersSent: 0, remindersFailed: 0 };

/**
 * Process pending reminders from the admin queue
 */
async function processAdminReminders(): Promise<void> {
	if (isProcessing) {
		console.log('[Admin Reminders] Skipping - previous run still in progress');
		return;
	}

	isProcessing = true;
	const startTime = Date.now();
	const stats = { remindersProcessed: 0, remindersSent: 0, remindersFailed: 0 };

	try {
		console.log('[Admin Reminders] Starting reminder processing...');

		// Check if admin WhatsApp is connected
		if (!adminSessionManager.getStatus().connected) {
			console.log('[Admin Reminders] Admin WhatsApp not connected, skipping');
			return;
		}

		// Get all pending reminders
		const reminders = await getPendingAdminReminders();
		console.log(`[Admin Reminders] Found ${reminders.length} pending reminders`);

		// Process each reminder
		for (const reminder of reminders) {
			try {
				stats.remindersProcessed++;

				// Send reminder via admin WhatsApp
				await adminSessionManager.sendMessage(
					reminder.customer_phone,
					reminder.reminder_text
				);

				// Mark as sent
				await updateAdminReminderStatus(reminder.id, 'sent');
				stats.remindersSent++;

				console.log(`[Admin Reminders] Sent reminder to ${reminder.customer_phone}: ${reminder.reminder_text.substring(0, 50)}...`);

				// Add delay between messages to avoid rate limiting
				await new Promise(resolve => setTimeout(resolve, 2000));

			} catch (error) {
				console.error(`[Admin Reminders] Error sending reminder ${reminder.id}:`, error);
				
				// Mark as failed
				await updateAdminReminderStatus(
					reminder.id, 
					'failed', 
					error instanceof Error ? error.message : 'Unknown error'
				);
				stats.remindersFailed++;
			}
		}

		const duration = Date.now() - startTime;
		console.log(`[Admin Reminders] Completed in ${duration}ms - Processed: ${stats.remindersProcessed}, Sent: ${stats.remindersSent}, Failed: ${stats.remindersFailed}`);

	} catch (error) {
		console.error('[Admin Reminders] Error in reminder processing:', error);
	} finally {
		isProcessing = false;
		lastRunTime = new Date();
		lastRunStats = stats;
	}
}

/**
 * Start the admin reminder cron job
 * @param schedule - Cron schedule expression (default: every 2 minutes)
 */
export function startAdminReminderCron(schedule: string = '*/2 * * * *'): void {
	if (reminderCron) {
		console.log('[Admin Reminders] Cron already running');
		return;
	}

	// Validate schedule
	if (!cron.validate(schedule)) {
		console.error(`[Admin Reminders] Invalid cron schedule: ${schedule}`);
		return;
	}

	console.log(`[Admin Reminders] Starting cron with schedule: ${schedule}`);

	reminderCron = cron.schedule(schedule, async () => {
		await processAdminReminders();
	}, {
		scheduled: true,
		timezone: 'Asia/Kuala_Lumpur' // Malaysia timezone
	});

	console.log('[Admin Reminders] Cron started successfully');
}

/**
 * Stop the admin reminder cron job
 */
export function stopAdminReminderCron(): void {
	if (reminderCron) {
		reminderCron.stop();
		reminderCron = null;
		console.log('[Admin Reminders] Cron stopped');
	}
}

/**
 * Manually trigger reminder processing (for testing)
 */
export async function triggerAdminReminderProcessing(): Promise<typeof lastRunStats> {
	await processAdminReminders();
	return lastRunStats;
}

/**
 * Get admin reminder cron status
 */
export function getAdminReminderCronStatus(): {
	running: boolean;
	isProcessing: boolean;
	lastRunTime: Date | null;
	lastRunStats: typeof lastRunStats;
	adminConnected: boolean;
} {
	return {
		running: reminderCron !== null,
		isProcessing,
		lastRunTime,
		lastRunStats,
		adminConnected: adminSessionManager.getStatus().connected
	};
}

/**
 * Initialize admin reminder service
 */
export async function initializeAdminReminderService(): Promise<void> {
	console.log('[Admin Reminders] Initializing admin reminder service...');

	try {
		// Start the cron job
		const schedule = process.env.ADMIN_REMINDER_CRON_SCHEDULE || '*/2 * * * *';
		startAdminReminderCron(schedule);

		console.log('[Admin Reminders] Service initialized successfully');
	} catch (error) {
		console.error('[Admin Reminders] Failed to initialize service:', error);
	}
}

/**
 * Shutdown admin reminder service
 */
export async function shutdownAdminReminderService(): Promise<void> {
	console.log('[Admin Reminders] Shutting down admin reminder service...');

	// Stop cron
	stopAdminReminderCron();

	console.log('[Admin Reminders] Service shut down');
}

// Handle process termination
process.on('SIGINT', async () => {
	await shutdownAdminReminderService();
});

process.on('SIGTERM', async () => {
	await shutdownAdminReminderService();
});