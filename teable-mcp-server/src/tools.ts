/**
 * MCP Tool definitions for Teable operations
 */

import { z } from 'zod';

// Tool schemas
export const listTablesSchema = z.object({
	baseId: z.string().describe('The Teable base/space ID'),
});

export const getTableSchema = z.object({
	baseId: z.string().describe('The Teable base/space ID'),
	tableId: z.string().describe('The table ID'),
});

export const createTableSchema = z.object({
	baseId: z.string().describe('The Teable base/space ID'),
	name: z.string().describe('Name for the new table'),
	fields: z.array(z.object({
		name: z.string(),
		type: z.string(),
		options: z.record(z.unknown()).optional(),
	})).optional().describe('Initial fields for the table'),
});

export const deleteTableSchema = z.object({
	baseId: z.string().describe('The Teable base/space ID'),
	tableId: z.string().describe('The table ID to delete'),
});

export const listRecordsSchema = z.object({
	tableId: z.string().describe('The table ID'),
	viewId: z.string().optional().describe('Optional view ID to filter records'),
	maxRecords: z.number().optional().describe('Maximum number of records to return'),
	filterByFormula: z.string().optional().describe('Formula to filter records'),
});

export const getRecordSchema = z.object({
	tableId: z.string().describe('The table ID'),
	recordId: z.string().describe('The record ID'),
});

export const createRecordSchema = z.object({
	tableId: z.string().describe('The table ID'),
	fields: z.record(z.unknown()).describe('Field values for the new record'),
});

export const createRecordsSchema = z.object({
	tableId: z.string().describe('The table ID'),
	records: z.array(z.object({
		fields: z.record(z.unknown()),
	})).describe('Array of records to create'),
});

export const updateRecordSchema = z.object({
	tableId: z.string().describe('The table ID'),
	recordId: z.string().describe('The record ID to update'),
	fields: z.record(z.unknown()).describe('Field values to update'),
});

export const updateRecordsSchema = z.object({
	tableId: z.string().describe('The table ID'),
	records: z.array(z.object({
		id: z.string(),
		fields: z.record(z.unknown()),
	})).describe('Array of records to update'),
});

export const deleteRecordSchema = z.object({
	tableId: z.string().describe('The table ID'),
	recordId: z.string().describe('The record ID to delete'),
});

export const deleteRecordsSchema = z.object({
	tableId: z.string().describe('The table ID'),
	recordIds: z.array(z.string()).describe('Array of record IDs to delete'),
});

export const listFieldsSchema = z.object({
	tableId: z.string().describe('The table ID'),
});

export const createFieldSchema = z.object({
	tableId: z.string().describe('The table ID'),
	name: z.string().describe('Field name'),
	type: z.string().describe('Field type (e.g., singleLineText, number, singleSelect)'),
	options: z.record(z.unknown()).optional().describe('Field type options'),
});

export const updateFieldSchema = z.object({
	tableId: z.string().describe('The table ID'),
	fieldId: z.string().describe('The field ID to update'),
	name: z.string().optional().describe('New field name'),
	options: z.record(z.unknown()).optional().describe('Updated field options'),
});

export const deleteFieldSchema = z.object({
	tableId: z.string().describe('The table ID'),
	fieldId: z.string().describe('The field ID to delete'),
});

export const listViewsSchema = z.object({
	tableId: z.string().describe('The table ID'),
});

export const createViewSchema = z.object({
	tableId: z.string().describe('The table ID'),
	name: z.string().describe('View name'),
	type: z.string().optional().default('grid').describe('View type (grid, kanban, etc.)'),
});

export const deleteViewSchema = z.object({
	tableId: z.string().describe('The table ID'),
	viewId: z.string().describe('The view ID to delete'),
});

// Tool definitions for MCP
export const toolDefinitions = [
	{
		name: 'list_tables',
		description: 'List all tables in a Teable base/space',
		inputSchema: {
			type: 'object' as const,
			properties: {
				baseId: { type: 'string', description: 'The Teable base/space ID' },
			},
			required: ['baseId'],
		},
	},
	{
		name: 'get_table',
		description: 'Get details of a specific table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				baseId: { type: 'string', description: 'The Teable base/space ID' },
				tableId: { type: 'string', description: 'The table ID' },
			},
			required: ['baseId', 'tableId'],
		},
	},
	{
		name: 'create_table',
		description: 'Create a new table in a Teable base',
		inputSchema: {
			type: 'object' as const,
			properties: {
				baseId: { type: 'string', description: 'The Teable base/space ID' },
				name: { type: 'string', description: 'Name for the new table' },
				fields: {
					type: 'array',
					description: 'Initial fields for the table',
					items: {
						type: 'object',
						properties: {
							name: { type: 'string' },
							type: { type: 'string' },
							options: { type: 'object' },
						},
						required: ['name', 'type'],
					},
				},
			},
			required: ['baseId', 'name'],
		},
	},
	{
		name: 'delete_table',
		description: 'Delete a table from a Teable base',
		inputSchema: {
			type: 'object' as const,
			properties: {
				baseId: { type: 'string', description: 'The Teable base/space ID' },
				tableId: { type: 'string', description: 'The table ID to delete' },
			},
			required: ['baseId', 'tableId'],
		},
	},
	{
		name: 'list_records',
		description: 'List records in a Teable table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				viewId: { type: 'string', description: 'Optional view ID' },
				maxRecords: { type: 'number', description: 'Maximum records to return' },
				filterByFormula: { type: 'string', description: 'Filter formula' },
			},
			required: ['tableId'],
		},
	},
	{
		name: 'get_record',
		description: 'Get a specific record by ID',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				recordId: { type: 'string', description: 'The record ID' },
			},
			required: ['tableId', 'recordId'],
		},
	},
	{
		name: 'create_record',
		description: 'Create a new record in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				fields: { type: 'object', description: 'Field values for the record' },
			},
			required: ['tableId', 'fields'],
		},
	},
	{
		name: 'create_records',
		description: 'Create multiple records in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				records: {
					type: 'array',
					description: 'Array of records',
					items: {
						type: 'object',
						properties: {
							fields: { type: 'object' },
						},
						required: ['fields'],
					},
				},
			},
			required: ['tableId', 'records'],
		},
	},
	{
		name: 'update_record',
		description: 'Update a record in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				recordId: { type: 'string', description: 'The record ID' },
				fields: { type: 'object', description: 'Field values to update' },
			},
			required: ['tableId', 'recordId', 'fields'],
		},
	},
	{
		name: 'update_records',
		description: 'Update multiple records in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				records: {
					type: 'array',
					description: 'Array of records to update',
					items: {
						type: 'object',
						properties: {
							id: { type: 'string' },
							fields: { type: 'object' },
						},
						required: ['id', 'fields'],
					},
				},
			},
			required: ['tableId', 'records'],
		},
	},
	{
		name: 'delete_record',
		description: 'Delete a record from a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				recordId: { type: 'string', description: 'The record ID' },
			},
			required: ['tableId', 'recordId'],
		},
	},
	{
		name: 'delete_records',
		description: 'Delete multiple records from a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				recordIds: {
					type: 'array',
					description: 'Record IDs to delete',
					items: { type: 'string' },
				},
			},
			required: ['tableId', 'recordIds'],
		},
	},
	{
		name: 'list_fields',
		description: 'List all fields in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
			},
			required: ['tableId'],
		},
	},
	{
		name: 'create_field',
		description: 'Create a new field in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				name: { type: 'string', description: 'Field name' },
				type: { type: 'string', description: 'Field type' },
				options: { type: 'object', description: 'Field options' },
			},
			required: ['tableId', 'name', 'type'],
		},
	},
	{
		name: 'update_field',
		description: 'Update a field in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				fieldId: { type: 'string', description: 'The field ID' },
				name: { type: 'string', description: 'New field name' },
				options: { type: 'object', description: 'Updated options' },
			},
			required: ['tableId', 'fieldId'],
		},
	},
	{
		name: 'delete_field',
		description: 'Delete a field from a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				fieldId: { type: 'string', description: 'The field ID' },
			},
			required: ['tableId', 'fieldId'],
		},
	},
	{
		name: 'list_views',
		description: 'List all views in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
			},
			required: ['tableId'],
		},
	},
	{
		name: 'create_view',
		description: 'Create a new view in a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				name: { type: 'string', description: 'View name' },
				type: { type: 'string', description: 'View type (grid, kanban, etc.)' },
			},
			required: ['tableId', 'name'],
		},
	},
	{
		name: 'delete_view',
		description: 'Delete a view from a table',
		inputSchema: {
			type: 'object' as const,
			properties: {
				tableId: { type: 'string', description: 'The table ID' },
				viewId: { type: 'string', description: 'The view ID' },
			},
			required: ['tableId', 'viewId'],
		},
	},
];
