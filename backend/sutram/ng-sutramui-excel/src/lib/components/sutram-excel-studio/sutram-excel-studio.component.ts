/**
 * sutram-excel-studio.component.ts
 * ─────────────────────────────────────────────────────────────
 * Master Studio Component hosting the toolbar, audit metrics,
 * virtual grid, header scanner, correction sidebar, and streaming importer.
 * ─────────────────────────────────────────────────────────────
 */

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { SutramExcelStateService, ImportProgressState } from '../../services/sutram-excel-state.service';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';
import { SutramExcelScannerService } from '../../services/sutram-excel-scanner.service';
import { SutramAuditService } from '../../services/sutram-audit.service';
import { SutramScanReport, SutramScanMatch, SutramTableConfig, SutramRow } from '../../models/sutram-excel.model';

import { SutramRefCacheService } from '../../services/sutram-ref-cache.service';

@Component({
  selector: 'sutram-excel-studio',
  templateUrl: './sutram-excel-studio.component.html',
  styleUrls: ['./sutram-excel-studio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramExcelStudioComponent implements OnInit, OnDestroy {
  @Input() set table(tableName: string) {
    if (tableName) {
      this.onTableSelect(tableName);
    }
  }
  @Input() mode: 'normal' | 'intelligent' = 'intelligent';
  @Input() apiBase: string = '/_sutram/excel';

  // ── Declarative Feature Flags (Batteries-Included: All ON by default, toggleable by user flags) ──
  @Input() enableFilters: boolean = true;
  @Input() enableSorting: boolean = true;
  @Input() enableSearch: boolean = true;
  @Input() enableControlBar: boolean = true;
  @Input() enableStatsBar: boolean = true;
  @Input() enableUpload: boolean = true;
  @Input() enableAudit: boolean = true;
  @Input() enableAddRow: boolean = true;
  @Input() enableCorrections: boolean = true;
  @Input() enableLoadData: boolean = true;
  @Input() enableVerify: boolean = true;
  @Input() enableSync: boolean = true;
  @Input() enableDelete: boolean = true;
  @Input() enableTabs: boolean = true;
  @Input() enableZoom: boolean = true;

  public tablesList: Array<{ table: string; display_name: string }> = [];
  public selectedTableName: string = '';
  public isLoadingConfig: boolean = false;

  // Sheet tabs state
  public sheetTabs: Array<{ id: string; title: string; icon: string; isLoaded: boolean; recordCount?: number }> = [];
  public activeSheetId: string = 'blank';
  public sheetWorkbooks: { [sheetId: string]: { rows: any[]; deletedRowIds?: any[]; deletedRowsQueue?: any[] } } = {};

  // Zoom / Scale state
  public zoomLevel: number = 1.0;

  // Dark Mode State
  public isDarkMode: boolean = false;

  // Text Formatting State
  public isBoldActive: boolean = false;
  public textAlign: 'left' | 'center' | 'right' = 'left';

  // Hidden Columns Set
  public hiddenColumnKeys: Set<string> = new Set<string>();

  // Floating Sync Toast HUD State
  public syncToast = {
    visible: false,
    title: '',
    hasError: false,
    inserted: 0,
    updated: 0,
    deleted: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Scanner modal state
  public showScannerModal: boolean = false;
  public scanReport: SutramScanReport | null = null;
  private pendingRawRows: any[] = [];

  // Correction sidebar state
  public showSidebar: boolean = false;

  // Import progress modal state
  public showProgressModal: boolean = false;
  public rejectedRowsDuringImport: any[] = [];
  private isCancelRequested: boolean = false;

  // DB Search Subject & Subscription
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSub?: Subscription;

  // Computed Active Cell Coordinate, Column Chip, and Formula Value
  public get activeCoord(): string {
    const sel = this.state.selectedCell();
    if (!sel) return 'A1';
    const cols = this.visibleHeaders;
    const colIdx = cols.findIndex(c => c.name === sel.colKey);
    const letter = this.getColLetter(colIdx >= 0 ? colIdx : 0);
    return `${letter}${sel.rowIdx + 1}`;
  }

  public get activeColChip(): string {
    const sel = this.state.selectedCell();
    return sel ? sel.colKey : '--';
  }

  public get formulaValue(): string {
    const sel = this.state.selectedCell();
    if (!sel) return '';
    const rows = this.state.rows();
    return rows[sel.rowIdx]?.cells[sel.colKey]?.value ?? '';
  }

  public get visibleHeaders(): any[] {
    const headers = this.state.headers();
    return headers.filter(h => !this.hiddenColumnKeys.has(h.name));
  }

  public get visibleHeadersCount(): number {
    return this.visibleHeaders.length;
  }

  public getColLetter(idx: number): string {
    let letter = '';
    let temp = idx;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  public get statusStripClass(): string {
    if (this.state.stats().errorRows > 0) return 'strip-error';
    if (this.mode === 'intelligent') return 'strip-suggestion';
    return 'strip-clean';
  }

  public get statusStripIcon(): string {
    if (this.state.stats().errorRows > 0) return 'pi-exclamation-triangle text-danger';
    if (this.mode === 'intelligent') return 'pi-bolt text-primary';
    return 'pi-info-circle text-primary';
  }

  public get statusStripMessage(): string {
    if (this.state.stats().errorRows > 0) {
      return `शीट में ${this.state.stats().errorRows} पंक्तियों में अमान्य मान मिले हैं। कृपया सुधारें या 'गलतियाँ' साइडबार देखें।`;
    }
    if (this.mode === 'intelligent') {
      return 'Smart Mode ON. Live foreign key validation and dictionary learning active.';
    }
    return 'Normal mode ready. Type or paste data. Turn on Smart Mode for live FK validation.';
  }

  constructor(
    public state: SutramExcelStateService,
    private api: SutramExcelApiService,
    private scanner: SutramExcelScannerService,
    private audit: SutramAuditService,
    public refCache: SutramRefCacheService,
    private cdr: ChangeDetectorRef
  ) { }

  public ngOnInit(): void {
    if (this.apiBase) {
      this.api.setBaseUri(this.apiBase);
    }
    this.state.isAuditMode.set(this.mode === 'intelligent');
    this.state.filtersEnabled.set(this.enableFilters);
    this.state.sortingEnabled.set(this.enableSorting);

    // Debounced direct database search
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((query: string) => {
      this.state.dbSearchQuery.set(query);
      if (this.selectedTableName) {
        this.loadDataChunk(this.selectedTableName, 0, 100, true);
      }
    });

    this.loadTablesList();
  }

  public ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  public setStudioMode(newMode: 'normal' | 'intelligent'): void {
    this.mode = newMode;
    this.state.isAuditMode.set(newMode === 'intelligent');
    this.cdr.markForCheck();
  }

  public toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    this.cdr.markForCheck();
  }

  public onFormulaChange(val: string): void {
    const sel = this.state.selectedCell();
    if (!sel) return;
    this.state.updateCellValue(sel.rowIdx, sel.colKey, val);
    this.cdr.markForCheck();
  }

  public toggleColumnVisibility(colName: string): void {
    if (this.hiddenColumnKeys.has(colName)) {
      this.hiddenColumnKeys.delete(colName);
    } else {
      this.hiddenColumnKeys.add(colName);
    }
    this.cdr.markForCheck();
  }

  public exportExcel(): void {
    const rows = this.state.rows();
    if (!rows || rows.length === 0) {
      alert('डाउनलोड करने के लिए शीट में कोई डेटा नहीं है (No data to export)');
      return;
    }
    const headers = this.visibleHeaders;
    const exportData = rows.map(r => {
      const obj: any = {};
      headers.forEach(h => {
        obj[h.name] = r.cells[h.name]?.value ?? '';
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.selectedTableName || 'Sheet1');
    XLSX.writeFile(wb, `${this.selectedTableName || 'data'}_${Date.now()}.xlsx`);
  }

  public loadTablesList(): void {
    this.api.getRegisteredTables().subscribe({
      next: (tables: any[]) => {
        this.tablesList = tables;
        this.sheetTabs = [
          { id: 'blank', title: 'Blank Sheet', icon: 'pi-file', isLoaded: false },
          ...tables.map((t: any) => ({
            id: t.table,
            title: t.display_name || t.table,
            icon: 'pi-table',
            isLoaded: false,
            recordCount: 0
          }))
        ];
        if (!this.selectedTableName && tables.length > 0) {
          this.activeSheetId = tables[0].table;
          this.onTableSelect(tables[0].table, true);
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error('[SutramStudio] Load tables failed:', err)
    });
  }

  public onTableSelect(tableName: string, autoLoadData: boolean = true): void {
    if (!tableName) return;
    this.selectedTableName = tableName;
    this.activeSheetId = tableName;
    this.state.setActiveTable(tableName);
    this.isLoadingConfig = true;

    this.api.getTableConfig(tableName).subscribe({
      next: (cfg: SutramTableConfig) => {
        this.state.setConfig(cfg);
        this.isLoadingConfig = false;
        this.state.clearGrid();

        // Hide technical internal columns by default (_id, verify, dept_id) matching legacy studio
        this.hiddenColumnKeys.clear();
        (cfg.headers || []).forEach((h: any) => {
          const n = (h.name || h.col_name || '').toLowerCase();
          if (n === '_id' || n.includes('_by_dept_id') || n === 'verify') {
            this.hiddenColumnKeys.add(h.name);
          }
        });

        // Preload all referenced FK tables
        if (cfg && cfg.headers) {
          const refTables = cfg.headers
            .filter((h: any) => h.ref_table || h.type === 'ref')
            .map((h: any) => h.ref_table)
            .filter(Boolean);
          this.refCache.preloadTables(refTables);
        }

        if (autoLoadData) {
          this.loadDataChunk(tableName, 0, 100, true);
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isLoadingConfig = false;
        console.error('[SutramStudio] Load config failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public switchSheet(tabId: string): void {
    if (this.activeSheetId === tabId) return;

    // Preserve current sheet state
    if (this.activeSheetId) {
      this.sheetWorkbooks[this.activeSheetId] = {
        rows: this.state.rows(),
        deletedRowIds: this.state.deletedRowIds(),
        deletedRowsQueue: this.state.deletedRowsQueue()
      };
    }

    this.activeSheetId = tabId;

    if (tabId === 'blank' || tabId.startsWith('sheet_')) {
      this.selectedTableName = '';
      const saved = this.sheetWorkbooks[tabId];
      if (saved && saved.rows) {
        this.state.setRows(saved.rows);
        this.state.deletedRowIds.set(saved.deletedRowIds || []);
        this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
      } else {
        this.state.clearGrid();
      }
      this.state.totalDbRecords.set(0);
      this.cdr.markForCheck();
    } else {
      const saved = this.sheetWorkbooks[tabId];
      if (saved && saved.rows && saved.rows.length > 0) {
        this.selectedTableName = tabId;
        this.state.setRows(saved.rows);
        this.state.deletedRowIds.set(saved.deletedRowIds || []);
        this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
        this.onTableSelect(tabId, false);
      } else {
        this.onTableSelect(tabId, true);
      }
    }
    this.cdr.markForCheck();
  }

  public addNewBlankSheet(): void {
    const customCount = this.sheetTabs.filter(t => t.id.startsWith('sheet_')).length + 2;
    const newId = `sheet_${Date.now()}`;
    this.sheetTabs.push({ id: newId, title: `Sheet ${customCount}`, icon: 'pi-file', isLoaded: false });
    this.switchSheet(newId);
  }

  /**
   * Converts a database row object into a verified SutramRow.
   * Utilizes SutramRefCacheService for Rule 8 bilingual formatting.
   */
  public convertDbRecordToSutramRow(dr: any, rowNum: number, cfg: SutramTableConfig): SutramRow {
    const cells: Record<string, any> = {};

    cfg.headers.forEach((h: any) => {
      let rawVal: any;

      if (h.ref_table || h.type === 'ref') {
        const joined = dr[h.ref_as || h.name || h.ref_table];
        if (joined && typeof joined === 'object') {
          const formatted = this.refCache.formatOption(h.ref_table, joined);
          if (formatted && formatted.display) {
            rawVal = formatted.display;
          }
        }
      }

      if (rawVal === undefined) rawVal = dr[h.col_name];
      if (rawVal === undefined) rawVal = dr[h.name];
      if (rawVal === undefined) {
        const matchKey = Object.keys(dr).find((k: string) => k.toLowerCase() === (h.col_name || h.name || '').toLowerCase());
        if (matchKey) rawVal = dr[matchKey];
      }

      cells[h.name] = {
        value: String(rawVal ?? ''),
        isValid: true,
        refId: dr[h.col_name] !== undefined ? dr[h.col_name] : rawVal
      };
    });

    return {
      rowNum,
      cells,
      hasError: false,
      errorCount: 0,
      _rawOriginal: dr
    };
  }

  /**
   * Chunked lazy loading with direct database search, sort, and filters.
   */
  public loadDataChunk(
    tableName: string,
    offset: number = 0,
    limit: number = 100,
    isReset: boolean = true
  ): void {
    const cfg = this.state.config();
    if (!cfg || !tableName) return;

    if (this.state.isLoadingDb()) return;
    this.state.isLoadingDb.set(true);

    const activeSort = this.state.activeSort();
    const columnFilters = this.state.columnFilters();
    const searchQuery = this.state.dbSearchQuery().trim();

    // Serialize column filters for backend API
    const apiFilters: Record<string, any> = {};
    for (const [colKey, valSet] of Object.entries(columnFilters)) {
      if (valSet && (valSet as Set<any>).size > 0) {
        apiFilters[colKey] = Array.from(valSet as Set<any>);
      }
    }

    this.api.getTableDataChunk(tableName, {
      limit,
      offset,
      search: searchQuery || undefined,
      sort: activeSort?.colKey,
      order: activeSort?.order,
      filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined
    }).subscribe({
      next: (res: { rows: any[]; total: number; offset: number; limit: number }) => {
        this.state.isLoadingDb.set(false);
        this.state.totalDbRecords.set(res.total);

        const startIndex = isReset ? 0 : this.state.rows().length;
        const builtRows: SutramRow[] = (res.rows || []).map((dr: any, idx: number) => {
          return this.convertDbRecordToSutramRow(dr, startIndex + idx + 1, cfg);
        });

        this.audit.auditAll(builtRows, cfg.headers);

        if (isReset) {
          this.state.setRows(builtRows);
        } else {
          this.state.appendRows(builtRows);
        }

        const tab = this.sheetTabs.find((t: any) => t.id === tableName);
        if (tab) {
          tab.isLoaded = true;
          tab.recordCount = this.state.rows().length;
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.state.isLoadingDb.set(false);
        console.error('[SutramStudio] Load DB data chunk failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * Infinite scroll trigger emitted from grid when scrolling near bottom
   */
  public onLoadMore(): void {
    if (this.state.isLoadingDb()) return;
    const currentCount = this.state.rows().length;
    const totalCount = this.state.totalDbRecords();
    if (totalCount > 0 && currentCount < totalCount && this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, currentCount, 100, false);
    }
  }

  /**
   * Direct Database Searchbox Handlers
   */
  public onDbSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  public clearDbSearch(): void {
    this.state.dbSearchQuery.set('');
    this.searchSubject.next('');
  }

  /**
   * Clear All Active Column Filters
   */
  public clearAllFilters(): void {
    this.state.clearAllColumnFilters();
    if (this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, 0, 100, true);
    }
  }

  public onGridFilterChanged(): void {
    if (this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, 0, 100, true);
    }
  }

  public onGridSortChanged(): void {
    if (this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, 0, 100, true);
    }
  }

  public loadTableDataFromDb(): void {
    if (this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, 0, 100, true);
    }
  }

  public zoomIn(): void {
    if (this.zoomLevel < 1.6) {
      this.zoomLevel = Math.min(1.6, Math.round((this.zoomLevel + 0.1) * 10) / 10);
      this.cdr.markForCheck();
    }
  }

  public zoomOut(): void {
    if (this.zoomLevel > 0.6) {
      this.zoomLevel = Math.max(0.6, Math.round((this.zoomLevel - 0.1) * 10) / 10);
      this.cdr.markForCheck();
    }
  }

  public resetZoom(): void {
    this.zoomLevel = 1.0;
    this.cdr.markForCheck();
  }

  // ── File Parsing & Header Scanning ───────────────────────────

  public onFileUpload(event: any): void {
    const file = event?.target?.files?.[0] || event?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (!rawJson || rawJson.length === 0) return;

      const headers: string[] = (rawJson[0] || []).map(h => String(h || '').trim());
      this.pendingRawRows = rawJson.slice(1);

      const cfg = this.state.config();
      if (!cfg) return;

      // Run smart header scan
      this.scanReport = this.scanner.scan(headers, cfg, this.pendingRawRows);
      this.showScannerModal = true;
      this.cdr.markForCheck();
    };

    reader.readAsArrayBuffer(file);
    // Reset file input value
    if (event.target) event.target.value = '';
  }

  public onScannerConfirmed(matches: SutramScanMatch[]): void {
    const cfg = this.state.config();
    if (!cfg) return;

    const builtRows = this.scanner.buildSutramRows(this.pendingRawRows, matches, cfg.headers);
    this.audit.auditAll(builtRows, cfg.headers);
    this.state.setRows(builtRows);
    this.showScannerModal = false;
    this.pendingRawRows = [];
    this.cdr.markForCheck();
  }

  // ── Server-Side Verification ─────────────────────────────────

  public verifyData(): void {
    const cfg = this.state.config();
    if (!cfg || !this.selectedTableName) return;

    const rows = this.state.rows();
    if (rows.length === 0) return;

    this.state.isVerifying.set(true);

    // Extract raw objects for verify API
    const rawObjects = rows.map((r: any) => {
      const obj: any = {};
      cfg.headers.forEach((h: any) => (obj[h.name] = r.cells[h.name]?.value));
      return obj;
    });

    this.api.verifyRows(this.selectedTableName, rawObjects).subscribe({
      next: (res: any) => {
        this.state.isVerifying.set(false);
        this.state.setCorrections(res.correctionList || []);

        // If corrections exist, open sidebar
        if (res.correctionList && res.correctionList.length > 0) {
          this.showSidebar = true;
        }

        // Re-audit with server resolved IDs
        if (res.rows && res.rows.length === rows.length) {
          const updatedRows = [...rows];
          res.rows.forEach((resolvedObj: any, idx: number) => {
            cfg.headers.forEach((h: any) => {
              if (resolvedObj[h.col_name] !== undefined) {
                updatedRows[idx].cells[h.name].refId = resolvedObj[h.col_name];
              }
            });
          });
          this.state.setRows(updatedRows);
        }

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.state.isVerifying.set(false);
        console.error('[SutramStudio] Verify failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public addNewRow(): void {
    const row = this.state.addNewBlankRow();
    this.cdr.markForCheck();
  }

  // ── Streaming Import Pipeline ────────────────────────────────

  public async startImport(): Promise<void> {
    const cfg = this.state.config();
    if (!cfg || !this.selectedTableName) return;

    const rows = this.state.rows();
    const deletedIds = [...this.state.deletedRowIds()];

    if (rows.length === 0 && deletedIds.length === 0) return;

    // 1. Identify rows to sync: only modified or newly added rows!
    const rowsToSync = rows.filter((r: any) => (r.isNew || r.isModified) && this.audit.rowHasData(r, cfg.headers));

    if (rowsToSync.length === 0 && deletedIds.length === 0) {
      alert('सिंक करने के लिए कोई नया, संशोधित या हटाया गया डेटा नहीं मिला (No modified, new, or deleted rows found to sync)।');
      return;
    }

    // 2. Mandatory Pre-Sync Audit: Check foreign keys and required constraints
    if (rowsToSync.length > 0) {
      const preSyncAudit = this.audit.auditRowsBeforeSync(rows, cfg.headers);
      if (!preSyncAudit.canSync) {
        const firstErr = preSyncAudit.errorDetails[0];
        const errMsg = `डेटाबेस सिंक रोका गया! कुल ${preSyncAudit.totalErrors} त्रुटियां पाई गईं (पंक्ति ${firstErr.rowNum}: ${firstErr.message})। केवल शुद्ध डेटा ही सिंक किया जा सकता है।`;
        console.warn('[SutramStudio] DB Sync Blocked:', errMsg);
        alert(errMsg);
        this.cdr.markForCheck();
        return;
      }
    }

    this.isCancelRequested = false;
    this.rejectedRowsDuringImport = [];
    this.showProgressModal = true;
    this.state.isImporting.set(true);

    const totalOps = rowsToSync.length + (deletedIds.length > 0 ? deletedIds.length : 0);

    const progress: ImportProgressState = {
      current: 0,
      total: totalOps,
      percentage: 0,
      inserted: 0,
      updated: 0,
      deleted: 0,
      duplicate: 0,
      rejected: 0,
      isActive: true
    };
    this.state.importProgress.set({ ...progress });

    // 3. Dispatch deleted rows if any exist
    if (deletedIds.length > 0) {
      try {
        const delRes = await this.api.deleteRows(this.selectedTableName, deletedIds).toPromise();
        const delCount = delRes?.count || deletedIds.length;
        progress.deleted = delCount;
        this.state.totalDbRecords.update((n: number) => Math.max(0, n - delCount));
        this.state.clearDeletedRowIds();
      } catch (delErr: any) {
        progress.rejected += deletedIds.length;
        this.rejectedRowsDuringImport.push({ _id: deletedIds.join(', '), _error: delErr?.message || 'Delete failed' });
        // Deletion failed: restore deleted rows back to normal in grid and clear delete queue
        const queue = this.state.deletedRowsQueue();
        if (queue.length > 0) {
          const currentRows = [...this.state.rows()];
          queue.forEach((item: { row: SutramRow; id: any; index: number }) => {
            const cleanRow: SutramRow = {
              ...item.row,
              isNew: false,
              isModified: false,
              hasError: false,
              errorCount: 0
            };
            const insertIdx = item.index >= 0 ? Math.min(item.index, currentRows.length) : currentRows.length;
            currentRows.splice(insertIdx, 0, cleanRow);
          });
          this.state.setRows(currentRows);
        }
        this.state.clearDeletedRowIds();
      }
      progress.current += deletedIds.length;
      progress.percentage = Math.round((progress.current / progress.total) * 100);
      this.state.importProgress.set({ ...progress });
      this.cdr.markForCheck();
    }

    // If only deletions were performed, wrap up and return!
    if (rowsToSync.length === 0) {
      progress.isActive = false;
      this.state.importProgress.set({ ...progress });
      this.state.isImporting.set(false);
      this.cdr.markForCheck();
      return;
    }

    const syncedRowNums: number[] = [];

    for (let i = 0; i < rowsToSync.length; i++) {
      if (this.isCancelRequested) break;

      const r = rowsToSync[i];
      const payload: any = {};

      cfg.headers.forEach((h: any) => {
        const cell = r.cells[h.name];
        const val = cell?.refId !== undefined ? cell.refId : cell?.value;
        payload[h.col_name] = val;
      });

      const rowId = (r as any)._id || r._rawOriginal?._id || r._rawOriginal?.id;
      const isUpdate = !r.isNew && !!rowId;
      if (isUpdate) {
        payload._id = rowId;
      }

      try {
        const res = isUpdate
          ? await this.api.updateRow(this.selectedTableName, payload).toPromise()
          : await this.api.importRow(this.selectedTableName, payload).toPromise();

        if (res?.status === 'inserted') {
          progress.inserted++;
          syncedRowNums.push(r.rowNum);
          this.state.totalDbRecords.update((n: number) => n + 1);
        } else if (res?.status === 'updated') {
          progress.updated++;
          syncedRowNums.push(r.rowNum);
        } else if (res?.status === 'duplicate') {
          progress.duplicate++;
          syncedRowNums.push(r.rowNum);
        } else {
          progress.rejected++;
          this.rejectedRowsDuringImport.push({ ...payload, _error: res?.error || 'Rejected' });
        }
      } catch (err: any) {
        progress.rejected++;
        this.rejectedRowsDuringImport.push({ ...payload, _error: err?.message || 'Network error' });
      }

      progress.current = deletedIds.length + i + 1;
      progress.percentage = Math.round((progress.current / progress.total) * 100);
      this.state.importProgress.set({ ...progress });
      this.cdr.markForCheck();
    }

    // Mark successfully synced rows as clean
    this.state.markRowsSynced(syncedRowNums);

    progress.isActive = false;
    this.state.importProgress.set({ ...progress });
    this.state.isImporting.set(false);

    // Populate floating Sync Toast HUD
    this.syncToast = {
      visible: true,
      title: progress.rejected > 0 ? 'Sync Finished with Warnings' : 'Sync Completed Successfully',
      hasError: progress.rejected > 0,
      inserted: progress.inserted,
      updated: progress.updated,
      deleted: progress.deleted || 0,
      failed: progress.rejected,
      errors: this.rejectedRowsDuringImport.map(x => x._error || 'Row operation failed')
    };

    this.cdr.markForCheck();
  }

  public cancelImport(): void {
    this.isCancelRequested = true;
  }

  // ── "Solve All" Handler from Grid ────────────────────────────

  public onGridSolveAll(event: {
    colKey: string;
    badValue: string;
    resolvedDisplay: string;
    resolvedId?: any;
    saveToDict: boolean;
  }): void {
    this.state.applyBatchCorrection(
      event.colKey,
      event.badValue,
      event.resolvedDisplay,
      event.resolvedId
    );

    if (event.saveToDict) {
      const header = this.state.headers().find((h: any) => h.name === event.colKey);
      const refType = header?.ref_table || event.colKey;

      this.api.addDictionaryEntry({
        type: refType,
        name: event.badValue,
        ref_id: event.resolvedId !== undefined ? event.resolvedId : event.resolvedDisplay
      }).subscribe();
    }
  }
}
