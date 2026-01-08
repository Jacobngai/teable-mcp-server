/**
 * Teable MCP Server - Multi-tenant Entry Point
 * Supports both stdio and HTTP/SSE transports
 * Last deploy: 2026-01-03
 */

import express, { Request, Response, NextFunction } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createTeableMcpServer, CustomerLimits } from './index.js';
import {
	getCustomerByMcpKey,
	logUsage,
	createCustomerWithStripe,
	updateCustomerTier,
	getCustomersByEmail,
	getCustomerByStripeSessionId,
	getAdminByEmail,
	getAllCustomers,
	getCustomerById,
	AdminUser,
	updateCustomerPasswordHash,
	getCustomerForLogin,
	createCustomer,
	updateCustomerToken,
	markOnboardingComplete,
	listCustomers
} from './supabase.js';
import { decryptToken, encryptToken } from './encryption.js';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import Stripe from 'stripe';
import { Resend } from 'resend';

// Generate secure random password
function generateSecurePassword(): string {
	const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
	const bytes = randomBytes(16);
	let password = '';
	for (let i = 0; i < 16; i++) {
		password += chars[bytes[i] % chars.length];
	}
	// Ensure at least one uppercase, one lowercase, one digit, one special
	return password.charAt(0).toUpperCase() + password.slice(1, 14) + '1!';
}

// Password hashing using scrypt
function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
	try {
		const [salt, hash] = storedHash.split(':');
		if (!salt || !hash) return false;
		const hashBuffer = Buffer.from(hash, 'hex');
		const suppliedHashBuffer = scryptSync(password, salt, 64);
		return timingSafeEqual(hashBuffer, suppliedHashBuffer);
	} catch {
		return false;
	}
}

// Create CRM template tables in a Teable space
async function createCrmTemplate(teableUrl: string, accessToken: string, spaceId: string): Promise<void> {
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${accessToken}`
	};

	console.log('Creating CRM template tables in space:', spaceId);

	// Step 1: Create a Base (database) in the space
	const baseResponse = await fetch(`${teableUrl}/api/base`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			spaceId,
			name: 'My CRM'
		})
	});

	if (!baseResponse.ok) {
		const err = await baseResponse.text();
		console.error('Failed to create base:', err);
		throw new Error('Failed to create CRM base');
	}

	const baseData = await baseResponse.json();
	const baseId = baseData.id;
	console.log('Created base:', baseId);

	// Step 2: Create Clients table
	const clientsTableResponse = await fetch(`${teableUrl}/api/table`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			baseId,
			name: 'Clients',
			fields: [
				{ name: 'Name', type: 'singleLineText', options: {} },
				{ name: 'Phone', type: 'singleLineText', options: {} },
				{ name: 'Email', type: 'singleLineText', options: {} },
				{ name: 'Company', type: 'singleLineText', options: {} },
				{ name: 'Birthday', type: 'date', options: { formatting: { date: 'YYYY-MM-DD' } } },
				{ name: 'Spouse', type: 'singleLineText', options: {} },
				{ name: 'Kids', type: 'number', options: { precision: 0 } },
				{
					name: 'Status',
					type: 'singleSelect',
					options: {
						choices: [
							{ name: 'Lead', color: 'grayBright' },
							{ name: 'Prospect', color: 'yellowBright' },
							{ name: 'Customer', color: 'greenBright' },
							{ name: 'VIP', color: 'purpleBright' }
						]
					}
				},
				{
					name: 'Interests',
					type: 'multipleSelect',
					options: {
						choices: [
							{ name: 'Medical Card', color: 'blueBright' },
							{ name: 'Life Insurance', color: 'greenBright' },
							{ name: 'Investment', color: 'yellowBright' },
							{ name: 'Education Plan', color: 'purpleBright' },
							{ name: 'Motor', color: 'grayBright' },
							{ name: 'Home Loan', color: 'redBright' },
							{ name: 'Personal Loan', color: 'orangeBright' }
						]
					}
				},
				{ name: 'Notes', type: 'longText', options: {} },
				{ name: 'Last Contact', type: 'date', options: { formatting: { date: 'YYYY-MM-DD' } } },
				{ name: 'Namecard', type: 'attachment', options: {} }
			]
		})
	});

	if (!clientsTableResponse.ok) {
		const err = await clientsTableResponse.text();
		console.error('Failed to create Clients table:', err);
		throw new Error('Failed to create Clients table');
	}

	const clientsTable = await clientsTableResponse.json();
	console.log('Created Clients table:', clientsTable.id);

	// Step 3: Create Activities table
	const activitiesTableResponse = await fetch(`${teableUrl}/api/table`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			baseId,
			name: 'Activities',
			fields: [
				{ name: 'Date', type: 'date', options: { formatting: { date: 'YYYY-MM-DD' } } },
				{
					name: 'Type',
					type: 'singleSelect',
					options: {
						choices: [
							{ name: 'Meeting', color: 'blueBright' },
							{ name: 'Call', color: 'greenBright' },
							{ name: 'Follow-up', color: 'yellowBright' },
							{ name: 'Proposal', color: 'purpleBright' },
							{ name: 'Closing', color: 'redBright' }
						]
					}
				},
				{ name: 'Client Name', type: 'singleLineText', options: {} },
				{ name: 'Notes', type: 'longText', options: {} },
				{
					name: 'Result',
					type: 'singleSelect',
					options: {
						choices: [
							{ name: 'Successful', color: 'greenBright' },
							{ name: 'Pending', color: 'yellowBright' },
							{ name: 'Rejected', color: 'redBright' }
						]
					}
				}
			]
		})
	});

	if (!activitiesTableResponse.ok) {
		const err = await activitiesTableResponse.text();
		console.error('Failed to create Activities table:', err);
		// Don't throw - continue with what we have
	} else {
		const activitiesTable = await activitiesTableResponse.json();
		console.log('Created Activities table:', activitiesTable.id);
	}

	// Step 4: Create Deals/Policies table
	const dealsTableResponse = await fetch(`${teableUrl}/api/table`, {
		method: 'POST',
		headers,
		body: JSON.stringify({
			baseId,
			name: 'Deals',
			fields: [
				{ name: 'Client Name', type: 'singleLineText', options: {} },
				{
					name: 'Product',
					type: 'singleSelect',
					options: {
						choices: [
							{ name: 'Medical Card', color: 'blueBright' },
							{ name: 'Life Insurance', color: 'greenBright' },
							{ name: 'Investment', color: 'yellowBright' },
							{ name: 'Home Loan', color: 'purpleBright' },
							{ name: 'Personal Loan', color: 'orangeBright' },
							{ name: 'Motor', color: 'grayBright' }
						]
					}
				},
				{ name: 'Amount', type: 'number', options: { precision: 2, symbol: 'RM' } },
				{ name: 'Date', type: 'date', options: { formatting: { date: 'YYYY-MM-DD' } } },
				{
					name: 'Status',
					type: 'singleSelect',
					options: {
						choices: [
							{ name: 'Pending', color: 'yellowBright' },
							{ name: 'Approved', color: 'greenBright' },
							{ name: 'Rejected', color: 'redBright' },
							{ name: 'Closed', color: 'blueBright' }
						]
					}
				},
				{ name: 'Bank/Provider', type: 'singleLineText', options: {} },
				{ name: 'Interest Rate', type: 'number', options: { precision: 2 } },
				{ name: 'Notes', type: 'longText', options: {} }
			]
		})
	});

	if (!dealsTableResponse.ok) {
		const err = await dealsTableResponse.text();
		console.error('Failed to create Deals table:', err);
	} else {
		const dealsTable = await dealsTableResponse.json();
		console.log('Created Deals table:', dealsTable.id);
	}

	console.log('CRM template creation complete');
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const TRANSPORT = process.env.MCP_TRANSPORT || 'stdio';

// Stripe configuration - lazy initialization to avoid crash when key not set
let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
	if (!stripeInstance) {
		const key = process.env.STRIPE_SECRET_KEY;
		if (!key) {
			throw new Error('STRIPE_SECRET_KEY environment variable is required');
		}
		stripeInstance = new Stripe(key, {
			apiVersion: '2025-02-24.acacia'
		});
	}
	return stripeInstance;
}

// Resend configuration - lazy initialization
let resendInstance: Resend | null = null;
function getResend(): Resend {
	if (!resendInstance) {
		resendInstance = new Resend(process.env.RESEND_API_KEY || '');
	}
	return resendInstance;
}

// Stripe Price IDs (Yearly Recurring)
const PRICE_BASE = process.env.STRIPE_PRICE_BASE || 'price_1SkpFgBYvVjM733YnXnG5Qgg';
const PRICE_PRO = process.env.STRIPE_PRICE_PRO || 'price_1SkpGlBYvVjM733YCInhzrI4';
const PRICE_ENTERPRISE = process.env.STRIPE_PRICE_ENTERPRISE || 'price_1SkpHBBYvVjM733YOqy1pU8n';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.resultmarketing.asia';

// Payment Links for upgrade (direct Stripe checkout)
const PAYMENT_LINK_PRO = 'https://buy.stripe.com/00w28q0PEbItaFgciE2Nq00';
const PAYMENT_LINK_ENTERPRISE = 'https://buy.stripe.com/6oUeVcdCqaEpaFg4Qc2Nq01';

// Store active SSE transports
const transports = new Map<string, SSEServerTransport>();

// Store active Streamable HTTP transports (keyed by session ID)
const httpTransports = new Map<string, StreamableHTTPServerTransport>();
const httpServers = new Map<string, McpServer>();

async function main() {
	if (TRANSPORT === 'http') {
		await startHttpServer();
	} else {
		await startStdioServer();
	}
}

async function startStdioServer() {
	const apiKey = process.env.TEABLE_API_KEY;
	if (!apiKey) {
		console.error('TEABLE_API_KEY environment variable is required for stdio mode');
		process.exit(1);
	}

	const server = createTeableMcpServer(apiKey);
	const transport = new StdioServerTransport();

	await server.connect(transport);
	console.error('Teable MCP Server running on stdio');
}

async function startHttpServer() {
	const app = express();

	// CORS middleware
	app.use((req: Request, res: Response, next: NextFunction) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, mcp-session-id');
		if (req.method === 'OPTIONS') {
			res.sendStatus(200);
			return;
		}
		next();
	});

	// Skip JSON parsing for endpoints that need raw body:
	// - MCP endpoints (StreamableHTTPServerTransport needs raw body)
	// - Stripe webhook (needs raw body for signature verification)
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.path.includes('/mcp/') && req.path.endsWith('/mcp')) {
			next();
		} else if (req.path === '/api/webhook/stripe') {
			next();  // Stripe webhook uses express.raw() in its route handler
		} else {
			express.json()(req, res, next);
		}
	});

	// Health check
	app.get('/health', (req: Request, res: Response) => {
		res.json({ status: 'ok', service: 'teable-mcp-server' });
	});

	// ============ ADMIN API ============

	// Create customer
	app.post('/api/customers', async (req: Request, res: Response) => {
		try {
			const { name, email, stripeSessionId, stripeCustomerId, tier } = req.body;

			if (!name || !email) {
				res.status(400).json({ error: 'Name and email are required' });
				return;
			}

			// Use createCustomerWithStripe if session ID provided, otherwise basic create
			if (stripeSessionId) {
				const customer = await createCustomerWithStripe(
					name,
					email,
					stripeCustomerId || null,
					stripeSessionId,
					tier || 'base',
					250000
				);
				res.json(customer);
			} else {
				const customer = await createCustomer(name, email);
				res.json(customer);
			}
		} catch (error) {
			console.error('Error creating customer:', error);
			res.status(500).json({ error: 'Failed to create customer' });
		}
	});

	// List customers
	app.get('/api/customers', async (req: Request, res: Response) => {
		try {
			const customers = await listCustomers();
			res.json(customers);
		} catch (error) {
			console.error('Error listing customers:', error);
			res.status(500).json({ error: 'Failed to list customers' });
		}
	});

	// Get customer by MCP key
	app.get('/api/customers/:mcpKey', async (req: Request, res: Response) => {
		try {
			const customer = await getCustomerByMcpKey(req.params.mcpKey);
			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}
			// Don't expose encrypted token
			const { encrypted_token, ...safeCustomer } = customer;
			res.json(safeCustomer);
		} catch (error) {
			console.error('Error getting customer:', error);
			res.status(500).json({ error: 'Failed to get customer' });
		}
	});

	// Get customers by email (for dashboard)
	app.get('/api/customers/by-email/:email', async (req: Request, res: Response) => {
		try {
			const email = decodeURIComponent(req.params.email);
			const customers = await getCustomersByEmail(email);
			// Don't expose encrypted tokens
			const safeCustomers = customers.map(c => {
				const { encrypted_token, ...safe } = c;
				return safe;
			});
			res.json({ customers: safeCustomers });
		} catch (error) {
			console.error('Error getting customers by email:', error);
			res.status(500).json({ error: 'Failed to get customers' });
		}
	});

	// Get customer by Stripe session ID (for post-payment redirect)
	app.get('/api/customers/by-session/:sessionId', async (req: Request, res: Response) => {
		try {
			const sessionId = req.params.sessionId;
			const customer = await getCustomerByStripeSessionId(sessionId);

			if (!customer) {
				res.status(404).json({ error: 'Customer not found', pending: true });
				return;
			}

			// Don't expose encrypted token
			const { encrypted_token, ...safeCustomer } = customer;
			res.json(safeCustomer);
		} catch (error) {
			console.error('Error getting customer by session:', error);
			res.status(500).json({ error: 'Failed to get customer' });
		}
	});

	// Fallback: Create customer from Stripe session (when webhook didn't work)
	app.post('/api/customers/from-stripe-session', async (req: Request, res: Response) => {
		try {
			const { sessionId } = req.body;

			if (!sessionId) {
				res.status(400).json({ error: 'sessionId is required' });
				return;
			}

			// First check if customer already exists
			const existingCustomer = await getCustomerByStripeSessionId(sessionId);
			if (existingCustomer) {
				const { encrypted_token, ...safeCustomer } = existingCustomer;
				res.json(safeCustomer);
				return;
			}

			// Retrieve session from Stripe
			const stripe = getStripe();
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			if (!session || session.payment_status !== 'paid') {
				res.status(400).json({ error: 'Payment not completed' });
				return;
			}

			// Get customer details
			const customerEmail = session.customer_details?.email || '';
			const customerName = session.customer_details?.name || customerEmail.split('@')[0];

			if (!customerEmail) {
				res.status(400).json({ error: 'No email found in session' });
				return;
			}

			console.log('Creating customer from Stripe session:', sessionId, customerEmail);

			// Check if customer with this email already exists (different session)
			const existingByEmail = await getCustomersByEmail(customerEmail);
			if (existingByEmail.length > 0) {
				console.log('Customer already exists for email:', customerEmail, '- returning existing');
				const { encrypted_token, ...safeCustomer } = existingByEmail[0];
				res.json(safeCustomer);
				return;
			}

			// Create customer in database
			const newCustomer = await createCustomerWithStripe(
				customerName,
				customerEmail,
				session.customer as string || null,
				sessionId,
				'base',
				250000
			);

			if (!newCustomer) {
				res.status(500).json({ error: 'Failed to create customer' });
				return;
			}

			const { encrypted_token, ...safeCustomer } = newCustomer;
			res.json(safeCustomer);
		} catch (error) {
			console.error('Error creating customer from Stripe session:', error);
			res.status(500).json({ error: 'Failed to retrieve payment details' });
		}
	});

	// Save customer token
	app.post('/api/customers/:mcpKey/token', async (req: Request, res: Response) => {
		try {
			const { token, baseUrl } = req.body;

			if (!token) {
				res.status(400).json({ error: 'Token is required' });
				return;
			}

			console.log('Encrypting token for mcpKey:', req.params.mcpKey);
			const encrypted = encryptToken(token);
			console.log('Token encrypted, updating customer...');
			const teableBaseUrl = baseUrl || 'https://table.resultmarketing.asia';
			const customer = await updateCustomerToken(req.params.mcpKey, encrypted, teableBaseUrl);

			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}

			console.log('Customer updated successfully:', customer.id);
			res.json({ success: true, status: customer.status });
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Error saving token:', errorMessage, error);
			res.status(500).json({ error: 'Failed to save token', details: errorMessage });
		}
	});

	// Auto-provision Teable account on table.resultmarketing.asia
	app.post('/api/provision-teable', async (req: Request, res: Response) => {
		const TEABLE_RM_URL = 'https://table.resultmarketing.asia';

		try {
			const { mcpKey, email, name } = req.body;

			if (!mcpKey || !email) {
				res.status(400).json({ error: 'mcpKey and email are required' });
				return;
			}

			// Generate a secure random password
			let password = generateSecurePassword();
			let sessionCookie: string | null = null;
			let isExistingUser = false;

			console.log('Creating Teable account for:', email);

			// Step 1: Try to create account on Teable
			const signupResponse = await fetch(`${TEABLE_RM_URL}/api/auth/signup`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email,
					password,
					defaultSpaceName: name ? `${name}'s Workspace` : 'My Workspace'
				})
			});

			if (!signupResponse.ok) {
				const errData = await signupResponse.json().catch(() => ({}));
				const errorMessage = errData.message || '';

				// Check if user already exists - try to signin instead
				if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
					console.log('User already exists in Teable, checking for stored password...');
					isExistingUser = true;

					// Check if we have stored password for this user
					const existingCustomer = await getCustomerByMcpKey(mcpKey);
					if (existingCustomer?.encrypted_password) {
						// Use stored password to signin
						const storedPassword = decryptToken(existingCustomer.encrypted_password);
						console.log('Found stored password, attempting signin...');

						const signinResponse = await fetch(`${TEABLE_RM_URL}/api/auth/signin`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email, password: storedPassword })
						});

						if (signinResponse.ok) {
							const signinCookie = signinResponse.headers.get('set-cookie');
							sessionCookie = signinCookie?.match(/auth_session=([^;]+)/)?.[0] || null;
							password = storedPassword; // Keep using stored password
							console.log('Signin successful with stored password');
						}
					}

					// If no stored password or signin failed, try with new password via password reset
					if (!sessionCookie) {
						console.log('No stored password or signin failed. Attempting to send password reset...');

						// Try to trigger password reset
						const resetResponse = await fetch(`${TEABLE_RM_URL}/api/auth/send-reset-password-email`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ email })
						});

						if (resetResponse.ok) {
							res.status(400).json({
								error: 'User already exists in Teable. A password reset email has been sent. Please check email and reset password, then try again.',
								needsPasswordReset: true,
								email
							});
							return;
						}

						// If reset also failed, return error
						res.status(400).json({
							error: `User ${email} already exists in Teable but password is unknown. Please contact admin to reset the Teable account.`,
							existingUser: true
						});
						return;
					}
				} else {
					console.error('Teable signup failed:', errData);
					throw new Error(errData.message || 'Failed to create Teable account');
				}
			} else {
				// Get the auth session cookie from signup response
				const setCookieHeader = signupResponse.headers.get('set-cookie');
				sessionCookie = setCookieHeader?.match(/auth_session=([^;]+)/)?.[0] || null;
			}

			if (!sessionCookie) {
				throw new Error('Failed to get session after signup/signin');
			}

			console.log(isExistingUser ? 'Signed in to existing account' : 'Account created', ', generating access token...');

			// Step 2: Create access token
			const tokenResponse = await fetch(`${TEABLE_RM_URL}/api/access-token`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cookie': sessionCookie
				},
				body: JSON.stringify({
					name: 'AI Connector',
					description: 'Auto-generated for Result Marketing AI Connector',
					scopes: [
						'table|read', 'table|create', 'table|update', 'table|delete',
						'record|read', 'record|create', 'record|update', 'record|delete',
						'view|read', 'view|create', 'view|update', 'view|delete',
						'field|read', 'field|create', 'field|update', 'field|delete',
						'base|read', 'base|create', 'base|update', 'base|delete',
						'space|read', 'space|create', 'space|update', 'space|delete'
					],
					hasFullAccess: true,
					expiredTime: '2028-01-01' // 2+ years from now
				})
			});

			if (!tokenResponse.ok) {
				const errData = await tokenResponse.json().catch(() => ({}));
				console.error('Token creation failed:', errData);
				throw new Error(errData.message || 'Failed to create access token');
			}

			const tokenData = await tokenResponse.json();
			const accessToken = tokenData.token;

			console.log('Access token created, creating CRM template...');

			// Step 3: Get the user's default space and create CRM template
			try {
				const spacesResponse = await fetch(`${TEABLE_RM_URL}/api/space`, {
					headers: { 'Authorization': `Bearer ${accessToken}` }
				});

				if (spacesResponse.ok) {
					const spaces = await spacesResponse.json();
					if (spaces && spaces.length > 0) {
						const defaultSpaceId = spaces[0].id;
						console.log('Found default space:', defaultSpaceId);
						await createCrmTemplate(TEABLE_RM_URL, accessToken, defaultSpaceId);
					}
				}
			} catch (templateError) {
				console.error('CRM template creation failed (non-critical):', templateError);
				// Continue anyway - user can still use the account
			}

			console.log('Saving token to database...');

			// Step 4: Save encrypted token to our database
			const encrypted = encryptToken(accessToken);
			await updateCustomerToken(mcpKey, encrypted, TEABLE_RM_URL);

			// Step 5: Hash and store password for dashboard login (also store encrypted for retrieval)
			const passwordHash = hashPassword(password);
			const encryptedPassword = encryptToken(password);
			await updateCustomerPasswordHash(mcpKey, passwordHash, encryptedPassword);
			console.log('Password hash and encrypted password saved for dashboard access');

			console.log('Teable provisioning complete for:', email);

			// Return credentials (password shown once, token is stored encrypted)
			res.json({
				success: true,
				email,
				password,
				teableUrl: TEABLE_RM_URL
			});

		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Provision error:', errorMessage, error);
			res.status(500).json({ error: errorMessage });
		}
	});

	// Get upgrade links and limits for a customer
	app.get('/api/customers/:mcpKey/limits', async (req: Request, res: Response) => {
		try {
			const customer = await getCustomerByMcpKey(req.params.mcpKey);
			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}
			res.json({
				record_limit: customer.record_limit,
				tier: customer.tier,
				upgrade_links: {
					pro: PAYMENT_LINK_PRO,
					enterprise: PAYMENT_LINK_ENTERPRISE
				}
			});
		} catch (error) {
			console.error('Error getting customer limits:', error);
			res.status(500).json({ error: 'Failed to get customer limits' });
		}
	});

	// Mark onboarding complete
	app.post('/api/customers/onboarding-complete', async (req: Request, res: Response) => {
		try {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({ error: 'Email is required' });
				return;
			}

			await markOnboardingComplete(email);
			res.json({ success: true });
		} catch (error) {
			console.error('Error marking onboarding complete:', error);
			res.status(500).json({ error: 'Failed to mark onboarding complete' });
		}
	});

	// ============ DASHBOARD AUTH ENDPOINTS ============

	// Dashboard login - verify email + password
	app.post('/api/auth/dashboard-login', async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({ error: 'Email and password are required' });
				return;
			}

			// Find customer by email
			const customer = await getCustomerForLogin(email);

			if (!customer) {
				res.status(401).json({ error: 'Invalid email or password' });
				return;
			}

			// Check if password hash exists
			if (!customer.password_hash) {
				res.status(401).json({ error: 'Account not set up. Please complete setup first.' });
				return;
			}

			// Verify password
			const isValid = verifyPassword(password, customer.password_hash);

			if (!isValid) {
				res.status(401).json({ error: 'Invalid email or password' });
				return;
			}

			// Generate session token (simple approach - just use mcp_key as auth)
			const sessionToken = randomBytes(32).toString('hex');

			// Return customer data (without sensitive fields)
			res.json({
				success: true,
				sessionToken,
				customer: {
					id: customer.id,
					name: customer.name,
					email: customer.email,
					mcp_key: customer.mcp_key,
					teable_base_url: customer.teable_base_url,
					tier: customer.tier,
					record_limit: customer.record_limit,
					status: customer.status
				}
			});

		} catch (error) {
			console.error('Dashboard login error:', error);
			res.status(500).json({ error: 'Login failed' });
		}
	});

	// Store password reset tokens (in-memory, use Redis in production)
	const resetTokens = new Map<string, { email: string; expires: number }>();

	// Forgot password - send reset email
	app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
		try {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({ error: 'Email is required' });
				return;
			}

			// Find customer
			const customer = await getCustomerForLogin(email);

			// Always return success to prevent email enumeration
			if (!customer) {
				res.json({ success: true, message: 'If an account exists, a reset link will be sent.' });
				return;
			}

			// Generate reset token
			const resetToken = randomBytes(32).toString('hex');
			const expires = Date.now() + (60 * 60 * 1000); // 1 hour
			resetTokens.set(resetToken, { email, expires });

			// Send reset email
			const resetUrl = `${FRONTEND_URL}/reset-password.html?token=${resetToken}`;

			try {
				await getResend().emails.send({
					from: 'Result Marketing <noreply@resultmarketing.asia>',
					to: email,
					subject: 'Reset Your Password - Result Marketing',
					html: `
						<h1>Password Reset</h1>
						<p>You requested to reset your password. Click the link below to set a new password:</p>
						<p><a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>
						<p>Or copy this link: ${resetUrl}</p>
						<p>This link expires in 1 hour.</p>
						<p>If you didn't request this, please ignore this email.</p>
						<hr>
						<p>- The Result Marketing Team</p>
					`
				});
			} catch (emailError) {
				console.error('Failed to send reset email:', emailError);
			}

			res.json({ success: true, message: 'If an account exists, a reset link will be sent.' });

		} catch (error) {
			console.error('Forgot password error:', error);
			res.status(500).json({ error: 'Failed to process request' });
		}
	});

	// Validate reset token
	app.get('/api/auth/validate-reset-token/:token', async (req: Request, res: Response) => {
		const { token } = req.params;
		const resetData = resetTokens.get(token);

		if (!resetData) {
			res.status(400).json({ error: 'Invalid or expired reset token' });
			return;
		}

		if (Date.now() > resetData.expires) {
			resetTokens.delete(token);
			res.status(400).json({ error: 'Reset token has expired' });
			return;
		}

		res.json({ success: true, email: resetData.email });
	});

	// Reset password with token
	app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
		try {
			const { token, password } = req.body;

			if (!token || !password) {
				res.status(400).json({ error: 'Token and password are required' });
				return;
			}

			if (password.length < 8) {
				res.status(400).json({ error: 'Password must be at least 8 characters' });
				return;
			}

			// Validate token
			const resetData = resetTokens.get(token);

			if (!resetData) {
				res.status(400).json({ error: 'Invalid or expired reset token' });
				return;
			}

			if (Date.now() > resetData.expires) {
				resetTokens.delete(token);
				res.status(400).json({ error: 'Reset token has expired' });
				return;
			}

			// Find customer
			const customer = await getCustomerForLogin(resetData.email);

			if (!customer) {
				res.status(400).json({ error: 'Account not found' });
				return;
			}

			// Hash new password and update
			const passwordHash = hashPassword(password);
			await updateCustomerPasswordHash(customer.mcp_key, passwordHash);

			// Delete used token
			resetTokens.delete(token);

			// Also update Teable password
			const TEABLE_RM_URL = 'https://table.resultmarketing.asia';
			try {
				// This would require admin access to Teable's auth API
				// For now, log that this would need to be synced
				console.log('Password reset for:', resetData.email, '- Teable sync would be needed');
			} catch (teableError) {
				console.error('Teable password sync failed:', teableError);
			}

			res.json({ success: true, message: 'Password reset successfully' });

		} catch (error) {
			console.error('Reset password error:', error);
			res.status(500).json({ error: 'Failed to reset password' });
		}
	});

	// Change password (for logged-in users)
	app.post('/api/auth/change-password', async (req: Request, res: Response) => {
		try {
			const { mcpKey, currentPassword, newPassword } = req.body;

			if (!mcpKey || !currentPassword || !newPassword) {
				res.status(400).json({ error: 'All fields are required' });
				return;
			}

			if (newPassword.length < 8) {
				res.status(400).json({ error: 'New password must be at least 8 characters' });
				return;
			}

			// Get customer
			const customer = await getCustomerByMcpKey(mcpKey);

			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}

			// Verify current password
			if (!customer.password_hash || !verifyPassword(currentPassword, customer.password_hash)) {
				res.status(401).json({ error: 'Current password is incorrect' });
				return;
			}

			// Hash and update new password
			const passwordHash = hashPassword(newPassword);
			await updateCustomerPasswordHash(mcpKey, passwordHash);

			res.json({ success: true, message: 'Password changed successfully' });

		} catch (error) {
			console.error('Change password error:', error);
			res.status(500).json({ error: 'Failed to change password' });
		}
	});

	// Get customer dashboard data by mcp_key (for authenticated sessions)
	app.get('/api/dashboard/:mcpKey', async (req: Request, res: Response) => {
		try {
			const customer = await getCustomerByMcpKey(req.params.mcpKey);

			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}

			// Decrypt password if available
			let teablePassword: string | null = null;
			if (customer.encrypted_password) {
				try {
					teablePassword = decryptToken(customer.encrypted_password);
				} catch (e) {
					console.error('Failed to decrypt password:', e);
				}
			}

			// Return dashboard data
			res.json({
				success: true,
				customer: {
					id: customer.id,
					name: customer.name,
					email: customer.email,
					mcp_key: customer.mcp_key,
					teable_base_url: customer.teable_base_url,
					tier: customer.tier,
					record_limit: customer.record_limit,
					status: customer.status,
					onboarding_complete: customer.onboarding_complete
				},
				teable_password: teablePassword,
				mcp_url: `https://teable-mcp-server-production.up.railway.app/mcp/${customer.mcp_key}/mcp`,
				claude_config: {
					mcpServers: {
						"resultmarketing-ai": {
							command: "npx",
							args: ["-y", "mcp-remote", `https://teable-mcp-server-production.up.railway.app/mcp/${customer.mcp_key}/mcp`]
						}
					}
				}
			});

		} catch (error) {
			console.error('Dashboard data error:', error);
			res.status(500).json({ error: 'Failed to get dashboard data' });
		}
	});

	// ============ DEBUG ENDPOINT ============

	// Debug endpoint to test PAT validity
	app.get('/api/debug/test-pat/:mcpKey', async (req: Request, res: Response) => {
		try {
			const customer = await getCustomerByMcpKey(req.params.mcpKey);

			if (!customer) {
				res.json({ error: 'Customer not found', step: 'lookup' });
				return;
			}

			if (!customer.encrypted_token) {
				res.json({ error: 'No encrypted token found', step: 'token_check', customer_email: customer.email });
				return;
			}

			// Try to decrypt
			let decryptedToken: string;
			try {
				decryptedToken = decryptToken(customer.encrypted_token);
			} catch (decryptError) {
				res.json({
					error: 'Decryption failed',
					step: 'decrypt',
					message: decryptError instanceof Error ? decryptError.message : 'Unknown',
					encrypted_token_length: customer.encrypted_token.length,
					encrypted_token_preview: customer.encrypted_token.substring(0, 50) + '...'
				});
				return;
			}

			// Test the token against Teable API
			const teableUrl = customer.teable_base_url || 'https://table.resultmarketing.asia';
			const testResponse = await fetch(`${teableUrl}/api/space`, {
				headers: {
					'Authorization': `Bearer ${decryptedToken}`
				}
			});

			const responseText = await testResponse.text();
			let responseJson;
			try {
				responseJson = JSON.parse(responseText);
			} catch {
				responseJson = null;
			}

			res.json({
				success: testResponse.ok,
				step: 'api_test',
				customer_email: customer.email,
				teable_url: teableUrl,
				token_length: decryptedToken.length,
				token_preview: decryptedToken.substring(0, 10) + '...',
				api_status: testResponse.status,
				api_response_type: testResponse.headers.get('content-type'),
				api_response_is_json: responseJson !== null,
				api_response_preview: responseText.substring(0, 200)
			});

		} catch (error) {
			console.error('Debug PAT test error:', error);
			res.status(500).json({ error: 'Debug test failed', message: error instanceof Error ? error.message : 'Unknown' });
		}
	});

	// ============ STRIPE ENDPOINTS ============

	// Create Stripe Checkout Session
	app.post('/api/checkout', async (req: Request, res: Response) => {
		try {
			const { email, name } = req.body;

			if (!email || !name) {
				res.status(400).json({ error: 'Email and name are required' });
				return;
			}

			const session = await getStripe().checkout.sessions.create({
				payment_method_types: ['card'],
				customer_email: email,
				line_items: [{
					price: PRICE_BASE,
					quantity: 1,
				}],
				mode: 'subscription',
				success_url: `${FRONTEND_URL}/app-login.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${FRONTEND_URL}/teable-checkout.html?cancelled=1`,
				metadata: { name, email, type: 'base' }
			});

			res.json({ url: session.url, sessionId: session.id });
		} catch (error) {
			console.error('Checkout error:', error);
			res.status(500).json({ error: 'Failed to create checkout session' });
		}
	});

	// Create Stripe Checkout for Upgrade
	app.post('/api/checkout/upgrade', async (req: Request, res: Response) => {
		try {
			const { email, tier } = req.body;

			if (!email || !tier) {
				res.status(400).json({ error: 'Email and tier are required' });
				return;
			}

			const priceId = tier === 'pro' ? PRICE_PRO : PRICE_ENTERPRISE;
			const recordLimit = tier === 'pro' ? 250000 : 1000000;

			const session = await getStripe().checkout.sessions.create({
				payment_method_types: ['card'],
				customer_email: email,
				line_items: [{
					price: priceId,
					quantity: 1,
				}],
				mode: 'subscription',
				success_url: `${FRONTEND_URL}/app-dashboard.html?upgrade=success&tier=${tier}`,
				cancel_url: `${FRONTEND_URL}/upsell.html?cancelled=1`,
				metadata: { email, tier, type: 'upgrade', recordLimit: recordLimit.toString() }
			});

			res.json({ url: session.url, sessionId: session.id });
		} catch (error) {
			console.error('Upgrade checkout error:', error);
			res.status(500).json({ error: 'Failed to create upgrade checkout' });
		}
	});

	// Stripe Webhook Handler
	app.post('/api/webhook/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
		console.log('=== WEBHOOK RECEIVED ===');
		console.log('Content-Type:', req.headers['content-type']);
		console.log('Body type:', typeof req.body);
		console.log('Body is Buffer:', Buffer.isBuffer(req.body));

		const sig = req.headers['stripe-signature'] as string;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

		console.log('Signature present:', !!sig);
		console.log('Secret configured:', !!webhookSecret, 'length:', webhookSecret.length);

		let event: Stripe.Event;

		try {
			event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
		} catch (err) {
			console.error('Webhook signature verification failed:', err);
			console.error('Body preview:', req.body?.toString?.()?.substring(0, 100) || 'N/A');
			res.status(400).json({ error: 'Webhook signature verification failed' });
			return;
		}

		console.log('Stripe webhook event verified:', event.type);

		if (event.type === 'checkout.session.completed') {
			const session = event.data.object as Stripe.Checkout.Session;
			const { name, email, type, tier, recordLimit } = session.metadata || {};

			// Get customer details from session (for Payment Links)
			const customerEmail = email || session.customer_details?.email || '';
			const customerName = name || session.customer_details?.name || customerEmail.split('@')[0] || 'Customer';

			// Handle new customer from:
			// 1. Checkout Session with type='base' metadata (from API)
			// 2. Payment Link (subscription or one-time payment without metadata)
			const isNewCustomer = (type === 'base' && customerEmail) ||
				(!type && customerEmail && (session.mode === 'subscription' || session.mode === 'payment'));

			if (isNewCustomer) {
				// New customer - create accounts
				try {
					// Check if customer already exists (duplicate payment)
					const existingCustomers = await getCustomersByEmail(customerEmail);
					if (existingCustomers.length > 0) {
						console.log('Customer already exists for email:', customerEmail, '- skipping creation');
						// Still acknowledge webhook but don't create duplicate
					} else {
						// Create customer in teable_customers (pro tier since they paid)
						const teableCustomer = await createCustomerWithStripe(
							customerName,
							customerEmail,
							session.customer as string || '',
							session.id,
							'pro',
							250000
						);

						// Send welcome email
						await getResend().emails.send({
							from: 'Result Marketing <noreply@resultmarketing.asia>',
							to: customerEmail,
							subject: 'Welcome to Result Marketing - Your AI Connector is Ready!',
							html: `
								<h1>Welcome, ${customerName}!</h1>
								<p>Thank you for your purchase! Your AI Connector account is now active.</p>
								<h2>Next Steps:</h2>
								<ol>
									<li>Complete setup: <a href="${FRONTEND_URL}/payment-success.html?session_id=${session.id}">Continue Setup</a></li>
									<li>Connect your Teable database</li>
									<li>Start using AI with your data!</li>
								</ol>
								<p>Your login email: <strong>${customerEmail}</strong></p>
								<hr>
								<p>Need help? Reply to this email or contact support.</p>
								<p>- The Result Marketing Team</p>
							`
						});

						console.log('New customer created:', customerEmail);
					}
				} catch (error) {
					console.error('Failed to create customer:', error);
				}
			} else if (type === 'upgrade' && customerEmail && tier) {
				// Existing customer upgrade
				try {
					const limit = parseInt(recordLimit || '250000', 10);
					await updateCustomerTier(customerEmail, tier, limit);

					// Send upgrade confirmation email
					await getResend().emails.send({
						from: 'Result Marketing <noreply@resultmarketing.asia>',
						to: email,
						subject: `Upgrade Confirmed - ${tier === 'pro' ? '250,000' : '1,000,000'} Records!`,
						html: `
							<h1>Upgrade Successful!</h1>
							<p>Your Teable storage has been upgraded to <strong>${limit.toLocaleString()} records</strong>.</p>
							<p>Your new plan: <strong>${tier === 'pro' ? 'Pro' : 'Enterprise'}</strong></p>
							<p>Enjoy your expanded storage!</p>
							<hr>
							<p>- The Result Marketing Team</p>
						`
					});

					console.log('Customer upgraded:', email, tier);
				} catch (error) {
					console.error('Failed to upgrade customer:', error);
				}
			}
		}

		res.json({ received: true });
	});

	// ============ ADMIN DASHBOARD API ============

	// Admin authentication middleware
	interface AdminRequest extends Request {
		adminUser?: AdminUser;
	}

	// Store admin sessions (simple in-memory store, use Redis in production)
	const adminSessions = new Map<string, { email: string; expires: number }>();

	// Admin login endpoint
	app.post('/api/admin/login', async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({ error: 'Email and password are required' });
				return;
			}

			// Check if user is admin
			const adminUser = await getAdminByEmail(email);
			if (!adminUser) {
				res.status(401).json({ error: 'Invalid credentials' });
				return;
			}

			// Verify admin password (stored in environment or check against admin table)
			const adminPassword = process.env.ADMIN_PASSWORD || 'admin123!';
			if (password !== adminPassword) {
				res.status(401).json({ error: 'Invalid credentials' });
				return;
			}

			// Create session token
			const sessionToken = randomBytes(32).toString('hex');
			const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
			adminSessions.set(sessionToken, { email, expires });

			res.json({
				success: true,
				token: sessionToken,
				admin: adminUser
			});
		} catch (error) {
			console.error('Admin login error:', error);
			res.status(500).json({ error: 'Login failed' });
		}
	});

	async function requireAdmin(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			res.status(401).json({ error: 'No token provided' });
			return;
		}

		const token = authHeader.substring(7);

		try {
			// Check session store
			const session = adminSessions.get(token);

			if (!session) {
				res.status(401).json({ error: 'Invalid token' });
				return;
			}

			// Check if session expired
			if (Date.now() > session.expires) {
				adminSessions.delete(token);
				res.status(401).json({ error: 'Session expired' });
				return;
			}

			// Get admin user
			const adminUser = await getAdminByEmail(session.email);
			if (!adminUser) {
				res.status(403).json({ error: 'Not authorized as admin' });
				return;
			}

			req.adminUser = adminUser;
			next();
		} catch (error) {
			console.error('Admin auth error:', error);
			res.status(401).json({ error: 'Authentication failed' });
		}
	}

	// Get admin profile
	app.get('/api/admin/me', requireAdmin, async (req: AdminRequest, res: Response) => {
		res.json(req.adminUser);
	});

	// List all customers (with pagination)
	app.get('/api/admin/customers', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const page = parseInt(req.query.page as string) || 1;
			const limit = parseInt(req.query.limit as string) || 50;
			const status = req.query.status as string | undefined;
			const search = req.query.search as string | undefined;

			const result = await getAllCustomers(page, limit, status, search);
			res.json(result);
		} catch (error) {
			console.error('Failed to list customers:', error);
			res.status(500).json({ error: 'Failed to fetch customers' });
		}
	});

	// Get customer details
	app.get('/api/admin/customers/:id', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const customer = await getCustomerById(req.params.id);
			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}
			// Remove encrypted token from response
			const { encrypted_token, ...safeCustomer } = customer;
			res.json(safeCustomer);
		} catch (error) {
			console.error('Failed to get customer:', error);
			res.status(500).json({ error: 'Failed to fetch customer' });
		}
	});

	// List recent Stripe payments
	app.get('/api/admin/stripe/payments', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const stripe = getStripe();
			const limit = parseInt(req.query.limit as string) || 50;

			const sessions = await stripe.checkout.sessions.list({
				limit,
				expand: ['data.customer']
			});

			// Map to simpler format
			const payments = sessions.data.map(session => ({
				id: session.id,
				customer_email: session.customer_details?.email || session.customer_email,
				customer_name: session.customer_details?.name,
				amount_total: session.amount_total,
				currency: session.currency,
				payment_status: session.payment_status,
				status: session.status,
				created: new Date(session.created * 1000).toISOString(),
				metadata: session.metadata
			}));

			res.json({ payments });
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Failed to list Stripe payments:', errorMessage);
			res.status(500).json({ error: 'Failed to fetch payments', details: errorMessage });
		}
	});

	// Get orphaned payments (paid but no customer record)
	app.get('/api/admin/stripe/orphaned', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const stripe = getStripe();
			const sessions = await stripe.checkout.sessions.list({
				limit: 100,
				status: 'complete'
			});

			// Cross-reference with database
			const orphaned = [];
			for (const session of sessions.data) {
				if (session.payment_status === 'paid') {
					const customer = await getCustomerByStripeSessionId(session.id);
					if (!customer) {
						orphaned.push({
							id: session.id,
							customer_email: session.customer_details?.email || session.customer_email,
							customer_name: session.customer_details?.name,
							amount_total: session.amount_total,
							currency: session.currency,
							created: new Date(session.created * 1000).toISOString()
						});
					}
				}
			}

			res.json({ orphaned, count: orphaned.length });
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Failed to get orphaned payments:', errorMessage);
			res.status(500).json({ error: 'Failed to fetch orphaned payments', details: errorMessage });
		}
	});

	// Create customer from orphaned Stripe session (manual provision)
	app.post('/api/admin/stripe/provision', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const { sessionId } = req.body;
			if (!sessionId) {
				res.status(400).json({ error: 'sessionId is required' });
				return;
			}

			// Check if customer already exists
			const existingCustomer = await getCustomerByStripeSessionId(sessionId);
			if (existingCustomer) {
				const { encrypted_token, ...safeCustomer } = existingCustomer;
				res.json({ customer: safeCustomer, message: 'Customer already exists' });
				return;
			}

			// Retrieve session from Stripe
			const stripe = getStripe();
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			if (!session || session.payment_status !== 'paid') {
				res.status(400).json({ error: 'Payment not completed' });
				return;
			}

			const customerEmail = session.customer_details?.email || '';
			const customerName = session.customer_details?.name || customerEmail.split('@')[0];

			if (!customerEmail) {
				res.status(400).json({ error: 'No email found in session' });
				return;
			}

			// Create customer
			const newCustomer = await createCustomerWithStripe(
				customerName,
				customerEmail,
				session.customer as string || null,
				sessionId,
				'base',
				250000
			);

			console.log('Admin provisioned customer:', customerEmail, 'by', req.adminUser?.email);

			const { encrypted_token, ...safeCustomer } = newCustomer;
			res.json({ customer: safeCustomer, message: 'Customer created successfully' });
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Failed to provision customer:', errorMessage);
			res.status(500).json({ error: 'Failed to provision customer', details: errorMessage });
		}
	});

	// Create a free account manually (for demos/testing)
	app.post('/api/admin/create-free-account', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const { name, email } = req.body;

			if (!name || !email) {
				res.status(400).json({ error: 'Name and email are required' });
				return;
			}

			// Check if customer already exists
			const existingCustomers = await getCustomersByEmail(email);
			if (existingCustomers.length > 0) {
				res.status(400).json({ error: 'Customer with this email already exists' });
				return;
			}

			// Step 1: Create customer record (like webhook does)
			const customer = await createCustomerWithStripe(
				name,
				email,
				'', // No Stripe customer ID for free accounts
				'manual_' + Date.now(), // Fake session ID
				'free', // Free tier for manual accounts
				50000 // 50k record limit for free
			);

			console.log('Admin created free account:', email, 'by', req.adminUser?.email);

			// Step 2: Auto-provision Teable account
			const TEABLE_RM_URL = 'https://table.resultmarketing.asia';
			const password = generateSecurePassword();

			try {
				// Create Teable user
				const signupResponse = await fetch(`${TEABLE_RM_URL}/api/auth/signup`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email,
						password,
						defaultSpaceName: name ? `${name}'s Workspace` : 'My Workspace'
					})
				});

				if (!signupResponse.ok) {
					const errorData = await signupResponse.json().catch(() => ({}));
					throw new Error(errorData.message || 'Teable signup failed');
				}

				// Get the auth session cookie from signup response
				const setCookieHeader = signupResponse.headers.get('set-cookie');
				const sessionCookie = setCookieHeader?.match(/auth_session=([^;]+)/)?.[0];

				if (!sessionCookie) {
					throw new Error('Failed to get session after signup');
				}

				console.log('Free account created, generating access token...');

				// Create access token using session cookie
				const tokenResponse = await fetch(`${TEABLE_RM_URL}/api/access-token`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Cookie': sessionCookie
					},
					body: JSON.stringify({
						name: 'AI Connector',
						description: 'Auto-generated for Result Marketing AI Connector',
						scopes: [
							'table|read', 'table|create', 'table|update', 'table|delete',
							'record|read', 'record|create', 'record|update', 'record|delete',
							'view|read', 'view|create', 'view|update', 'view|delete',
							'field|read', 'field|create', 'field|update', 'field|delete',
							'base|read', 'base|create', 'base|update', 'base|delete',
							'space|read', 'space|create', 'space|update', 'space|delete'
						],
						hasFullAccess: true,
						expiredTime: '2028-01-01'
					})
				});

				if (!tokenResponse.ok) {
					const errData = await tokenResponse.json().catch(() => ({}));
					console.error('Token creation failed:', errData);
					throw new Error(errData.message || 'Failed to create access token');
				}

				const tokenData = await tokenResponse.json();
				const accessToken = tokenData.token;

				if (!accessToken) {
					throw new Error('No access token in response');
				}

				// Save encrypted token
				const encryptedToken = encryptToken(accessToken);
				await updateCustomerToken(customer.mcp_key, encryptedToken, TEABLE_RM_URL);

				// Save password hash and encrypted password
				const passwordHash = hashPassword(password);
				const encryptedPassword = encryptToken(password);
				await updateCustomerPasswordHash(customer.mcp_key, passwordHash, encryptedPassword);

				console.log('Teable account provisioned for free account:', email);

				// Return credentials
				res.json({
					success: true,
					customer: {
						id: customer.id,
						name: customer.name,
						email: customer.email,
						mcp_key: customer.mcp_key,
						tier: customer.tier,
						status: 'active'
					},
					credentials: {
						teable_url: TEABLE_RM_URL,
						email: email,
						password: password
					},
					dashboard_url: `https://www.resultmarketing.asia/dashboard.html?mcp_key=${customer.mcp_key}&pwd=${encodeURIComponent(password)}`
				});

			} catch (provisionError) {
				// If provisioning fails, still return customer info but with error
				console.error('Teable provisioning failed for free account:', provisionError);
				res.json({
					success: false,
					customer: {
						id: customer.id,
						name: customer.name,
						email: customer.email,
						mcp_key: customer.mcp_key,
						tier: customer.tier,
						status: 'pending'
					},
					error: 'Account created but Teable provisioning failed. Use manual provisioning.',
					provisionError: provisionError instanceof Error ? provisionError.message : 'Unknown error'
				});
			}

		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error('Failed to create free account:', errorMessage);
			res.status(500).json({ error: 'Failed to create account', details: errorMessage });
		}
	});

	// Manually trigger Teable provisioning for a customer
	app.post('/api/admin/provision-teable/:mcpKey', requireAdmin, async (req: AdminRequest, res: Response) => {
		try {
			const { mcpKey } = req.params;
			const customer = await getCustomerByMcpKey(mcpKey);

			if (!customer) {
				res.status(404).json({ error: 'Customer not found' });
				return;
			}

			// Forward to the existing provision-teable endpoint logic
			// This reuses the existing provisioning code
			const provisionUrl = `${req.protocol}://${req.get('host')}/api/provision-teable`;
			const provisionResponse = await fetch(provisionUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mcpKey,
					email: customer.email,
					name: customer.name
				})
			});

			const result = await provisionResponse.json();

			if (!provisionResponse.ok) {
				res.status(provisionResponse.status).json(result);
				return;
			}

			console.log('Admin triggered Teable provisioning for:', customer.email, 'by', req.adminUser?.email);
			res.json(result);
		} catch (error) {
			console.error('Failed to provision Teable:', error);
			res.status(500).json({ error: 'Failed to provision Teable account' });
		}
	});

	// ============ MCP ENDPOINTS ============

	// SSE endpoint for MCP connections
	app.get('/mcp/:mcpKey/sse', async (req: Request, res: Response) => {
		const { mcpKey } = req.params;

		try {
			// Validate customer
			const customer = await getCustomerByMcpKey(mcpKey);

			if (!customer) {
				res.status(404).json({ error: 'Invalid MCP key' });
				return;
			}

			if (customer.status !== 'active') {
				res.status(403).json({ error: 'Subscription not active' });
				return;
			}

			if (!customer.encrypted_token) {
				res.status(400).json({ error: 'API token not configured' });
				return;
			}

			// Decrypt the API key
			const apiKey = decryptToken(customer.encrypted_token);

			// Create limits object for this customer
			const limits: CustomerLimits = {
				recordLimit: customer.record_limit || 250000,
				tier: customer.tier || 'free'
			};

			// Create MCP server for this customer
			const server = createTeableMcpServer(apiKey, customer.teable_base_url, limits);

			// Create SSE transport
			const transport = new SSEServerTransport('/mcp/' + mcpKey + '/messages', res);
			transports.set(mcpKey, transport);

			// Log connection
			await logUsage(customer.id, 'connection');

			// Clean up on disconnect
			res.on('close', () => {
				transports.delete(mcpKey);
			});

			await server.connect(transport);
		} catch (error) {
			console.error('SSE connection error:', error);
			res.status(500).json({ error: 'Connection failed' });
		}
	});

	// Message endpoint for MCP
	app.post('/mcp/:mcpKey/messages', async (req: Request, res: Response) => {
		const { mcpKey } = req.params;
		const transport = transports.get(mcpKey);

		if (!transport) {
			res.status(404).json({ error: 'No active SSE connection' });
			return;
		}

		try {
			await transport.handlePostMessage(req, res);
		} catch (error) {
			console.error('Message handling error:', error);
			res.status(500).json({ error: 'Failed to process message' });
		}
	});

	// Streamable HTTP endpoint for MCP (supports POST, GET, DELETE)
	app.all('/mcp/:mcpKey/mcp', async (req: Request, res: Response) => {
		const { mcpKey } = req.params;

		try {
			const customer = await getCustomerByMcpKey(mcpKey);

			if (!customer) {
				res.status(404).json({ error: 'Invalid MCP key' });
				return;
			}

			if (customer.status !== 'active') {
				res.status(403).json({ error: 'Subscription not active' });
				return;
			}

			if (!customer.encrypted_token) {
				res.status(400).json({ error: 'API token not configured' });
				return;
			}

			const apiKey = decryptToken(customer.encrypted_token);

			// Create limits object for this customer
			const limits: CustomerLimits = {
				recordLimit: customer.record_limit || 250000,
				tier: customer.tier || 'free'
			};

			// Get or create session ID from header
			const sessionId = req.headers['mcp-session-id'] as string || randomUUID();
			const transportKey = `${mcpKey}:${sessionId}`;

			// Handle different methods
			if (req.method === 'POST') {
				let transport = httpTransports.get(transportKey);
				let server = httpServers.get(transportKey);

				// Create new transport and server if needed
				if (!transport) {
					transport = new StreamableHTTPServerTransport({
						sessionIdGenerator: () => sessionId,
					});
					httpTransports.set(transportKey, transport);

					server = createTeableMcpServer(apiKey, customer.teable_base_url, limits);
					httpServers.set(transportKey, server);

					await server.connect(transport);
					console.log('New Streamable HTTP session:', sessionId);
				}

				// Log tool usage
				const requestBody = req.body;
				if (requestBody?.method === 'tools/call') {
					await logUsage(customer.id, requestBody.params?.name || 'unknown');
				}

				await transport.handleRequest(req, res);
			} else if (req.method === 'GET') {
				// GET is for SSE stream in Streamable HTTP
				const transport = httpTransports.get(transportKey);
				if (transport) {
					await transport.handleRequest(req, res);
				} else {
					res.status(400).json({ error: 'No session. Send POST first.' });
				}
			} else if (req.method === 'DELETE') {
				// Clean up session
				const transport = httpTransports.get(transportKey);
				const server = httpServers.get(transportKey);
				if (transport) {
					await transport.close();
					httpTransports.delete(transportKey);
				}
				if (server) {
					await server.close();
					httpServers.delete(transportKey);
				}
				res.status(200).json({ success: true });
			} else {
				res.status(405).json({ error: 'Method not allowed' });
			}
		} catch (error) {
			console.error('MCP request error:', error);
			res.status(500).json({ error: 'Request failed' });
		}
	});

	app.listen(PORT, () => {
		console.log(`Teable MCP Server running on http://localhost:${PORT}`);
		console.log('Endpoints:');
		console.log(`  Health: GET /health`);
		console.log(`  Admin API: POST/GET /api/customers`);
		console.log(`  MCP SSE: GET /mcp/:mcpKey/sse`);
		console.log(`  MCP Messages: POST /mcp/:mcpKey/messages`);
	});
}

main().catch(console.error);
