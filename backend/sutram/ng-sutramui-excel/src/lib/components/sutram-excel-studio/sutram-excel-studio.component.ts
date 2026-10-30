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
  ViewChild
} from '@angular/core';
import { Subject, Subscription, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { SutramExcelStateService, ImportProgressState } from '../../services/sutram-excel-state.service';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';
import { SutramExcelScannerService } from '../../services/sutram-excel-scanner.service';
import { SutramAuditService } from '../../services/sutram-audit.service';
import { SutramScanReport, SutramScanMatch, SutramTableConfig, SutramRow } from '../../models/sutram-excel.model';
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
  type: string;
  not_null?: boolean;
  default_selected?: boolean;
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

  @ViewChild('grid') public gridComponent?: SutramGridComponent;

  // ── Top Ribbon Navigation & Catalogs State ───────────────────
  public activeTopTab: 'home' | 'tables' | 'reports' = 'home';
  public tableSearchQuery: string = '';
  public reportSearchQuery: string = '';
  public favoriteTables: Set<string> = new Set<string>();
  public favoriteReports: Set<string> = new Set<string>();



  // ── Pre-configured Reports Catalog (CTE & SQL Views) ─────────
  public readonly reportsList = [
    {
      id: 'mn_awk_type_wise',
      title: 'आवक प्रकार सार (Monthly Aawak Type Saar)',
      desc: 'माह एवं प्रकार अनुसार आवक की कुल मात्रा, दर एवं अवशेष रिपोर्ट',
      icon: 'pi-chart-line',
      table: 'mn_awk_type_wise',
      category: 'Aawak / Inventory'
    },
    {
      id: 'mn_jwk_aj_type',
      title: 'जावक प्रकार सार (Monthly Jawak Type Saar)',
      desc: 'माह अनुसार प्रयुक्त एवं अन्य जावक का विश्लेषण विवरण',
      icon: 'pi-chart-bar',
      table: 'mn_jwk_aj_type',
      category: 'Jawak / Inventory'
    },
    {
      id: 'bachat_summary',
      title: 'बचत स्टॉक सारांश (Bachat Stock Summary)',
      desc: 'वर्तमान शेष, चालू, नया, पुराना, रिपेयरिंग एवं कबाड़ स्टॉक का समग्र विवरण',
      icon: 'pi-percentage',
      table: 'bachat',
      category: 'Stock Balance'
    },
    {
      id: 'pbk_closing',
      title: 'पीबीके क्लोजिंग रिपोर्ट (PBK Closing Statement)',
      desc: 'वित्तीय वर्षानुसार पीबीके की वार्षिक क्लोजिंग एवं बैलेंस शीट',
      icon: 'pi-book',
      table: 'pbk_closing',
      category: 'Closing'
    }
  ];

  public tablesList: Array<{ table: string; display_name: string }> = [];
  public selectedTableName: string = '';
  public isLoadingConfig: boolean = false;

  // Active Session Sheet Tabs (Rough & Favorites only)
  public sheetTabs: StudioSheetTab[] = [];
  public activeSheetId: string = 'rough_1';
  public sheetWorkbooks: { [sheetId: string]: { rows: any[]; config?: SutramTableConfig; totalDbRecords?: number; loadedDbRecordCount?: number; deletedRowIds?: any[]; deletedRowsQueue?: any[]; allConfigColumns?: StudioConfigColumn[]; selectedColumnKeys?: Set<string> } } = {};
  public loadedDbRecordCount: number = 0;

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
    return n === '_id' || n.includes('_by_dept_id') || n === 'verify';
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
  }

  public get filteredDirectCols(): StudioConfigColumn[] {
    const q = (this.colSearchQuery || '').trim().toLowerCase();
    return this.allConfigColumns.filter(c => {
      if (c.group) return false;
      if (!q) return true;
      return (c.name && c.name.toLowerCase().includes(q)) ||
             (c.key && c.key.toLowerCase().includes(q));
    });
  }

  public get filteredFkGroups(): StudioFkGroup[] {
    const q = (this.colSearchQuery || '').trim().toLowerCase();
    const groupsMap = new Map<string, StudioConfigColumn[]>();

    this.allConfigColumns.forEach(c => {
      if (c.group) {
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
               (c.short_name && c.short_name.toLowerCase().includes(q));
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
    this.cdr.markForCheck();
  }

  public ensureRowCellsForColumn(key: string): void {
    const colDef = this.allConfigColumns.find(c => c.key === key);
    if (!colDef) return;
    const rows = this.state.rows();
    let updated = false;

    rows.forEach(r => {
      if (r.cells && !r.cells[key] && r._rawOriginal) {
        const dr = r._rawOriginal;
        let rawVal: any;
        if (colDef.is_fk_subcol) {
          const refObj = dr[colDef.ref_as || colDef.ref_table!];
          if (refObj && typeof refObj === 'object') {
            rawVal = refObj[colDef.sub_col_name!];
          }
        } else if (colDef.is_fk_main || colDef.type === 'ref') {
          const joined = dr[colDef.ref_as || colDef.name || colDef.ref_table!];
          if (joined && typeof joined === 'object') {
            const formatted = this.refCache.formatOption(colDef.ref_table!, joined);
            rawVal = formatted?.display;
          }
        } else if (colDef.is_fk_raw) {
          rawVal = dr[colDef.col_name!] ?? dr[colDef.key];
        } else {
          rawVal = dr[colDef.col_name!] ?? dr[colDef.name] ?? dr[colDef.key];
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

    // Initialize & persist dark mode preference
    const savedTheme = localStorage.getItem('sutram_dark_mode');
    if (savedTheme === 'true' || document.body.classList.contains('dark-mode')) {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
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

  public setTopTab(tab: 'home' | 'tables' | 'reports'): void {
    this.activeTopTab = tab;
    this.cdr.markForCheck();
  }

  public get isCurrentSheetRough(): boolean {
    const cur = this.sheetTabs.find(t => t.id === this.activeSheetId);
    return !cur || cur.type === 'rough' || this.activeSheetId === 'blank' || this.activeSheetId.startsWith('rough_') || this.activeSheetId.startsWith('sheet_');
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
      const newTab: StudioSheetTab = {
        id: tableName,
        title: tableInfo?.display_name || tableName,
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
    const tabId = 'rep_' + report.id;
    const foundTab = this.sheetTabs.find(t => t.id === tabId);
    if (foundTab) {
      this.switchSheet(foundTab.id);
    } else {
      const newTab: StudioSheetTab = {
        id: tabId,
        title: report.title,
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
      display_name: 'Sheet (रफ)',
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

    const dataToSave = {
      sheetId: this.activeSheetId,
      savedAt: new Date().toLocaleTimeString(),
      rows: cleanRows,
      allConfigColumns: this.allConfigColumns,
      selectedColumnKeys: Array.from(this.selectedColumnKeys)
    };

    try {
      localStorage.setItem(`sutram_rough_${this.activeSheetId}`, JSON.stringify(dataToSave));
      const curTab = this.sheetTabs.find(t => t.id === this.activeSheetId);
      if (curTab) {
        curTab.lastSaved = new Date().toLocaleTimeString();
        curTab.recordCount = currentRows.length;
      }

      this.lastSyncPerSheet[this.activeSheetId] = {
        time: new Date().toLocaleTimeString(),
        summary: `${currentRows.length} पंक्तियाँ सुरक्षित (Saved locally)`,
        hasError: false
      };

      this.syncToast = {
        visible: true,
        inProgress: false,
        percentage: 100,
        title: 'रफ शीट स्थानीय रूप से सुरक्षित (Saved Locally)',
        hasError: false,
        inserted: currentRows.length,
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
    } catch (e: any) {
      console.error('[SutramStudio] Local save failed:', e);
    }
  }

  public loadTablesList(): void {
    const savedFavs = localStorage.getItem('sutram_studio_favorites');
    if (savedFavs) {
      try {
        this.favoriteTables = new Set(JSON.parse(savedFavs));
      } catch {}
    } else {
      this.favoriteTables = new Set(['item', 'aawak', 'bachat']);
    }

    const savedFavReps = localStorage.getItem('sutram_favorite_reports');
    if (savedFavReps) {
      try {
        this.favoriteReports = new Set(JSON.parse(savedFavReps));
      } catch {}
    }

    this.api.getRegisteredTables().subscribe({
      next: (tables: any[]) => {
        this.tablesList = tables;

        // Build active session sheets:
        // 1. Always start with Sheet 1 (रफ)
        const activeTabs: StudioSheetTab[] = [
          { id: 'rough_1', title: 'Sheet 1 (रफ)', icon: 'pi-file', type: 'rough', isLoaded: true }
        ];

        // 2. Add pinned / favorite tables only
        tables.forEach((t: any) => {
          if (this.favoriteTables.has(t.table)) {
            activeTabs.push({
              id: t.table,
              title: t.display_name || t.table,
              icon: 'pi-table',
              type: 'table',
              tableName: t.table,
              isLoaded: false,
              recordCount: 0
            });
          }
        });

        this.sheetTabs = activeTabs;

        // Choose initial active sheet: favorite table if available, else rough_1
        const firstTable = activeTabs.find(t => t.type === 'table');
        if (firstTable) {
          this.activeSheetId = firstTable.id;
          this.selectedTableName = firstTable.id;
          this.onTableSelect(firstTable.id, true);
        } else {
          this.activeSheetId = 'rough_1';
          this.selectedTableName = '';
          this.switchSheet('rough_1');
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
      const saved = this.sheetWorkbooks[tabId];
      if (saved && saved.rows && saved.rows.length > 0) {
        // Instant in-memory restoration for previously visited sheets!
        this.selectedTableName = tabId;
        this.state.setActiveTable(tabId);
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
        this.onTableSelect(tabId, true);
      }
    }
    this.cdr.markForCheck();
  }

  public addNewBlankSheet(): void {
    const roughCount = this.sheetTabs.filter(t => t.type === 'rough').length + 1;
    const newId = `rough_${Date.now()}`;
    const newTab: StudioSheetTab = {
      id: newId,
      title: `Sheet ${roughCount} (रफ)`,
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
      } else if (col.is_fk_main || col.type === 'ref') {
        const joined = dr[col.ref_as || col.name || col.ref_table];
        if (joined && typeof joined === 'object') {
          const formatted = this.refCache.formatOption(col.ref_table, joined);
          if (formatted && formatted.display) {
            rawVal = formatted.display;
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

      const cellKey = col.key || col.name;
      const strVal = String(rawVal ?? '');
      cells[cellKey] = {
        value: strVal,
        originalValue: strVal,
        isValid: true,
        isModified: false,
        refId: dr[col.col_name] !== undefined ? dr[col.col_name] : rawVal
      };
      if (col.name && col.name !== cellKey) {
        cells[col.name] = cells[cellKey];
      }
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

    // Serialize column filters for backend API
    const apiFilters: Record<string, any> = {};
    for (const [colKey, valSet] of Object.entries(columnFilters)) {
      if (valSet && (valSet as Set<any>).size > 0) {
        let dbKey = colKey;
        const foundCol = this.allConfigColumns.find(c => c.key === colKey || c.name === colKey);
        if (foundCol && foundCol.col_name) {
          dbKey = foundCol.col_name;
        }
        apiFilters[dbKey] = Array.from(valSet as Set<any>);
      }
    }

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

        this.audit.auditAll(builtRows, cfg.headers);

        let combined = isReset ? builtRows : [...cleanExisting, ...builtRows];
        // Always ensure one trailing blank row at the very end (whether 0, 10, or 250+ records)
        combined = this.ensureTrailingBlankRow(combined, cfg);

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
    const withBlank = this.ensureTrailingBlankRow(builtRows, cfg);
    this.state.setRows(withBlank);
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
            ? await firstValueFrom(this.api.updateRow(this.selectedTableName, payload))
            : await firstValueFrom(this.api.importRow(this.selectedTableName, payload));

          if (res?.status === 'inserted') {
            progress.inserted++;
            syncedRowNums.push(r.rowNum);
            if (rowId) syncedRowNums.push(rowId);
            this.state.totalDbRecords.update((n: number) => n + 1);
          } else if (res?.status === 'updated') {
            progress.updated++;
            syncedRowNums.push(r.rowNum);
            if (rowId) syncedRowNums.push(rowId);
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

  @HostListener('document:keydown', ['$event'])
  public onStudioGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      event.stopPropagation();
      if (this.isCurrentSheetRough) {
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
