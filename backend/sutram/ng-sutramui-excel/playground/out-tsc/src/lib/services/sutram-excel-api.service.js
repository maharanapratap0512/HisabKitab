/**
 * sutram-excel-api.service.ts
 * ─────────────────────────────────────────────────────────────
 * Type-safe HTTP Client for sutramExcel backend API.
 * Communicates with /_sutram/excel/* endpoints.
 * ─────────────────────────────────────────────────────────────
 */
import { Injectable, Inject, Optional } from '@angular/core';
import { map } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export const SUTRAM_EXCEL_API_BASE = 'SUTRAM_EXCEL_API_BASE';
export class SutramExcelApiService {
    http;
    baseUri;
    constructor(http, apiBase) {
        this.http = http;
        this.baseUri = apiBase || '/_sutram/excel';
        // Strip trailing slash if present
        if (this.baseUri.endsWith('/')) {
            this.baseUri = this.baseUri.slice(0, -1);
        }
    }
    setBaseUri(uri) {
        this.baseUri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
    }
    getBaseUri() {
        return this.baseUri;
    }
    /**
     * GET /tables - Fetch list of registered tables
     */
    getRegisteredTables() {
        return this.http.get(`${this.baseUri}/tables`).pipe(map(res => res.result || []));
    }
    /**
     * GET /config/:table - Fetch derived schema and column config
     */
    getTableConfig(tableName) {
        return this.http.get(`${this.baseUri}/config/${tableName}`).pipe(map(res => res.result));
    }
    /**
     * GET /ref-data/:table - Fetch reference lookup records for FK autocomplete and validation
     */
    getRefData(tableName) {
        return this.http.get(`${this.baseUri}/ref-data/${tableName}`).pipe(map(res => res.result || []));
    }
    /**
     * GET live records for table using direct Sutram API (/api/sutram/:table)
     */
    getTableData(tableName, limit = 500, offset = 0) {
        return this.http.get(`/api/sutram/${tableName}?_limit=${limit}`).pipe(map(res => res.result || []));
    }
    /**
     * GET /data/:table - Chunked lazy-loading with direct DB search, sort, and filters support
     */
    getTableDataChunk(tableName, opts = {}) {
        const params = [];
        params.push(`_limit=${opts.limit ?? 100}`);
        params.push(`_offset=${opts.offset ?? 0}`);
        params.push(`_full=1`);
        if (opts.search)
            params.push(`_search=${encodeURIComponent(opts.search)}`);
        if (opts.sort)
            params.push(`_sort=${encodeURIComponent(opts.sort)}&_order=${opts.order || 'ASC'}`);
        if (opts.filters && Object.keys(opts.filters).length > 0) {
            params.push(`_filters=${encodeURIComponent(JSON.stringify(opts.filters))}`);
        }
        const url = `${this.baseUri}/data/${tableName}?${params.join('&')}`;
        return this.http.get(url).pipe(map(res => ({
            rows: res.result || [],
            total: res.total !== undefined ? res.total : (res.result?.length || 0),
            offset: res.offset || 0,
            limit: res.limit || (opts.limit ?? 100)
        })));
    }
    /**
     * POST /verify/:table - Server-side FK matching, Unicode normalization, and dictionary check
     */
    verifyRows(tableName, rows) {
        return this.http.post(`${this.baseUri}/verify/${tableName}`, { rows }).pipe(map(res => res.result || { rows: [], correctionList: [] }));
    }
    /**
     * POST /import/:table - Single row trigger-aware insertion
     */
    importRow(tableName, row) {
        return this.http.post(`${this.baseUri}/import/${tableName}`, { row }).pipe(map(res => {
            if (!res.success) {
                return { status: 'rejected', error: res.error || 'Import failed' };
            }
            return res.result || { status: 'inserted' };
        }));
    }
    /**
     * POST /update/:table - Single row update on duplicate match
     */
    updateRow(tableName, row) {
        return this.http.post(`${this.baseUri}/update/${tableName}`, { row }).pipe(map(res => res.result || { status: 'updated' }));
    }
    /**
     * POST /error-report - Generates styled ExcelJS workbook of rejected rows
     */
    downloadErrorReport(tableName, rejectedRows) {
        return this.http.post(`${this.baseUri}/error-report`, { table: tableName, rows: rejectedRows }, {
            responseType: 'blob'
        });
    }
    /**
     * GET /dictionary - List all dictionary entries
     */
    getDictionary(type) {
        const url = type ? `${this.baseUri}/dictionary/${type}` : `${this.baseUri}/dictionary`;
        return this.http.get(url).pipe(map(res => res.result || []));
    }
    /**
     * POST /dictionary - Add a new correction entry to xls_dictionary
     */
    addDictionaryEntry(entry) {
        return this.http.post(`${this.baseUri}/dictionary`, entry).pipe(map(res => res.result || { _id: 0 }));
    }
    /**
     * PUT /dictionary/:id - Update an existing dictionary entry
     */
    updateDictionaryEntry(id, patch) {
        return this.http.put(`${this.baseUri}/dictionary/${id}`, patch).pipe(map(res => res.result || { updated: true }));
    }
    /**
     * DELETE /dictionary/:id - Soft-delete dictionary entry (active = 0)
     */
    deleteDictionaryEntry(id) {
        return this.http.delete(`${this.baseUri}/dictionary/${id}`).pipe(map(res => res.result || { deleted: true }));
    }
    /**
     * POST /delete/:table - Delete rows by id(s) via sutramEngine
     */
    deleteRows(tableName, ids) {
        return this.http.post(`${this.baseUri}/delete/${tableName}`, { ids }).pipe(map((res) => {
            if (!res.success) {
                throw new Error(res.error || 'Delete failed');
            }
            return res.result || { status: 'deleted', count: ids.length, ids };
        }));
    }
    static ɵfac = function SutramExcelApiService_Factory(t) { return new (t || SutramExcelApiService)(i0.ɵɵinject(i1.HttpClient), i0.ɵɵinject(SUTRAM_EXCEL_API_BASE, 8)); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SutramExcelApiService, factory: SutramExcelApiService.ɵfac, providedIn: 'root' });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelApiService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], function () { return [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                type: Optional
            }, {
                type: Inject,
                args: [SUTRAM_EXCEL_API_BASE]
            }] }]; }, null); })();
