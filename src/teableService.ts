/**
 * Teable API Service
 * Handles all API calls to Teable
 */

export interface TeableRecord {
	id: string;
	fields: Record<string, unknown>;
}

export interface TeableField {
	id: string;
	name: string;
	type: string;
	options?: Record<string, unknown>;
}

export interface TeableTable {
	id: string;
	name: string;
	fields?: TeableField[];
}

export interface TeableView {
	id: string;
	name: string;
	type: string;
}

export interface ListRecordsOptions {
	viewId?: string;
	projection?: string[];
	cellFormat?: 'json' | 'text';
	fieldKeyType?: 'id' | 'name';
	filterByFormula?: string;
	maxRecords?: number;
}

export class TeableService {
	private readonly apiKey: string;
	private readonly baseUrl: string;

	constructor(apiKey: string, baseUrl = 'https://app.teable.io/api') {
		this.apiKey = apiKey.trim();
		if (!this.apiKey) {
			throw new Error('teable-mcp-server: No API key provided');
		}
		// Ensure baseUrl ends with /api
		let url = baseUrl.replace(/\/$/, ''); // Remove trailing slash
		if (!url.endsWith('/api')) {
			url = `${url}/api`;
		}
		this.baseUrl = url;
	}

	// ============ SPACES & BASES ============

	async listSpaces(): Promise<{ spaces: Array<{ id: string; name: string }> }> {
		return this.fetchApi('/space');
	}

	async getSpace(spaceId: string): Promise<{ id: string; name: string }> {
		return this.fetchApi(`/space/${spaceId}`);
	}

	async listBases(spaceId: string): Promise<{ bases: Array<{ id: string; name: string; spaceId: string }> }> {
		return this.fetchApi(`/space/${spaceId}/base`);
	}

	async getBase(baseId: string): Promise<{ id: string; name: string; spaceId: string }> {
		return this.fetchApi(`/base/${baseId}`);
	}

	// ============ RECORDS ============

	async getRecord(
		tableId: string,
		recordId: string,
		options: { projection?: string[]; cellFormat?: 'json' | 'text'; fieldKeyType?: 'id' | 'name' } = {}
	): Promise<TeableRecord> {
		const params = new URLSearchParams();
		if (options.projection) {
			options.projection.forEach(p => params.append('projection', p));
		}
		if (options.cellFormat) params.append('cellFormat', options.cellFormat);
		if (options.fieldKeyType) params.append('fieldKeyType', options.fieldKeyType);

		const query = params.toString() ? `?${params.toString()}` : '';
		return this.fetchApi(`/table/${tableId}/record/${recordId}${query}`);
	}

	async listRecords(tableId: string, options: ListRecordsOptions = {}): Promise<{ records: TeableRecord[] }> {
		const params = new URLSearchParams();
		if (options.viewId) params.append('viewId', options.viewId);
		if (options.projection) {
			options.projection.forEach(p => params.append('projection', p));
		}
		if (options.cellFormat) params.append('cellFormat', options.cellFormat);
		if (options.fieldKeyType) params.append('fieldKeyType', options.fieldKeyType);
		if (options.filterByFormula) params.append('filterByFormula', options.filterByFormula);
		if (options.maxRecords) params.append('maxRecords', options.maxRecords.toString());

		const query = params.toString() ? `?${params.toString()}` : '';
		return this.fetchApi(`/table/${tableId}/record${query}`);
	}

	async createRecord(tableId: string, fields: Record<string, unknown>): Promise<TeableRecord> {
		return this.fetchApi(`/table/${tableId}/record`, {
			method: 'POST',
			body: JSON.stringify({ fields }),
		});
	}

	async createRecords(tableId: string, records: { fields: Record<string, unknown> }[]): Promise<{ records: TeableRecord[] }> {
		return this.fetchApi(`/table/${tableId}/record`, {
			method: 'POST',
			body: JSON.stringify({ records }),
		});
	}

	async updateRecord(tableId: string, recordId: string, fields: Record<string, unknown>): Promise<TeableRecord> {
		return this.fetchApi(`/table/${tableId}/record/${recordId}`, {
			method: 'PATCH',
			body: JSON.stringify({ fields }),
		});
	}

	async updateRecords(tableId: string, records: { id: string; fields: Record<string, unknown> }[]): Promise<{ records: TeableRecord[] }> {
		return this.fetchApi(`/table/${tableId}/record`, {
			method: 'PATCH',
			body: JSON.stringify({ records }),
		});
	}

	async deleteRecord(tableId: string, recordId: string): Promise<void> {
		await this.fetchApi(`/table/${tableId}/record/${recordId}`, {
			method: 'DELETE',
		});
	}

	async deleteRecords(tableId: string, recordIds: string[]): Promise<void> {
		const params = recordIds.map(id => `recordIds=${id}`).join('&');
		await this.fetchApi(`/table/${tableId}/record?${params}`, {
			method: 'DELETE',
		});
	}

	// ============ TABLES ============

	async listTables(baseId: string): Promise<TeableTable[]> {
		return this.fetchApi(`/base/${baseId}/table`);
	}

	async getTable(baseId: string, tableId: string): Promise<TeableTable> {
		return this.fetchApi(`/base/${baseId}/table/${tableId}`);
	}

	async createTable(baseId: string, name: string, fields?: Partial<TeableField>[]): Promise<TeableTable> {
		return this.fetchApi(`/base/${baseId}/table/`, {
			method: 'POST',
			body: JSON.stringify({ name, fields }),
		});
	}

	async deleteTable(baseId: string, tableId: string): Promise<void> {
		await this.fetchApi(`/base/${baseId}/table/${tableId}`, {
			method: 'DELETE',
		});
	}

	async renameTable(baseId: string, tableId: string, name: string): Promise<void> {
		await this.fetchApi(`/base/${baseId}/table/${tableId}/name`, {
			method: 'PUT',
			body: JSON.stringify({ name }),
		});
	}

	// ============ FIELDS ============

	async listFields(tableId: string): Promise<TeableField[]> {
		return this.fetchApi(`/table/${tableId}/field`);
	}

	async getField(tableId: string, fieldId: string): Promise<TeableField> {
		return this.fetchApi(`/table/${tableId}/field/${fieldId}`);
	}

	async createField(tableId: string, field: Omit<TeableField, 'id'>): Promise<TeableField> {
		return this.fetchApi(`/table/${tableId}/field`, {
			method: 'POST',
			body: JSON.stringify(field),
		});
	}

	async updateField(tableId: string, fieldId: string, updates: Partial<TeableField>): Promise<TeableField> {
		return this.fetchApi(`/table/${tableId}/field/${fieldId}`, {
			method: 'PATCH',
			body: JSON.stringify(updates),
		});
	}

	async deleteField(tableId: string, fieldId: string): Promise<void> {
		await this.fetchApi(`/table/${tableId}/field/${fieldId}`, {
			method: 'DELETE',
		});
	}

	// ============ VIEWS ============

	async listViews(tableId: string): Promise<TeableView[]> {
		return this.fetchApi(`/table/${tableId}/view`);
	}

	async getView(tableId: string, viewId: string): Promise<TeableView> {
		return this.fetchApi(`/table/${tableId}/view/${viewId}`);
	}

	async createView(tableId: string, name: string, type: string = 'grid'): Promise<TeableView> {
		return this.fetchApi(`/table/${tableId}/view`, {
			method: 'POST',
			body: JSON.stringify({ name, type }),
		});
	}

	async deleteView(tableId: string, viewId: string): Promise<void> {
		await this.fetchApi(`/table/${tableId}/view/${viewId}`, {
			method: 'DELETE',
		});
	}

	// ============ RECORD COUNTING ============

	/**
	 * Get total record count across all accessible tables
	 * Used for enforcing record limits
	 */
	async getTotalRecordCount(): Promise<number> {
		let totalCount = 0;

		try {
			// Get all spaces
			const spacesResult = await this.listSpaces();
			const spaces = spacesResult.spaces || [];

			// For each space, get bases
			for (const space of spaces) {
				try {
					const basesResult = await this.listBases(space.id);
					const bases = basesResult.bases || [];

					// For each base, get tables and count records
					for (const base of bases) {
						try {
							const tables = await this.listTables(base.id);

							// For each table, get record count
							for (const table of tables) {
								try {
									// Use maxRecords=1 to just get the total count from response
									const result = await this.listRecords(table.id, { maxRecords: 1 });
									// The records array length is just 1, but we need total
									// Teable API might return total in response, check for it
									const records = result.records || [];
									// For now, do a full count by listing more records
									const fullResult = await this.listRecords(table.id, { maxRecords: 100000 });
									totalCount += (fullResult.records || []).length;
								} catch (e) {
									// Skip tables we can't access
									console.error(`Error counting records in table ${table.id}:`, e);
								}
							}
						} catch (e) {
							// Skip bases we can't access
							console.error(`Error listing tables in base ${base.id}:`, e);
						}
					}
				} catch (e) {
					// Skip spaces we can't access
					console.error(`Error listing bases in space ${space.id}:`, e);
				}
			}
		} catch (e) {
			console.error('Error counting total records:', e);
		}

		return totalCount;
	}

	// ============ HELPER ============

	private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
				...options.headers,
			},
		});

		const responseText = await response.text();

		if (!response.ok) {
			throw new Error(`Teable API Error: ${response.status} ${response.statusText}. Response: ${responseText}`);
		}

		if (!responseText) {
			return undefined as T;
		}

		try {
			return JSON.parse(responseText);
		} catch {
			return responseText as T;
		}
	}
}
