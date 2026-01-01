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
	encryptedToken: string
): Promise<TeableCustomer | null> {
	const client = getSupabaseClient();

	const { data, error } = await client
		.from('teable_customers')
		.update({
			encrypted_token: encryptedToken,
			status: 'active',
		})
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
