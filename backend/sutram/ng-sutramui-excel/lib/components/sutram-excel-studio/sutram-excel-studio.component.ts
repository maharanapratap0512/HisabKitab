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
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { SutramExcelStateService, ImportProgressState } from '../../services/sutram-excel-state.service';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';
import { SutramExcelScannerService } from '../../services/sutram-excel-scanner.service';
import { SutramAuditService } from '../../services/sutram-audit.service';
import { SutramScanReport, SutramScanMatch, SutramTableConfig, SutramRow, SutramCell, SutramHeaderConfig } from '../../models/sutram-excel.model';
import { SutramGridComponent } from '../sutram-grid/sutram-grid.component';

import { SutramRefCacheService } from '../../services/sutram-ref-cache.service';

export interface StudioConfigColumn {
  key: string;
  name: string;
  short_name?: string;
  col_name?: string;
  group?: string | null;
  is_fk_main?: boolean;
  is_fk_subcol?: boolean;
  is_fk_raw?: boolean;
  ref_table?: string;
  ref_as?: string;
  sub_col_name?: string;
  ref_select?: string[];
  ref_data?: string;
  label?: string;
  display_format?: string | null;
  type: string;
  not_null?: boolean;
  default_selected?: boolean;
  is_temp?: boolean;
  is_virtual?: boolean;
  readonly?: boolean;
}

export interface StudioFkGroup {
  name: string;
  refTable: string;
  columns: StudioConfigColumn[];
  totalCount: number;
  selectedCount: number;
  isAllChecked: boolean;
  isIndeterminate: boolean;
}

export interface StudioSheetTab {
  id: string;
  title: string;
  icon: string;
  type: 'rough' | 'table' | 'report';
  tableName?: string;
  reportId?: string;
  isLoaded: boolean;
  recordCount?: number;
  lastSaved?: string;
}

export interface SavedLocalSheetItem {
  sheetId: string;
  title: string;
  savedAt: string;
  rowCount: number;
}

@Component({
  selector: 'sutram-excel-studio',
  templateUrl: './sutram-excel-studio.component.html',
  styleUrls: ['./sutram-excel-studio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramExcelStudioComponent implements OnInit, OnDestroy {
  @Input() set table(tableName: string) {
    if (tableName) {
      this.selectedTableName = tableName;
      if (this.activeSheetId !== tableName) {
        this.openTableInSheet(tableName);
      }
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

  @ViewChild('grid') public gridComponent?: SutramGridComponent;
  @ViewChild('fileInput') public fileInputRef?: ElementRef<HTMLInputElement>;
  public savedSheetsList: SavedLocalSheetItem[] = [];

  // ── Top Ribbon Navigation & Catalogs State ───────────────────
  public activeTopTab: 'home' | 'tables' | 'reports' | 'settings' = 'home';
  public tableSearchQuery: string = '';
  public reportSearchQuery: string = '';
  public favoriteTables: Set<string> = new Set<string>();
  public favoriteReports: Set<string> = new Set<string>();

  // ── Configurable Boolean Display Settings ────────────────────
  public booleanDisplayStyle: 'checkbox' | 'badge' = 'checkbox';



  // ── Dynamic Reports & Views Catalog ──────────────────────────
  @Input() public reportsList: any[] = [];

  public tablesList: Array<{ table: string; display_name: string }> = [];
  public selectedTableName: string = '';
  public isLoadingConfig: boolean = false;

  // Active Session Sheet Tabs (Rough & Favorites only)
  public sheetTabs: StudioSheetTab[] = [];
  public activeSheetId: string = 'rough_1';
  public sheetWorkbooks: { [sheetId: string]: { rows: any[]; config?: SutramTableConfig; totalDbRecords?: number; loadedDbRecordCount?: number; deletedRowIds?: any[]; deletedRowsQueue?: any[]; allConfigColumns?: StudioConfigColumn[]; selectedColumnKeys?: Set<string> } } = {};
  public loadedDbRecordCount: number = 0;

  // Tab Renaming & Tab Context Menu State
  public renamingTabId: string | null = null;
  public renamingTabTitle: string = '';
  public tabContextMenu: { visible: boolean; x: number; y: number; tab: StudioSheetTab | null } = {
    visible: false,
    x: 0,
    y: 0,
    tab: null
  };

  // Zoom / Scale state
  public zoomLevel: number = 1.0;

  // Dark Mode State
  public isDarkMode: boolean = false;

  // Text Formatting State
  public isBoldActive: boolean = false;
  public textAlign: 'left' | 'center' | 'right' = 'left';

  // Hidden Columns Set (legacy support)
  public hiddenColumnKeys: Set<string> = new Set<string>();

  // Rich Column Configuration Dropdown State (Matching Legacy Studio)
  public allConfigColumns: StudioConfigColumn[] = [];
  public selectedColumnKeys: Set<string> = new Set<string>();
  public expandedFkGroups: Set<string> = new Set<string>();
  public colSearchQuery: string = '';
  public isExportingExcel: boolean = false;

  // Floating Sync Toast HUD State (Live toastr & result notification)
  public syncToast = {
    visible: false,
    inProgress: false,
    percentage: 0,
    title: '',
    hasError: false,
    inserted: 0,
    updated: 0,
    deleted: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Last database sync status per sheet (rendered in bottom status bar)
  public lastSyncPerSheet: { [sheetId: string]: { time: string; summary: string; hasError: boolean } } = {};

  // Scanner modal state & Dual-Mode Open File
  public showScannerModal: boolean = false;
  public scanReport: SutramScanReport | null = null;
  public uploadedWorkbook: any = null;
  public uploadedFileName: string = '';
  public uploadedSheetNames: string[] = [];
  public selectedUploadedSheet: string = '';
  public uploadedAllRawRows: any[][] = [];
  public uploadedSheetHeaders: string[] = [];
  public uploadedRawRows: any[][] = [];
  public uploadedSampleRows: any[][] = [];
  public uploadedTotalRows: number = 0;
  public scannerTargetTable: string = '';
  public scannerTableConfig: SutramTableConfig | null = null;
  public scannerAvailableHeaders: SutramHeaderConfig[] = [];
  public isScannerConfigLoading: boolean = false;
  private pendingRawRows: any[] = [];

  // Correction sidebar state
  public showSidebar: boolean = false;

  // Import progress modal state
  public showProgressModal: boolean = false;
  public rejectedRowsDuringImport: any[] = [];
  private isCancelRequested: boolean = false;

  // DB Search & Ref Cache Subscriptions
  private searchSubject: Subject<string> = new Subject<string>();
  private searchSub?: Subscription;
  private refLoadedSub?: Subscription;

  // Computed Active Cell Coordinate, Column Chip, and Formula Value
  public get activeCoord(): string {
    const sel = this.state.selectedCell();
    if (!sel) return 'A1';
    const cols = this.visibleHeaders;
    const colIdx = cols.findIndex(c => (c.key || c.name) === sel.colKey);
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
    if (this.allConfigColumns.length > 0) {
      return this.allConfigColumns.filter(c => this.selectedColumnKeys.has(c.key));
    }
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

  private isTechnicalCol(name: string): boolean {
    const n = (name || '').toLowerCase();
    return n === '_id' || n.includes('_by_dept_id') || n === 'verify' || n === 'hl';
  }

  public buildConfigColumns(cfg: SutramTableConfig): void {
    this.allConfigColumns = [];
    this.selectedColumnKeys.clear();
    this.expandedFkGroups.clear();

    const rawHeaders = cfg.headers || [];
    const allSchemaCols: any[] = (cfg as any).all_schema_columns || [];
    const headerList: any[] = Array.isArray(rawHeaders) ? rawHeaders : Object.values(rawHeaders);
    const processedCols = new Set<string>();

    for (const h of headerList) {
      const colName = h.col_name || h.name;
      if (this.isTechnicalCol(colName)) continue;
      processedCols.add(colName);

      if (h.ref_table || h.type === 'ref') {
        const refTbl = h.ref_table;
        const refAs = h.ref_as || refTbl;
        const refCols: any[] = (h as any).ref_columns || [];

        // 1. Composite / Human-Readable FK Display
        const mainCol: StudioConfigColumn = {
          key: refAs,
          name: h.name || refAs,
          short_name: `${refAs} (display)`,
          col_name: colName,
          group: refTbl,
          is_fk_main: true,
          ref_table: refTbl,
          ref_as: refAs,
          ref_select: h.ref_select,
          ref_data: h.ref_data,
          type: 'ref',
          not_null: !!h.not_null,
          default_selected: true
        };
        this.allConfigColumns.push(mainCol);
        this.selectedColumnKeys.add(refAs);
        this.expandedFkGroups.add(refTbl);

        // 2. Reference Table Sub-columns
        if (Array.isArray(refCols)) {
          refCols.forEach((rc: any) => {
            const subColName = rc.col_name || rc.name;
            if (this.isTechnicalCol(subColName)) return;
            this.allConfigColumns.push({
              key: `${refAs}.${subColName}`,
              name: `${refAs}.${subColName}`,
              short_name: rc.name || subColName,
              col_name: subColName,
              group: refTbl,
              is_fk_subcol: true,
              ref_table: refTbl,
              ref_as: refAs,
              sub_col_name: subColName,
              type: rc.type || 'string',
              not_null: false,
              default_selected: false
            });
          });
        }

        // 3. Raw Numeric ID Column
        this.allConfigColumns.push({
          key: colName,
          name: colName,
          short_name: `${colName} (id)`,
          col_name: colName,
          group: refTbl,
          is_fk_raw: true,
          ref_table: refTbl,
          ref_as: refAs,
          type: 'id',
          not_null: !!h.not_null,
          default_selected: false
        });
      } else {
        // Direct Standard Column
        this.allConfigColumns.push({
          key: colName,
          name: h.name || colName,
          short_name: h.name || colName,
          col_name: colName,
          group: null,
          is_fk_subcol: false,
          is_fk_main: false,
          is_fk_raw: false,
          type: h.type || 'string',
          not_null: !!h.not_null,
          default_selected: true
        });
        this.selectedColumnKeys.add(colName);
      }
    }

    // Additional Schema Columns if any
    if (Array.isArray(allSchemaCols)) {
      for (const sc of allSchemaCols) {
        const colName = sc.col_name || sc.name;
        if (this.isTechnicalCol(colName) || processedCols.has(colName)) continue;
        processedCols.add(colName);
        this.allConfigColumns.push({
          key: colName,
          name: sc.name || colName,
          short_name: sc.name || colName,
          col_name: colName,
          group: null,
          type: sc.type || 'string',
          not_null: !!sc.not_null,
          default_selected: false
        });
      }
    }

    if (this.selectedColumnKeys.size === 0 && this.allConfigColumns.length > 0) {
      this.selectedColumnKeys.add(this.allConfigColumns[0].key);
    }

    // Always merge temporary formula columns from active uiSutrasList
    this.syncTempColumnsToGrid();
  }

  public get filteredDirectCols(): StudioConfigColumn[] {
    const q = (this.colSearchQuery || '').trim().toLowerCase();
    return this.allConfigColumns.filter(c => {
      if (c.group || c.is_temp) return false;
      if (!q) return true;
      return (c.name && c.name.toLowerCase().includes(q)) ||
             (c.short_name && c.short_name.toLowerCase().includes(q)) ||
             (c.label && c.label.toLowerCase().includes(q)) ||
             (c.key && c.key.toLowerCase().includes(q));
    });
  }

  public get filteredComputedCols(): StudioConfigColumn[] {
    const q = (this.colSearchQuery || '').trim().toLowerCase();
    return this.allConfigColumns.filter(c => {
      if (!c.is_temp && c.group !== 'Computed (fx)') return false;
      if (!q) return true;
      return (c.name && c.name.toLowerCase().includes(q)) ||
             (c.short_name && c.short_name.toLowerCase().includes(q)) ||
             (c.label && c.label.toLowerCase().includes(q)) ||
             (c.key && c.key.toLowerCase().includes(q));
    });
  }

  public get filteredFkGroups(): StudioFkGroup[] {
    const q = (this.colSearchQuery || '').trim().toLowerCase();
    const groupsMap = new Map<string, StudioConfigColumn[]>();

    this.allConfigColumns.forEach(c => {
      if (c.group && !c.is_temp && c.group !== 'Computed (fx)') {
        if (!groupsMap.has(c.group)) groupsMap.set(c.group, []);
        groupsMap.get(c.group)!.push(c);
      }
    });

    const result: StudioFkGroup[] = [];

    for (const [groupName, cols] of groupsMap.entries()) {
      const matchingCols = cols.filter(c => {
        if (!q) return true;
        return groupName.toLowerCase().includes(q) ||
               (c.name && c.name.toLowerCase().includes(q)) ||
               (c.short_name && c.short_name.toLowerCase().includes(q)) ||
               (c.label && c.label.toLowerCase().includes(q));
      });

      if (q && matchingCols.length === 0) continue;

      const selectedInGroup = cols.filter(c => this.selectedColumnKeys.has(c.key)).length;
      const totalInGroup = cols.length;

      result.push({
        name: groupName,
        refTable: cols[0]?.ref_table || groupName,
        columns: q ? matchingCols : cols,
        totalCount: totalInGroup,
        selectedCount: selectedInGroup,
        isAllChecked: selectedInGroup === totalInGroup && totalInGroup > 0,
        isIndeterminate: selectedInGroup > 0 && selectedInGroup < totalInGroup
      });
    }

    return result;
  }

  public get selectedOrderedColumns(): StudioConfigColumn[] {
    return this.allConfigColumns.filter(c => this.selectedColumnKeys.has(c.key));
  }

  public moveSelectedColUp(colKey: string): void {
    const selKeys = this.selectedOrderedColumns.map(c => c.key);
    const selIdx = selKeys.indexOf(colKey);
    if (selIdx <= 0) return;
    const prevSelKey = selKeys[selIdx - 1];

    const curIdx = this.allConfigColumns.findIndex(c => c.key === colKey);
    if (curIdx === -1) return;
    const [removed] = this.allConfigColumns.splice(curIdx, 1);

    const targetIdx = this.allConfigColumns.findIndex(c => c.key === prevSelKey);
    if (targetIdx !== -1) {
      this.allConfigColumns.splice(targetIdx, 0, removed);
    } else {
      this.allConfigColumns.unshift(removed);
    }
    this.allConfigColumns = [...this.allConfigColumns];
    this.autoSaveColumnConfig();
    this.cdr.markForCheck();
  }

  public moveSelectedColDown(colKey: string): void {
    const selKeys = this.selectedOrderedColumns.map(c => c.key);
    const selIdx = selKeys.indexOf(colKey);
    if (selIdx === -1 || selIdx >= selKeys.length - 1) return;
    const nextSelKey = selKeys[selIdx + 1];

    const curIdx = this.allConfigColumns.findIndex(c => c.key === colKey);
    if (curIdx === -1) return;
    const [removed] = this.allConfigColumns.splice(curIdx, 1);

    const targetIdx = this.allConfigColumns.findIndex(c => c.key === nextSelKey);
    if (targetIdx !== -1) {
      this.allConfigColumns.splice(targetIdx + 1, 0, removed);
    } else {
      this.allConfigColumns.push(removed);
    }
    this.allConfigColumns = [...this.allConfigColumns];
    this.autoSaveColumnConfig();
    this.cdr.markForCheck();
  }

  public isDateCol(col: any): boolean {
    if (!col) return false;
    const t = (col.type || col.field_type || '').toLowerCase();
    const k = (col.key || col.name || col.col_name || '').toLowerCase();
    return t === 'date' || t === 'datetime' || k.endsWith('_date') || k === 'date';
  }

  public isNumberCol(col: any): boolean {
    if (!col) return false;
    const t = (col.type || col.field_type || '').toLowerCase();
    const k = (col.key || col.name || col.col_name || '').toLowerCase();
    return t === 'number' || t === 'integer' || t === 'numeric' || t === 'float' || t === 'decimal' ||
           k === 'price' || k === 'amount' || k === 'total' || k === 'rate' || k === 'qty' || k === 'quantity';
  }

  private saveColConfigTimeout: any = null;

  public onColumnLabelChange(col: StudioConfigColumn): void {
    this.cdr.markForCheck();
    if (this.saveColConfigTimeout) clearTimeout(this.saveColConfigTimeout);
    this.saveColConfigTimeout = setTimeout(() => {
      this.autoSaveColumnConfig();
    }, 600);
  }

  public onColumnFormatChange(col: StudioConfigColumn): void {
    this.cdr.markForCheck();
    this.autoSaveColumnConfig();
  }

  public autoSaveColumnConfig(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl || this.isCurrentSheetReport || this.isCurrentSheetRough) return;

    const selectedKeys = Array.from(this.selectedColumnKeys);
    const columnsPayload = this.allConfigColumns.map((c, i) => ({
      key: c.key,
      name: c.name,
      col_name: c.col_name || c.name || c.key,
      short_name: c.short_name,
      label: c.label || c.short_name || c.name,
      type: c.type,
      field_type: c.type || 'text',
      visible_list: this.selectedColumnKeys.has(c.key),
      display_format: c.display_format || null,
      ref_select: c.ref_select || null,
      sort_order: i
    }));

    const payload = {
      table_name: tbl,
      columns: columnsPayload,
      selected_keys: selectedKeys
    };

    // Save to localStorage immediately as local cache
    try {
      localStorage.setItem(`sutram_table_col_config_${tbl}`, JSON.stringify(payload));
    } catch {}

    // Save to backend sys_meta
    this.api.saveTableUiConfig(tbl, payload).subscribe({
      next: () => {},
      error: (err) => console.warn('[SutramStudio] Auto-saving col config error:', err)
    });
  }

  public applySavedUiConfig(savedConfig: any): void {
    if (!savedConfig) return;
    const savedCols: any[] = savedConfig.columns || (Array.isArray(savedConfig) ? savedConfig : []);
    const selectedKeys: string[] = savedConfig.selected_keys || [];

    // 1. Restore exact visibility selection ONLY if explicit non-empty selected_keys provided
    if (Array.isArray(selectedKeys) && selectedKeys.length > 0) {
      this.selectedColumnKeys = new Set(selectedKeys);
      selectedKeys.forEach(k => this.ensureRowCellsForColumn(k));
    }

    // 2. Restore custom label and display_format by exact key
    const colMap = new Map<string, any>();
    savedCols.forEach(sc => {
      const k = sc.key || sc.name || sc.column_name;
      if (k) colMap.set(k, sc);
    });

    this.allConfigColumns.forEach(c => {
      const saved = colMap.get(c.key);
      if (saved) {
        if (saved.label !== undefined && saved.label !== null && String(saved.label).trim() !== '') {
          c.label = saved.label;
        }
        if (saved.display_format !== undefined) c.display_format = saved.display_format;
      }
    });

    // 3. Restore column order if sort_order was specified
    if (savedCols.some((sc: any) => sc.sort_order !== undefined)) {
      const orderMap = new Map<string, number>();
      savedCols.forEach((sc, idx) => {
        const k = sc.key || sc.name || sc.column_name;
        if (k) orderMap.set(k, sc.sort_order !== undefined ? sc.sort_order : idx);
      });

      this.allConfigColumns.sort((a, b) => {
        const orderA = orderMap.has(a.key) ? orderMap.get(a.key)! : 9999;
        const orderB = orderMap.has(b.key) ? orderMap.get(b.key)! : 9999;
        return orderA - orderB;
      });
    }

    this.allConfigColumns = [...this.allConfigColumns];
    this.selectedColumnKeys = new Set(this.selectedColumnKeys);
    this.cdr.markForCheck();
  }

  public isColumnSelected(key: string): boolean {
    return this.selectedColumnKeys.has(key);
  }

  public trackByGroupName(index: number, grp: StudioFkGroup): string {
    return grp.name;
  }

  public trackByColKey(index: number, col: StudioConfigColumn): string {
    return col.key;
  }

  public isFkGroupExpanded(groupName: string): boolean {
    if (this.colSearchQuery && this.colSearchQuery.trim()) return true;
    return this.expandedFkGroups.has(groupName);
  }

  public toggleFkGroupExpand(groupName: string): void {
    if (this.expandedFkGroups.has(groupName)) {
      this.expandedFkGroups.delete(groupName);
    } else {
      this.expandedFkGroups.add(groupName);
    }
    this.expandedFkGroups = new Set(this.expandedFkGroups);
    this.cdr.markForCheck();
  }

  public toggleColumnCheckbox(key: string): void {
    if (this.selectedColumnKeys.has(key)) {
      if (this.selectedColumnKeys.size <= 1) {
        return; // At least 1 column must remain visible
      }
      this.selectedColumnKeys.delete(key);
    } else {
      this.selectedColumnKeys.add(key);
      this.ensureRowCellsForColumn(key);
    }
    this.selectedColumnKeys = new Set(this.selectedColumnKeys);
    this.autoSaveColumnConfig();
    this.cdr.markForCheck();
  }

  public toggleFkGroupAll(groupName: string): void {
    const groupCols = this.allConfigColumns.filter(c => c.group === groupName);
    const selectedCount = groupCols.filter(c => this.selectedColumnKeys.has(c.key)).length;
    const shouldSelectAll = selectedCount < groupCols.length;

    if (shouldSelectAll) {
      groupCols.forEach(c => {
        this.selectedColumnKeys.add(c.key);
        this.ensureRowCellsForColumn(c.key);
      });
    } else {
      groupCols.forEach(c => this.selectedColumnKeys.delete(c.key));
      if (this.selectedColumnKeys.size === 0) {
        const fallback = this.allConfigColumns.find(c => !c.group) || this.allConfigColumns[0];
        if (fallback) {
          this.selectedColumnKeys.add(fallback.key);
          this.ensureRowCellsForColumn(fallback.key);
        }
      }
    }
    this.selectedColumnKeys = new Set(this.selectedColumnKeys);
    this.autoSaveColumnConfig();
    this.cdr.markForCheck();
  }

  public selectAllColumns(selectAll: boolean = true): void {
    if (selectAll) {
      this.allConfigColumns.forEach(c => {
        this.selectedColumnKeys.add(c.key);
        this.ensureRowCellsForColumn(c.key);
      });
    } else {
      this.selectedColumnKeys.clear();
      if (this.allConfigColumns.length > 0) {
        const fallback = this.allConfigColumns.find(c => !c.group) || this.allConfigColumns[0];
        if (fallback) {
          this.selectedColumnKeys.add(fallback.key);
          this.ensureRowCellsForColumn(fallback.key);
        }
      }
    }
    this.selectedColumnKeys = new Set(this.selectedColumnKeys);
    this.autoSaveColumnConfig();
    this.cdr.markForCheck();
  }

  public resetDefaultColumns(): void {
    this.selectedColumnKeys.clear();
    this.allConfigColumns.forEach(c => {
      if (c.default_selected) {
        this.selectedColumnKeys.add(c.key);
        this.ensureRowCellsForColumn(c.key);
      }
    });
    if (this.selectedColumnKeys.size === 0 && this.allConfigColumns.length > 0) {
      this.selectedColumnKeys.add(this.allConfigColumns[0].key);
      this.ensureRowCellsForColumn(this.allConfigColumns[0].key);
    }
    this.selectedColumnKeys = new Set(this.selectedColumnKeys);
    this.autoSaveColumnConfig();
    this.cdr.markForCheck();
  }

  public ensureRowCellsForColumn(key: string): void {
    const colDef = this.allConfigColumns.find(c => c.key === key);
    if (!colDef) return;
    const rows = this.state.rows();
    let updated = false;

    if (colDef.is_temp) {
      rows.forEach((r, idx) => {
        if (!r.cells) r.cells = {};
        if (!r.cells[key]) {
          r.cells[key] = { value: '', isValid: true, isModified: false };
        }
        this.evaluateUiSutrasForRow(r, idx, true);
      });
      this.state.rows.set([...rows]);
      this.cdr.markForCheck();
      return;
    }

    rows.forEach(r => {
      if (r.cells && !r.cells[key] && r._rawOriginal) {
        const dr = r._rawOriginal;
        let rawVal: any;
        if (colDef.is_fk_subcol) {
          const refObj = dr[colDef.ref_as || colDef.ref_table!];
          if (refObj && typeof refObj === 'object') {
            rawVal = refObj[colDef.sub_col_name!];
          }
          if (rawVal === undefined) {
            rawVal = dr[key] ?? dr[`${colDef.ref_as || colDef.ref_table}.${colDef.sub_col_name}`] ?? dr[`${colDef.ref_table}_${colDef.sub_col_name}`] ?? dr[colDef.sub_col_name!];
          }
          if (rawVal === undefined && colDef.ref_table) {
            const rawFkId = dr[colDef.col_name!] ?? dr[`${colDef.ref_table}_id`] ?? dr[colDef.ref_table!];
            if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
              const match = this.refCache.findRefMatch(colDef.ref_table, '', undefined, rawFkId);
              if (match.found && match.item && match.item[colDef.sub_col_name!] !== undefined) {
                rawVal = match.item[colDef.sub_col_name!];
              }
            }
          }
        } else if (colDef.is_fk_main || colDef.type === 'ref') {
          const joined = dr[colDef.ref_as || colDef.name || colDef.ref_table!];
          if (joined && typeof joined === 'object') {
            const formatted = this.refCache.formatOption(colDef.ref_table!, joined, colDef.ref_select);
            rawVal = formatted?.display;
          } else {
            const rawFkId = dr[colDef.col_name!] ?? dr[colDef.key] ?? dr[`${colDef.ref_table}_id`];
            if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
              const match = this.refCache.findRefMatch(colDef.ref_table!, '', undefined, rawFkId);
              if (match.found && match.display) {
                rawVal = match.display;
              }
            }
          }
        } else if (colDef.is_fk_raw) {
          rawVal = dr[colDef.col_name!] ?? dr[colDef.key];
        } else {
          rawVal = dr[colDef.col_name!] ?? dr[colDef.name] ?? dr[colDef.key];
        }

        // Safe unwrapping for JSON / nested objects to prevent "[object Object]"
        if (rawVal !== null && typeof rawVal === 'object') {
          if (rawVal.display) rawVal = rawVal.display;
          else if (rawVal.name) rawVal = rawVal.name;
          else if (rawVal.title) rawVal = rawVal.title;
          else if (rawVal.label) rawVal = rawVal.label;
          else if (rawVal.url) rawVal = rawVal.url;
          else if (Array.isArray(rawVal)) rawVal = rawVal.length > 0 ? JSON.stringify(rawVal) : '';
          else if (Object.keys(rawVal).length === 0) rawVal = '';
          else rawVal = JSON.stringify(rawVal);
        }

        r.cells[key] = {
          value: String(rawVal ?? ''),
          isValid: true,
          refId: dr[colDef.col_name!] !== undefined ? dr[colDef.col_name!] : rawVal
        };
        updated = true;
      }
    });

    if (updated) {
      this.state.setRows([...rows]);
    }
  }

  public get statusStripClass(): string {
    if (this.isCurrentSheetReport) return 'strip-clean';
    if (this.state.stats().errorRows > 0) return 'strip-error';
    if (this.mode === 'intelligent') return 'strip-suggestion';
    return 'strip-clean';
  }

  public get statusStripIcon(): string {
    if (this.isCurrentSheetReport) return 'pi-chart-bar text-primary';
    if (this.state.stats().errorRows > 0) return 'pi-exclamation-triangle text-danger';
    if (this.mode === 'intelligent') return 'pi-bolt text-primary';
    return 'pi-info-circle text-primary';
  }

  public get statusStripMessage(): string {
    if (this.isCurrentSheetReport) {
      return 'Report view loaded. Filter, sort, or export to Excel anytime.';
    }
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

    // Initialize & persist dark mode preference
    const savedTheme = localStorage.getItem('sutram_dark_mode');
    if (savedTheme === 'true' || document.body.classList.contains('dark-mode')) {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }

    // Load persisted boolean display settings
    const savedBoolStyle = localStorage.getItem('sutram_boolean_style');
    if (savedBoolStyle && ['checkbox', 'badge'].includes(savedBoolStyle)) {
      this.booleanDisplayStyle = savedBoolStyle as any;
    }

    // Load persisted active user and role
    const savedActiveUser = localStorage.getItem('sutram_active_user');
    if (savedActiveUser) {
      try {
        const parsed = JSON.parse(savedActiveUser);
        if (parsed && (parsed.role === 'admin' || parsed.role === 'author')) {
          this.currentUser = parsed;
        }
      } catch {}
    }

    this.state.isAuditMode.set(this.mode === 'intelligent');
    this.state.filtersEnabled.set(this.enableFilters);
    this.state.sortingEnabled.set(this.enableSorting);

    // Refresh saved local sheets list from localStorage
    this.refreshSavedSheetsList();

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

    // Reactive listener: automatically re-audit current grid rows whenever a referenced FK dataset finishes caching
    this.refLoadedSub = this.refCache.tableLoaded$.subscribe((loadedTable: string) => {
      const cfg = this.state.config();
      if (!cfg || !cfg.headers) return;
      const cleanLoaded = (loadedTable || '').toLowerCase().trim();
      const hasRef = cfg.headers.some((h: any) => (h.ref_table || '').toLowerCase().trim() === cleanLoaded);
      if (hasRef) {
        const rows = this.state.rows();
        if (rows && rows.length > 0) {
          this.allConfigColumns
            .filter(c => c.is_fk_subcol && (c.ref_table || '').toLowerCase().trim() === cleanLoaded && this.selectedColumnKeys.has(c.key))
            .forEach(c => this.ensureRowCellsForColumn(c.key));
          this.audit.auditAll(rows, cfg.headers);
          this.state.setRows([...rows]);
          this.cdr.markForCheck();
        }
      }
    });

    this.loadTablesList();
  }

  public ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.refLoadedSub?.unsubscribe();
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
      localStorage.setItem('sutram_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('sutram_dark_mode', 'false');
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
    if (this.isExportingExcel) return;

    const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
    const targetTable = curTab?.tableName || this.selectedTableName;
    const isRough = this.isCurrentSheetRough;

    // Case 1: Rough / Blank Sheet (In-Memory Export)
    if (isRough || !targetTable) {
      const rows = this.state.rows().filter(r => this.isRowPopulated(r));
      if (!rows || rows.length === 0) {
        alert('डाउनलोड करने के लिए शीट में कोई डेटा नहीं है (No data to export)');
        return;
      }
      this.downloadExcelWorkbook(rows, this.activeSheetId || 'Sheet1');
      return;
    }

    // Case 2: Database Table / Report -> Fetch ALL matching rows based on active filters, search & sort
    const cfg = this.state.config();
    if (!cfg) {
      alert('तालिका कॉन्फ़िगरेशन अभी लोड नहीं हुआ है (Configuration not ready)');
      return;
    }

    this.isExportingExcel = true;
    this.cdr.markForCheck();

    const activeSort = this.state.activeSort();
    const columnFilters = this.state.columnFilters();
    const searchQuery = this.state.dbSearchQuery().trim();

    let sortColKey = activeSort?.colKey;
    if (sortColKey && cfg) {
      const foundCol = this.allConfigColumns.find(c => c.key === sortColKey || c.name === sortColKey);
      if (foundCol && foundCol.col_name) {
        sortColKey = foundCol.col_name;
      } else {
        const foundHeader = (cfg.headers || []).find((h: any) => h.name === sortColKey || h.col_name === sortColKey);
        if (foundHeader && foundHeader.col_name) {
          sortColKey = foundHeader.col_name;
        }
      }
    }

    const apiFilters = this.buildApiFilters();

    this.api.getTableDataChunk(targetTable, {
      export: true,
      search: searchQuery || undefined,
      sort: sortColKey,
      order: activeSort?.order,
      filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined
    }).subscribe({
      next: (res: { rows: any[]; total: number }) => {
        this.isExportingExcel = false;
        const dbRows = res.rows || [];
        if (dbRows.length === 0) {
          alert('फिल्टर के अनुसार कोई डेटा नहीं मिला (No matching records to export)');
          this.cdr.markForCheck();
          return;
        }

        // Convert db records to SutramRow format for clean column mapping & FK display
        const builtRows: SutramRow[] = dbRows.map((dr: any, idx: number) => {
          return this.convertDbRecordToSutramRow(dr, idx + 1, cfg);
        });

        // Overlay any unsaved in-memory edits for modified rows
        const currentMemoryRows = this.state.rows();
        const modifiedMemoryMap = new Map<any, SutramRow>();
        for (const mr of currentMemoryRows) {
          if (mr.isModified) {
            const idVal = mr.cells['_id']?.value || mr.cells['id']?.value;
            if (idVal) modifiedMemoryMap.set(String(idVal), mr);
          }
        }

        if (modifiedMemoryMap.size > 0) {
          builtRows.forEach(br => {
            const idVal = br.cells['_id']?.value || br.cells['id']?.value;
            if (idVal && modifiedMemoryMap.has(String(idVal))) {
              const memRow = modifiedMemoryMap.get(String(idVal))!;
              Object.keys(memRow.cells).forEach(k => {
                if (memRow.cells[k]?.isModified) {
                  br.cells[k] = { ...memRow.cells[k] };
                }
              });
            }
          });
        }

        // Include any newly added un-synced rows
        const newMemoryRows = currentMemoryRows.filter(r => r.isNew && this.isRowPopulated(r));
        const allFinalRows = [...newMemoryRows, ...builtRows];

        const sheetTitle = curTab?.title || targetTable;
        this.downloadExcelWorkbook(allFinalRows, sheetTitle);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.isExportingExcel = false;
        console.error('[SutramStudio] Export failed:', err);
        alert('एक्सेल निर्यात विफल रहा (Export failed): ' + (err?.message || 'Server error'));
        this.cdr.markForCheck();
      }
    });
  }

  private downloadExcelWorkbook(rows: SutramRow[], sheetName: string): void {
    const headers = this.visibleHeaders;
    const exportData = rows.map(r => {
      const obj: any = {};
      headers.forEach(h => {
        const colTitle = h.name || h.col_name || h.key;
        let cellVal = r.cells[h.key]?.value ?? r.cells[h.name]?.value ?? r.cells[h.col_name]?.value ?? '';
        if (this.isBooleanColumn(h)) {
          cellVal = this.isCellTrue(cellVal) ? 'Yes' : 'No';
        }
        obj[colTitle] = cellVal;
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    const cleanSheetName = (sheetName || 'Sheet1').replace(/[*?:/\\\[\]]/g, '').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
    const filename = `${sheetName || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  public isBooleanColumn(col: any): boolean {
    if (!col) return false;
    const t = (col.type || '').toLowerCase();
    if (t === 'boolean' || t === 'bool') return true;
    const colName = (col.col_name || col.name || col.key || '').toLowerCase();
    return (
      colName === 'active' ||
      colName === 'verify' ||
      colName.startsWith('is_') ||
      colName.startsWith('has_') ||
      colName.endsWith('_status') ||
      colName.endsWith('_flag')
    );
  }

  public isCellTrue(val: any): boolean {
    return (
      val === true ||
      val === 1 ||
      val === '1' ||
      val === 'true' ||
      val === 'TRUE' ||
      val === 'yes' ||
      val === 'YES' ||
      val === 'y' ||
      val === 'Y' ||
      val === 'सक्रिय'
    );
  }

  public setTopTab(tab: 'home' | 'tables' | 'reports' | 'settings'): void {
    this.activeTopTab = tab;
    this.cdr.markForCheck();
  }

  public setBooleanStyle(style: 'checkbox' | 'badge'): void {
    this.booleanDisplayStyle = style;
    localStorage.setItem('sutram_boolean_style', style);
    this.cdr.markForCheck();
  }

  public get isCurrentSheetRough(): boolean {
    const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
    return !cur || cur.type === 'rough' || this.activeSheetId === 'blank' || this.activeSheetId.startsWith('rough_') || this.activeSheetId.startsWith('sheet_');
  }

  public get isCurrentSheetReport(): boolean {
    const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
    return !!cur && cur.type === 'report';
  }

  public get isCurrentSheetTable(): boolean {
    const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
    return !!cur && cur.type === 'table';
  }

  public get currentActiveTableName(): string {
    const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
    return cur?.tableName || (cur?.type === 'table' ? cur.id : '') || this.selectedTableName || '';
  }

  public get currentActiveSheetTitle(): string {
    const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
    if (!cur || cur.type === 'rough') return 'Rough Sheet';
    return cur.title || cur.tableName || cur.id;
  }

  // ── Settings Modals State ─────────────────────────────────────
  public showTableConfigModal: boolean = false;
  public showUiSutrasModal: boolean = false;
  public showBackendSutrasModal: boolean = false;

  // 1. Table & Column Configuration
  public tableConfigColumns: any[] = [];
  public isSavingTableConfig: boolean = false;
  public dateFormatOptions = [
    { label: 'DD/MM/YYYY (e.g. 10/11/2026)', value: 'DD/MM/YYYY' },
    { label: 'YYYY-MM-DD (e.g. 2026-11-10)', value: 'YYYY-MM-DD' },
    { label: 'DD-MMM-YYYY (e.g. 10-Nov-2026)', value: 'DD-MMM-YYYY' },
    { label: 'MM/DD/YYYY (e.g. 11/10/2026)', value: 'MM/DD/YYYY' }
  ];
  public numberDecimalOptions = [
    { label: '0 Decimals (पूर्णांक / Integer)', value: '0' },
    { label: '2 Decimals (0.00)', value: '2' },
    { label: '4 Decimals (0.0000)', value: '4' },
    { label: 'मुद्रा प्रारूप (₹ Currency)', value: 'currency' }
  ];

  // 2. UI Sutras (Client-side Reactive Formulas & Temp Display Columns)
  public uiSutrasList: Array<{ target_col: string; display_name?: string; formula: string; is_temp?: boolean; desc?: string }> = [];
  public isSavingUiSutras: boolean = false;
  public selectedTargetColValue: string | null = null;
  public newUiSutra: { target_col: string; display_name: string; formula: string; is_temp: boolean; desc?: string } = {
    target_col: '',
    display_name: '',
    formula: '',
    is_temp: false
  };

  public targetColDropdownOptions: Array<{ value: string; label: string; isTemp?: boolean }> = [];

  public buildTargetColDropdownOptions(): void {
    const list: Array<{ value: string; label: string; isTemp?: boolean }> = [
      { value: '__temp__', label: '➕ Temp Column (Virtual / स्क्रीन-ओनली Read-Only)', isTemp: true }
    ];

    // Gather ONLY direct physical columns of the CURRENT table:
    // Exclude temp/virtual columns and exclude reference table sub-columns (is_fk_subcol, dot notation)
    let sourceCols: any[] = [];
    if (this.allConfigColumns && this.allConfigColumns.length > 0) {
      sourceCols = this.allConfigColumns.filter(c =>
        !c.is_temp &&
        !c.is_virtual &&
        !c.is_fk_subcol &&
        !(c.key && c.key.includes('.')) &&
        !c.sub_col_name
      );
    }
    if (sourceCols.length === 0 && this.state.headers().length > 0) {
      sourceCols = this.state.headers().filter((h: any) =>
        !h.is_temp &&
        !h.is_virtual &&
        !h.is_fk_subcol &&
        !(h.key && h.key.includes('.')) &&
        !h.sub_col_name
      );
    }
    if (sourceCols.length === 0) {
      const cfg = this.state.config();
      if (cfg && cfg.headers) {
        sourceCols = cfg.headers.filter((h: any) =>
          !h.is_temp &&
          !h.is_virtual &&
          !h.is_fk_subcol &&
          !(h.key && h.key.includes('.')) &&
          !h.sub_col_name
        );
      }
    }

    const seen = new Set<string>();
    for (const col of sourceCols) {
      if (col.is_fk_subcol || (col.key && col.key.includes('.')) || col.sub_col_name) continue;
      const colId = col.name || col.col_name || col.key;
      if (!colId || seen.has(colId)) continue;
      seen.add(colId);
      const displayLabel = col.name
        ? (col.col_name && col.col_name !== col.name ? `${col.name} (${col.col_name})` : col.name)
        : colId;
      list.push({
        value: colId,
        label: `${displayLabel} (DB Column)`
      });
    }
    this.targetColDropdownOptions = list;
  }

  public get currentTableColumns(): any[] {
    const list: any[] = [];
    const sourceCols: any[] = (this.allConfigColumns && this.allConfigColumns.length > 0)
      ? this.allConfigColumns
      : (this.state.headers() || []);

    const seen = new Set<string>();
    for (const c of sourceCols) {
      if (c.is_temp || c.is_virtual || c.is_fk_subcol || (c.key && c.key.includes('.')) || c.sub_col_name) continue;
      const colId = c.name || c.col_name || c.key;
      if (!colId || seen.has(colId)) continue;
      seen.add(colId);
      list.push(c);
    }
    return list;
  }

  public get referenceColumns(): any[] {
    const list: any[] = [];
    if (!this.allConfigColumns || this.allConfigColumns.length === 0) return list;

    const seen = new Set<string>();
    for (const c of this.allConfigColumns) {
      if (c.is_fk_subcol || (c.key && c.key.includes('.')) || c.sub_col_name) {
        const colId = c.key || c.name || c.col_name;
        if (!colId || seen.has(colId)) continue;
        seen.add(colId);
        list.push(c);
      }
    }
    return list;
  }

  public onTargetColChange(event: any): void {
    const val = (event && typeof event === 'object' && 'value' in event) ? event.value : event;
    this.selectedTargetColValue = val;
    if (val === '__temp__') {
      this.newUiSutra.is_temp = true;
      this.newUiSutra.target_col = '';
      this.newUiSutra.display_name = '';
    } else if (val) {
      this.newUiSutra.is_temp = false;
      this.newUiSutra.target_col = val;
      this.newUiSutra.display_name = val;
    } else {
      this.newUiSutra.is_temp = false;
      this.newUiSutra.target_col = '';
      this.newUiSutra.display_name = '';
    }
    this.cdr.markForCheck();
  }

  // 3. Backend Sutras (Server-side Triggers)
  public backendTriggersList: any[] = [];
  public isLoadingTriggers: boolean = false;
  public newTriggerDef: any = {
    trigger_name: '',
    event: 'INSERT',
    action_type: 'raw_sql',
    raw_sql: '',
    target_table: '',
    field_map_str: '{}'
  };

  // 4. Role & User Management (Frontend Rights Control)
  public currentUser: { username: string; display_name: string; role: 'admin' | 'author' } = {
    username: 'admin',
    display_name: 'Administrator',
    role: 'admin'
  };
  public showUserManagementModal: boolean = false;
  public usersList: any[] = [];
  public isLoadingUsers: boolean = false;
  public isSavingUser: boolean = false;
  public editingUserId: number | null = null;
  public userFormData: {
    username: string;
    password: string;
    display_name: string;
    role: 'admin' | 'author';
    active: number;
  } = {
    username: '',
    password: '',
    display_name: '',
    role: 'author',
    active: 1
  };
  public roleDropdownOptions = [
    { label: '👑 Admin (पूर्ण नियंत्रण - Triggers, Schema, Rules)', value: 'admin' },
    { label: '👤 Author (ऑपरेशनल - View, Edit, Column Visibility & Style)', value: 'author' }
  ];

  public get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  public get isAuthor(): boolean {
    return this.currentUser?.role === 'author';
  }

  public switchRole(role: 'admin' | 'author'): void {
    if (!this.currentUser) {
      this.currentUser = { username: 'admin', display_name: 'Administrator', role: 'admin' };
    }
    this.currentUser.role = role;
    localStorage.setItem('sutram_active_user', JSON.stringify(this.currentUser));
    this.cdr.markForCheck();
  }

  public toggleRole(): void {
    this.switchRole(this.isAdmin ? 'author' : 'admin');
  }

  // ── Table Config Actions ─────────────────────────────────────
  public openTableConfigModal(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl) return;
    this.api.getTableUiConfig(tbl).subscribe({
      next: (res) => {
        if (res && res.columns) {
          this.tableConfigColumns = res.columns.filter((c: any) => c.name !== 'hl' && c.column_name !== 'hl');
        } else {
          this.tableConfigColumns = (this.allConfigColumns.length > 0 ? this.allConfigColumns : this.visibleHeaders)
            .filter(c => c.name !== 'hl')
            .map(c => ({
              column_name: c.name,
              label: c.label || c.short_name || c.name,
              field_type: c.type || 'text',
              visible_list: this.selectedColumnKeys.has(c.key || c.name),
              display_format: c.display_format || null,
              ref_select: c.ref_select || null,
              sort_order: 0
            }));
        }
        this.showTableConfigModal = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.tableConfigColumns = (this.allConfigColumns.length > 0 ? this.allConfigColumns : this.visibleHeaders)
          .filter(c => c.name !== 'hl')
          .map(c => ({
            column_name: c.name,
            label: c.label || c.short_name || c.name,
            field_type: c.type || 'text',
            visible_list: this.selectedColumnKeys.has(c.key || c.name),
            display_format: c.display_format || null,
            ref_select: c.ref_select || null,
            sort_order: 0
          }));
        this.showTableConfigModal = true;
        this.cdr.markForCheck();
      }
    });
  }

  public moveConfigColUp(idx: number): void {
    if (idx <= 0) return;
    const temp = this.tableConfigColumns[idx];
    this.tableConfigColumns[idx] = this.tableConfigColumns[idx - 1];
    this.tableConfigColumns[idx - 1] = temp;
    this.tableConfigColumns.forEach((c, i) => c.sort_order = i);
  }

  public moveConfigColDown(idx: number): void {
    if (idx >= this.tableConfigColumns.length - 1) return;
    const temp = this.tableConfigColumns[idx];
    this.tableConfigColumns[idx] = this.tableConfigColumns[idx + 1];
    this.tableConfigColumns[idx + 1] = temp;
    this.tableConfigColumns.forEach((c, i) => c.sort_order = i);
  }

  public saveTableConfig(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl) return;
    this.isSavingTableConfig = true;
    this.api.saveTableUiConfig(tbl, { columns: this.tableConfigColumns }).subscribe({
      next: () => {
        this.isSavingTableConfig = false;
        this.showTableConfigModal = false;
        const newSelected = new Set<string>();
        this.tableConfigColumns.forEach(c => {
          if (c.visible_list !== false) {
            newSelected.add(c.column_name || c.name);
          }
        });
        this.selectedColumnKeys = newSelected;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSavingTableConfig = false;
        console.error('[SutramStudio] Error saving table config:', err);
      }
    });
  }

  public get nonTempHeaders(): any[] {
    return this.visibleHeaders.filter(h => !h.is_temp && !h.is_virtual);
  }

  // ── UI Sutras Actions ────────────────────────────────────────
  public loadUiSutras(tableName: string, callback?: () => void): void {
    if (!tableName) return;
    this.api.getUiSutras(tableName).subscribe({
      next: (list) => {
        this.uiSutrasList = list || [];
        this.syncTempColumnsToGrid();
        if (callback) callback();
        const rows = this.state.rows();
        if (rows && rows.length > 0 && this.uiSutrasList.length > 0) {
          rows.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, true));
          this.state.rows.set([...rows]);
        }
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: () => {
        this.uiSutrasList = [];
        if (callback) callback();
        this.cdr.markForCheck();
      }
    });
  }

  public syncTempColumnsToGrid(): void {
    if (!this.uiSutrasList || this.uiSutrasList.length === 0) return;
    let anyAdded = false;

    for (const s of this.uiSutrasList) {
      if (s.is_temp) {
        const colKey = s.target_col;
        const exists = this.allConfigColumns.some(c => c.key === colKey);
        if (!exists) {
          const tempCol: StudioConfigColumn = {
            key: colKey,
            name: colKey,
            short_name: s.display_name || colKey,
            col_name: colKey,
            group: 'Computed (fx)',
            is_temp: true,
            is_virtual: true,
            readonly: true,
            type: 'string',
            not_null: false,
            default_selected: true
          };
          this.allConfigColumns.push(tempCol);
          this.selectedColumnKeys.add(colKey);
          anyAdded = true;
        } else {
          if (!this.selectedColumnKeys.has(colKey)) {
            this.selectedColumnKeys.add(colKey);
            anyAdded = true;
          }
        }

        // Initialize cell in all loaded rows if missing
        const rows = this.state.rows();
        for (const r of rows) {
          if (r.cells && !r.cells[colKey]) {
            r.cells[colKey] = { value: '', isValid: true, isModified: false };
          }
        }
      }
    }

    if (anyAdded) {
      this.allConfigColumns = [...this.allConfigColumns];
      this.selectedColumnKeys = new Set(this.selectedColumnKeys);
    }

    const rows = this.state.rows();
    if (rows && rows.length > 0) {
      rows.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, true));
      this.state.rows.set([...rows]);
    }

    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  public openUiSutrasModal(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl) return;
    this.loadUiSutras(tbl, () => {
      this.buildTargetColDropdownOptions();
      this.newUiSutra = { target_col: '', display_name: '', formula: '', is_temp: false };
      this.selectedTargetColValue = null;
      this.showUiSutrasModal = true;
      this.cdr.markForCheck();
    });
  }

  public addUiSutra(): void {
    if (!this.newUiSutra.formula) return;
    if (this.newUiSutra.is_temp) {
      if (!this.newUiSutra.display_name?.trim()) return;
      const cleanKey = this.newUiSutra.display_name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, '_')
        .replace(/^_+|_+$/g, '');
      this.newUiSutra.target_col = cleanKey ? `col_${cleanKey}` : `temp_${Date.now()}`;
    } else {
      if (!this.newUiSutra.target_col) return;
      this.newUiSutra.display_name = this.newUiSutra.target_col;
    }

    this.uiSutrasList.push({ ...this.newUiSutra });
    this.newUiSutra = { target_col: '', display_name: '', formula: '', is_temp: false };
    this.selectedTargetColValue = null;
    this.buildTargetColDropdownOptions();
  }

  public removeUiSutra(idx: number): void {
    const removed = this.uiSutrasList[idx];
    this.uiSutrasList.splice(idx, 1);
    if (removed && removed.is_temp) {
      this.allConfigColumns = this.allConfigColumns.filter(c => c.key !== removed.target_col);
      this.selectedColumnKeys.delete(removed.target_col);
      this.buildTargetColDropdownOptions();
      this.cdr.markForCheck();
    }
  }

  public insertColIntoFormula(colName: string): void {
    this.newUiSutra.formula = (this.newUiSutra.formula || '') + `[${colName}]`;
  }

  public insertFnIntoFormula(fnText: string): void {
    this.newUiSutra.formula = (this.newUiSutra.formula || '') + fnText;
  }

  public saveUiSutras(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl) return;
    this.isSavingUiSutras = true;
    this.api.saveUiSutras(tbl, this.uiSutrasList).subscribe({
      next: () => {
        this.isSavingUiSutras = false;
        this.showUiSutrasModal = false;
        this.syncTempColumnsToGrid();
        const rows = this.state.rows();
        rows.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, false));
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSavingUiSutras = false;
        console.error('[SutramStudio] Error saving UI sutras:', err);
      }
    });
  }

  // ── Backend Sutras Actions ───────────────────────────────────
  public openBackendSutrasModal(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl) return;
    this.isLoadingTriggers = true;
    this.api.getTableTriggers(tbl).subscribe({
      next: (res) => {
        this.isLoadingTriggers = false;
        this.backendTriggersList = res || [];
        this.newTriggerDef = {
          trigger_name: `trg_${tbl}_sync`,
          event: 'INSERT',
          action_type: 'raw_sql',
          raw_sql: '',
          target_table: this.tablesList.length > 0 ? this.tablesList[0].table : '',
          field_map_str: '{}'
        };
        this.showBackendSutrasModal = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingTriggers = false;
        this.backendTriggersList = [];
        this.newTriggerDef = {
          trigger_name: `trg_${tbl}_sync`,
          event: 'INSERT',
          action_type: 'raw_sql',
          raw_sql: '',
          target_table: this.tablesList.length > 0 ? this.tablesList[0].table : '',
          field_map_str: '{}'
        };
        this.showBackendSutrasModal = true;
        this.cdr.markForCheck();
      }
    });
  }

  public insertColIntoTriggerSql(colName: string, prefix: string = ':new.'): void {
    const snippet = `${prefix}${colName}`;
    this.newTriggerDef.raw_sql = (this.newTriggerDef.raw_sql || '') + snippet;
  }

  public insertTextIntoTriggerSql(text: string): void {
    this.newTriggerDef.raw_sql = (this.newTriggerDef.raw_sql || '') + text;
  }

  public createBackendTrigger(): void {
    const tbl = this.currentActiveTableName;
    if (!tbl || !this.newTriggerDef.trigger_name) return;
    let fieldMap = {};
    try {
      fieldMap = JSON.parse(this.newTriggerDef.field_map_str || '{}');
    } catch {}

    const payload = {
      trigger_name: this.newTriggerDef.trigger_name,
      label: this.newTriggerDef.trigger_name,
      source_table: tbl,
      event: this.newTriggerDef.event,
      actions: [
        {
          sort_order: 0,
          action_type: this.newTriggerDef.action_type || 'raw_sql',
          target_table: this.newTriggerDef.target_table || null,
          field_map: fieldMap,
          raw_sql: this.newTriggerDef.raw_sql ? this.newTriggerDef.raw_sql.trim() : null
        }
      ]
    };

    this.api.createTrigger(payload).subscribe({
      next: () => {
        this.openBackendSutrasModal();
      },
      error: (err) => console.error('[SutramStudio] Create trigger error:', err)
    });
  }

  public deleteBackendTrigger(id: number | string): void {
    this.api.deleteTrigger(id).subscribe({
      next: () => {
        this.backendTriggersList = this.backendTriggersList.filter(t => t._id !== id);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('[SutramStudio] Delete trigger error:', err)
    });
  }

  // ── User Management Actions ──────────────────────────────────
  public openUserManagementModal(): void {
    this.showUserManagementModal = true;
    this.editingUserId = null;
    this.userFormData = {
      username: '',
      password: '',
      display_name: '',
      role: 'author',
      active: 1
    };
    this.loadUsers();
    this.cdr.markForCheck();
  }

  public loadUsers(): void {
    this.isLoadingUsers = true;
    this.api.getUsers().subscribe({
      next: (users) => {
        this.usersList = users || [];
        this.isLoadingUsers = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoadingUsers = false;
        console.error('[SutramStudio] Error loading users:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public openAddUser(): void {
    this.editingUserId = null;
    this.userFormData = {
      username: '',
      password: '',
      display_name: '',
      role: 'author',
      active: 1
    };
  }

  public editUser(u: any): void {
    this.editingUserId = u._id;
    this.userFormData = {
      username: u.username,
      password: '', // Blank unless modifying
      display_name: u.display_name || u.username,
      role: u.role || 'author',
      active: u.active !== undefined ? u.active : 1
    };
  }

  public cancelUserEdit(): void {
    this.editingUserId = null;
    this.userFormData = { username: '', password: '', display_name: '', role: 'author', active: 1 };
  }

  public saveUser(): void {
    if (!this.userFormData.username?.trim()) return;
    if (!this.editingUserId && !this.userFormData.password?.trim()) return;

    this.isSavingUser = true;
    if (this.editingUserId) {
      this.api.updateUser(this.editingUserId, this.userFormData).subscribe({
        next: () => {
          this.isSavingUser = false;
          this.cancelUserEdit();
          this.loadUsers();
        },
        error: (err) => {
          this.isSavingUser = false;
          alert('Error updating user: ' + (err?.error?.error || err.message));
        }
      });
    } else {
      this.api.createUser(this.userFormData).subscribe({
        next: () => {
          this.isSavingUser = false;
          this.cancelUserEdit();
          this.loadUsers();
        },
        error: (err) => {
          this.isSavingUser = false;
          alert('Error creating user: ' + (err?.error?.error || err.message));
        }
      });
    }
  }

  public deleteUser(u: any): void {
    if (!confirm(`Are you sure you want to delete user "${u.username}"?`)) return;
    this.api.deleteUser(u._id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        alert('Error deleting user: ' + (err?.error?.error || err.message));
      }
    });
  }

  public setCurrentActiveUser(u: any): void {
    this.currentUser = {
      username: u.username,
      display_name: u.display_name || u.username,
      role: u.role || 'author'
    };
    localStorage.setItem('sutram_active_user', JSON.stringify(this.currentUser));
    this.cdr.markForCheck();
  }

  // ── Reactive Cell Changed & Highlight Auto-persistence ────────
  public onGridCellChanged(event: { rowIdx: number; colKey: string; value: any }): void {
    const rows = this.state.rows();
    const row = rows[event.rowIdx];
    if (!row) return;

    if (event.colKey === 'hl') {
      const rowId = row._rawOriginal?._id ?? row._rawOriginal?.id ?? row.cells?.['_id']?.value;
      if (rowId !== undefined && rowId !== null && this.currentActiveTableName && !this.isCurrentSheetRough) {
        this.api.updateRow(this.currentActiveTableName, {
          _id: rowId,
          hl: event.value ? 1 : 0
        }).subscribe({
          next: () => {
            if (row._rawOriginal) row._rawOriginal.hl = event.value ? 1 : 0;
            this.cdr.markForCheck();
          },
          error: (err) => console.warn('[SutramStudio] Error persisting row highlight:', err)
        });
      }
      return;
    }

    if (this.uiSutrasList.length > 0) {
      this.evaluateUiSutrasForRow(row, event.rowIdx);
    }
  }

  public evaluateUiSutrasForRow(row: SutramRow, rowIdx: number, isInitialOrDisplayLoad: boolean = false): void {
    if (!row || !row.cells || this.uiSutrasList.length === 0) return;
    let anyChanged = false;

    const helpers = {
      AGE: (dobVal: any) => {
        if (!dobVal) return '';
        const birth = new Date(dobVal);
        if (isNaN(birth.getTime())) return '';
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age >= 0 ? age : 0;
      },
      DAYS: (d1: any, d2: any) => {
        if (!d1 || !d2) return 0;
        const t1 = new Date(d1).getTime();
        const t2 = new Date(d2).getTime();
        if (isNaN(t1) || isNaN(t2)) return 0;
        return Math.round(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
      },
      YEAR: (d: any) => {
        if (!d) return '';
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? '' : dt.getFullYear();
      },
      MONTH: (d: any) => {
        if (!d) return '';
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? '' : dt.getMonth() + 1;
      },
      DAY: (d: any) => {
        if (!d) return '';
        const dt = new Date(d);
        return isNaN(dt.getTime()) ? '' : dt.getDate();
      },
      IF: (cond: any, a: any, b: any) => (cond ? a : b),
      ROUND: (num: any, decimals: number = 2) => {
        const n = Number(num);
        if (isNaN(n)) return 0;
        const factor = Math.pow(10, decimals);
        return Math.round(n * factor) / factor;
      },
      UPPER: (str: any) => (str !== null && str !== undefined ? String(str).toUpperCase() : ''),
      LOWER: (str: any) => (str !== null && str !== undefined ? String(str).toLowerCase() : ''),
      COALESCE: (...args: any[]) => args.find(v => v !== null && v !== undefined && v !== '') ?? ''
    };

    const colNames = Object.keys(row.cells);

    // Helper to get raw or cell value across all aliases (col_name, name, key, short_name)
    const getColValue = (colIdentifier: string): any => {
      if (!colIdentifier) return undefined;
      // 1. Direct cell match in row.cells
      if (row.cells[colIdentifier] && row.cells[colIdentifier].value !== undefined) {
        return row.cells[colIdentifier].value;
      }
      // 2. Match in allConfigColumns or cfg.headers by name, col_name, key, or short_name
      const match = this.allConfigColumns.find(c =>
        c.name === colIdentifier ||
        c.col_name === colIdentifier ||
        c.key === colIdentifier ||
        c.short_name === colIdentifier
      );
      if (match) {
        if (match.col_name && row.cells[match.col_name]?.value !== undefined) {
          return row.cells[match.col_name].value;
        }
        if (match.name && row.cells[match.name]?.value !== undefined) {
          return row.cells[match.name].value;
        }
        if (match.key && row.cells[match.key]?.value !== undefined) {
          return row.cells[match.key].value;
        }
      }
      // 3. Fallback to row root property or raw original
      if ((row as any)[colIdentifier] !== undefined) {
        return (row as any)[colIdentifier];
      }
      if (row._rawOriginal && row._rawOriginal[colIdentifier] !== undefined) {
        return row._rawOriginal[colIdentifier];
      }
      return undefined;
    };

    for (const sutra of this.uiSutrasList) {
      if (!sutra.target_col || !sutra.formula) continue;

      // RULE: On initial/display load, ONLY calculate temp/virtual columns!
      // Never overwrite stored database values in physical columns!
      if (isInitialOrDisplayLoad && !sutra.is_temp) {
        continue;
      }

      try {
        const rawFormula = sutra.formula.trim();
        let finalVal: any = undefined;

        // 1. Direct Column Copy: e.g. [colB] or colB
        const directBracketMatch = rawFormula.match(/^\[([^\]]+)\]$/);
        const directColName = directBracketMatch ? directBracketMatch[1] : (colNames.includes(rawFormula) ? rawFormula : null);

        if (directColName) {
          const srcVal = getColValue(directColName);
          finalVal = (srcVal !== undefined) ? srcVal : null;
        } else {
          // 2. Computed Expression / Function block
          const rowData: Record<string, any> = {};
          for (const c of colNames) {
            rowData[c] = row.cells[c]?.value;
          }
          this.allConfigColumns.forEach(c => {
            const cell = row.cells[c.col_name] || row.cells[c.name] || (c.key ? row.cells[c.key] : undefined);
            if (cell && cell.value !== undefined) {
              if (c.col_name) rowData[c.col_name] = cell.value;
              if (c.name) rowData[c.name] = cell.value;
              if (c.key) rowData[c.key] = cell.value;
            }
          });
          for (const k of Object.keys(row)) {
            if (k !== 'cells' && !(k in rowData)) {
              rowData[k] = (row as any)[k];
            }
          }

          let code = rawFormula;
          code = code.replace(/\[([^\]]+)\]/g, "row['$1']");

          if (code.includes('return ')) {
            const fn = new Function('row', 'helpers', `
              'use strict';
              const { AGE, DAYS, YEAR, MONTH, DAY, IF, ROUND, UPPER, LOWER, COALESCE } = helpers;
              ${code}
            `);
            finalVal = fn(rowData, helpers);
          } else {
            const fn = new Function('row', 'helpers', `
              'use strict';
              const { AGE, DAYS, YEAR, MONTH, DAY, IF, ROUND, UPPER, LOWER, COALESCE } = helpers;
              return (${code});
            `);
            finalVal = fn(rowData, helpers);
          }
        }

        if (finalVal !== undefined) {
          const currentVal = row.cells[sutra.target_col]?.value;
          if (currentVal !== finalVal) {
            if (sutra.is_temp) {
              // Temp column: In-memory only, never marks row modified/dirty
              if (row.cells[sutra.target_col]) {
                row.cells[sutra.target_col].value = finalVal;
                row.cells[sutra.target_col].refId = finalVal;
                row.cells[sutra.target_col].isModified = false;
              } else {
                row.cells[sutra.target_col] = { value: finalVal, refId: finalVal, isValid: true, isModified: false };
              }
              anyChanged = true;
            } else {
              // Real DB column: update all alias keys in row.cells and mark modified so it persists to DB
              const matchingCol = this.allConfigColumns.find(c =>
                c.name === sutra.target_col ||
                c.col_name === sutra.target_col ||
                c.key === sutra.target_col
              );
              const keysToUpdate = new Set<string>();
              keysToUpdate.add(sutra.target_col);
              if (matchingCol?.col_name) keysToUpdate.add(matchingCol.col_name);
              if (matchingCol?.name) keysToUpdate.add(matchingCol.name);
              if (matchingCol?.key) keysToUpdate.add(matchingCol.key);

              keysToUpdate.forEach(k => {
                if (row.cells[k]) {
                  row.cells[k].value = finalVal;
                  row.cells[k].refId = finalVal;
                  row.cells[k].isModified = true;
                } else {
                  row.cells[k] = { value: finalVal, refId: finalVal, isValid: true, isModified: true };
                }
              });
              row.isModified = true;

              this.state.updateCellValue(rowIdx, sutra.target_col, finalVal, finalVal);
              if (matchingCol?.col_name && matchingCol.col_name !== sutra.target_col) {
                this.state.updateCellValue(rowIdx, matchingCol.col_name, finalVal, finalVal);
              }
              anyChanged = true;
            }
          }
        }
      } catch (e) {
        console.warn('[SutramStudio] UI Sutra eval error for col', sutra.target_col, e);
      }
    }
    if (anyChanged) {
      this.cdr.markForCheck();
    }
  }

  public get filteredTables(): Array<{ table: string; display_name: string }> {
    const q = (this.tableSearchQuery || '').toLowerCase().trim();
    if (!q) return this.tablesList;
    return this.tablesList.filter(t =>
      t.table.toLowerCase().includes(q) ||
      (t.display_name && t.display_name.toLowerCase().includes(q))
    );
  }

  public get filteredReports(): any[] {
    const q = (this.reportSearchQuery || '').toLowerCase().trim();
    if (!q) return this.reportsList;
    return this.reportsList.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  }

  public toggleFavoriteTable(tableName: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.favoriteTables.has(tableName)) {
      this.favoriteTables.delete(tableName);
    } else {
      this.favoriteTables.add(tableName);
    }
    localStorage.setItem('sutram_studio_favorites', JSON.stringify(Array.from(this.favoriteTables)));
    this.cdr.markForCheck();
  }

  public toggleFavoriteReport(reportId: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.favoriteReports.has(reportId)) {
      this.favoriteReports.delete(reportId);
    } else {
      this.favoriteReports.add(reportId);
    }
    localStorage.setItem('sutram_favorite_reports', JSON.stringify(Array.from(this.favoriteReports)));
    this.cdr.markForCheck();
  }

  public isTableOpen(tableName: string): boolean {
    return this.sheetTabs.some(t => t.id === tableName || t.tableName === tableName);
  }

  public isReportOpen(reportId: string): boolean {
    return this.sheetTabs.some(t => t.id === 'rep_' + reportId || t.reportId === reportId);
  }

  public openTableInSheet(tableName: string): void {
    const foundTab = this.sheetTabs.find(t => t.id === tableName || t.tableName === tableName);
    if (foundTab) {
      this.switchSheet(foundTab.id);
    } else {
      const tableInfo = this.tablesList.find(t => t.table === tableName);
      const tabTitle = tableInfo?.display_name || tableName;
      const newTab: StudioSheetTab = {
        id: tableName,
        title: tabTitle,
        icon: 'pi-table',
        type: 'table',
        tableName: tableName,
        isLoaded: false,
        recordCount: 0
      };
      this.sheetTabs.push(newTab);
      this.switchSheet(newTab.id);
    }
    this.cdr.markForCheck();
  }

  public openReportInSheet(report: any): void {
    this.mode = 'normal';
    this.state.isAuditMode.set(false);
    const tabId = 'rep_' + report.id;
    const foundTab = this.sheetTabs.find(t => t.id === tabId);
    if (foundTab) {
      this.switchSheet(foundTab.id);
    } else {
      const reportTitle = report.display_name || report.title || report.table || report.id;
      const newTab: StudioSheetTab = {
        id: tabId,
        title: reportTitle,
        icon: report.icon || 'pi-chart-bar',
        type: 'report',
        tableName: report.table,
        reportId: report.id,
        isLoaded: false,
        recordCount: 0
      };
      this.sheetTabs.push(newTab);
      this.switchSheet(newTab.id);
    }
    this.cdr.markForCheck();
  }

  public closeSheet(tabId: string, event: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.sheetTabs.length <= 1) return;

    const idx = this.sheetTabs.findIndex(t => t.id === tabId);
    if (idx < 0) return;

    const wasActive = this.activeSheetId === tabId;
    this.sheetTabs.splice(idx, 1);

    if (wasActive) {
      const nextTab = this.sheetTabs[Math.max(0, idx - 1)] || this.sheetTabs[0];
      if (nextTab) {
        this.switchSheet(nextTab.id);
      }
    }
    this.persistOpenTabs();
    this.cdr.markForCheck();
  }

  public persistOpenTabs(): void {
    try {
      if (this.activeSheetId) {
        localStorage.setItem('sutram_studio_last_active_tab', this.activeSheetId);
      }
      if (Array.isArray(this.sheetTabs) && this.sheetTabs.length > 0) {
        const toSave = this.sheetTabs.map(t => ({
          id: t.id,
          title: t.title,
          type: t.type,
          tableName: t.tableName,
          reportId: t.reportId
        }));
        localStorage.setItem('sutram_studio_open_tabs', JSON.stringify(toSave));
      }
    } catch {}
  }

  // ── Sheet Tab Inline Renaming & Context Menu ──────────────────

  public startRenameTab(tab: StudioSheetTab, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.renamingTabId = tab.id;
    this.renamingTabTitle = tab.title;
    this.closeTabContextMenu();
    this.cdr.markForCheck();
    setTimeout(() => {
      const el = document.getElementById(`tab-rename-input-${tab.id}`) as HTMLInputElement;
      if (el) {
        el.focus();
        el.select();
      }
    }, 50);
  }

  public saveTabRename(tab: StudioSheetTab): void {
    if (this.renamingTabId !== tab.id) return;
    const trimmed = (this.renamingTabTitle || '').trim();
    if (trimmed && trimmed !== tab.title) {
      tab.title = trimmed;
      if (this.sheetWorkbooks[tab.id]?.config) {
        this.sheetWorkbooks[tab.id].config!.display_name = trimmed;
      }
      if (this.activeSheetId === tab.id) {
        const currentCfg = this.state.config();
        if (currentCfg) {
          this.state.setConfig({
            ...currentCfg,
            display_name: trimmed
          });
        }
      }
      try {
        const localSaved = localStorage.getItem(`sutram_rough_${tab.id}`);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          parsed.title = trimmed;
          localStorage.setItem(`sutram_rough_${tab.id}`, JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Could not update localStorage title:', e);
      }
    }
    this.renamingTabId = null;
    this.renamingTabTitle = '';
    this.cdr.markForCheck();
  }

  public cancelTabRename(): void {
    this.renamingTabId = null;
    this.renamingTabTitle = '';
    this.cdr.markForCheck();
  }

  public openTabContextMenu(event: MouseEvent, tab: StudioSheetTab): void {
    event.preventDefault();
    event.stopPropagation();
    const menuHeight = 85;
    const menuWidth = 190;
    const x = Math.min(event.clientX, window.innerWidth - menuWidth - 10);
    const y = event.clientY + menuHeight > window.innerHeight
      ? Math.max(10, event.clientY - menuHeight)
      : event.clientY;
    this.tabContextMenu = {
      visible: true,
      x,
      y,
      tab
    };
    this.cdr.markForCheck();
  }

  public closeTabContextMenu(): void {
    if (this.tabContextMenu.visible) {
      this.tabContextMenu.visible = false;
      this.tabContextMenu.tab = null;
      this.cdr.markForCheck();
    }
  }

  public deleteSheet(tab: StudioSheetTab, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.closeTabContextMenu();

    const tabId = tab.id;

    // 1. Remove from localStorage
    try {
      localStorage.removeItem(`sutram_rough_${tabId}`);
    } catch (e) {
      console.warn('Could not remove rough sheet from localStorage:', e);
    }

    // 2. Remove from in-memory cache and sync tracking
    delete this.sheetWorkbooks[tabId];
    delete this.lastSyncPerSheet[tabId];

    // 3. Remove from sheetTabs
    const idx = this.sheetTabs.findIndex(t => t.id === tabId);
    if (idx >= 0) {
      this.sheetTabs.splice(idx, 1);
    }

    // 4. If active sheet was deleted, switch to adjacent sheet or create new blank sheet
    if (this.activeSheetId === tabId) {
      if (this.sheetTabs.length > 0) {
        const nextTab = this.sheetTabs[Math.max(0, idx - 1)] || this.sheetTabs[0];
        this.switchSheet(nextTab.id);
      } else {
        this.addNewBlankSheet();
      }
    }

    // 5. If this tab was a table tab pinned from favorites, unpin it
    if (tab.type === 'table' && tab.tableName) {
      this.favoriteTables.delete(tab.tableName);
      localStorage.setItem('sutram_studio_favorites', JSON.stringify(Array.from(this.favoriteTables)));
    }

    this.refreshSavedSheetsList();
    this.cdr.markForCheck();
  }

  // ── Saved Local Sheets Management & File Manager ──────────────

  public refreshSavedSheetsList(): void {
    const list: SavedLocalSheetItem[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sutram_rough_')) {
          const sheetId = key.replace('sutram_rough_', '');
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            list.push({
              sheetId,
              title: parsed.title || sheetId,
              savedAt: parsed.savedAt || '',
              rowCount: Array.isArray(parsed.rows) ? parsed.rows.length : 0
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error reading saved sheets from localStorage:', e);
    }
    this.savedSheetsList = list;
    this.cdr.markForCheck();
  }

  public openFileManager(): void {
    this.refreshSavedSheetsList();
    this.showScannerModal = true;
    this.cdr.markForCheck();
  }

  public triggerBrowseFile(): void {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.click();
    }
  }

  public onOpenSavedSheet(sheetId: string): void {
    this.showScannerModal = false;
    let existingTab = this.sheetTabs.find(t => t.id === sheetId);
    if (!existingTab) {
      let sheetTitle = 'Saved Sheet';
      try {
        const raw = localStorage.getItem(`sutram_rough_${sheetId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          sheetTitle = parsed.title || sheetTitle;
        }
      } catch {}

      existingTab = {
        id: sheetId,
        title: sheetTitle,
        icon: 'pi-file',
        type: 'rough',
        isLoaded: true
      };
      this.sheetTabs.push(existingTab);
    }

    this.switchSheet(sheetId);
    this.cdr.markForCheck();
  }

  public onDeleteSavedSheet(sheetId: string): void {
    try {
      localStorage.removeItem(`sutram_rough_${sheetId}`);
    } catch (e) {
      console.warn('Could not remove sheet from localStorage:', e);
    }
    delete this.sheetWorkbooks[sheetId];
    delete this.lastSyncPerSheet[sheetId];

    const idx = this.sheetTabs.findIndex(t => t.id === sheetId);
    if (idx >= 0) {
      this.sheetTabs.splice(idx, 1);
      if (this.activeSheetId === sheetId) {
        if (this.sheetTabs.length > 0) {
          const nextTab = this.sheetTabs[Math.max(0, idx - 1)] || this.sheetTabs[0];
          this.switchSheet(nextTab.id);
        } else {
          this.addNewBlankSheet();
        }
      }
    }

    this.refreshSavedSheetsList();
    this.cdr.markForCheck();
  }

  public initBlankRoughSheet(): void {
    this.state.clearGrid();
    const defaultCols: StudioConfigColumn[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(c => ({
      key: c,
      name: c,
      short_name: c,
      col_name: c,
      type: 'string',
      default_selected: true
    }));
    this.allConfigColumns = defaultCols;
    this.selectedColumnKeys = new Set(defaultCols.map(c => c.key));

    const roughHeaders: any[] = defaultCols.map(c => ({
      name: c.name,
      col_name: c.col_name,
      type: 'string'
    }));

    const mockCfg: SutramTableConfig = {
      table: 'rough',
      display_name: 'Sheet 1',
      headers: roughHeaders,
      duplicateOn: []
    };
    this.state.setConfig(mockCfg);

    const blankRow = this.createBlankRow(1, mockCfg);
    this.state.setRows([blankRow]);
  }

  public saveRoughSheetLocally(): void {
    const currentRows = this.state.rows();
    const cleanRows = currentRows.map(r => ({
      rowNum: r.rowNum,
      cells: r.cells,
      hasError: r.hasError,
      isNew: r.isNew,
      isModified: r.isModified
    }));

    const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
    const dataToSave = {
      sheetId: this.activeSheetId,
      title: curTab?.title,
      savedAt: new Date().toLocaleTimeString(),
      rows: cleanRows,
      allConfigColumns: this.allConfigColumns,
      selectedColumnKeys: Array.from(this.selectedColumnKeys)
    };

    try {
      localStorage.setItem(`sutram_rough_${this.activeSheetId}`, JSON.stringify(dataToSave));
      const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
      const isReport = curTab?.type === 'report';
      if (curTab) {
        curTab.lastSaved = new Date().toLocaleTimeString();
        curTab.recordCount = currentRows.length;
      }

      this.lastSyncPerSheet[this.activeSheetId] = {
        time: new Date().toLocaleTimeString(),
        summary: isReport
          ? `${currentRows.length} पंक्तियाँ रिपोर्ट सुरक्षित (Report saved locally)`
          : `${currentRows.length} पंक्तियाँ सुरक्षित (Saved locally)`,
        hasError: false
      };

      this.syncToast = {
        visible: true,
        inProgress: false,
        percentage: 100,
        title: isReport ? 'रिपोर्ट स्थानीय रूप से सुरक्षित (Report Saved Locally)' : 'रफ शीट स्थानीय रूप से सुरक्षित (Saved Locally)',
        hasError: false,
        inserted: currentRows.length,
        updated: 0,
        deleted: 0,
        failed: 0,
        errors: []
      };
      this.refreshSavedSheetsList();
      this.cdr.detectChanges();

      setTimeout(() => {
        if (this.syncToast.visible && !this.syncToast.inProgress && !this.syncToast.hasError) {
          this.syncToast = { ...this.syncToast, visible: false };
          this.cdr.detectChanges();
        }
      }, 2500);
    } catch (e: any) {
      console.error('[SutramStudio] Local save failed:', e);
    }
  }

  /**
   * Refreshes the list of tables in Sutram Studio (e.g. after dynamic table creation).
   * Optionally opens and activates the specified table sheet.
   */
  public refreshStudioTables(activeTableName?: string): void {
    this.api.getRegisteredTables().subscribe({
      next: (tables: any[]) => {
        this.tablesList = tables || [];
        if (activeTableName) {
          this.openTableInSheet(activeTableName);
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('[SutramStudio] Refresh tables failed:', err);
        if (activeTableName) {
          this.openTableInSheet(activeTableName);
        }
        this.cdr.markForCheck();
      }
    });
  }

  public loadTablesList(): void {
    const savedFavs = localStorage.getItem('sutram_studio_favorites');
    if (savedFavs) {
      try {
        this.favoriteTables = new Set(JSON.parse(savedFavs));
      } catch {}
    } else {
      this.favoriteTables = new Set<string>();
    }

    const savedFavReps = localStorage.getItem('sutram_favorite_reports');
    if (savedFavReps) {
      try {
        this.favoriteReports = new Set(JSON.parse(savedFavReps));
      } catch {}
    }

    // Dynamic Reports fetching from API
    if (!this.reportsList || this.reportsList.length === 0) {
      this.api.getReports().subscribe({
        next: (reps: any[]) => {
          this.reportsList = reps || [];
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.warn('[SutramStudio] Dynamic reports load warning:', err?.message || err);
          this.reportsList = [];
          this.cdr.markForCheck();
        }
      });
    }

    this.api.getRegisteredTables().subscribe({
      next: (tables: any[]) => {
        this.tablesList = tables;

        // Build active session sheets:
        // 1. Always start with Sheet 1
        const activeTabs: StudioSheetTab[] = [
          { id: 'rough_1', title: 'Sheet 1', icon: 'pi-file', type: 'rough', isLoaded: true }
        ];

        const existingTabIds = new Set(activeTabs.map(t => t.id));

        // 2. Restore previously opened sheets/tabs if any
        try {
          const raw = localStorage.getItem('sutram_studio_open_tabs');
          if (raw) {
            const savedTabs: any[] = JSON.parse(raw);
            if (Array.isArray(savedTabs)) {
              savedTabs.forEach((st: any) => {
                if (st.id && !existingTabIds.has(st.id)) {
                  if (st.type === 'table') {
                    const tableInfo = tables.find(t => t.table === (st.tableName || st.id));
                    activeTabs.push({
                      id: st.id,
                      title: st.title || tableInfo?.display_name || st.tableName || st.id,
                      icon: 'pi-table',
                      type: 'table',
                      tableName: st.tableName || st.id,
                      isLoaded: false,
                      recordCount: 0
                    });
                    existingTabIds.add(st.id);
                  } else if (st.type === 'rough' && st.id !== 'rough_1') {
                    activeTabs.push({
                      id: st.id,
                      title: st.title || 'Sheet',
                      icon: 'pi-file',
                      type: 'rough',
                      isLoaded: false
                    });
                    existingTabIds.add(st.id);
                  }
                }
              });
            }
          }
        } catch {}

        // 3. Add pinned / favorite tables not already opened
        tables.forEach((t: any) => {
          if (this.favoriteTables.has(t.table) && !existingTabIds.has(t.table)) {
            activeTabs.push({
              id: t.table,
              title: t.display_name || t.table,
              icon: 'pi-table',
              type: 'table',
              tableName: t.table,
              isLoaded: false,
              recordCount: 0
            });
            existingTabIds.add(t.table);
          }
        });

        this.sheetTabs = activeTabs;

        // Choose initial active sheet: last active tab if valid, else first table, else rough_1
        const lastActive = localStorage.getItem('sutram_studio_last_active_tab');
        const targetTab = (lastActive && activeTabs.find(t => t.id === lastActive))
          ? activeTabs.find(t => t.id === lastActive)!
          : (activeTabs.find(t => t.type === 'table') || activeTabs[0]);

        if (targetTab.type === 'table' && targetTab.tableName) {
          this.activeSheetId = targetTab.id;
          this.selectedTableName = targetTab.tableName;
          this.onTableSelect(targetTab.tableName, true);
        } else {
          this.activeSheetId = targetTab.id;
          this.selectedTableName = '';
          this.switchSheet(targetTab.id);
        }
        this.persistOpenTabs();
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
    this.persistOpenTabs();

    if (autoLoadData) {
      this.state.clearGrid();
      this.loadedDbRecordCount = 0;
    }

    this.isLoadingConfig = true;

    this.api.getTableConfig(tableName).subscribe({
      next: (cfg: SutramTableConfig) => {
        this.state.setConfig(cfg);
        this.isLoadingConfig = false;

        // Build rich column configuration matching legacy studio only if not already built or fresh load
        if (autoLoadData || this.allConfigColumns.length === 0) {
          this.buildConfigColumns(cfg);
        }

        // Check localStorage first for instant restore
        let restoredFromLocal = false;
        try {
          const cached = localStorage.getItem(`sutram_table_col_config_${tableName}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && Array.isArray(parsed.selected_keys) && parsed.selected_keys.length > 0) {
              this.applySavedUiConfig(parsed);
              restoredFromLocal = true;
            }
          }
        } catch {}

        // Apply any saved UI column preferences from backend sys_meta
        this.api.getTableUiConfig(tableName).subscribe({
          next: (uiRes) => {
            if (uiRes && Array.isArray(uiRes.selected_keys) && uiRes.selected_keys.length > 0) {
              this.applySavedUiConfig(uiRes);
              try {
                localStorage.setItem(`sutram_table_col_config_${tableName}`, JSON.stringify(uiRes));
              } catch {}
            } else if (restoredFromLocal) {
              // Sync local preferences to backend sys_meta if backend was clean
              this.autoSaveColumnConfig();
            }
          },
          error: () => {}
        });

        // Auto-load UI reactive sutras / formulas for this table and sync temp columns
        this.loadUiSutras(tableName, () => {
          this.syncTempColumnsToGrid();
        });

        // Preload all referenced FK tables and register their display configurations
        if (cfg && cfg.headers) {
          const refHeaders = cfg.headers.filter((h: any) => h.ref_table || h.type === 'ref');
          for (const h of refHeaders) {
            const cols = h.ref_select || (h.ref_data ? [h.ref_data] : []);
            if (h.ref_table && cols.length > 0) {
              this.refCache.registerTableConfig(h.ref_table, {
                ref_select: cols,
                ref_data: h.ref_data
              });
            }
          }
          const refTables = refHeaders
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
        config: this.state.config() || undefined,
        totalDbRecords: this.state.totalDbRecords(),
        loadedDbRecordCount: this.loadedDbRecordCount,
        deletedRowIds: this.state.deletedRowIds(),
        deletedRowsQueue: this.state.deletedRowsQueue(),
        allConfigColumns: [...this.allConfigColumns],
        selectedColumnKeys: new Set(this.selectedColumnKeys)
      };
    }

    this.activeSheetId = tabId;

    if (tabId === 'blank' || tabId.startsWith('rough_') || tabId.startsWith('sheet_')) {
      this.selectedTableName = '';
      this.state.setActiveTable(null);
      const saved = this.sheetWorkbooks[tabId];
      if (saved && saved.rows && saved.rows.length > 0) {
        this.state.setRows(saved.rows);
        this.state.deletedRowIds.set(saved.deletedRowIds || []);
        this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
        if (saved.allConfigColumns) this.allConfigColumns = [...saved.allConfigColumns];
        if (saved.selectedColumnKeys) this.selectedColumnKeys = new Set(saved.selectedColumnKeys);
      } else {
        const localSaved = localStorage.getItem(`sutram_rough_${tabId}`);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed.title) {
              const currentTab = this.sheetTabs.find(t => t.id === tabId);
              if (currentTab) currentTab.title = parsed.title;
            }
            if (parsed.rows && parsed.rows.length > 0) {
              this.state.setRows(parsed.rows);
              if (parsed.allConfigColumns) this.allConfigColumns = parsed.allConfigColumns;
              if (parsed.selectedColumnKeys) this.selectedColumnKeys = new Set(parsed.selectedColumnKeys);
            } else {
              this.initBlankRoughSheet();
            }
          } catch {
            this.initBlankRoughSheet();
          }
        } else {
          this.initBlankRoughSheet();
        }
      }
      this.state.totalDbRecords.set(0);
      this.loadedDbRecordCount = 0;
      this.gridComponent?.resetScroll();
      this.cdr.markForCheck();
    } else {
      const curTab = this.sheetTabs.find(t => t.id === tabId);
      if (curTab?.type === 'report') {
        this.mode = 'normal';
        this.state.isAuditMode.set(false);
      }
      const targetTable = curTab?.tableName || tabId;
      const saved = this.sheetWorkbooks[tabId];
      if (saved && saved.rows && saved.rows.length > 0) {
        // Instant in-memory restoration for previously visited sheets!
        this.selectedTableName = targetTable;
        this.state.setActiveTable(targetTable);
        if (saved.config) {
          this.state.setConfig(saved.config);
        }
        if (saved.allConfigColumns && saved.selectedColumnKeys) {
          this.allConfigColumns = [...saved.allConfigColumns];
          this.selectedColumnKeys = new Set(saved.selectedColumnKeys);
        }
        this.state.setRows(saved.rows);
        this.state.deletedRowIds.set(saved.deletedRowIds || []);
        this.state.deletedRowsQueue.set(saved.deletedRowsQueue || []);
        if (saved.totalDbRecords !== undefined) {
          this.state.totalDbRecords.set(saved.totalDbRecords);
        }
        if (saved.loadedDbRecordCount !== undefined) {
          this.loadedDbRecordCount = saved.loadedDbRecordCount;
        }
        this.gridComponent?.resetScroll();
      } else {
        // First visit: load config and data chunk 1
        this.gridComponent?.resetScroll();
        this.onTableSelect(targetTable, true);
      }
    }
    this.persistOpenTabs();
    this.cdr.markForCheck();
  }

  public addNewBlankSheet(): void {
    const roughCount = this.sheetTabs.filter(t => t.type === 'rough').length + 1;
    const newId = `rough_${Date.now()}`;
    const newTab: StudioSheetTab = {
      id: newId,
      title: `Sheet ${roughCount}`,
      icon: 'pi-file',
      type: 'rough',
      isLoaded: true
    };
    this.sheetTabs.push(newTab);
    this.switchSheet(newId);
  }

  /**
   * Converts a database row object into a verified SutramRow.
   * Utilizes SutramRefCacheService for Rule 8 bilingual formatting.
   */
  public convertDbRecordToSutramRow(dr: any, rowNum: number, cfg: SutramTableConfig): SutramRow {
    const cells: Record<string, any> = {};

    const colsToPopulate: any[] = this.allConfigColumns.length > 0
      ? this.allConfigColumns
      : (cfg.headers || []).map((h: any) => ({
          key: h.col_name || h.name,
          name: h.name,
          short_name: h.name,
          col_name: h.col_name,
          type: h.type || 'string',
          ref_table: h.ref_table,
          ref_as: h.ref_as || h.ref_table,
          is_fk_main: !!h.ref_table,
          is_fk_subcol: false,
          is_fk_raw: false
        }));

    colsToPopulate.forEach((col: any) => {
      let rawVal: any;

      if (col.is_fk_subcol) {
        const refObj = dr[col.ref_as || col.ref_table];
        if (refObj && typeof refObj === 'object') {
          rawVal = refObj[col.sub_col_name];
        }
        if (rawVal === undefined) {
          rawVal = dr[col.key] ?? dr[`${col.ref_as || col.ref_table}.${col.sub_col_name}`] ?? dr[`${col.ref_table}_${col.sub_col_name}`] ?? dr[col.sub_col_name];
        }
        if (rawVal === undefined && col.ref_table) {
          const rawFkId = dr[col.col_name] ?? dr[`${col.ref_table}_id`] ?? dr[col.ref_table];
          if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
            const match = this.refCache.findRefMatch(col.ref_table, '', undefined, rawFkId);
            if (match.found && match.item && match.item[col.sub_col_name] !== undefined) {
              rawVal = match.item[col.sub_col_name];
            }
          }
        }
      } else if (col.is_fk_main || col.type === 'ref') {
        const joined = dr[col.ref_as || col.name || col.ref_table];
        if (joined && typeof joined === 'object') {
          const formatted = this.refCache.formatOption(col.ref_table, joined, col.ref_select);
          if (formatted && formatted.display) {
            rawVal = formatted.display;
          }
        } else {
          // If not joined object, match by foreign key ID
          const rawFkId = dr[col.col_name] ?? dr[col.key] ?? dr[`${col.ref_table}_id`];
          if (rawFkId !== undefined && rawFkId !== null && rawFkId !== '') {
            const match = this.refCache.findRefMatch(col.ref_table, '', undefined, rawFkId);
            if (match.found && match.display) {
              rawVal = match.display;
            }
          }
        }
      } else if (col.is_fk_raw) {
        rawVal = dr[col.col_name] ?? dr[col.key];
      } else {
        rawVal = dr[col.col_name];
        if (rawVal === undefined) rawVal = dr[col.name];
        if (rawVal === undefined && col.key) rawVal = dr[col.key];
      }

      if (rawVal === undefined) {
        const matchKey = Object.keys(dr).find((k: string) => k.toLowerCase() === (col.col_name || col.name || '').toLowerCase());
        if (matchKey) rawVal = dr[matchKey];
      }

      // Safe unwrapping for JSON / nested objects to prevent "[object Object]"
      if (rawVal !== null && typeof rawVal === 'object') {
        if (rawVal.display) rawVal = rawVal.display;
        else if (rawVal.name) rawVal = rawVal.name;
        else if (rawVal.title) rawVal = rawVal.title;
        else if (rawVal.label) rawVal = rawVal.label;
        else if (rawVal.url) rawVal = rawVal.url;
        else if (Array.isArray(rawVal)) rawVal = rawVal.length > 0 ? JSON.stringify(rawVal) : '';
        else if (Object.keys(rawVal).length === 0) rawVal = '';
        else rawVal = JSON.stringify(rawVal);
      }

      const cellKey = col.key || col.name;
      const strVal = String(rawVal ?? '');

      // Resolve true DB Foreign Key ID hint
      let refIdVal: any = undefined;
      if (col.is_fk_main || col.type === 'ref' || col.ref_table) {
        const fkCol = col.col_name || `${col.ref_table}_id` || col.key;
        if (dr[fkCol] !== undefined) {
          refIdVal = dr[fkCol];
        } else if (dr[`${col.key}_id`] !== undefined) {
          refIdVal = dr[`${col.key}_id`];
        } else if (dr[col.key] !== undefined && typeof dr[col.key] !== 'object') {
          refIdVal = dr[col.key];
        }
      }

      cells[cellKey] = {
        value: strVal,
        originalValue: strVal,
        isValid: true,
        isModified: false,
        refId: refIdVal !== undefined ? refIdVal : (col.col_name && dr[col.col_name] !== undefined ? dr[col.col_name] : rawVal)
      };
      if (col.name && col.name !== cellKey) {
        cells[col.name] = cells[cellKey];
      }
      if (col.col_name && col.col_name !== cellKey) {
        cells[col.col_name] = cells[cellKey];
      }
    });

    const isHl = !!(dr.hl === 1 || dr.hl === true || dr.hl === '1');
    if (!cells['hl']) {
      cells['hl'] = {
        value: isHl ? 1 : 0,
        originalValue: isHl ? 1 : 0,
        isValid: true,
        isModified: false
      };
    }

    return {
      rowNum,
      cells,
      hasError: false,
      errorCount: 0,
      isHighlighted: isHl,
      hl: isHl ? 1 : 0,
      _rawOriginal: dr
    };
  }

  /**
   * Helper to check if a row contains any non-empty cell values
   */
  public isRowPopulated(row: SutramRow): boolean {
    if (!row || !row.cells) return false;
    for (const k in row.cells) {
      const val = row.cells[k]?.value;
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return true;
      }
    }
    return false;
  }

  /**
   * Creates an empty blank SutramRow initialized with column structure
   */
  public createBlankRow(rowNum: number, cfg: SutramTableConfig): SutramRow {
    const cells: Record<string, any> = {};
    const colsToPopulate: any[] = this.allConfigColumns.length > 0
      ? this.allConfigColumns
      : (cfg.headers || []).map((h: any) => ({
          key: h.col_name || h.name,
          name: h.name
        }));

    colsToPopulate.forEach((col: any) => {
      const cellKey = col.key || col.name;
      cells[cellKey] = {
        value: '',
        originalValue: '',
        isValid: true,
        isModified: false,
        isNew: true
      };
      if (col.name && col.name !== cellKey) {
        cells[col.name] = cells[cellKey];
      }
      if (col.col_name && col.col_name !== cellKey) {
        cells[col.col_name] = cells[cellKey];
      }
    });

    return {
      rowNum,
      cells,
      hasError: false,
      errorCount: 0,
      isNew: true
    };
  }

  /**
   * Guarantees there is always one trailing blank row at the very end of the sheet
   */
  public ensureTrailingBlankRow(rows: SutramRow[], cfg: SutramTableConfig): SutramRow[] {
    if (!rows || rows.length === 0) {
      return [this.createBlankRow(1, cfg)];
    }
    const lastRow = rows[rows.length - 1];
    if (this.isRowPopulated(lastRow)) {
      return [...rows, this.createBlankRow(rows.length + 1, cfg)];
    }
    return rows;
  }

  /**
   * Serializes active column filters into an API-ready filter object,
   * automatically resolving FK display values to numeric/underlying IDs if applicable.
   */
  private buildApiFilters(): Record<string, any> {
    const columnFilters = this.state.columnFilters();
    const apiFilters: Record<string, any> = {};

    for (const [colKey, valSet] of Object.entries(columnFilters)) {
      if (valSet && (valSet as Set<any>).size > 0) {
        let dbKey = colKey;
        const foundCol = this.allConfigColumns.find(c => c.key === colKey || c.name === colKey);
        if (foundCol && foundCol.col_name) {
          dbKey = foundCol.col_name;
        }

        const rawVals = Array.from(valSet as Set<any>);
        if (foundCol && (foundCol.is_fk_main || foundCol.type === 'ref' || foundCol.ref_table) && foundCol.ref_table) {
          const options = this.refCache.getOptions(foundCol.ref_table);
          apiFilters[dbKey] = rawVals.map(val => {
            if (val === '__BLANK__') return '__BLANK__';
            const match = options.find(o => o.display === val || String(o.id) === String(val));
            return match ? match.id : val;
          });
        } else {
          apiFilters[dbKey] = rawVals;
        }
      }
    }

    return apiFilters;
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

    if (this.state.isLoadingDb() && !isReset) return;
    this.state.isLoadingDb.set(true);

    const activeSort = this.state.activeSort();
    const columnFilters = this.state.columnFilters();
    const searchQuery = this.state.dbSearchQuery().trim();

    let sortColKey = activeSort?.colKey;
    if (sortColKey && cfg) {
      const foundCol = this.allConfigColumns.find(c => c.key === sortColKey || c.name === sortColKey);
      if (foundCol && foundCol.col_name) {
        sortColKey = foundCol.col_name;
      } else {
        const foundHeader = (cfg.headers || []).find((h: any) => h.name === sortColKey || h.col_name === sortColKey);
        if (foundHeader && foundHeader.col_name) {
          sortColKey = foundHeader.col_name;
        }
      }
    }

    // Serialize column filters for backend API (resolving FK display values if needed)
    const apiFilters = this.buildApiFilters();

    this.api.getTableDataChunk(tableName, {
      limit,
      offset,
      search: searchQuery || undefined,
      sort: sortColKey,
      order: activeSort?.order,
      filters: Object.keys(apiFilters).length > 0 ? apiFilters : undefined
    }).subscribe({
      next: (res: { rows: any[]; total: number; offset: number; limit: number }) => {
        this.state.isLoadingDb.set(false);
        this.state.totalDbRecords.set(res.total);

        if (isReset) {
          this.loadedDbRecordCount = res.rows ? res.rows.length : 0;
          this.gridComponent?.resetScroll();
        } else {
          this.loadedDbRecordCount += res.rows ? res.rows.length : 0;
        }

        const existingRows = isReset ? [] : this.state.rows();
        // Remove trailing empty blank row before appending next chunk so it doesn't get stuck in the middle
        const cleanExisting = (!isReset && existingRows.length > 0 && !this.isRowPopulated(existingRows[existingRows.length - 1]))
          ? existingRows.slice(0, -1)
          : existingRows;

        const startIndex = cleanExisting.length;
        const builtRows: SutramRow[] = (res.rows || []).map((dr: any, idx: number) => {
          return this.convertDbRecordToSutramRow(dr, startIndex + idx + 1, cfg);
        });

        if (!this.isCurrentSheetReport) {
          this.audit.auditAll(builtRows, cfg.headers);
        } else {
          builtRows.forEach(r => {
            r.hasError = false;
            if (r.cells) {
              Object.values(r.cells).forEach((c: any) => {
                c.isValid = true;
                c.errorMessage = undefined;
              });
            }
          });
        }

        let combined = isReset ? builtRows : [...cleanExisting, ...builtRows];
        // Always ensure one trailing blank row at the very end (whether 0, 10, or 250+ records)
        combined = this.ensureTrailingBlankRow(combined, cfg);

        // Evaluate UI reactive sutras on loaded rows (initial display load: only temp columns)
        if (this.uiSutrasList && this.uiSutrasList.length > 0) {
          combined.forEach((r, idx) => this.evaluateUiSutrasForRow(r, idx, true));
        }

        this.state.setRows(combined);

        const tab = this.sheetTabs.find((t: any) => t.id === tableName);
        if (tab) {
          tab.isLoaded = true;
          tab.recordCount = res.total !== undefined ? res.total : this.loadedDbRecordCount;
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.state.isLoadingDb.set(false);
        console.error('[SutramStudio] Load DB data chunk failed:', err);
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Infinite scroll trigger emitted from grid when scrolling near bottom
   */
  public onLoadMore(): void {
    if (this.state.isLoadingDb()) return;
    const loadedCount = this.loadedDbRecordCount;
    const totalCount = this.state.totalDbRecords();
    if (totalCount > 0 && loadedCount < totalCount && this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, loadedCount, 100, false);
    }
  }

  /**
   * Direct Database Searchbox Handlers
   */
  public onDbSearchInput(query: string): void {
    this.state.dbSearchQuery.set(query);
    this.searchSubject.next(query);
  }

  public clearDbSearch(): void {
    this.state.dbSearchQuery.set('');
    this.searchSubject.next('');
    if (this.selectedTableName) {
      this.loadDataChunk(this.selectedTableName, 0, 100, true);
    }
    this.cdr.markForCheck();
  }

  public toggleBold(): void {
    this.isBoldActive = !this.isBoldActive;
    this.cdr.markForCheck();
  }

  public setTextAlign(align: 'left' | 'center' | 'right'): void {
    this.textAlign = align;
    this.cdr.markForCheck();
  }

  /**
   * Refresh Button Handler:
   * Reloads table data from DB with a warning confirmation if tracked changes are unsynced.
   */
  public onRefreshData(): void {
    if (!this.selectedTableName) return;

    const pendingCount = this.state.pendingChangesCount();
    if (pendingCount > 0) {
      const confirmDiscard = window.confirm(
        `Warning: You have ${pendingCount} unsaved change(s) in this sheet that will be lost.\n\nDo you want to discard your changes and reload from database?`
      );
      if (!confirmDiscard) {
        return;
      }
    }

    // Discard tracking and reload freshly from database
    this.state.deletedRowIds.set([]);
    this.state.deletedRowsQueue.set([]);
    this.loadTableDataFromDb();
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

  // ── File Parsing & Dual-Mode Open File ───────────────────────────

  public getExcelColLetter(colIdx: number): string {
    let letter = '';
    let temp = colIdx + 1;
    while (temp > 0) {
      const mod = (temp - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      temp = Math.floor((temp - mod) / 26);
    }
    return letter;
  }

  public parseCurrentUploadedSheet(): void {
    if (!this.uploadedWorkbook || !this.selectedUploadedSheet) return;
    const worksheet = this.uploadedWorkbook.Sheets[this.selectedUploadedSheet];
    if (!worksheet) return;

    const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    if (!rawJson || rawJson.length === 0) {
      this.uploadedAllRawRows = [];
      this.uploadedSheetHeaders = [];
      this.uploadedRawRows = [];
      this.uploadedSampleRows = [];
      this.uploadedTotalRows = 0;
      this.scanReport = null;
      return;
    }

    this.uploadedAllRawRows = rawJson;
    this.uploadedTotalRows = rawJson.length;

    // Intelligently detect the real header row for Format Matcher (handles merged/title row 0)
    const detected = this.scanner.detectBestHeaderRow(rawJson, this.scannerTableConfig);
    this.uploadedSheetHeaders = detected.headers;
    this.uploadedRawRows = detected.dataRows;
    this.uploadedSampleRows = this.uploadedRawRows.slice(0, 3);
    this.pendingRawRows = this.uploadedRawRows;

    if (this.scannerTableConfig) {
      this.scanReport = this.scanner.scan(this.uploadedSheetHeaders, this.scannerTableConfig, this.uploadedSampleRows);
      this.scanReport.headerRowIndex = detected.headerRowIndex;
    }
  }

  public loadScannerTableConfig(tableName: string): void {
    if (!tableName) return;
    this.scannerTargetTable = tableName;

    const applyTableCfg = (cfg: SutramTableConfig) => {
      this.scannerTableConfig = cfg;
      this.scannerAvailableHeaders = cfg.headers || [];

      // Re-detect best header row now that we have the target table's schema
      if (this.uploadedAllRawRows && this.uploadedAllRawRows.length > 0) {
        const detected = this.scanner.detectBestHeaderRow(this.uploadedAllRawRows, cfg);
        this.uploadedSheetHeaders = detected.headers;
        this.uploadedRawRows = detected.dataRows;
        this.uploadedSampleRows = this.uploadedRawRows.slice(0, 3);
        this.pendingRawRows = this.uploadedRawRows;
      }

      this.scanReport = this.scanner.scan(this.uploadedSheetHeaders, cfg, this.uploadedSampleRows);
      this.isScannerConfigLoading = false;
      this.cdr.markForCheck();
    };

    const currentCfg = this.state.config();
    if (currentCfg && currentCfg.table === tableName) {
      applyTableCfg(currentCfg);
      return;
    }

    this.isScannerConfigLoading = true;
    this.api.getTableConfig(tableName).subscribe({
      next: (cfg: SutramTableConfig) => {
        applyTableCfg(cfg);
      },
      error: (err: any) => {
        this.isScannerConfigLoading = false;
        console.error('[SutramStudio] Load scanner table config failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public onFileUpload(event: any): void {
    const file = event?.target?.files?.[0] || event?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) return;

      this.uploadedFileName = file.name;
      this.uploadedWorkbook = workbook;
      this.uploadedSheetNames = [...workbook.SheetNames];
      this.selectedUploadedSheet = workbook.SheetNames[0];

      this.parseCurrentUploadedSheet();

      // Determine default target table for Mode 2
      let defaultTable = this.selectedTableName;
      if (!defaultTable && this.tablesList && this.tablesList.length > 0) {
        defaultTable = this.tablesList[0].table;
      }

      if (defaultTable) {
        this.loadScannerTableConfig(defaultTable);
      } else {
        this.scanReport = null;
        this.scannerTableConfig = null;
        this.scannerAvailableHeaders = [];
      }

      this.refreshSavedSheetsList();
      this.showScannerModal = true;
      this.cdr.markForCheck();
    };

    reader.readAsArrayBuffer(file);
    if (event.target) event.target.value = '';
  }

  public onUploadedSheetChange(sheetName: string): void {
    if (!sheetName || sheetName === this.selectedUploadedSheet) return;
    this.selectedUploadedSheet = sheetName;
    this.parseCurrentUploadedSheet();
    this.cdr.markForCheck();
  }

  public onScannerTargetTableChange(tableName: string): void {
    this.loadScannerTableConfig(tableName);
  }

  public onDirectOpenAsNormalSheet(data?: { sheetName: string; headers: string[] }): void {
    const rawAllRows = this.uploadedAllRawRows || [];
    if (rawAllRows.length === 0) return;

    // 1. Calculate max columns across all rows in the raw sheet
    let maxCols = 8;
    for (const r of rawAllRows) {
      if (Array.isArray(r) && r.length > maxCols) {
        maxCols = r.length;
      }
    }
    // At least 10 columns for comfortable spreadsheet view
    maxCols = Math.max(maxCols, 10);

    // 2. Generate standard Excel column definitions (A, B, C, D...)
    const cols: StudioConfigColumn[] = [];
    for (let c = 0; c < maxCols; c++) {
      const letter = this.getExcelColLetter(c);
      cols.push({
        key: letter,
        name: letter,
        short_name: letter,
        col_name: letter,
        type: 'string',
        default_selected: true
      });
    }

    this.allConfigColumns = cols;
    this.selectedColumnKeys = new Set(cols.map(c => c.key));

    const roughHeaders: any[] = cols.map(c => ({
      name: c.name,
      col_name: c.col_name,
      type: 'string'
    }));

    // Create unique tab for this rough sheet
    const roughCount = this.sheetTabs.filter(t => t.type === 'rough').length + 1;
    const sheetTitle = data?.sheetName || this.selectedUploadedSheet || this.uploadedFileName?.replace(/\.[^/.]+$/, '') || `Sheet ${roughCount}`;
    const newId = `rough_${Date.now()}`;
    const newTab: StudioSheetTab = {
      id: newId,
      title: sheetTitle,
      icon: 'pi-file',
      type: 'rough',
      isLoaded: true
    };
    this.sheetTabs.push(newTab);

    const mockCfg: SutramTableConfig = {
      table: 'rough',
      display_name: sheetTitle,
      headers: roughHeaders,
      duplicateOn: []
    };
    this.state.setConfig(mockCfg);

    // 3. Populate all rows as-is starting from row 0!
    // No row is discarded as a header: row 0 (e.g. merge & center title) appears in row 1!
    const sutramRows: SutramRow[] = rawAllRows.map((rawRow: any[], rIdx: number) => {
      const cells: Record<string, SutramCell> = {};
      cols.forEach((col, cIdx) => {
        const rawVal = Array.isArray(rawRow) ? rawRow[cIdx] : '';
        const valStr = rawVal !== undefined && rawVal !== null ? String(rawVal) : '';
        cells[col.key] = {
          value: valStr,
          originalValue: valStr,
          isValid: true,
          isModified: false
        };
      });
      return {
        rowNum: rIdx + 1,
        cells,
        hasError: false,
        errorCount: 0,
        _rawOriginal: rawRow
      };
    });

    // Append 1 trailing blank row for immediate spreadsheet typing
    const blankRow = this.createBlankRow(sutramRows.length + 1, mockCfg);
    sutramRows.push(blankRow);

    // 4. Switch to this new sheet tab in normal mode (audit mode disabled)
    this.mode = 'normal';
    this.state.isAuditMode.set(false);
    this.selectedTableName = '';
    this.state.setActiveTable(null);
    this.activeSheetId = newId;
    this.state.setRows(sutramRows);

    // Save as local rough sheet immediately so it is tracked in saved sheets
    this.saveRoughSheetLocally();

    this.showScannerModal = false;
    this.gridComponent?.resetScroll();
    this.cdr.markForCheck();
  }

  public onScannerConfirmedMapped(event: { targetTable: string; matches: SutramScanMatch[] }): void {
    const targetTable = event.targetTable;
    if (!targetTable) return;

    let foundTab = this.sheetTabs.find(t => t.id === targetTable || t.tableName === targetTable);
    if (!foundTab) {
      const tableInfo = this.tablesList.find(t => t.table === targetTable);
      foundTab = {
        id: targetTable,
        title: tableInfo?.display_name || targetTable,
        icon: 'pi-table',
        type: 'table',
        tableName: targetTable,
        isLoaded: true
      };
      this.sheetTabs.push(foundTab);
    }

    const applyMappedData = (cfg: SutramTableConfig) => {
      this.selectedTableName = targetTable;
      this.activeSheetId = targetTable;
      this.state.setActiveTable(targetTable);
      this.state.setConfig(cfg);
      this.buildConfigColumns(cfg);

      const builtRows = this.scanner.buildSutramRows(this.uploadedRawRows, event.matches, cfg.headers);
      this.audit.auditAll(builtRows, cfg.headers);
      const withBlank = this.ensureTrailingBlankRow(builtRows, cfg);
      this.state.setRows(withBlank);

      this.showScannerModal = false;
      this.uploadedRawRows = [];
      this.gridComponent?.resetScroll();
      this.cdr.markForCheck();
    };

    if (this.scannerTableConfig && this.scannerTableConfig.table === targetTable) {
      applyMappedData(this.scannerTableConfig);
    } else {
      this.api.getTableConfig(targetTable).subscribe({
        next: (cfg: SutramTableConfig) => {
          this.scannerTableConfig = cfg;
          applyMappedData(cfg);
        },
        error: (err: any) => {
          console.error('[SutramStudio] Failed to load table config for mapping:', err);
        }
      });
    }
  }

  public onScannerConfirmed(matches: SutramScanMatch[]): void {
    if (this.scannerTargetTable) {
      this.onScannerConfirmedMapped({ targetTable: this.scannerTargetTable, matches });
    }
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
    // 0. Commit any active in-cell edit before gathering rows to sync
    if (this.gridComponent && (this.gridComponent as any).editingCell) {
      (this.gridComponent as any).commitCellEdit();
    }

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
        this.cdr.detectChanges();
        return;
      }
    }

    this.isCancelRequested = false;
    this.rejectedRowsDuringImport = [];
    this.showProgressModal = false; // Status is shown via live toastr & bottom status bar
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

    // Live Toastr initialization
    this.syncToast = {
      visible: true,
      inProgress: true,
      percentage: 0,
      title: 'डेटाबेस में सिंक हो रहा है (Syncing to Database)...',
      hasError: false,
      inserted: 0,
      updated: 0,
      deleted: 0,
      failed: 0,
      errors: []
    };
    this.cdr.detectChanges();

    const syncedRowNums: number[] = [];

    try {
      // 3. Dispatch deleted rows if any exist
      if (deletedIds.length > 0) {
        try {
          const delRes = await firstValueFrom(this.api.deleteRows(this.selectedTableName, deletedIds));
          const delCount = delRes?.count || deletedIds.length;
          progress.deleted = delCount;
          this.syncToast = { ...this.syncToast, deleted: delCount };
          this.state.totalDbRecords.update((n: number) => Math.max(0, n - delCount));
          this.state.clearDeletedRowIds();
        } catch (delErr: any) {
          progress.rejected += deletedIds.length;
          this.syncToast = { ...this.syncToast, failed: this.syncToast.failed + deletedIds.length };
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
        this.syncToast = { ...this.syncToast, percentage: progress.percentage };
        this.state.importProgress.set({ ...progress });
        this.cdr.detectChanges();
      }

      // 4. Dispatch rows to sync (insert / update)
      for (let i = 0; i < rowsToSync.length; i++) {
        if (this.isCancelRequested) break;

        const r = rowsToSync[i];
        const payload: any = {};

        cfg.headers.forEach((h: any) => {
          if (h.is_temp || h.is_virtual) return;
          const cell = r.cells[h.col_name] || r.cells[h.name] || (h.key ? r.cells[h.key] : undefined);
          let val: any;
          const isFk = !!(h.ref_table || h.type === 'ref');
          if (isFk) {
            val = (cell?.refId !== undefined && cell?.refId !== null && cell?.refId !== '')
              ? cell.refId
              : (cell?.value ?? null);
          } else {
            val = (cell?.value !== undefined && cell?.value !== null)
              ? cell.value
              : (cell?.refId !== undefined && cell?.refId !== null ? cell.refId : null);
          }

          if (val === '') {
            const colType = (h.type || '').toLowerCase();
            if (['number', 'integer', 'int', 'float', 'double', 'decimal', 'date', 'datetime', 'timestamp'].includes(colType)) {
              val = null;
            }
          }
          payload[h.col_name] = val;
        });

        const rowId = (r as any)._id || r._rawOriginal?._id || r._rawOriginal?.id;
        const isUpdate = !r.isNew && !!rowId;
        if (isUpdate) {
          payload._id = rowId;
        } else {
          delete payload._id;
          delete payload.id;
        }
        if (r.hl !== undefined) {
          payload.hl = r.hl ? 1 : 0;
        }

        try {
          const res = isUpdate
            ? await firstValueFrom(this.api.updateRow(this.selectedTableName, payload))
            : await firstValueFrom(this.api.importRow(this.selectedTableName, payload));

          if (res?.status === 'inserted') {
            progress.inserted++;
            syncedRowNums.push(r.rowNum);
            const anyRes = res as any;
            const newInsertedId = anyRes?.newData?._id || anyRes?.data?._id || (typeof anyRes?.newData === 'number' ? anyRes.newData : null);
            if (newInsertedId) {
              (r as any)._id = newInsertedId;
              if (r._rawOriginal) r._rawOriginal._id = newInsertedId;
              if (r.cells && r.cells['_id']) r.cells['_id'].value = newInsertedId;
              syncedRowNums.push(newInsertedId);
            }
            if (rowId) syncedRowNums.push(rowId);
            this.state.totalDbRecords.update((n: number) => n + 1);
            r.isNew = false;
            r.isModified = false;
          } else if (res?.status === 'updated') {
            progress.updated++;
            syncedRowNums.push(r.rowNum);
            if (rowId) syncedRowNums.push(rowId);
            r.isModified = false;
          } else if (res?.status === 'duplicate') {
            progress.duplicate++;
            syncedRowNums.push(r.rowNum);
            if (rowId) syncedRowNums.push(rowId);
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
        this.syncToast = {
          ...this.syncToast,
          percentage: progress.percentage,
          title: `सिंक जारी है (${progress.current}/${progress.total})...`,
          inserted: progress.inserted,
          updated: progress.updated,
          deleted: progress.deleted || 0,
          failed: progress.rejected
        };
        this.state.importProgress.set({ ...progress });
        this.cdr.detectChanges();
      }

      // Mark successfully synced rows as clean
      if (syncedRowNums.length > 0) {
        this.state.markRowsSynced(syncedRowNums);
      }

      progress.isActive = false;
      this.state.importProgress.set({ ...progress });

      const hasErr = progress.rejected > 0;
      this.syncToast = {
        visible: true,
        inProgress: false,
        percentage: 100,
        title: hasErr
          ? 'सिंक चेतावनी के साथ संपन्न (Sync Finished with Warnings)'
          : 'सिंक सफलतापूर्वक संपन्न (Sync Completed Successfully)',
        hasError: hasErr,
        inserted: progress.inserted,
        updated: progress.updated,
        deleted: progress.deleted || 0,
        failed: progress.rejected,
        errors: this.rejectedRowsDuringImport.map(x => x._error || 'Row operation failed')
      };

      this.recordSheetLastSync(progress, hasErr);
      this.cdr.detectChanges();

      // Auto-dismiss toast after 3.5 seconds if successful
      if (!hasErr) {
        setTimeout(() => {
          if (this.syncToast.visible && !this.syncToast.inProgress && !this.syncToast.hasError) {
            this.syncToast = { ...this.syncToast, visible: false };
            this.cdr.detectChanges();
          }
        }, 3500);
      }
    } catch (globalErr: any) {
      console.error('[SutramStudio] DB Sync Error:', globalErr);
      this.syncToast = {
        visible: true,
        inProgress: false,
        percentage: 100,
        title: 'सिंक में त्रुटि (Sync Failed)',
        hasError: true,
        inserted: progress.inserted,
        updated: progress.updated,
        deleted: progress.deleted || 0,
        failed: progress.rejected + 1,
        errors: [globalErr?.message || 'Database sync encountered an unexpected error.']
      };
      this.recordSheetLastSync(progress, true);
      this.cdr.detectChanges();
    } finally {
      this.state.isImporting.set(false);
      this.cdr.detectChanges();
    }
  }

  private recordSheetLastSync(progress: ImportProgressState, hasErr: boolean): void {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const parts: string[] = [];
    if (progress.updated > 0) parts.push(`${progress.updated} Updated`);
    if (progress.inserted > 0) parts.push(`${progress.inserted} Inserted`);
    if ((progress.deleted || 0) > 0) parts.push(`${progress.deleted} Deleted`);
    if (progress.rejected > 0) parts.push(`${progress.rejected} Failed`);
    const summary = parts.length > 0 ? parts.join(', ') : 'All in sync';

    this.lastSyncPerSheet[this.activeSheetId] = {
      time: timeStr,
      summary,
      hasError: hasErr
    };
  }

  public dismissSyncToast(): void {
    this.syncToast = { ...this.syncToast, visible: false, inProgress: false };
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  public onStudioGlobalClick(): void {
    if (this.tabContextMenu.visible) {
      this.closeTabContextMenu();
    }
  }

  @HostListener('document:keydown', ['$event'])
  public onStudioGlobalKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.renamingTabId) {
        this.cancelTabRename();
        return;
      }
      if (this.tabContextMenu.visible) {
        this.closeTabContextMenu();
        return;
      }
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      event.stopPropagation();
      this.toggleBold();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      event.stopPropagation();
      if (this.isCurrentSheetRough || this.isCurrentSheetReport) {
        this.saveRoughSheetLocally();
        return;
      }
      if (this.state.isImporting()) return;

      if (this.state.hasErrors()) {
        this.syncToast = {
          visible: true,
          inProgress: false,
          percentage: 0,
          title: 'कृपया पहले त्रुटियों को ठीक करें (Fix errors before syncing)',
          hasError: true,
          inserted: 0,
          updated: 0,
          deleted: 0,
          failed: this.state.stats().errorRows,
          errors: ['शीट में अमान्य डेटा या त्रुटियाँ मौजूद हैं।']
        };
        this.cdr.detectChanges();
        return;
      }

      if (this.state.pendingChangesCount() > 0) {
        this.startImport();
      } else {
        this.syncToast = {
          visible: true,
          inProgress: false,
          percentage: 100,
          title: 'डेटाबेस पहले से सिंक है (Already in sync)',
          hasError: false,
          inserted: 0,
          updated: 0,
          deleted: 0,
          failed: 0,
          errors: []
        };
        this.cdr.detectChanges();
        setTimeout(() => {
          if (this.syncToast.visible && !this.syncToast.inProgress && !this.syncToast.hasError) {
            this.syncToast = { ...this.syncToast, visible: false };
            this.cdr.detectChanges();
          }
        }, 2500);
      }
    }
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
