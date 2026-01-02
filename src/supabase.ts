/**
 * Supabase client for Teable customer management
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TeableCustomer {
	id: string;
	name: string;
	email: string;
	encrypted_token: string | null;
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
	stripeCustomerId: string,
	stripeSessionId: string,
	tier: string = 'free',
	recordLimit: number = 5000
): Promise<TeableCustomer> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.insert({
			name,
			email,
			stripe_customer_id: stripeCustomerId,
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
