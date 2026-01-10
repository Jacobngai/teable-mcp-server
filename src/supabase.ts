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
