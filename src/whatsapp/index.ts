/**
 * WhatsApp Module Index
 * Exports all WhatsApp-related functionality
 */

// Session management
export {
	createSession,
	getSessionState,
	getConnectionStatus,
	isConnected,
	getQRCode,
	getPhoneNumber,
	disconnectSession,
	sendMessage,
	sendReminderToSelf,
	restoreSessions,
	getActiveSessionIds,
	cleanupAllSessions,
	SessionState
} from './sessionManager.js';

// Reminder service
export {
	findRemindersTable,
	validateRemindersTable,
	getDueReminders,
	getPendingRemindersCount,
	markReminderSent,
	markReminderFailed,
	processCustomerReminders,
	getRemindersStatus,
	WhatsAppCustomer,
	ReminderRecord
} from './reminderService.js';

// Cron job
export {
	startReminderCron,
	stopReminderCron,
	triggerReminderProcessing,
	getCronStatus,
	initializeWhatsAppService,
	shutdownWhatsAppService
} from './cron.js';
