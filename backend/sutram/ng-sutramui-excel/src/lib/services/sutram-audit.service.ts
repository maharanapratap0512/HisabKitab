/**
 * sutram-audit.service.ts
 * ─────────────────────────────────────────────────────────────
 * High-speed in-memory validation engine for grid rows and cells.
 * Enforces mandatory constraints, data types, and Foreign Key
 * integrity checks before allowing database synchronisation.
 * ─────────────────────────────────────────────────────────────
 */

import { Injectable } from '@angular/core';
import { SutramRow, SutramCell, SutramHeaderConfig } from '../models/sutram-excel.model';
import { SutramRefCacheService } from './sutram-ref-cache.service';

export interface PreSyncAuditResult {
  canSync: boolean;
  validRowsToSync: SutramRow[];
  dirtyRowCount: number;
  totalErrors: number;
  errorDetails: Array<{ rowNum: number; colName: string; value: any; message: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class SutramAuditService {

  constructor(private refCache: SutramRefCacheService) {}

  /**
   * Checks if a row has any non-empty cell.
   * If all cells in a row are blank, it is treated as an empty row and ignored.
   */
  public rowHasData(row: SutramRow, headers: SutramHeaderConfig[]): boolean {
    if (!row || !row.cells) return false;
    for (const h of headers) {
      const cell = row.cells[h.name];
      if (cell && cell.value !== null && cell.value !== undefined && String(cell.value).trim() !== '') {
        return true;
      }
    }
    return false;
  }

  /**
   * Validates a single cell against its schema header definition
   */
  public validateCell(
    cell: SutramCell,
    header: SutramHeaderConfig,
    row?: SutramRow,
    headers?: SutramHeaderConfig[]
  ): void {
    if (!cell || !header) return;

    const val = cell.value;
    const strVal = val === null || val === undefined ? '' : String(val).trim();

    // 1. Mandatory constraint check
    if (header.not_null && strVal === '') {
      cell.isValid = false;
      cell.isWarning = true;
      cell.errorMessage = `${header.name} अनिवार्य है (Required)`;
      return;
    }

    // If empty and not required, it is valid
    if (strVal === '') {
      cell.isValid = true;
      cell.isWarning = false;
      cell.errorMessage = undefined;
      cell.refId = null;
      return;
    }

    // 2. Foreign Key validation against reference table
    const isRef = header.type === 'ref' || !!header.ref_table;
    if (isRef && header.ref_table) {
      let parentId: any = undefined;
      // Contextual parent lookup (e.g. subitem under item)
      if (header.ref_table.toLowerCase() === 'subitem' && row && headers) {
        const itemHeader = headers.find(h => h.ref_table === 'item' || h.name.includes('item'));
        if (itemHeader && row.cells[itemHeader.name]) {
          parentId = row.cells[itemHeader.name].refId || row.cells[itemHeader.name].value;
        }
      }

      const match = this.refCache.findRefMatch(header.ref_table, strVal, parentId);
      if (match.found) {
        cell.isValid = true;
        cell.isWarning = false;
        cell.errorMessage = undefined;
        cell.refId = match.id;
        cell.refDisplay = match.display;
        return;
      } else {
        cell.isValid = false;
        cell.isWarning = false;
        cell.refId = null;
        cell.errorMessage = `अमान्य ${header.name}: तालिका '${header.ref_table}' में कोई मेल नहीं मिला`;
        return;
      }
    }

    // 3. Numeric validation
    const type = (header.type || 'string').toLowerCase();
    if (['number', 'integer', 'int', 'float', 'double'].includes(type)) {
      const cleanNum = strVal.replace(/,/g, '');
      if (isNaN(Number(cleanNum))) {
        cell.isValid = false;
        cell.isWarning = false;
        cell.errorMessage = 'संख्या (Number) अपेक्षित है';
        return;
      }
    }

    // 4. Date validation
    if (type === 'date') {
      const isValidDate = !isNaN(new Date(strVal).getTime()) || /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(strVal);
      if (!isValidDate) {
        cell.isValid = false;
        cell.isWarning = true;
        cell.errorMessage = 'अमान्य दिनांक (Invalid Date)';
        return;
      }
    }

    // Default valid
    cell.isValid = true;
    cell.isWarning = false;
    cell.errorMessage = undefined;
  }

  /**
   * Validates a full row against all column headers
   */
  public validateRow(row: SutramRow, headers: SutramHeaderConfig[]): void {
    if (!row || !row.cells) return;

    if (!this.rowHasData(row, headers)) {
      for (const h of headers) {
        const cell = row.cells[h.name];
        if (cell) {
          cell.isValid = true;
          cell.isWarning = false;
          cell.errorMessage = undefined;
        }
      }
      row.hasError = false;
      row.errorCount = 0;
      return;
    }

    let errorCount = 0;
    for (const h of headers) {
      const cell = row.cells[h.name];
      if (!cell) continue;

      this.validateCell(cell, h, row, headers);
      if (!cell.isValid) {
        errorCount++;
      }
    }

    row.hasError = errorCount > 0;
    row.errorCount = errorCount;
  }

  /**
   * Audits all rows in the grid
   */
  public auditAll(rows: SutramRow[], headers: SutramHeaderConfig[]): void {
    for (const r of rows) {
      this.validateRow(r, headers);
    }
  }

  /**
   * Comprehensive pre-sync audit to ensure only clean data reaches the database.
   * Blocks synchronisation if ANY dirty or unresolved foreign key cell is found.
   */
  public auditRowsBeforeSync(
    rows: SutramRow[],
    headers: SutramHeaderConfig[],
    onlyModified: boolean = false
  ): PreSyncAuditResult {
    let totalErrors = 0;
    let dirtyRowCount = 0;
    const errorDetails: Array<{ rowNum: number; colName: string; value: any; message: string }> = [];
    const validRowsToSync: SutramRow[] = [];

    for (const r of rows) {
      if (!this.rowHasData(r, headers)) {
        continue;
      }

      this.validateRow(r, headers);

      if (r.hasError) {
        dirtyRowCount++;
        totalErrors += r.errorCount;
        for (const h of headers) {
          const cell = r.cells[h.name];
          if (cell && !cell.isValid) {
            errorDetails.push({
              rowNum: r.rowNum,
              colName: h.name,
              value: cell.value,
              message: cell.errorMessage || 'Invalid data'
            });
          }
        }
      } else {
        // If onlyModified is true, only include rows that were newly created or edited
        if (!onlyModified || r.isNew || r.isModified) {
          validRowsToSync.push(r);
        }
      }
    }

    return {
      canSync: totalErrors === 0 && dirtyRowCount === 0,
      validRowsToSync,
      dirtyRowCount,
      totalErrors,
      errorDetails
    };
  }
}
