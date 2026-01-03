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
import { getCustomerByMcpKey, logUsage, createCustomerWithStripe, updateCustomerTier, getCustomersByEmail, getCustomerByStripeSessionId } from './supabase.js';
import { decryptToken, encryptToken } from './encryption.js';
import { randomUUID, randomBytes } from 'crypto';
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

	// Skip JSON parsing for MCP endpoints (StreamableHTTPServerTransport needs raw body)
	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.path.includes('/mcp/') && req.path.endsWith('/mcp')) {
			next();
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
			const { createCustomer } = await import('./supabase.js');
			const { name, email } = req.body;

			if (!name || !email) {
				res.status(400).json({ error: 'Name and email are required' });
				return;
			}

			const customer = await createCustomer(name, email);
			res.json(customer);
		} catch (error) {
			console.error('Error creating customer:', error);
			res.status(500).json({ error: 'Failed to create customer' });
		}
	});

	// List customers
	app.get('/api/customers', async (req: Request, res: Response) => {
		try {
			const { listCustomers } = await import('./supabase.js');
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
			const { getCustomersByEmail } = await import('./supabase.js');
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

	// Save customer token
	app.post('/api/customers/:mcpKey/token', async (req: Request, res: Response) => {
		try {
			const { updateCustomerToken } = await import('./supabase.js');
			const { token, baseUrl } = req.body;

			if (!token) {
				res.status(400).json({ error: 'Token is required' });
				return;
			}

			console.log('Encrypting token for mcpKey:', req.params.mcpKey);
			const encrypted = encryptToken(token);
			console.log('Token encrypted, updating customer...');
			const teableBaseUrl = baseUrl || 'https://app.teable.io';
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
			const password = generateSecurePassword();

			console.log('Creating Teable account for:', email);

			// Step 1: Create account on Teable
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
				console.error('Teable signup failed:', errData);
				throw new Error(errData.message || 'Failed to create Teable account');
			}

			// Get the auth session cookie from signup response
			const setCookieHeader = signupResponse.headers.get('set-cookie');
			const sessionCookie = setCookieHeader?.match(/auth_session=([^;]+)/)?.[0];

			if (!sessionCookie) {
				throw new Error('Failed to get session after signup');
			}

			console.log('Account created, generating access token...');

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
			const { updateCustomerToken } = await import('./supabase.js');
			const encrypted = encryptToken(accessToken);
			await updateCustomerToken(mcpKey, encrypted, TEABLE_RM_URL);

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
			const { markOnboardingComplete } = await import('./supabase.js');
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
		const sig = req.headers['stripe-signature'] as string;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

		let event: Stripe.Event;

		try {
			event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
		} catch (err) {
			console.error('Webhook signature verification failed:', err);
			res.status(400).json({ error: 'Webhook signature verification failed' });
			return;
		}

		console.log('Stripe webhook event:', event.type);

		if (event.type === 'checkout.session.completed') {
			const session = event.data.object as Stripe.Checkout.Session;
			const { name, email, type, tier, recordLimit } = session.metadata || {};

			// Get customer details from session (for Payment Links)
			const customerEmail = email || session.customer_details?.email || '';
			const customerName = name || session.customer_details?.name || customerEmail.split('@')[0] || 'Customer';

			// Handle new customer from Checkout Session with metadata OR from Payment Link
			if ((type === 'base' && customerEmail) || (!type && customerEmail && session.mode === 'subscription')) {
				// New customer - create accounts
				try {
					// Create customer in teable_customers
					const teableCustomer = await createCustomerWithStripe(
						customerName,
						customerEmail,
						session.customer as string || '',
						session.id,
						'free',
						5000
					);

					// Also create in Airtable customers table
					const { createAirtableCustomer } = await import('./supabase.js');
					await createAirtableCustomer(customerName, customerEmail, session.customer as string || '', session.id);

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
				recordLimit: customer.record_limit || 5000,
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
				recordLimit: customer.record_limit || 5000,
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
