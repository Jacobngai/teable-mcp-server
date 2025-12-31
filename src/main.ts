/**
 * Teable MCP Server - Multi-tenant Entry Point
 * Supports both stdio and HTTP/SSE transports
 */

import express, { Request, Response, NextFunction } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createTeableMcpServer } from './index.js';
import { getCustomerByMcpKey, logUsage } from './supabase.js';
import { decryptToken, encryptToken } from './encryption.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const TRANSPORT = process.env.MCP_TRANSPORT || 'stdio';

// Store active SSE transports
const transports = new Map<string, SSEServerTransport>();

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
		res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		if (req.method === 'OPTIONS') {
			res.sendStatus(200);
			return;
		}
		next();
	});

	app.use(express.json());

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

	// Save customer token
	app.post('/api/customers/:mcpKey/token', async (req: Request, res: Response) => {
		try {
			const { updateCustomerToken } = await import('./supabase.js');
			const { token } = req.body;

			if (!token) {
				res.status(400).json({ error: 'Token is required' });
				return;
			}

			console.log('Encrypting token for mcpKey:', req.params.mcpKey);
			const encrypted = encryptToken(token);
			console.log('Token encrypted, updating customer...');
			const customer = await updateCustomerToken(req.params.mcpKey, encrypted);

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

			// Create MCP server for this customer
			const server = createTeableMcpServer(apiKey, customer.teable_base_url);

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

	// Legacy /mcp endpoint (direct POST for Streamable HTTP)
	app.post('/mcp/:mcpKey/mcp', async (req: Request, res: Response) => {
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
			const server = createTeableMcpServer(apiKey, customer.teable_base_url);

			// Log tool usage
			const requestBody = req.body;
			if (requestBody?.method === 'tools/call') {
				await logUsage(customer.id, requestBody.params?.name || 'unknown');
			}

			// Handle the request directly
			// For now, return method not supported - need proper streamable HTTP handling
			res.status(501).json({
				error: 'Use SSE transport. Connect to /mcp/' + mcpKey + '/sse',
			});
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
