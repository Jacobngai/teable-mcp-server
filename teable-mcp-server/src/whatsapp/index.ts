/**
 * Admin WhatsApp Module Index
 * Exports admin-controlled WhatsApp functionality
 * Replaces the old per-customer session system
 */

// Admin session management
export {
	createAdminSession,
	getAdminSessionState,
	getAdminConnectionStatus,
	isAdminConnected,
	getAdminQRCode,
	getAdminPhoneNumber,
	disconnectAdminSession,
	sendAdminMessage,
	sendAdminTestMessage,
	restoreAdminSession,
	cleanupAdminSession,
	onQRCode,
	onConnectionChange,
	AdminSessionState
} from './adminSessionManager.js';

// Admin reminder service
export {
	startAdminReminderCron,
	stopAdminReminderCron,
	triggerAdminReminderProcessing,
	getAdminReminderCronStatus,
	initializeAdminReminderService,
	shutdownAdminReminderService
} from './adminReminderService.js';

// Legacy reminder service (kept for potential future use with admin system)
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
