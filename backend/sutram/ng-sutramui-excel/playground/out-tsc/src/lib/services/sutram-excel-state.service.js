/**
 * sutram-excel-state.service.ts
 * ─────────────────────────────────────────────────────────────
 * Reactive state store for ng-sutramui-excel powered by Angular Signals.
 * Manages tables, columns, rows, cell edits, corrections, and import progress.
 * ─────────────────────────────────────────────────────────────
 */
import { Injectable, signal, computed } from '@angular/core';
import { cleanString } from '../utils/normalization.utils';
import * as i0 from "@angular/core";
export class SutramExcelStateService {
    // ── Writable Signals ─────────────────────────────────────────
    activeTable = signal(null);
    config = signal(null);
    rows = signal([]);
    deletedRowIds = signal([]);
    deletedRowsQueue = signal([]);
    corrections = signal([]);
    selectedCell = signal(null);
    isAuditMode = signal(true);
    isVerifying = signal(false);
    isImporting = signal(false);
    filterOnlyErrors = signal(false);
    // Lazy Loading & Live DB Search State
    totalDbRecords = signal(0);
    dbSearchQuery = signal('');
    isLoadingDb = signal(false);
    // Control Bar Feature Settings
    filtersEnabled = signal(true);
    sortingEnabled = signal(true);
    // Active Column Filters & Sorting
    columnFilters = signal({});
    activeSort = signal(null);
    // Computed Active Filter Count
    activeFilterCount = computed(() => {
        return Object.keys(this.columnFilters()).length;
    });
    importProgress = signal({
        current: 0,
        total: 0,
        percentage: 0,
        inserted: 0,
        updated: 0,
        deleted: 0,
        duplicate: 0,
        rejected: 0,
        isActive: false
    });
    // ── Computed Signals ─────────────────────────────────────────
    headers = computed(() => {
        return this.config()?.headers || [];
    });
    stats = computed(() => {
        const rList = this.rows();
        let valid = 0;
        let warning = 0;
        let error = 0;
        let totalCellErrors = 0;
        for (const r of rList) {
            if (r.hasError) {
                error++;
                totalCellErrors += r.errorCount;
            }
            else {
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
    hasErrors = computed(() => {
        return this.stats().errorRows > 0;
    });
    /**
     * Groups corrections by unique bad value and ref table for the sidebar
     */
    correctionGroups = computed(() => {
        const list = this.corrections();
        const map = new Map();
        for (const item of list) {
            if (item.done || item.ignore)
                continue;
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
            }
            else {
                const grp = map.get(key);
                grp.occurrences += item.rowIndexes.length;
                grp.rowIndexes.push(...item.rowIndexes);
            }
        }
        return Array.from(map.values());
    });
    unresolvedCorrectionsCount = computed(() => {
        return this.correctionGroups().length;
    });
    // ── Actions & Mutators ───────────────────────────────────────
    setActiveTable(table) {
        this.activeTable.set(table);
    }
    setConfig(cfg) {
        this.config.set(cfg);
    }
    setRows(newRows) {
        this.rows.set(newRows);
    }
    setCorrections(items) {
        this.corrections.set(items);
    }
    setSelectedCell(cell) {
        this.selectedCell.set(cell);
    }
    toggleAuditMode() {
        this.isAuditMode.update(v => !v);
    }
    toggleFilterErrors() {
        this.filterOnlyErrors.update(v => !v);
    }
    modifiedRowsCount = computed(() => {
        return this.rows().filter(r => {
            if (r.isModified)
                return true;
            if (r.isNew) {
                if (!r.cells)
                    return false;
                for (const k in r.cells) {
                    const val = r.cells[k]?.value;
                    if (val !== undefined && val !== null && String(val).trim() !== '') {
                        return true;
                    }
                }
                return false;
            }
            return false;
        }).length;
    });
    pendingChangesCount = computed(() => {
        return this.modifiedRowsCount() + this.deletedRowIds().length;
    });
    /**
     * Updates an individual cell value in the grid and marks row modified only if value actually changed
     */
    updateCellValue(rowIdx, colKey, newValue, refId) {
        this.rows.update(current => {
            const copy = [...current];
            const targetRow = copy[rowIdx];
            if (!targetRow || !targetRow.cells[colKey])
                return current;
            const cell = { ...targetRow.cells[colKey] };
            if (cell.originalValue === undefined) {
                cell.originalValue = cell.value;
            }
            const strNew = String(newValue ?? '').trim();
            const strOrig = String(cell.originalValue ?? '').trim();
            const actuallyChanged = strNew !== strOrig;
            cell.value = newValue;
            if (refId !== undefined)
                cell.refId = refId;
            if (actuallyChanged) {
                cell.isModified = true;
            }
            else if (!targetRow.isNew) {
                cell.isModified = false;
            }
            targetRow.cells = { ...targetRow.cells, [colKey]: cell };
            targetRow.isModified = targetRow.isNew || Object.values(targetRow.cells).some((c) => c && c.isModified);
            copy[rowIdx] = targetRow;
            return copy;
        });
    }
    /**
     * Appends a new blank row marked as isNew
     */
    addNewBlankRow() {
        const headers = this.headers();
        const currentRows = this.rows();
        const newRowNum = currentRows.length + 1;
        const cells = {};
        headers.forEach(h => {
            cells[h.name] = {
                value: '',
                isValid: true,
                isModified: false,
                isNew: true
            };
        });
        const newRow = {
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
    markRowsSynced(rowNums) {
        if (!rowNums || rowNums.length === 0)
            return;
        const set = new Set(rowNums);
        this.rows.update(list => {
            return list.map(r => {
                const rowId = r._id ?? r.id;
                const matches = set.has(r.rowNum) || (rowId !== undefined && set.has(rowId));
                if (matches) {
                    const cleanCells = {};
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
        // Clear isSynced pulse styling after 3.8 seconds while keeping rows clean and synced
        setTimeout(() => {
            this.rows.update(list => {
                return list.map(r => {
                    const rowId = r._id ?? r.id;
                    const matches = set.has(r.rowNum) || (rowId !== undefined && set.has(rowId));
                    if (matches && r.isSynced) {
                        return {
                            ...r,
                            isSynced: false
                        };
                    }
                    return r;
                });
            });
        }, 3800);
    }
    /**
     * Finds all row indices in a column having the exact matching bad value
     */
    findSameMistakeRowIndices(colKey, targetValue) {
        const cleanTarget = cleanString(targetValue);
        if (!cleanTarget)
            return [];
        const indices = [];
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
    applyBatchCorrection(colKey, badValue, resolvedDisplay, resolvedId) {
        const cleanBad = cleanString(badValue);
        if (!cleanBad)
            return 0;
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
     * Appends newly loaded lazy chunks to existing rows
     */
    appendRows(newRows) {
        this.rows.update((current) => [...current, ...newRows]);
    }
    /**
     * Tracks a deleted row ID and records its state for rollback if deletion fails.
     */
    trackDeletedRow(row, index = -1) {
        if (!row)
            return;
        const targetId = row._id || row._rawOriginal?._id || row._rawOriginal?.id;
        if (targetId !== undefined && targetId !== null && targetId !== '') {
            this.deletedRowIds.update((ids) => {
                if (!ids.includes(targetId)) {
                    return [...ids, targetId];
                }
                return ids;
            });
            this.deletedRowsQueue.update((q) => [
                ...q,
                { row, id: targetId, index }
            ]);
        }
    }
    /**
     * Clears tracked deleted row IDs and restore queue
     */
    clearDeletedRowIds() {
        this.deletedRowIds.set([]);
        this.deletedRowsQueue.set([]);
    }
    /**
     * Clears all rows and resets state
     */
    clearGrid() {
        this.rows.set([]);
        this.corrections.set([]);
        this.selectedCell.set(null);
        this.deletedRowIds.set([]);
        this.deletedRowsQueue.set([]);
    }
    // ── Filter & Sorting Control Methods ─────────────────────────
    toggleFiltersEnabled() {
        this.filtersEnabled.update((v) => !v);
    }
    toggleSortingEnabled() {
        this.sortingEnabled.update((v) => {
            const next = !v;
            if (!next)
                this.activeSort.set(null);
            return next;
        });
    }
    setColumnFilter(colKey, values) {
        this.columnFilters.update((filters) => {
            const next = { ...filters };
            if (!values || values.size === 0) {
                delete next[colKey];
            }
            else {
                next[colKey] = values;
            }
            return next;
        });
    }
    clearColumnFilter(colKey) {
        this.columnFilters.update((filters) => {
            const next = { ...filters };
            delete next[colKey];
            return next;
        });
    }
    clearAllColumnFilters() {
        this.columnFilters.set({});
    }
    setSort(colKey, order) {
        this.activeSort.set({ colKey, order });
    }
    clearSort() {
        this.activeSort.set(null);
    }
    static ɵfac = function SutramExcelStateService_Factory(t) { return new (t || SutramExcelStateService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: SutramExcelStateService, factory: SutramExcelStateService.ɵfac, providedIn: 'root' });
}
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SutramExcelStateService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();
