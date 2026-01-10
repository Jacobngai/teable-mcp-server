/**
 * Supabase client for Teable customer management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TeableCustomer {
	id: string;
	name: string;
	email: string;
	encrypted_token: string | null;
	encrypted_password: string | null;
	mcp_key: string;
	teable_base_url: string;
	status: 'pending' | 'active' | 'suspended' | 'cancelled';
	tier: string;
	record_limit: number;
	onboarding_complete: boolean;
	stripe_customer_id: string | null;
	stripe_session_id: string | null;
	expires_at: string | null;
	created_at: string;
	password_hash: string | null;
	// WhatsApp fields
	whatsapp_connected: boolean;
	whatsapp_phone: string | null;
	whatsapp_session_id: string | null;
	whatsapp_last_connected: string | null;
	reminder_enabled: boolean;
}

export interface AdminUser {
	id: string;
	user_id: string;
	email: string;
	name: string | null;
	role: 'owner' | 'salesperson' | 'viewer';
	is_active: boolean;
	created_at: string;
}

export interface Lead {
	id: string;
	name: string;
	phone: string;
	source: string | null;
	status: 'new' | 'contacted' | 'converted' | 'not_interested';
	notes: string | null;
	created_at: string;
}

let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
	if (!supabase) {
		const url = process.env.SUPABASE_URL;
		const key = process.env.SUPABASE_SERVICE_KEY;

		if (!url || !key) {
			throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
		}

		supabase = createClient(url, key);
	}
	return supabase;
}

export async function getCustomerByMcpKey(mcpKey: string): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('mcp_key', mcpKey)
		.single();

	if (error || !data) {
		return null;
	}

	return data as TeableCustomer;
}

export async function getCustomerById(id: string): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('id', id)
		.single();

	if (error || !data) {
		return null;
	}

	return data as TeableCustomer;
}

export async function createCustomer(name: string, email: string): Promise<TeableCustomer> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.insert({ name, email })
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create customer: ${error.message}`);
	}

	return data as TeableCustomer;
}

export async function updateCustomerToken(
	mcpKey: string,
	encryptedToken: string,
	teableBaseUrl?: string
): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const updateData: Record<string, unknown> = {
		encrypted_token: encryptedToken,
		status: 'active',
	};

	if (teableBaseUrl) {
		updateData.teable_base_url = teableBaseUrl;
	}

	const { data, error } = await client
		.from('teable_customers')
		.update(updateData)
		.eq('mcp_key', mcpKey)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to update customer token: ${error.message}`);
	}

	return data as TeableCustomer;
}

export async function listCustomers(): Promise<TeableCustomer[]> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to list customers: ${error.message}`);
	}

	return data as TeableCustomer[];
}

export async function deleteCustomer(id: string): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.delete()
		.eq('id', id)
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to delete customer: ${error.message}`);
	}

	return data as TeableCustomer;
}

export async function getCustomersByEmail(email: string): Promise<TeableCustomer[]> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('email', email)
		.order('created_at', { ascending: false });

	if (error) {
		throw new Error(`Failed to get customers by email: ${error.message}`);
	}

	return (data || []) as TeableCustomer[];
}

export async function logUsage(customerId: string, toolName: string, tableId?: string): Promise<void> {
	const client = getSupabaseClient();

	await client.from('teable_usage_logs').insert({
		customer_id: customerId,
		tool_name: toolName,
		table_id: tableId,
	});
}

export async function createCustomerWithStripe(
	name: string,
	email: string,
	stripeCustomerId: string | null,
	stripeSessionId: string,
	tier: string = 'free',
	recordLimit: number = 250000
): Promise<TeableCustomer> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.insert({
			name,
			email,
			stripe_session_id: stripeSessionId,
			tier,
			record_limit: recordLimit,
			status: 'pending'
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create customer: ${error.message}`);
	}

	return data as TeableCustomer;
}

export async function createAirtableCustomer(
	name: string,
	email: string,
	stripeCustomerId: string,
	stripeSessionId: string
): Promise<void> {
	const client = getSupabaseClient();

	const { error } = await client
		.from('customers')
		.insert({
			name,
			email,
			stripe_customer_id: stripeCustomerId,
			stripe_session_id: stripeSessionId,
			tier: 'free',
			status: 'pending'
		});

	if (error) {
		throw new Error(`Failed to create Airtable customer: ${error.message}`);
	}
}

export async function updateCustomerTier(
	email: string,
	tier: string,
	recordLimit: number
): Promise<void> {
	const client = getSupabaseClient();

	// Update teable_customers
	const { error: teableError } = await client
		.from('teable_customers')
		.update({ tier, record_limit: recordLimit })
		.eq('email', email);

	if (teableError) {
		throw new Error(`Failed to update Teable customer tier: ${teableError.message}`);
	}

	// Update customers (Airtable)
	const { error: airtableError } = await client
		.from('customers')
		.update({ tier })
		.eq('email', email);

	if (airtableError) {
		console.error('Failed to update Airtable customer tier:', airtableError.message);
	}
}

export async function markOnboardingComplete(email: string): Promise<void> {
	const client = getSupabaseClient();

	// Update teable_customers
	await client
		.from('teable_customers')
		.update({ onboarding_complete: true })
		.eq('email', email);

	// Update customers (Airtable)
	await client
		.from('customers')
		.update({ onboarding_complete: true })
		.eq('email', email);
}

export async function getCustomerByStripeSessionId(sessionId: string): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('stripe_session_id', sessionId)
		.single();

	if (error || !data) {
		return null;
	}

	return data as TeableCustomer;
}

// ============ ADMIN FUNCTIONS ============

export async function getAdminByUserId(userId: string): Promise<AdminUser | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_users')
		.select('*')
		.eq('user_id', userId)
		.eq('is_active', true)
		.single();

	if (error || !data) {
		return null;
	}

	return data as AdminUser;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_users')
		.select('*')
		.eq('email', email)
		.eq('is_active', true)
		.single();

	if (error || !data) {
		return null;
	}

	return data as AdminUser;
}

export async function getAllCustomers(
	page: number = 1,
	limit: number = 50,
	status?: string,
	search?: string
): Promise<{ customers: TeableCustomer[]; total: number }> {
	const client = getSupabaseClient();
	const offset = (page - 1) * limit;

	let query = client
		.from('teable_customers')
		.select('*', { count: 'exact' });

	if (status) {
		query = query.eq('status', status);
	}

	if (search) {
		query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
	}

	const { data, error, count } = await query
		.order('created_at', { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		throw new Error(`Failed to fetch customers: ${error.message}`);
	}

	return {
		customers: (data || []) as TeableCustomer[],
		total: count || 0
	};
}

// ============ DASHBOARD AUTH FUNCTIONS ============

export async function updateCustomerPasswordHash(
	mcpKey: string,
	passwordHash: string,
	encryptedPassword?: string
): Promise<void> {
	const client = getSupabaseClient();

	const updateData: Record<string, unknown> = { password_hash: passwordHash };
	if (encryptedPassword) {
		updateData.encrypted_password = encryptedPassword;
	}

	const { error } = await client
		.from('teable_customers')
		.update(updateData)
		.eq('mcp_key', mcpKey);

	if (error) {
		throw new Error(`Failed to update password hash: ${error.message}`);
	}
}

export async function getCustomerForLogin(email: string): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('email', email)
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(1)
		.single();

	if (error || !data) {
		return null;
	}

	return data as TeableCustomer;
}

// ============ LEADS MANAGEMENT ============

export async function createLead(
	name: string,
	phone: string,
	source?: string
): Promise<Lead> {
	const client = getSupabaseClient();
	const { data, error } = await client
		.from('leads')
		.insert({
			name,
			phone,
			source: source || null,
			status: 'new'
		})
		.select()
		.single();

	if (error) {
		throw new Error(`Failed to create lead: ${error.message}`);
	}

	return data as Lead;
}

export async function getLeads(
	status?: string,
	limit: number = 100
): Promise<Lead[]> {
	const client = getSupabaseClient();
	let query = client.from('leads').select('*');

	if (status) {
		query = query.eq('status', status);
	}

	const { data, error } = await query
		.order('created_at', { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(`Failed to get leads: ${error.message}`);
	}

	return data as Lead[];
}

export async function updateLeadStatus(
	leadId: string,
	status: string,
	notes?: string
): Promise<Lead | null> {
	const client = getSupabaseClient();
	const updateData: any = { status };
	if (notes) {
		updateData.notes = notes;
	}

	const { data, error } = await client
		.from('leads')
		.update(updateData)
		.eq('id', leadId)
		.select()
		.single();

	if (error) {
		return null;
	}

	return data as Lead;
}

export async function getLeadStats(): Promise<{
	total: number;
	new: number;
	contacted: number;
	converted: number;
}> {
	const client = getSupabaseClient();
	const { data, error } = await client.from('leads').select('status');

	if (error || !data) {
		return { total: 0, new: 0, contacted: 0, converted: 0 };
	}

	return {
		total: data.length,
		new: data.filter(l => l.status === 'new').length,
		contacted: data.filter(l => l.status === 'contacted').length,
		converted: data.filter(l => l.status === 'converted').length
	};
}

// ============ WHATSAPP FUNCTIONS ============

/**
 * Get all customers with reminders enabled and WhatsApp connected
 */
export async function getCustomersWithRemindersEnabled(): Promise<TeableCustomer[]> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('status', 'active')
		.eq('reminder_enabled', true)
		.eq('whatsapp_connected', true)
		.not('encrypted_token', 'is', null);

	if (error) {
		console.error('Failed to get customers with reminders enabled:', error.message);
		return [];
	}

	return (data || []) as TeableCustomer[];
}

/**
 * Update customer WhatsApp connection status
 */
export async function updateCustomerWhatsApp(
	mcpKey: string,
	phone: string | null,
	connected: boolean
): Promise<void> {
	const client = getSupabaseClient();

	const updateData: Record<string, unknown> = {
		whatsapp_connected: connected,
		whatsapp_phone: phone
	};

	if (connected) {
		updateData.whatsapp_last_connected = new Date().toISOString();
	}

	const { error } = await client
		.from('teable_customers')
		.update(updateData)
		.eq('mcp_key', mcpKey);

	if (error) {
		throw new Error(`Failed to update WhatsApp status: ${error.message}`);
	}
}

/**
 * Set reminder enabled status for a customer
 */
export async function setReminderEnabled(
	mcpKey: string,
	enabled: boolean
): Promise<void> {
	const client = getSupabaseClient();

	const { error } = await client
		.from('teable_customers')
		.update({ reminder_enabled: enabled })
		.eq('mcp_key', mcpKey);

	if (error) {
		throw new Error(`Failed to update reminder status: ${error.message}`);
	}
}

/**
 * Get WhatsApp status for a customer
 */
export async function getCustomerWhatsAppStatus(
	mcpKey: string
): Promise<{
	whatsapp_connected: boolean;
	whatsapp_phone: string | null;
	whatsapp_last_connected: string | null;
	reminder_enabled: boolean;
} | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('whatsapp_connected, whatsapp_phone, whatsapp_last_connected, reminder_enabled')
		.eq('mcp_key', mcpKey)
		.single();

	if (error || !data) {
		return null;
	}

	return {
		whatsapp_connected: data.whatsapp_connected || false,
		whatsapp_phone: data.whatsapp_phone || null,
		whatsapp_last_connected: data.whatsapp_last_connected || null,
		reminder_enabled: data.reminder_enabled || false
	};
}

// ============ ADMIN WHATSAPP FUNCTIONS ============

/**
 * Admin WhatsApp Configuration Interface
 */
export interface AdminWhatsAppConfig {
	id: string;
	phone_number: string | null;
	connected: boolean;
	last_connected: string | null;
	last_error: string | null;
	connection_attempts: number;
	session_data: any;
	qr_code_generated_at: string | null;
	admin_user_id: string | null;
	created_at: string;
	updated_at: string;
}

/**
 * Admin Message Interface
 */
export interface AdminMessage {
	id: string;
	customer_id: string;
	customer_phone: string;
	customer_name: string | null;
	message_text: string;
	sent_at: string;
	status: 'sent' | 'failed' | 'pending';
	error_message: string | null;
	admin_user_id: string | null;
	admin_phone: string | null;
}

/**
 * Admin Reminder Queue Interface
 */
export interface AdminReminderQueue {
	id: string;
	customer_id: string;
	customer_phone: string;
	customer_name: string | null;
	reminder_text: string;
	scheduled_for: string;
	status: 'pending' | 'sent' | 'failed' | 'cancelled';
	attempts: number;
	last_attempt_at: string | null;
	error_message: string | null;
	created_at: string;
	sent_at: string | null;
}

/**
 * Get admin WhatsApp configuration
 */
export async function getAdminWhatsAppConfig(): Promise<AdminWhatsAppConfig | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_whatsapp_config')
		.select('*')
		.single();

	if (error || !data) {
		return null;
	}

	return data as AdminWhatsAppConfig;
}

/**
 * Update admin WhatsApp configuration
 */
export async function updateAdminWhatsAppConfig(
	phoneNumber: string | null,
	connected: boolean,
	lastError: string | null = null,
	connectionAttempts: number = 0,
	sessionData: any = null
): Promise<AdminWhatsAppConfig> {
	const client = getSupabaseClient();

	const updateData: any = {
		phone_number: phoneNumber,
		connected,
		connection_attempts: connectionAttempts
	};

	if (connected) {
		updateData.last_connected = new Date().toISOString();
		updateData.last_error = null;
	} else {
		updateData.last_error = lastError;
	}

	if (sessionData) {
		updateData.session_data = sessionData;
	}

	// First try to update existing record
	const { data: updatedData, error: updateError } = await client
		.from('admin_whatsapp_config')
		.update(updateData)
		.select()
		.single();

	if (updateError || !updatedData) {
		// If no record exists, create one
		const { data: insertedData, error: insertError } = await client
			.from('admin_whatsapp_config')
			.insert({
				...updateData,
				id: crypto.randomUUID()
			})
			.select()
			.single();

		if (insertError || !insertedData) {
			throw new Error(`Failed to create admin WhatsApp config: ${insertError?.message}`);
		}

		return insertedData as AdminWhatsAppConfig;
	}

	return updatedData as AdminWhatsAppConfig;
}

/**
 * Update QR code generation timestamp
 */
export async function updateAdminQRCodeGenerated(): Promise<void> {
	const client = getSupabaseClient();

	const { error } = await client
		.from('admin_whatsapp_config')
		.update({ qr_code_generated_at: new Date().toISOString() })
		.single();

	if (error) {
		console.error('Failed to update QR code timestamp:', error.message);
	}
}

/**
 * Log admin message sent to customer
 */
export async function logAdminMessage(
	customerId: string,
	customerPhone: string,
	customerName: string | null,
	messageText: string,
	status: 'sent' | 'failed' | 'pending' = 'sent',
	errorMessage: string | null = null,
	adminUserId: string | null = null,
	adminPhone: string | null = null
): Promise<AdminMessage> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_messages')
		.insert({
			customer_id: customerId,
			customer_phone: customerPhone,
			customer_name: customerName,
			message_text: messageText,
			status,
			error_message: errorMessage,
			admin_user_id: adminUserId,
			admin_phone: adminPhone
		})
		.select()
		.single();

	if (error || !data) {
		throw new Error(`Failed to log admin message: ${error?.message}`);
	}

	return data as AdminMessage;
}

/**
 * Get admin message history for a customer
 */
export async function getAdminMessagesForCustomer(
	customerId: string,
	limit: number = 50
): Promise<AdminMessage[]> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_messages')
		.select('*')
		.eq('customer_id', customerId)
		.order('sent_at', { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(`Failed to get admin messages: ${error.message}`);
	}

	return (data || []) as AdminMessage[];
}

/**
 * Get recent admin messages (for admin dashboard)
 */
export async function getRecentAdminMessages(limit: number = 100): Promise<AdminMessage[]> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_messages')
		.select('*')
		.order('sent_at', { ascending: false })
		.limit(limit);

	if (error) {
		throw new Error(`Failed to get recent admin messages: ${error.message}`);
	}

	return (data || []) as AdminMessage[];
}

/**
 * Queue a reminder for a customer
 */
export async function queueAdminReminder(
	customerId: string,
	customerPhone: string,
	customerName: string | null,
	reminderText: string,
	scheduledFor: Date
): Promise<AdminReminderQueue> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('admin_reminder_queue')
		.insert({
			customer_id: customerId,
			customer_phone: customerPhone,
			customer_name: customerName,
			reminder_text: reminderText,
			scheduled_for: scheduledFor.toISOString()
		})
		.select()
		.single();

	if (error || !data) {
		throw new Error(`Failed to queue admin reminder: ${error?.message}`);
	}

	return data as AdminReminderQueue;
}

/**
 * Get pending reminders to be sent
 */
export async function getPendingAdminReminders(): Promise<AdminReminderQueue[]> {
	const client = getSupabaseClient();

	const now = new Date().toISOString();

	const { data, error } = await client
		.from('admin_reminder_queue')
		.select('*')
		.eq('status', 'pending')
		.lte('scheduled_for', now)
		.order('scheduled_for', { ascending: true });

	if (error) {
		throw new Error(`Failed to get pending reminders: ${error.message}`);
	}

	return (data || []) as AdminReminderQueue[];
}

/**
 * Update reminder status after sending attempt
 */
export async function updateAdminReminderStatus(
	reminderId: string,
	status: 'sent' | 'failed' | 'cancelled',
	errorMessage: string | null = null
): Promise<void> {
	const client = getSupabaseClient();

	const updateData: any = {
		status,
		last_attempt_at: new Date().toISOString()
	};

	if (status === 'sent') {
		updateData.sent_at = new Date().toISOString();
	} else if (status === 'failed') {
		updateData.error_message = errorMessage;
	}

	// Increment attempts counter
	const { error: updateError } = await client
		.from('admin_reminder_queue')
		.update({
			...updateData,
			attempts: client.rpc('increment_attempts', { reminder_id: reminderId })
		})
		.eq('id', reminderId);

	// If RPC doesn't work, fall back to direct update
	if (updateError) {
		const { error } = await client
			.from('admin_reminder_queue')
			.update(updateData)
			.eq('id', reminderId);

		if (error) {
			throw new Error(`Failed to update reminder status: ${error.message}`);
		}
	}
}

/**
 * Get customers who have opted in for WhatsApp reminders
 */
export async function getCustomersForAdminReminders(): Promise<TeableCustomer[]> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.select('*')
		.eq('reminder_enabled', true)
		.eq('status', 'active')
		.not('whatsapp_phone', 'is', null);

	if (error) {
		throw new Error(`Failed to get customers for reminders: ${error.message}`);
	}

	return (data || []) as TeableCustomer[];
}

/**
 * Update customer's WhatsApp phone number
 */
export async function updateCustomerWhatsAppPhone(
	mcpKey: string,
	phoneNumber: string | null
): Promise<void> {
	const client = getSupabaseClient();

	const { error } = await client
		.from('teable_customers')
		.update({ whatsapp_phone: phoneNumber })
		.eq('mcp_key', mcpKey);

	if (error) {
		throw new Error(`Failed to update customer WhatsApp phone: ${error.message}`);
	}
}
