/**
 * sutram-excel-api.service.ts
 * ─────────────────────────────────────────────────────────────
 * Type-safe HTTP Client for sutramExcel backend API.
 * Communicates with /_sutram/excel/* endpoints.
 * ─────────────────────────────────────────────────────────────
 */

import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SutramTableConfig } from '../models/sutram-excel.model';
import { SutramCorrectionItem, DictionaryEntry } from '../models/sutram-correction.model';

export const SUTRAM_EXCEL_API_BASE = 'SUTRAM_EXCEL_API_BASE';

interface ApiResponse<T = any> {
  success: boolean;
  result?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SutramExcelApiService {
  private baseUri: string;

  constructor(
    private http: HttpClient,
    @Optional() @Inject(SUTRAM_EXCEL_API_BASE) apiBase?: string
  ) {
    this.baseUri = apiBase || '/_sutram/excel';
    // Strip trailing slash if present
    if (this.baseUri.endsWith('/')) {
      this.baseUri = this.baseUri.slice(0, -1);
    }
  }

  public setBaseUri(uri: string): void {
    this.baseUri = uri.endsWith('/') ? uri.slice(0, -1) : uri;
  }

  public getBaseUri(): string {
    return this.baseUri;
  }

  /**
   * GET /tables - Fetch list of registered tables
   */
  public getRegisteredTables(): Observable<Array<{ table: string; display_name: string }>> {
    return this.http.get<ApiResponse<Array<{ table: string; display_name: string }>>>(`${this.baseUri}/tables`).pipe(
      map(res => res.result || [])
    );
  }

  /**
   * GET /config/:table - Fetch derived schema and column config
   */
  public getTableConfig(tableName: string): Observable<SutramTableConfig> {
    return this.http.get<ApiResponse<SutramTableConfig>>(`${this.baseUri}/config/${tableName}`).pipe(
      map(res => res.result!)
    );
  }

  /**
   * GET /ref-data/:table - Fetch reference lookup records for FK autocomplete and validation
   */
  public getRefData(tableName: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUri}/ref-data/${tableName}`).pipe(
      map(res => res.result || [])
    );
  }

  /**
   * GET live records for table using direct Sutram API (/api/sutram/:table)
   */
  public getTableData(tableName: string, limit: number = 500, offset: number = 0): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`/api/sutram/${tableName}?_limit=${limit}`).pipe(
      map(res => res.result || [])
    );
  }

  /**
   * POST /verify/:table - Server-side FK matching, Unicode normalization, and dictionary check
   */
  public verifyRows(
    tableName: string,
    rows: any[]
  ): Observable<{ rows: any[]; correctionList: SutramCorrectionItem[] }> {
    return this.http.post<ApiResponse<{ rows: any[]; correctionList: SutramCorrectionItem[] }>>(
      `${this.baseUri}/verify/${tableName}`,
      { rows }
    ).pipe(
      map(res => res.result || { rows: [], correctionList: [] })
    );
  }

  /**
   * POST /import/:table - Single row trigger-aware insertion
   */
  public importRow(
    tableName: string,
    row: any
  ): Observable<{ status: 'inserted' | 'updated' | 'duplicate' | 'rejected'; data?: any; error?: string }> {
    return this.http.post<ApiResponse<{ status: any; data?: any }>>(
      `${this.baseUri}/import/${tableName}`,
      { row }
    ).pipe(
      map(res => {
        if (!res.success) {
          return { status: 'rejected', error: res.error || 'Import failed' };
        }
        return res.result || { status: 'inserted' };
      })
    );
  }

  /**
   * POST /update/:table - Single row update on duplicate match
   */
  public updateRow(
    tableName: string,
    row: any
  ): Observable<{ status: string; data?: any; error?: string }> {
    return this.http.post<ApiResponse<any>>(`${this.baseUri}/update/${tableName}`, { row }).pipe(
      map(res => res.result || { status: 'updated' })
    );
  }

  /**
   * POST /error-report - Generates styled ExcelJS workbook of rejected rows
   */
  public downloadErrorReport(tableName: string, rejectedRows: any[]): Observable<Blob> {
    return this.http.post(`${this.baseUri}/error-report`, { table: tableName, rows: rejectedRows }, {
      responseType: 'blob'
    });
  }

  /**
   * GET /dictionary - List all dictionary entries
   */
  public getDictionary(type?: string): Observable<DictionaryEntry[]> {
    const url = type ? `${this.baseUri}/dictionary/${type}` : `${this.baseUri}/dictionary`;
    return this.http.get<ApiResponse<DictionaryEntry[]>>(url).pipe(
      map(res => res.result || [])
    );
  }

  /**
   * POST /dictionary - Add a new correction entry to xls_dictionary
   */
  public addDictionaryEntry(entry: {
    type: string;
    name: string;
    ref_id: any;
    ref_id2?: any;
    extra_note?: string;
  }): Observable<{ _id: number }> {
    return this.http.post<ApiResponse<{ _id: number }>>(`${this.baseUri}/dictionary`, entry).pipe(
      map(res => res.result || { _id: 0 })
    );
  }

  /**
   * PUT /dictionary/:id - Update an existing dictionary entry
   */
  public updateDictionaryEntry(id: number, patch: Partial<DictionaryEntry>): Observable<{ updated: boolean }> {
    return this.http.put<ApiResponse<{ updated: boolean }>>(`${this.baseUri}/dictionary/${id}`, patch).pipe(
      map(res => res.result || { updated: true })
    );
  }

  /**
   * DELETE /dictionary/:id - Soft-delete dictionary entry (active = 0)
   */
  public deleteDictionaryEntry(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<ApiResponse<{ deleted: boolean }>>(`${this.baseUri}/dictionary/${id}`).pipe(
      map(res => res.result || { deleted: true })
    );
  }
}
