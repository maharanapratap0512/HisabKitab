/**
 * sutram-excel-state.service.ts
 * ─────────────────────────────────────────────────────────────
 * Reactive state store for ng-sutramui-excel powered by Angular Signals.
 * Manages tables, columns, rows, cell edits, corrections, and import progress.
 * ─────────────────────────────────────────────────────────────
 */

import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import {
  SutramTableConfig,
  SutramRow,
  SutramCell,
  SutramHeaderConfig,
  SutramGridStats
} from '../models/sutram-excel.model';
import { SutramCorrectionItem, CorrectionGroup } from '../models/sutram-correction.model';
import { cleanString } from '../utils/normalization.utils';

export interface ImportProgressState {
  current: number;
  total: number;
  percentage: number;
  inserted: number;
  updated: number;
  duplicate: number;
  rejected: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SutramExcelStateService {
  // ── Writable Signals ─────────────────────────────────────────
  public readonly activeTable: WritableSignal<string | null> = signal(null);
  public readonly config: WritableSignal<SutramTableConfig | null> = signal(null);
  public readonly rows: WritableSignal<SutramRow[]> = signal([]);
  public readonly corrections: WritableSignal<SutramCorrectionItem[]> = signal([]);
  public readonly selectedCell: WritableSignal<{ rowIdx: number; colKey: string } | null> = signal(null);
  public readonly isAuditMode: WritableSignal<boolean> = signal(true);
  public readonly isVerifying: WritableSignal<boolean> = signal(false);
  public readonly isImporting: WritableSignal<boolean> = signal(false);
  public readonly filterOnlyErrors: WritableSignal<boolean> = signal(false);

  public readonly importProgress: WritableSignal<ImportProgressState> = signal({
    current: 0,
    total: 0,
    percentage: 0,
    inserted: 0,
    updated: 0,
    duplicate: 0,
    rejected: 0,
    isActive: false
  });

  // ── Computed Signals ─────────────────────────────────────────
  public readonly headers: Signal<SutramHeaderConfig[]> = computed(() => {
    return this.config()?.headers || [];
  });

  public readonly stats: Signal<SutramGridStats> = computed(() => {
    const rList = this.rows();
    let valid = 0;
    let warning = 0;
    let error = 0;
    let totalCellErrors = 0;

    for (const r of rList) {
      if (r.hasError) {
        error++;
        totalCellErrors += r.errorCount;
      } else {
        valid++;
      }
    }

    return {
      totalRows: rList.length,
      validRows: valid,
      warningRows: warning,
      errorRows: error,
      errorCellsCount: totalCellErrors
    };
  });

  public readonly hasErrors: Signal<boolean> = computed(() => {
    return this.stats().errorRows > 0;
  });

  /**
   * Groups corrections by unique bad value and ref table for the sidebar
   */
  public readonly correctionGroups: Signal<CorrectionGroup[]> = computed(() => {
    const list = this.corrections();
    const map = new Map<string, CorrectionGroup>();

    for (const item of list) {
      if (item.done || item.ignore) continue;
      const key = `${item.type}:${cleanString(item.name)}`;

      if (!map.has(key)) {
        map.set(key, {
          groupKey: key,
          type: item.type,
          name: item.name,
          occurrences: item.rowIndexes.length,
          rowIndexes: [...item.rowIndexes],
          resolvedId: item.id,
          resolvedDisplay: item.resolvedDisplay,
          saveToDictionary: item.dictionary,
          isResolved: false
        });
      } else {
        const grp = map.get(key)!;
        grp.occurrences += item.rowIndexes.length;
        grp.rowIndexes.push(...item.rowIndexes);
      }
    }

    return Array.from(map.values());
  });

  public readonly unresolvedCorrectionsCount: Signal<number> = computed(() => {
    return this.correctionGroups().length;
  });

  // ── Actions & Mutators ───────────────────────────────────────

  public setActiveTable(table: string | null): void {
    this.activeTable.set(table);
  }

  public setConfig(cfg: SutramTableConfig | null): void {
    this.config.set(cfg);
  }

  public setRows(newRows: SutramRow[]): void {
    this.rows.set(newRows);
  }

  public setCorrections(items: SutramCorrectionItem[]): void {
    this.corrections.set(items);
  }

  public setSelectedCell(cell: { rowIdx: number; colKey: string } | null): void {
    this.selectedCell.set(cell);
  }

  public toggleAuditMode(): void {
    this.isAuditMode.update(v => !v);
  }

  public toggleFilterErrors(): void {
    this.filterOnlyErrors.update(v => !v);
  }

  public readonly modifiedRowsCount: Signal<number> = computed(() => {
    return this.rows().filter(r => r.isNew || r.isModified).length;
  });

  /**
   * Updates an individual cell value in the grid and marks row modified
   */
  public updateCellValue(rowIdx: number, colKey: string, newValue: any, refId?: any): void {
    this.rows.update(current => {
      const copy = [...current];
      const targetRow = copy[rowIdx];
      if (!targetRow || !targetRow.cells[colKey]) return current;

      const cell = { ...targetRow.cells[colKey] };
      if (cell.originalValue === undefined) {
        cell.originalValue = cell.value;
      }
      cell.value = newValue;
      cell.isModified = true;
      if (refId !== undefined) cell.refId = refId;

      targetRow.cells = { ...targetRow.cells, [colKey]: cell };
      targetRow.isModified = true;
      copy[rowIdx] = targetRow;
      return copy;
    });
  }

  /**
   * Appends a new blank row marked as isNew
   */
  public addNewBlankRow(): SutramRow {
    const headers = this.headers();
    const currentRows = this.rows();
    const newRowNum = currentRows.length + 1;
    const cells: Record<string, SutramCell> = {};

    headers.forEach(h => {
      cells[h.name] = {
        value: '',
        isValid: true,
        isModified: false,
        isNew: true
      };
    });

    const newRow: SutramRow = {
      rowNum: newRowNum,
      cells,
      hasError: false,
      errorCount: 0,
      isNew: true
    };

    this.rows.update(list => [...list, newRow]);
    return newRow;
  }

  /**
   * Marks specified rows as clean and synced after successful DB write
   */
  public markRowsSynced(rowNums: number[]): void {
    if (!rowNums || rowNums.length === 0) return;
    const set = new Set(rowNums);

    this.rows.update(list => {
      return list.map(r => {
        if (set.has(r.rowNum)) {
          const cleanCells: Record<string, SutramCell> = {};
          for (const k in r.cells) {
            cleanCells[k] = { ...r.cells[k], isModified: false, originalValue: r.cells[k].value };
          }
          return {
            ...r,
            cells: cleanCells,
            isNew: false,
            isModified: false,
            isSynced: true
          };
        }
        return r;
      });
    });
  }

  /**
   * Finds all row indices in a column having the exact matching bad value
   */
  public findSameMistakeRowIndices(colKey: string, targetValue: string): number[] {
    const cleanTarget = cleanString(targetValue);
    if (!cleanTarget) return [];

    const indices: number[] = [];
    const currentRows = this.rows();

    for (let i = 0; i < currentRows.length; i++) {
      const val = currentRows[i].cells[colKey]?.value;
      if (cleanString(val) === cleanTarget) {
        indices.push(i);
      }
    }

    return indices;
  }

  /**
   * Applies correction to all rows matching the bad value across the column
   */
  public applyBatchCorrection(
    colKey: string,
    badValue: string,
    resolvedDisplay: string,
    resolvedId?: any
  ): number {
    const cleanBad = cleanString(badValue);
    if (!cleanBad) return 0;

    let modifiedCount = 0;
    this.rows.update(current => {
      return current.map(row => {
        const cell = row.cells[colKey];
        if (cell && cleanString(cell.value) === cleanBad) {
          modifiedCount++;
          return {
            ...row,
            cells: {
              ...row.cells,
              [colKey]: {
                ...cell,
                value: resolvedDisplay,
                refId: resolvedId !== undefined ? resolvedId : cell.refId,
                isValid: true,
                errorMessage: undefined,
                isModified: true
              }
            }
          };
        }
        return row;
      });
    });

    // Mark corresponding correction items as resolved
    this.corrections.update(list => {
      return list.map(item => {
        if (cleanString(item.name) === cleanBad) {
          return {
            ...item,
            id: resolvedId,
            resolvedDisplay,
            done: true
          };
        }
        return item;
      });
    });

    return modifiedCount;
  }

  /**
   * Clears all rows and resets state
   */
  public clearGrid(): void {
    this.rows.set([]);
    this.corrections.set([]);
    this.selectedCell.set(null);
  }
}
