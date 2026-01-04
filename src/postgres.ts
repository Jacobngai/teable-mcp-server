/**
 * PostgreSQL client for Teable customer management
 * Replaces Supabase for direct PostgreSQL access
 */

import pg from 'pg';
const { Pool } = pg;

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
	password_hash: string | null;
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

export interface UsageLog {
	id: string;
	customer_id: string;
	tool_name: string;
	table_id: string | null;
	created_at: string;
}

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
	if (!pool) {
		const connectionString = process.env.DATABASE_URL;

		if (!connectionString) {
			throw new Error('Missing DATABASE_URL environment variable');
		}

		pool = new Pool({
			connectionString,
			ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
		});
	}
	return pool;
}

export async function getCustomerByMcpKey(mcpKey: string): Promise<TeableCustomer | null> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM teable_customers WHERE mcp_key = $1 LIMIT 1',
		[mcpKey]
	);

	return result.rows[0] || null;
}

export async function getCustomerById(id: string): Promise<TeableCustomer | null> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM teable_customers WHERE id = $1 LIMIT 1',
		[id]
	);

	return result.rows[0] || null;
}

export async function createCustomer(name: string, email: string): Promise<TeableCustomer> {
	const client = getPool();

	const result = await client.query(
		`INSERT INTO teable_customers (name, email)
		 VALUES ($1, $2)
		 RETURNING *`,
		[name, email]
	);

	return result.rows[0];
}

export async function updateCustomerToken(
	mcpKey: string,
	encryptedToken: string,
	teableBaseUrl?: string
): Promise<TeableCustomer | null> {
	const client = getPool();

	let query: string;
	let params: (string | undefined)[];

	if (teableBaseUrl) {
		query = `UPDATE teable_customers
				 SET encrypted_token = $1, status = 'active', teable_base_url = $2
				 WHERE mcp_key = $3
				 RETURNING *`;
		params = [encryptedToken, teableBaseUrl, mcpKey];
	} else {
		query = `UPDATE teable_customers
				 SET encrypted_token = $1, status = 'active'
				 WHERE mcp_key = $2
				 RETURNING *`;
		params = [encryptedToken, mcpKey];
	}

	const result = await client.query(query, params);
	return result.rows[0] || null;
}

export async function listCustomers(): Promise<TeableCustomer[]> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM teable_customers ORDER BY created_at DESC'
	);

	return result.rows;
}

export async function getCustomersByEmail(email: string): Promise<TeableCustomer[]> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM teable_customers WHERE email = $1 ORDER BY created_at DESC',
		[email]
	);

	return result.rows;
}

export async function logUsage(customerId: string, toolName: string, tableId?: string): Promise<void> {
	const client = getPool();

	await client.query(
		`INSERT INTO teable_usage_logs (customer_id, tool_name, table_id)
		 VALUES ($1, $2, $3)`,
		[customerId, toolName, tableId || null]
	);
}

export async function createCustomerWithStripe(
	name: string,
	email: string,
	stripeCustomerId: string | null,
	stripeSessionId: string,
	tier: string = 'free',
	recordLimit: number = 250000
): Promise<TeableCustomer> {
	const client = getPool();

	const result = await client.query(
		`INSERT INTO teable_customers (name, email, stripe_session_id, tier, record_limit, status)
		 VALUES ($1, $2, $3, $4, $5, 'pending')
		 RETURNING *`,
		[name, email, stripeSessionId, tier, recordLimit]
	);

	return result.rows[0];
}

export async function updateCustomerTier(
	email: string,
	tier: string,
	recordLimit: number
): Promise<void> {
	const client = getPool();

	await client.query(
		'UPDATE teable_customers SET tier = $1, record_limit = $2 WHERE email = $3',
		[tier, recordLimit, email]
	);
}

export async function markOnboardingComplete(email: string): Promise<void> {
	const client = getPool();

	await client.query(
		'UPDATE teable_customers SET onboarding_complete = true WHERE email = $1',
		[email]
	);
}

export async function getCustomerByStripeSessionId(sessionId: string): Promise<TeableCustomer | null> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM teable_customers WHERE stripe_session_id = $1 LIMIT 1',
		[sessionId]
	);

	return result.rows[0] || null;
}

// ============ ADMIN FUNCTIONS ============

export async function getAdminByUserId(userId: string): Promise<AdminUser | null> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM admin_users WHERE user_id = $1 AND is_active = true LIMIT 1',
		[userId]
	);

	return result.rows[0] || null;
}

export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
	const client = getPool();

	const result = await client.query(
		'SELECT * FROM admin_users WHERE email = $1 AND is_active = true LIMIT 1',
		[email]
	);

	return result.rows[0] || null;
}

export async function getAllCustomers(
	page: number = 1,
	limit: number = 50,
	status?: string,
	search?: string
): Promise<{ customers: TeableCustomer[]; total: number }> {
	const client = getPool();
	const offset = (page - 1) * limit;

	let whereClause = '';
	const params: (string | number)[] = [];
	let paramIndex = 1;

	if (status) {
		whereClause = `WHERE status = $${paramIndex}`;
		params.push(status);
		paramIndex++;
	}

	if (search) {
		const searchCondition = `(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
		params.push(`%${search}%`);
		paramIndex++;

		whereClause = whereClause
			? `${whereClause} AND ${searchCondition}`
			: `WHERE ${searchCondition}`;
	}

	// Get total count
	const countResult = await client.query(
		`SELECT COUNT(*) FROM teable_customers ${whereClause}`,
		params
	);
	const total = parseInt(countResult.rows[0].count, 10);

	// Get paginated results
	params.push(limit, offset);
	const result = await client.query(
		`SELECT * FROM teable_customers ${whereClause}
		 ORDER BY created_at DESC
		 LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
		params
	);

	return {
		customers: result.rows,
		total
	};
}

// ============ DASHBOARD AUTH FUNCTIONS ============

export async function updateCustomerPasswordHash(
	mcpKey: string,
	passwordHash: string
): Promise<void> {
	const client = getPool();

	await client.query(
		'UPDATE teable_customers SET password_hash = $1 WHERE mcp_key = $2',
		[passwordHash, mcpKey]
	);
}

export async function getCustomerForLogin(email: string): Promise<TeableCustomer | null> {
	const client = getPool();

	const result = await client.query(
		`SELECT * FROM teable_customers
		 WHERE email = $1 AND status = 'active'
		 ORDER BY created_at DESC
		 LIMIT 1`,
		[email]
	);

	return result.rows[0] || null;
}

// ============ DATABASE INITIALIZATION ============

export async function initializeDatabase(): Promise<void> {
	const client = getPool();

	// Create tables if they don't exist
	await client.query(`
		CREATE TABLE IF NOT EXISTS teable_customers (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			encrypted_token TEXT,
			mcp_key VARCHAR(64) DEFAULT encode(gen_random_bytes(16), 'hex'),
			teable_base_url VARCHAR(500) DEFAULT 'https://table.resultmarketing.asia/api',
			status VARCHAR(20) DEFAULT 'pending',
			tier VARCHAR(50) DEFAULT 'free',
			record_limit INTEGER DEFAULT 250000,
			onboarding_complete BOOLEAN DEFAULT false,
			stripe_customer_id VARCHAR(255),
			stripe_session_id VARCHAR(255),
			expires_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			password_hash TEXT
		);

		CREATE TABLE IF NOT EXISTS admin_users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL,
			email VARCHAR(255) NOT NULL,
			name VARCHAR(255),
			role VARCHAR(20) DEFAULT 'viewer',
			is_active BOOLEAN DEFAULT true,
			created_at TIMESTAMPTZ DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS teable_usage_logs (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			customer_id UUID REFERENCES teable_customers(id),
			tool_name VARCHAR(100) NOT NULL,
			table_id VARCHAR(100),
			created_at TIMESTAMPTZ DEFAULT NOW()
		);

		CREATE TABLE IF NOT EXISTS plans (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(100) NOT NULL,
			price_myr DECIMAL(10,2),
			price_usd DECIMAL(10,2),
			interval VARCHAR(20),
			features JSONB,
			is_active BOOLEAN DEFAULT true,
			stripe_price_id VARCHAR(255),
			created_at TIMESTAMPTZ DEFAULT NOW()
		);

		-- Create indexes for better performance
		CREATE INDEX IF NOT EXISTS idx_customers_email ON teable_customers(email);
		CREATE INDEX IF NOT EXISTS idx_customers_mcp_key ON teable_customers(mcp_key);
		CREATE INDEX IF NOT EXISTS idx_customers_status ON teable_customers(status);
		CREATE INDEX IF NOT EXISTS idx_customers_stripe_session ON teable_customers(stripe_session_id);
		CREATE INDEX IF NOT EXISTS idx_usage_logs_customer ON teable_usage_logs(customer_id);
		CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
		CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
	`);

	console.log('Database tables initialized successfully');
}

// ============ DATA MIGRATION FROM BACKUP ============

export async function migrateFromBackup(backupData: {
	teable_customers: TeableCustomer[];
	admin_users: AdminUser[];
	plans: Array<{
		id: string;
		name: string;
		price_myr: string;
		price_usd: string;
		interval: string;
		features: string[];
		is_active: boolean;
		stripe_price_id: string | null;
		created_at: string;
	}>;
}): Promise<void> {
	const client = getPool();

	// Migrate customers
	for (const customer of backupData.teable_customers) {
		await client.query(
			`INSERT INTO teable_customers
			 (id, name, email, encrypted_token, mcp_key, teable_base_url, status, tier,
			  record_limit, onboarding_complete, stripe_customer_id, stripe_session_id,
			  expires_at, created_at, password_hash)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
			 ON CONFLICT (id) DO NOTHING`,
			[
				customer.id, customer.name, customer.email, customer.encrypted_token,
				customer.mcp_key, customer.teable_base_url, customer.status, customer.tier,
				customer.record_limit, customer.onboarding_complete, customer.stripe_customer_id,
				customer.stripe_session_id, customer.expires_at, customer.created_at,
				customer.password_hash
			]
		);
	}

	// Migrate admin users
	for (const admin of backupData.admin_users) {
		await client.query(
			`INSERT INTO admin_users (id, user_id, email, name, role, is_active, created_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 ON CONFLICT (id) DO NOTHING`,
			[admin.id, admin.user_id, admin.email, admin.name, admin.role, admin.is_active, admin.created_at]
		);
	}

	// Migrate plans
	for (const plan of backupData.plans) {
		await client.query(
			`INSERT INTO plans (id, name, price_myr, price_usd, interval, features, is_active, stripe_price_id, created_at)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			 ON CONFLICT (id) DO NOTHING`,
			[
				plan.id, plan.name, plan.price_myr, plan.price_usd, plan.interval,
				JSON.stringify(plan.features), plan.is_active, plan.stripe_price_id, plan.created_at
			]
		);
	}

	console.log('Data migration completed successfully');
}

// Graceful shutdown
export async function closePool(): Promise<void> {
	if (pool) {
		await pool.end();
		pool = null;
	}
}
