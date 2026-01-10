/**
 * Teable MCP Server
 * Creates an MCP server instance with Teable tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TeableService } from './teableService.js';
import { toolDefinitions } from './tools.js';
import {
	listTablesSchema,
	getTableSchema,
	createTableSchema,
	deleteTableSchema,
	listRecordsSchema,
	getRecordSchema,
	createRecordSchema,
	createRecordsSchema,
	updateRecordSchema,
	updateRecordsSchema,
	deleteRecordSchema,
	deleteRecordsSchema,
	listFieldsSchema,
	createFieldSchema,
	updateFieldSchema,
	deleteFieldSchema,
	listViewsSchema,
	createViewSchema,
	deleteViewSchema,
} from './tools.js';

// Payment links for upgrades (use environment variable to switch between test/live)
const PAYMENT_LINK_PRO = process.env.PAYMENT_LINK_PRO || 'https://buy.stripe.com/test_00w28q0PEbItaFgciE2Nq00';
const PAYMENT_LINK_ENTERPRISE = process.env.PAYMENT_LINK_ENTERPRISE || 'https://buy.stripe.com/test_6oUeVcdCqaEpaFg4Qc2Nq01';

export interface CustomerLimits {
	recordLimit: number;
	tier: string;
}

function getLimitErrorMessage(currentCount: number, limit: number, tier: string): string {
	const nextTier = tier === 'free' ? 'Pro' : 'Enterprise';
	const nextLimit = tier === 'free' ? '250,000' : '1,000,000';
	const upgradeLink = tier === 'free' ? PAYMENT_LINK_PRO : PAYMENT_LINK_ENTERPRISE;

	if (tier === 'enterprise') {
		return `❌ Record Limit Reached (${currentCount.toLocaleString()}/${limit.toLocaleString()})

You've reached the maximum Enterprise limit. Please contact support for custom plans.`;
	}

	return `❌ Record Limit Reached (${currentCount.toLocaleString()}/${limit.toLocaleString()})

You cannot add more records until you upgrade or delete existing records.

Upgrade to ${nextTier} (${nextLimit} records):
${upgradeLink}`;
}

export function createTeableMcpServer(apiKey: string, baseUrl?: string, limits?: CustomerLimits): McpServer {
	const server = new McpServer({
		name: 'teable-mcp-server',
		version: '1.0.0',
	});

	const teable = new TeableService(apiKey, baseUrl);

	// Register tools

	// ============ SPACES & BASES ============
	server.tool(
		'list_spaces',
		'List all spaces/workspaces the user has access to. Use this first to discover available spaces.',
		z.object({}).shape,
		async () => {
			const result = await teable.listSpaces();
			return {
				content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
			};
		}
	);

	server.tool(
		'list_bases',
		'List all bases in a specific space. Use list_spaces first to get the spaceId.',
		z.object({ spaceId: z.string().describe('The space ID (starts with spc...)') }).shape,
		async (args: { spaceId: string }) => {
			const result = await teable.listBases(args.spaceId);
			return {
				content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
			};
		}
	);

	server.tool(
		'get_base',
		'Get details of a specific base including its tables',
		z.object({ baseId: z.string().describe('The base ID (starts with bse...)') }).shape,
		async (args: { baseId: string }) => {
			const result = await teable.getBase(args.baseId);
			return {
				content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
			};
		}
	);

	// ============ TABLES ============
	server.tool(
		'list_tables',
		'List all tables in a Teable base/space',
		listTablesSchema.shape,
		async (args) => {
			const tables = await teable.listTables(args.baseId);
			return {
				content: [{ type: 'text', text: JSON.stringify(tables, null, 2) }],
			};
		}
	);

	server.tool(
		'get_table',
		'Get details of a specific table',
		getTableSchema.shape,
		async (args) => {
			const table = await teable.getTable(args.baseId, args.tableId);
			return {
				content: [{ type: 'text', text: JSON.stringify(table, null, 2) }],
			};
		}
	);

	server.tool(
		'create_table',
		'Create a new table in a Teable base',
		createTableSchema.shape,
		async (args) => {
			const table = await teable.createTable(args.baseId, args.name, args.fields);
			return {
				content: [{ type: 'text', text: JSON.stringify(table, null, 2) }],
			};
		}
	);

	server.tool(
		'delete_table',
		'Delete a table from a Teable base',
		deleteTableSchema.shape,
		async (args) => {
			await teable.deleteTable(args.baseId, args.tableId);
			return {
				content: [{ type: 'text', text: `Table ${args.tableId} deleted successfully` }],
			};
		}
	);

	server.tool(
		'list_records',
		'List records in a Teable table',
		listRecordsSchema.shape,
		async (args) => {
			const result = await teable.listRecords(args.tableId, {
				viewId: args.viewId,
				maxRecords: args.maxRecords,
				filterByFormula: args.filterByFormula,
			});
			return {
				content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
			};
		}
	);

	server.tool(
		'get_record',
		'Get a specific record by ID',
		getRecordSchema.shape,
		async (args) => {
			const record = await teable.getRecord(args.tableId, args.recordId);
			return {
				content: [{ type: 'text', text: JSON.stringify(record, null, 2) }],
			};
		}
	);

	server.tool(
		'create_record',
		'Create a new record in a table',
		createRecordSchema.shape,
		async (args) => {
			// Check record limit if limits are set
			if (limits) {
				const totalRecords = await teable.getTotalRecordCount();
				if (totalRecords >= limits.recordLimit) {
					return {
						content: [{ type: 'text', text: getLimitErrorMessage(totalRecords, limits.recordLimit, limits.tier) }],
						isError: true,
					};
				}
			}
			const record = await teable.createRecord(args.tableId, args.fields as Record<string, unknown>);
			return {
				content: [{ type: 'text', text: JSON.stringify(record, null, 2) }],
			};
		}
	);

	server.tool(
		'create_records',
		'Create multiple records in a table',
		createRecordsSchema.shape,
		async (args) => {
			// Check record limit if limits are set
			if (limits) {
				const totalRecords = await teable.getTotalRecordCount();
				const newRecordsCount = args.records.length;
				if (totalRecords + newRecordsCount > limits.recordLimit) {
					const remaining = Math.max(0, limits.recordLimit - totalRecords);
					return {
						content: [{ type: 'text', text: `${getLimitErrorMessage(totalRecords, limits.recordLimit, limits.tier)}

You're trying to add ${newRecordsCount} records but only have space for ${remaining}.` }],
						isError: true,
					};
				}
			}
			const result = await teable.createRecords(
				args.tableId,
				args.records as { fields: Record<string, unknown> }[]
			);
			return {
				content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
			};
		}
	);

	server.tool(
		'update_record',
		'Update a record in a table',
		updateRecordSchema.shape,
		async (args) => {
			const record = await teable.updateRecord(
				args.tableId,
				args.recordId,
				args.fields as Record<string, unknown>
			);
			return {
				content: [{ type: 'text', text: JSON.stringify(record, null, 2) }],
			};
		}
	);

	server.tool(
		'update_records',
		'Update multiple records in a table',
		updateRecordsSchema.shape,
		async (args) => {
			const result = await teable.updateRecords(
				args.tableId,
				args.records as { id: string; fields: Record<string, unknown> }[]
			);
			return {
				content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
			};
		}
	);

	server.tool(
		'delete_record',
		'Delete a record from a table',
		deleteRecordSchema.shape,
		async (args) => {
			await teable.deleteRecord(args.tableId, args.recordId);
			return {
				content: [{ type: 'text', text: `Record ${args.recordId} deleted successfully` }],
			};
		}
	);

	server.tool(
		'delete_records',
		'Delete multiple records from a table',
		deleteRecordsSchema.shape,
		async (args) => {
			await teable.deleteRecords(args.tableId, args.recordIds);
			return {
				content: [{ type: 'text', text: `${args.recordIds.length} records deleted successfully` }],
			};
		}
	);

	server.tool(
		'list_fields',
		'List all fields in a table',
		listFieldsSchema.shape,
		async (args) => {
			const fields = await teable.listFields(args.tableId);
			return {
				content: [{ type: 'text', text: JSON.stringify(fields, null, 2) }],
			};
		}
	);

	server.tool(
		'create_field',
		'Create a new field in a table',
		createFieldSchema.shape,
		async (args) => {
			const field = await teable.createField(args.tableId, {
				name: args.name,
				type: args.type,
				options: args.options as Record<string, unknown>,
			});
			return {
				content: [{ type: 'text', text: JSON.stringify(field, null, 2) }],
			};
		}
	);

	server.tool(
		'update_field',
		'Update a field in a table',
		updateFieldSchema.shape,
		async (args) => {
			const field = await teable.updateField(args.tableId, args.fieldId, {
				name: args.name,
				options: args.options as Record<string, unknown>,
			});
			return {
				content: [{ type: 'text', text: JSON.stringify(field, null, 2) }],
			};
		}
	);

	server.tool(
		'delete_field',
		'Delete a field from a table',
		deleteFieldSchema.shape,
		async (args) => {
			await teable.deleteField(args.tableId, args.fieldId);
			return {
				content: [{ type: 'text', text: `Field ${args.fieldId} deleted successfully` }],
			};
		}
	);

	server.tool(
		'list_views',
		'List all views in a table',
		listViewsSchema.shape,
		async (args) => {
			const views = await teable.listViews(args.tableId);
			return {
				content: [{ type: 'text', text: JSON.stringify(views, null, 2) }],
			};
		}
	);

	server.tool(
		'create_view',
		'Create a new view in a table',
		createViewSchema.shape,
		async (args) => {
			const view = await teable.createView(args.tableId, args.name, args.type);
			return {
				content: [{ type: 'text', text: JSON.stringify(view, null, 2) }],
			};
		}
	);

	server.tool(
		'delete_view',
		'Delete a view from a table',
		deleteViewSchema.shape,
		async (args) => {
			await teable.deleteView(args.tableId, args.viewId);
			return {
				content: [{ type: 'text', text: `View ${args.viewId} deleted successfully` }],
			};
		}
	);

	return server;
}
