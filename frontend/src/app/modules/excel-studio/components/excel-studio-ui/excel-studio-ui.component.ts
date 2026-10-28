import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { AutocompleteOption, StudioCell, StudioColumn, StudioFormat, StudioMode, StudioRow, StudioSheetTab, SheetWorkbookData } from '../../models/excel-studio.model';
import { ExcelStudioService } from '../../services/excel-studio.service';
import { MasterIndexerService } from '../../services/master-indexer.service';
import { GlobalService } from 'src/app/services/global.service';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-excel-studio-ui',
  templateUrl: './excel-studio-ui.component.html',
  styleUrls: ['./excel-studio-ui.component.scss']
})
export class ExcelStudioUiComponent implements OnInit {
  @ViewChild('activeCellInput') activeCellInput?: ElementRef<HTMLInputElement>;
  @ViewChild('formulaInput') formulaInput?: ElementRef<HTMLInputElement>;
  @ViewChild('gridContainer') gridContainer?: ElementRef<HTMLDivElement>;

  Math = Math;

  // Multi-Sheet Workbook State (Excel-like Sheet Tabs at Bottom)
  sheetTabs: StudioSheetTab[] = [];
  activeSheetId: string = 'blank';
  sheetWorkbooks: { [sheetId: string]: SheetWorkbookData } = {};

  // Zoom / Scale State (User Scale Feature)
  zoomLevel: number = 1.0;

  // Writing & Formatting Toolbar State
  isTextBold: boolean = false;
  textAlign: 'left' | 'center' | 'right' = 'left';
  sheetSearchQuery: string = '';

  // Current State
  mode: StudioMode = 'intelligent'; // 'normal' | 'intelligent'
  currentFormat: StudioFormat | null = null;
  columns: StudioColumn[] = [];
  rows: StudioRow[] = [];

  // Column Resizing State
  columnWidths: { [key: string]: number } = {};
  resizingColKey: string | null = null;
  resizeStartX: number = 0;
  resizeStartWidth: number = 160;

  // Single Floating Active Editor State (Flyweight for Low-End PC Performance)
  activeRowIndex: number | null = null;
  activeColKey: string | null = null;
  activeCellEditorValue: string = '';
  previousCellValueBeforeEdit: string = '';
  autocompleteSuggestions: AutocompleteOption[] = [];
  isAutocompleteOpen: boolean = false;
  selectedSuggestionIndex: number = 0;
  openDropdownUpwards: boolean = false;
  currentSubitemParentItem: string = '';

  // Formula Bar / Active Coordinate
  activeCellCoordinate: string = 'A1';
  activeColumnName: string = '';

  // Context Menu State
  isContextMenuOpen: boolean = false;
  contextMenuPos = { x: 0, y: 0 };
  contextMenuTargetRow: number | null = null;

  // Row Selection & Copy/Paste State
  selectedRowIndex: number | null = null;
  copiedRowData: string[] | null = null;
  isFormatMenuOpen: boolean = false;

  // Batch Fix & Suggestion State (Inline Row Notification - No Blocking Popups)
  batchFixSuggestion: {
    colKey: string;
    colTitle: string;
    oldVal: string;
    newVal: string;
    otherMatches: number;
  } | null = null;

  // Validation Audit Summary
  auditSummary = {
    total: 0,
    valid: 0,
    errors: 0,
    badCells: 0
  };
  currentErrorPointer: number = -1;
  errorCellsList: { rowIndex: number; colKey: string }[] = [];

  // Modals & Panels
  showScannerModal: boolean = false;
  showImportModal: boolean = false;
  rawSheetMatrix: any[][] = [];
  importPayload: any = null;
  importTypeForModal: string = 'bachat';
  isLoadingData: boolean = false;
  showMmSelectModal: boolean = false;
  selectedMmIdForLoad: string = 'ALL';
  mms: any[] = [];

  constructor(
    public studioService: ExcelStudioService,
    public masterIndexer: MasterIndexerService,
    private toastr: ToastrService,
    public gs: GlobalService,
    public auth: AuthService,
    public themeService: ThemeService,
    private http: HttpClient,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.initMmsList();
    this.initSheetTabs();
    this.initGenericNormalSheet(10, 40);
  }

  // ==========================================
  // MULTI-SHEET WORKBOOK MANAGEMENT
  // ==========================================

  initSheetTabs(): void {
    this.sheetTabs = [
      { id: 'blank', title: 'Blank Sheet', title_hin: 'खाली शीट', icon: 'uil-table', formatId: null },
      ...this.studioService.formats.map(f => ({
        id: f.id,
        title: f.title,
        title_hin: f.title_hin,
        icon: f.icon || 'uil-layer-group',
        formatId: f.id,
        isLoaded: false,
        recordCount: 0
      }))
    ];
    this.activeSheetId = 'blank';
  }

  switchSheet(tab: StudioSheetTab): void {
    if (this.activeSheetId === tab.id) return;

    this.closeActiveEditor();
    this.closeContextMenu();
    this.batchFixSuggestion = null;

    // Save current active sheet data into workbook memory
    this.sheetWorkbooks[this.activeSheetId] = {
      rows: this.rows,
      columns: this.columns,
      format: this.currentFormat,
      columnWidths: { ...this.columnWidths },
      isLoaded: this.sheetTabs.find(t => t.id === this.activeSheetId)?.isLoaded || false,
      recordCount: this.rows.filter(r => this.rowHasData(r)).length
    };

    this.activeSheetId = tab.id;

    // Restore from workbook memory or initialize clean empty format
    if (this.sheetWorkbooks[tab.id]) {
      const saved = this.sheetWorkbooks[tab.id];
      this.currentFormat = saved.format;
      this.columns = saved.columns;
      this.rows = saved.rows;
      this.columnWidths = saved.columnWidths;
      if (this.mode === 'intelligent') {
        this.runAudit();
      } else {
        this.resetAudit();
      }
      this.updateCoordinate(0, this.columns[0]?.key);
      this.toastr.info(`'${tab.title}' शीट पर स्विच किया गया।`, 'Sheet Switched');
    } else {
      if (tab.id === 'blank' || !tab.formatId) {
        this.initGenericNormalSheet(10, 40);
      } else {
        const fmt = this.studioService.getFormat(tab.formatId);
        if (fmt) {
          // Clean empty format with blank rows ready for typing or loading data
          this.loadFormat(fmt, this.mode, false);
        } else {
          this.initGenericNormalSheet(10, 40);
        }
      }
    }
  }

  addNewBlankSheet(): void {
    const customCount = this.sheetTabs.filter(t => t.isCustom).length + 2;
    const newTab: StudioSheetTab = {
      id: 'sheet_custom_' + Date.now(),
      title: `Sheet ${customCount}`,
      title_hin: `शीट ${customCount}`,
      icon: 'uil-table',
      formatId: null,
      isCustom: true
    };
    this.sheetTabs.push(newTab);
    this.switchSheet(newTab);
    this.toastr.success(`नई शीट '${newTab.title}' जोड़ी गई।`, 'Sheet Added');
  }

  scrollSheetTabs(direction: 'left' | 'right'): void {
    const el = document.getElementById('sheetTabsStrip');
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -220 : 220, behavior: 'smooth' });
    }
  }

  markActiveSheetLoaded(count: number): void {
    const tab = this.sheetTabs.find(t => t.id === this.activeSheetId);
    if (tab) {
      tab.isLoaded = true;
      tab.recordCount = count;
    }
  }

  // ==========================================
  // SCALE / ZOOM CONTROLS (User Scale Feature)
  // ==========================================

  zoomIn(): void {
    if (this.zoomLevel < 1.6) {
      this.zoomLevel = Math.min(1.6, Math.round((this.zoomLevel + 0.1) * 10) / 10);
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.6) {
      this.zoomLevel = Math.max(0.6, Math.round((this.zoomLevel - 0.1) * 10) / 10);
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1.0;
  }

  // ==========================================
  // WRITING & FORMATTING TOOLBAR
  // ==========================================

  toggleBold(): void {
    this.isTextBold = !this.isTextBold;
  }

  setTextAlign(align: 'left' | 'center' | 'right'): void {
    this.textAlign = align;
  }

  // ==========================================
  // FORMAT & SHEET INITIALIZATION
  // ==========================================

  private initMmsList(): void {
    if (this.gs.Lists && this.gs.Lists.mm) {
      this.mms = this.gs.Lists.mm;
    } else {
      this.gs.observeList().subscribe({
        next: (result: any) => {
          if (result && result.mm) {
            this.mms = result.mm;
          } else if (this.gs.Lists && this.gs.Lists.mm) {
            this.mms = this.gs.Lists.mm;
          }
        },
        error: (err: any) => {
          this.toastr.error('मास्टर सूचियां लोड करने में त्रुटि आई: ' + (err?.error?.message || err?.message || 'Network error'));
        }
      });
    }
  }

  // ==========================================
  // THEME MANAGEMENT (Independent Standalone)
  // ==========================================

  get isDarkMode(): boolean {
    return !!(this.auth.webUser && this.auth.webUser.settings && this.auth.webUser.settings.darkMode);
  }

  toggleTheme(): void {
    if (!this.auth.webUser || !this.auth.webUser.settings) return;
    this.auth.webUser.settings.darkMode = !this.auth.webUser.settings.darkMode;
    this.auth.updateSettings();
    this.themeService.initializeTheme();
  }

  // ==========================================
  // FORMAT & SHEET INITIALIZATION
  // ==========================================

  loadFormat(format: StudioFormat, targetMode: StudioMode = 'intelligent', includeSample: boolean = false): void {
    this.closeActiveEditor();
    this.closeContextMenu();
    this.batchFixSuggestion = null;
    this.selectedRowIndex = null;
    this.currentFormat = format;
    this.columns = [...format.columns];
    this.initColumnWidths();
    this.rows = this.studioService.generateBlankRows(format, 35, includeSample);
    this.mode = targetMode;

    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.info(`'${format.title}' लोड हो गया है।`, 'Format Loaded');
    this.updateCoordinate(0, this.columns[0]?.key);
  }

  initGenericNormalSheet(colCount: number = 10, rowCount: number = 35): void {
    this.closeActiveEditor();
    this.closeContextMenu();
    this.batchFixSuggestion = null;
    this.selectedRowIndex = null;
    this.currentFormat = null;
    this.columns = this.studioService.generateNormalColumns(colCount);
    this.initColumnWidths();
    this.rows = [];
    for (let r = 0; r < rowCount; r++) {
      const cells: { [k: string]: any } = {};
      for (const col of this.columns) {
        cells[col.key] = { value: '', isValid: true };
      }
      this.rows.push({
        rowNum: r + 1,
        cells: cells,
        hasError: false,
        errorCount: 0
      });
    }
    this.mode = 'intelligent';
    this.resetAudit();
    this.toastr.info('स्वतंत्र खाली शीट तैयार है। आप अपने हेडर लिख सकते हैं।', 'Blank Sheet Ready');
    this.updateCoordinate(0, this.columns[0]?.key);
  }

  initColumnWidths(): void {
    this.columnWidths = {};
    for (const col of this.columns) {
      // Calculate generous default width so full title fits cleanly
      const nameLength = (col.name || '').length;
      const baseWidth = Math.max(160, nameLength * 11 + 45);
      this.columnWidths[col.key] = baseWidth;
    }
  }

  // ==========================================
  // COLUMN RESIZING VIA MOUSE DRAG
  // ==========================================

  onColResizeStart(event: MouseEvent, colKey: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizingColKey = colKey;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.columnWidths[colKey] || 160;
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (this.resizingColKey) {
      const diff = event.clientX - this.resizeStartX;
      const newWidth = Math.max(80, this.resizeStartWidth + diff);
      this.columnWidths[this.resizingColKey] = newWidth;
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (this.resizingColKey) {
      this.resizingColKey = null;
    }
  }

  // ==========================================
  // ROW DATA CHECK (Empty row ignore rule)
  // ==========================================

  rowHasData(row: StudioRow): boolean {
    return this.studioService.rowHasData(row, this.columns);
  }

  // ==========================================
  // 1-CLICK DUAL MODE TOGGLING & AUDIT SCAN
  // ==========================================

  setMode(newMode: StudioMode): void {
    if (this.mode === newMode) return;
    this.closeActiveEditor();
    this.batchFixSuggestion = null;
    this.mode = newMode;

    if (this.mode === 'intelligent') {
      this.runAudit();
      this.toastr.success(
        `स्मार्ट मोड सक्रिय! कुल ${this.auditSummary.badCells} गलत सेल्स पाई गईं।`,
        'Intelligent Mode On'
      );
    } else {
      this.toastr.info(
        'नॉर्मल मोड सक्रिय! तीव्र गति से टाइपिंग और पेस्टिंग के लिए तैयार।',
        'Normal Mode On'
      );
    }
  }

  toggleMode(): void {
    this.setMode(this.mode === 'normal' ? 'intelligent' : 'normal');
  }

  runAudit(): void {
    this.auditSummary = this.studioService.validateAllRows(this.rows, this.columns);
    this.rebuildErrorCellsList();
  }

  resetAudit(): void {
    const dataCount = this.rows.filter(r => this.rowHasData(r)).length;
    this.auditSummary = {
      total: dataCount,
      valid: dataCount,
      errors: 0,
      badCells: 0
    };
    this.errorCellsList = [];
    this.currentErrorPointer = -1;
    for (const r of this.rows) {
      r.hasError = false;
      r.errorCount = 0;
      for (const col of this.columns) {
        if (r.cells[col.key]) {
          r.cells[col.key].isValid = true;
          r.cells[col.key].isWarning = false;
          r.cells[col.key].errorMessage = undefined;
        }
      }
    }
  }

  rebuildErrorCellsList(): void {
    this.errorCellsList = [];
    for (let r = 0; r < this.rows.length; r++) {
      const row = this.rows[r];
      // ONLY check errors on rows that actually have data!
      if (this.rowHasData(row) && row.hasError) {
        for (const col of this.columns) {
          const cell = row.cells[col.key];
          if (cell && !cell.isValid) {
            this.errorCellsList.push({ rowIndex: r, colKey: col.key });
          }
        }
      }
    }
    this.currentErrorPointer = this.errorCellsList.length > 0 ? 0 : -1;
  }

  // ==========================================
  // ERROR NAVIGATION (Next / Prev Error Jump)
  // ==========================================

  jumpToNextError(): void {
    if (this.errorCellsList.length === 0) {
      this.toastr.success('शीट में कोई त्रुटि नहीं है! (No errors found)', 'All Valid');
      return;
    }
    this.currentErrorPointer = (this.currentErrorPointer + 1) % this.errorCellsList.length;
    const target = this.errorCellsList[this.currentErrorPointer];
    this.focusCell(target.rowIndex, target.colKey);
  }

  jumpToPrevError(): void {
    if (this.errorCellsList.length === 0) {
      this.toastr.success('शीट में कोई त्रुटि नहीं है! (No errors found)', 'All Valid');
      return;
    }
    this.currentErrorPointer = (this.currentErrorPointer - 1 + this.errorCellsList.length) % this.errorCellsList.length;
    const target = this.errorCellsList[this.currentErrorPointer];
    this.focusCell(target.rowIndex, target.colKey);
  }

  // ==========================================
  // SINGLE FLOATING ACTIVE EDITOR (FLYWEIGHT)
  // ==========================================

  onCellClick(rowIndex: number, colKey: string): void {
    this.closeContextMenu();
    this.selectedRowIndex = null;
    this.focusCell(rowIndex, colKey);
  }

  onRowHeaderClick(rIdx: number, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedRowIndex = rIdx;
    this.closeActiveEditor();
    this.closeContextMenu();
    this.updateCoordinate(rIdx, this.columns[0]?.key);
  }

  copySelectedRow(): void {
    const targetIdx = this.selectedRowIndex ?? this.contextMenuTargetRow ?? this.activeRowIndex;
    if (targetIdx === null || !this.rows[targetIdx]) return;
    this.selectedRowIndex = targetIdx;
    const row = this.rows[targetIdx];
    const rowValues = this.columns.map(col => row.cells[col.key]?.value || '');
    this.copiedRowData = [...rowValues];

    const tsv = rowValues.join('\t');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tsv).then(() => {
        this.toastr.success(`रो ${targetIdx + 1} कॉपी हो गई (Row Copied)!`);
      }).catch(() => {
        this.toastr.info(`रो ${targetIdx + 1} कॉपी हो गई!`);
      });
    } else {
      this.toastr.info(`रो ${targetIdx + 1} कॉपी हो गई!`);
    }
  }

  pasteIntoSelectedRow(): void {
    const targetIdx = this.selectedRowIndex ?? this.contextMenuTargetRow ?? this.activeRowIndex;
    if (targetIdx === null || !this.rows[targetIdx]) return;
    this.selectedRowIndex = targetIdx;
    const targetRow = this.rows[targetIdx];

    const applyValues = (cells: string[]) => {
      for (let c = 0; c < Math.min(cells.length, this.columns.length); c++) {
        const col = this.columns[c];
        targetRow.cells[col.key].value = cells[c] ? cells[c].trim() : '';
      }
      if (this.mode === 'intelligent') {
        this.studioService.validateRow(targetRow, this.columns);
        this.rebuildErrorCellsList();
      }
      this.toastr.success(`रो ${targetIdx + 1} में पेस्ट सफल (Row Pasted)!`);
    };

    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(text => {
        if (text) {
          const firstLine = text.split(/\r?\n/)[0];
          applyValues(firstLine.split('\t'));
        } else if (this.copiedRowData) {
          applyValues(this.copiedRowData);
        }
      }).catch(() => {
        if (this.copiedRowData) applyValues(this.copiedRowData);
      });
    } else if (this.copiedRowData) {
      applyValues(this.copiedRowData);
    }
  }

  focusCell(rowIndex: number, colKey: string): void {
    if (rowIndex < 0 || rowIndex >= this.rows.length) return;
    this.closeActiveEditor();

    this.activeRowIndex = rowIndex;
    this.activeColKey = colKey;
    const currentVal = this.rows[rowIndex].cells[colKey]?.value ?? '';
    this.activeCellEditorValue = String(currentVal);
    this.previousCellValueBeforeEdit = String(currentVal);

    this.updateCoordinate(rowIndex, colKey);

    // Auto-buffer rows if within last 3 rows
    if (rowIndex >= this.rows.length - 3) {
      this.autoBufferRows(10);
    }

    const col = this.getColumn(colKey);
    if (this.mode === 'intelligent' && col?.ref_table) {
      if (col.ref_table === 'subitem') {
        this.currentSubitemParentItem = this.getParentItemValue(this.rows[rowIndex]);
        this.autocompleteSuggestions = this.masterIndexer.getSubitemSuggestions(this.currentSubitemParentItem, this.activeCellEditorValue, 20);
      } else {
        this.currentSubitemParentItem = '';
        this.autocompleteSuggestions = this.masterIndexer.getSuggestions(col.ref_table, this.activeCellEditorValue, 20);
      }
      this.isAutocompleteOpen = this.autocompleteSuggestions.length > 0;
      this.selectedSuggestionIndex = 0;
    } else {
      this.currentSubitemParentItem = '';
      this.isAutocompleteOpen = false;
    }

    // Determine dropdown direction (upwards if in lower half of screen)
    if (typeof window !== 'undefined') {
      const viewportHeight = window.innerHeight;
      this.openDropdownUpwards = rowIndex > 8 && (rowIndex * 30) % viewportHeight > viewportHeight * 0.55;
    }

    setTimeout(() => {
      if (this.activeCellInput) {
        this.activeCellInput.nativeElement.focus();
        this.activeCellInput.nativeElement.select();
      }
    }, 40);
  }

  getParentItemValue(row: StudioRow | null | undefined): string {
    return this.studioService.getParentItemValueFromRow(row as StudioRow, this.columns);
  }

  updateCoordinate(rowIndex: number, colKey?: string): void {
    if (!colKey) return;
    const colIdx = this.columns.findIndex(c => c.key === colKey);
    const letter = this.studioService.getColumnLetter(colIdx >= 0 ? colIdx : 0);
    this.activeCellCoordinate = `${letter}${rowIndex + 1}`;
    const col = this.getColumn(colKey);
    this.activeColumnName = col ? col.name : '';
  }

  onEditorInput(val: string): void {
    this.activeCellEditorValue = val;
    if (this.activeRowIndex !== null && this.activeColKey) {
      this.rows[this.activeRowIndex].cells[this.activeColKey].value = val;
    }

    const col = this.getColumn(this.activeColKey || '');
    if (this.mode === 'intelligent' && col?.ref_table) {
      if (col.ref_table === 'subitem') {
        const row = this.activeRowIndex !== null ? this.rows[this.activeRowIndex] : null;
        this.currentSubitemParentItem = this.getParentItemValue(row);
        this.autocompleteSuggestions = this.masterIndexer.getSubitemSuggestions(this.currentSubitemParentItem, val, 20);
      } else {
        this.currentSubitemParentItem = '';
        this.autocompleteSuggestions = this.masterIndexer.getSuggestions(col.ref_table, val, 20);
      }
      this.isAutocompleteOpen = this.autocompleteSuggestions.length > 0;
      this.selectedSuggestionIndex = 0;
    }
  }

  get activeCell(): StudioCell | null {
    if (this.activeRowIndex === null || !this.activeColKey || !this.rows[this.activeRowIndex]) return null;
    return this.rows[this.activeRowIndex].cells[this.activeColKey] || null;
  }

  get activeCellIsBad(): boolean {
    if (this.mode !== 'intelligent' || this.activeRowIndex === null || !this.activeColKey) return false;
    const row = this.rows[this.activeRowIndex];
    if (!row || !this.rowHasData(row)) return false;
    const cell = this.activeCell;
    return !!(cell && !cell.isValid);
  }

  get activeCellErrorMessage(): string {
    return this.activeCell?.errorMessage || '';
  }

  get activeColRefTable(): string {
    if (!this.activeColKey) return '';
    const col = this.getColumn(this.activeColKey);
    return col?.ref_table || '';
  }

  selectSuggestion(opt: AutocompleteOption): void {
    if (this.activeRowIndex === null || !this.activeColKey) return;
    const oldVal = this.previousCellValueBeforeEdit;
    const newVal = opt.label;
    const colKey = this.activeColKey;
    const currentRow = this.rows[this.activeRowIndex];

    this.activeCellEditorValue = newVal;
    currentRow.cells[colKey].value = newVal;
    this.isAutocompleteOpen = false;

    // Contextual Subitem Auto-fill: If subitem selected and parent item on this row is empty, auto-fill parent item!
    const col = this.getColumn(colKey);
    if (col?.ref_table === 'subitem' && opt.raw?.parent_item) {
      const pIt = opt.raw.parent_item;
      const pLabel = pIt.item_hin || pIt.item_eng || '';
      if (currentRow.cells['item'] && (!currentRow.cells['item'].value || String(currentRow.cells['item'].value).trim() === '')) {
        currentRow.cells['item'].value = pLabel;
      }
      if (currentRow.cells['item_hin'] && (!currentRow.cells['item_hin'].value || String(currentRow.cells['item_hin'].value).trim() === '')) {
        currentRow.cells['item_hin'].value = pIt.item_hin || pLabel;
      }
    }

    if (this.mode === 'intelligent') {
      this.studioService.validateRow(currentRow, this.columns);
      this.rebuildErrorCellsList();
    }
    if (oldVal !== newVal) {
      this.checkAndOfferBatchFix(oldVal, newVal, colKey);
    }
    this.moveToNextCell(0, 1);
  }

  onEditorKeydown(event: KeyboardEvent): void {
    if (this.isAutocompleteOpen && this.autocompleteSuggestions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % this.autocompleteSuggestions.length;
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + this.autocompleteSuggestions.length) % this.autocompleteSuggestions.length;
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const chosen = this.autocompleteSuggestions[this.selectedSuggestionIndex];
        if (chosen) {
          this.selectSuggestion(chosen);
          return;
        }
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitActiveEditor();
      this.moveToNextCell(1, 0); // Down
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      this.commitActiveEditor();
      this.moveToNextCell(0, event.shiftKey ? -1 : 1); // Tab
      return;
    }

    if (event.key === 'Escape') {
      this.closeActiveEditor();
      return;
    }
  }

  commitActiveEditor(): void {
    if (this.activeRowIndex === null || !this.activeColKey) return;
    const oldVal = this.previousCellValueBeforeEdit;
    const newVal = this.activeCellEditorValue;
    const colKey = this.activeColKey;

    this.rows[this.activeRowIndex].cells[colKey].value = newVal;

    if (this.mode === 'intelligent') {
      this.studioService.validateRow(this.rows[this.activeRowIndex], this.columns);
      this.rebuildErrorCellsList();
    }

    if (oldVal !== newVal) {
      this.checkAndOfferBatchFix(oldVal, newVal, colKey);
    }
  }

  checkAndOfferBatchFix(oldVal: string, newVal: string, colKey: string): void {
    if (!oldVal || !newVal || oldVal.trim() === '' || oldVal === newVal || this.mode !== 'intelligent') return;

    let otherMatches = 0;
    for (let r = 0; r < this.rows.length; r++) {
      if (r !== this.activeRowIndex && this.rows[r].cells[colKey]?.value === oldVal) {
        otherMatches++;
      }
    }

    if (otherMatches > 0) {
      const col = this.getColumn(colKey);
      const colTitle = col ? col.name : 'इस कॉलम';

      // Inline suggestion in dedicated status row (No intrusive Swal popup)
      this.batchFixSuggestion = {
        colKey: colKey,
        colTitle: colTitle,
        oldVal: oldVal,
        newVal: newVal,
        otherMatches: otherMatches
      };
    }
  }

  applyBatchFix(): void {
    if (!this.batchFixSuggestion) return;
    const { colKey, oldVal, newVal, otherMatches } = this.batchFixSuggestion;

    for (const r of this.rows) {
      if (r.cells[colKey]?.value === oldVal) {
        r.cells[colKey].value = newVal;
      }
    }

    this.runAudit();
    this.toastr.success(`सभी ${otherMatches + 1} जगह '${oldVal}' को '${newVal}' से अपडेट कर दिया गया!`, 'सफलतापूर्वक बदला गया');
    this.batchFixSuggestion = null;
  }

  dismissBatchFix(): void {
    this.batchFixSuggestion = null;
  }

  closeActiveEditor(): void {
    this.isAutocompleteOpen = false;
    this.activeRowIndex = null;
    this.activeColKey = null;
    this.activeCellEditorValue = '';
  }

  moveToNextCell(rowOffset: number, colOffset: number): void {
    if (this.activeRowIndex === null || !this.activeColKey) return;
    const currentColIdx = this.columns.findIndex(c => c.key === this.activeColKey);

    let nextRow = this.activeRowIndex + rowOffset;
    let nextColIdx = currentColIdx + colOffset;

    if (nextColIdx >= this.columns.length) {
      nextColIdx = 0;
      nextRow++;
    } else if (nextColIdx < 0) {
      nextColIdx = this.columns.length - 1;
      nextRow = Math.max(0, nextRow - 1);
    }

    // Auto add rows on demand
    while (nextRow >= this.rows.length) {
      this.appendBlankRow();
    }

    const nextCol = this.columns[nextColIdx];
    if (nextCol) {
      this.focusCell(nextRow, nextCol.key);
    }
  }

  getColumn(colKey: string): StudioColumn | undefined {
    return this.columns.find(c => c.key === colKey);
  }

  // ==========================================
  // AUTOMATIC ROW ADDITION & BUFFERING
  // ==========================================

  appendBlankRow(): void {
    const cells: { [k: string]: any } = {};
    for (const col of this.columns) {
      cells[col.key] = { value: '', isValid: true };
    }
    this.rows.push({
      rowNum: this.rows.length + 1,
      cells: cells,
      hasError: false,
      errorCount: 0
    });
  }

  autoBufferRows(count: number = 10): void {
    for (let i = 0; i < count; i++) {
      this.appendBlankRow();
    }
  }

  // ==========================================
  // RIGHT-CLICK CONTEXT MENU (NO ACTION COLUMN)
  // ==========================================

  onCellContextMenu(event: MouseEvent, rowIndex: number, colKey: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuPos = { x: event.clientX, y: event.clientY };
    this.contextMenuTargetRow = rowIndex;
    this.isContextMenuOpen = true;
    this.focusCell(rowIndex, colKey);
  }

  onRowNumberContextMenu(event: MouseEvent, rowIndex: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenuPos = { x: event.clientX, y: event.clientY };
    this.contextMenuTargetRow = rowIndex;
    this.selectedRowIndex = rowIndex;
    this.isContextMenuOpen = true;
    this.focusCell(rowIndex, this.columns[0]?.key);
  }

  closeContextMenu(): void {
    this.isContextMenuOpen = false;
    this.contextMenuTargetRow = null;
  }

  insertRowAbove(): void {
    if (this.contextMenuTargetRow === null) return;
    const idx = this.contextMenuTargetRow;
    const cells: { [k: string]: any } = {};
    for (const col of this.columns) {
      cells[col.key] = { value: '', isValid: true };
    }
    this.rows.splice(idx, 0, {
      rowNum: idx + 1,
      cells: cells,
      hasError: false,
      errorCount: 0
    });
    this.reindexRows();
    this.closeContextMenu();
    this.toastr.info(`रो ${idx + 1} के ऊपर नई रो जोड़ी गई।`);
  }

  insertRowBelow(): void {
    if (this.contextMenuTargetRow === null) return;
    const idx = this.contextMenuTargetRow + 1;
    const cells: { [k: string]: any } = {};
    for (const col of this.columns) {
      cells[col.key] = { value: '', isValid: true };
    }
    this.rows.splice(idx, 0, {
      rowNum: idx + 1,
      cells: cells,
      hasError: false,
      errorCount: 0
    });
    this.reindexRows();
    this.closeContextMenu();
    this.toastr.info(`रो ${idx} के नीचे नई रो जोड़ी गई।`);
  }

  deleteTargetRow(): void {
    if (this.contextMenuTargetRow === null) return;
    if (this.rows.length <= 1) {
      this.toastr.warning('कम से कम एक रो होना अनिवार्य है।');
      return;
    }
    const idx = this.contextMenuTargetRow;
    this.rows.splice(idx, 1);
    this.reindexRows();
    this.closeContextMenu();
    if (this.mode === 'intelligent') {
      this.runAudit();
    }
    this.toastr.info(`रो ${idx + 1} हटा दी गई है।`);
  }

  clearTargetRow(): void {
    if (this.contextMenuTargetRow === null) return;
    const row = this.rows[this.contextMenuTargetRow];
    if (row) {
      for (const col of this.columns) {
        if (row.cells[col.key]) {
          row.cells[col.key].value = '';
          row.cells[col.key].isValid = true;
          row.cells[col.key].errorMessage = undefined;
        }
      }
      row.hasError = false;
      row.errorCount = 0;
    }
    this.closeContextMenu();
    if (this.mode === 'intelligent') {
      this.runAudit();
    }
    this.toastr.info('रो की सामग्री खाली कर दी गई।');
  }

  duplicateTargetRow(): void {
    if (this.contextMenuTargetRow === null) return;
    const source = this.rows[this.contextMenuTargetRow];
    if (!source) return;

    const clonedCells: { [k: string]: any } = {};
    for (const col of this.columns) {
      clonedCells[col.key] = {
        value: source.cells[col.key]?.value ?? '',
        isValid: true
      };
    }
    const insertIdx = this.contextMenuTargetRow + 1;
    this.rows.splice(insertIdx, 0, {
      rowNum: insertIdx + 1,
      cells: clonedCells,
      hasError: false,
      errorCount: 0
    });
    this.reindexRows();
    this.closeContextMenu();
    if (this.mode === 'intelligent') {
      this.runAudit();
    }
    this.toastr.success('रो की प्रतिलिपि (Copy) बना दी गई।');
  }

  reindexRows(): void {
    this.rows.forEach((r, idx) => r.rowNum = idx + 1);
  }

  // ==========================================
  // BULK EXCEL PASTE SUPPORT (Copy from Excel)
  // ==========================================

  onGridPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const text = clipboardData.getData('text');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) {
      return;
    }

    event.preventDefault();
    const startRow = this.activeRowIndex !== null ? this.activeRowIndex : 0;
    const startColIdx = this.activeColKey ? this.columns.findIndex(c => c.key === this.activeColKey) : 0;

    const lines = text.split(/\r?\n/).filter(line => line.length > 0);
    for (let r = 0; r < lines.length; r++) {
      const targetRowIdx = startRow + r;
      while (targetRowIdx >= this.rows.length) {
        this.appendBlankRow();
      }

      const rowCells = lines[r].split('\t');
      for (let c = 0; c < rowCells.length; c++) {
        const targetColIdx = startColIdx + c;
        if (targetColIdx < this.columns.length) {
          const col = this.columns[targetColIdx];
          this.rows[targetRowIdx].cells[col.key].value = rowCells[c].trim();
        }
      }
    }

    this.closeActiveEditor();

    if (this.mode === 'intelligent') {
      this.runAudit();
    }

    this.toastr.success(`एक्सेल से ${lines.length} रो सफलतापूर्वक पेस्ट की गईं!`, 'Paste Successful');
  }

  clearAllRows(): void {
    Swal.fire({
      title: 'क्या आप पूरी शीट खाली करना चाहते हैं?',
      text: 'शीट का सभी डेटा मिटा दिया जाएगा।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'हाँ, खाली करें',
      cancelButtonText: 'रद्द करें'
    }).then((res) => {
      if (res.isConfirmed) {
        if (this.currentFormat) {
          this.rows = this.studioService.generateBlankRows(this.currentFormat, 35, false); // false = NO SAMPLE DATA!
        } else {
          this.initGenericNormalSheet(10, 35);
        }
        this.selectedRowIndex = null;
        this.batchFixSuggestion = null;
        this.resetAudit();
        this.toastr.info('शीट खाली कर दी गई है (सैंपल डेटा हटा दिया गया)।', 'Sheet Cleared');
      }
    });
  }

  // ==========================================
  // FILE IMPORT (.xlsx, .csv) & EXPORT
  // ==========================================

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          this.toastr.error('फाइल खाली है या समर्थित नहीं है।');
          return;
        }

        this.rawSheetMatrix = rawJson;
        this.loadRawMatrixIntoSheet(rawJson, file.name);
      } catch (err) {
        this.toastr.error('फाइल पढ़ने में त्रुटि: अमान्य एक्सेल फॉर्मेट।');
      }
    };
    reader.readAsBinaryString(file);
    event.target.value = '';
  }

  loadRawMatrixIntoSheet(matrix: any[][], fileName: string): void {
    if (!matrix || matrix.length === 0) return;
    const headerRow = matrix[0] || [];
    const dataRows = matrix.slice(1);

    if (this.currentFormat) {
      // Map rows directly to current format columns
      this.rows = [];
      for (let r = 0; r < dataRows.length; r++) {
        const rowArr = dataRows[r];
        if (!rowArr || rowArr.length === 0 || rowArr.every(c => c === '' || c === undefined || c === null)) continue;
        const cells: { [k: string]: any } = {};
        for (let c = 0; c < this.columns.length; c++) {
          const col = this.columns[c];
          cells[col.key] = { value: rowArr[c] !== undefined ? String(rowArr[c]).trim() : '', isValid: true };
        }
        this.rows.push({
          rowNum: this.rows.length + 1,
          cells: cells,
          hasError: false,
          errorCount: 0
        });
      }
      while (this.rows.length < 35) {
        this.appendBlankRow();
      }
      if (this.mode === 'intelligent') {
        this.runAudit();
      }
      this.toastr.success(`'${fileName}' से ${dataRows.length} पंक्तियाँ लोड हो गईं!`, 'File Opened');
    } else {
      // Free Generic Sheet: Populate columns directly from the file's headers
      this.columns = headerRow.map((h: any, idx: number) => ({
        key: `col_${idx}`,
        name: h ? String(h).trim() : `Col ${this.studioService.getColumnLetter(idx)}`,
        type: 'text'
      }));
      this.initColumnWidths();

      this.rows = [];
      for (let r = 0; r < dataRows.length; r++) {
        const rowArr = dataRows[r];
        if (!rowArr || rowArr.length === 0 || rowArr.every(c => c === '' || c === undefined || c === null)) continue;
        const cells: { [k: string]: any } = {};
        for (let c = 0; c < this.columns.length; c++) {
          const col = this.columns[c];
          cells[col.key] = { value: rowArr[c] !== undefined ? String(rowArr[c]).trim() : '', isValid: true };
        }
        this.rows.push({
          rowNum: this.rows.length + 1,
          cells: cells,
          hasError: false,
          errorCount: 0
        });
      }
      while (this.rows.length < 35) {
        this.appendBlankRow();
      }
      this.toastr.success(`'${fileName}' से ${dataRows.length} पंक्तियाँ और ${this.columns.length} कॉलम लोड हो गए!`, 'File Opened');
    }
    this.updateCoordinate(0, this.columns[0]?.key);
  }

  openScannerModal(): void {
    this.rawSheetMatrix = [
      this.columns.map(c => c.name),
      ...this.rows.map(r => this.columns.map(c => r.cells[c.key]?.value || ''))
    ];
    this.showScannerModal = true;
  }

  onScannerApply(payload: { format: StudioFormat; columnMap: { [sheetIndex: number]: string }; headerRow: number }): void {
    this.showScannerModal = false;
    const format = payload.format;
    const colMap = payload.columnMap;
    const headerRow = payload.headerRow;

    this.currentFormat = format;
    this.columns = [...format.columns];
    this.initColumnWidths();
    this.rows = [];

    const dataRows = this.rawSheetMatrix.slice(headerRow + 1);
    for (let r = 0; r < dataRows.length; r++) {
      const rowArr = dataRows[r];
      if (!rowArr || rowArr.length === 0 || rowArr.every((c: any) => c === '' || c === undefined || c === null)) {
        continue;
      }

      const cells: { [k: string]: any } = {};
      for (const col of this.columns) {
        cells[col.key] = { value: '', isValid: true };
      }

      for (const sheetColIdxStr of Object.keys(colMap)) {
        const sheetColIdx = Number(sheetColIdxStr);
        const targetKey = colMap[sheetColIdx];
        if (targetKey && cells[targetKey]) {
          cells[targetKey].value = rowArr[sheetColIdx] !== undefined ? rowArr[sheetColIdx] : '';
        }
      }

      this.rows.push({
        rowNum: this.rows.length + 1,
        cells: cells,
        hasError: false,
        errorCount: 0
      });
    }

    if (this.rows.length === 0) {
      this.rows = this.studioService.generateBlankRows(format, 35);
    }

    this.setMode('intelligent');
    this.toastr.success(`फॉर्मेट '${format.title}' सफलतापूर्वक अटैच हो गया!`);
  }

  exportToExcel(): void {
    const filename = this.currentFormat ? `HK_${this.currentFormat.id}` : 'HK_Excel_Sheet';
    this.studioService.exportExcel(this.columns, this.rows, filename);
    this.toastr.success('एक्सेल फाइल सफलतापूर्वक डाउनलोड हो गई!', 'Export Done');
  }

  // ==========================================
  // DATABASE DATA LOADING PIPELINE (All Formats)
  // ==========================================

  async loadDatabaseData(): Promise<void> {
    if (!this.currentFormat) {
      this.toastr.warning('कृपया पहले कोई फॉर्मेट चुनें (Please select a format first)', 'No Format Selected');
      return;
    }

    if (this.rows.some(r => this.rowHasData(r))) {
      const confirm = await Swal.fire({
        title: 'डेटाबेस से लोड करें?',
        text: `वर्तमान शीट में डेटा मौजूद है। डेटाबेस से लोड करने पर यह डेटा बदल जाएगा। क्या आप जारी रखना चाहते हैं?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'हाँ, लोड करें',
        cancelButtonText: 'रद्द करें'
      });
      if (!confirm.isConfirmed) return;
    }

    const fmtId = this.currentFormat.id;

    if (fmtId === 'bachat') {
      await this.loadBachatDataFromDb();
    } else if (fmtId === 'mm') {
      this.loadMmDataFromDb();
    } else if (fmtId === 'item') {
      this.loadItemDataFromDb();
    } else if (fmtId === 'subitem') {
      this.loadSubitemDataFromDb();
    } else if (fmtId === 'vehicle') {
      this.loadVehicleDataFromDb();
    } else if (fmtId === 'pbk') {
      this.loadPbkDataFromDb();
    } else if (fmtId === 'nimitt') {
      this.loadNimittDataFromDb();
    } else if (fmtId === 'product') {
      this.loadProductDataFromDb();
    } else if (fmtId === 'category') {
      this.loadCategoryDataFromDb();
    } else if (fmtId === 'unit') {
      this.loadUnitDataFromDb();
    } else if (fmtId === 'state') {
      this.loadStateDataFromDb();
    } else if (fmtId === 'city') {
      this.loadCityDataFromDb();
    } else if (fmtId === 'district') {
      this.loadDistrictDataFromDb();
    } else if (fmtId === 'support_list') {
      this.loadSupportListDataFromDb();
    } else if (fmtId === 'subitem_list') {
      this.loadSubitemListDataFromDb();
    } else if (fmtId === 'variant') {
      this.loadVariantDataFromDb();
    } else if (fmtId === 'attribute') {
      this.loadAttributeDataFromDb();
    } else if (fmtId === 'attributes_value') {
      this.loadAttributeValueDataFromDb();
    } else if (fmtId === 'rel_item_category') {
      this.loadRelItemCategoryDataFromDb();
    } else if (fmtId === 'rel_subitem_category') {
      this.loadRelSubitemCategoryDataFromDb();
    } else if (fmtId === 'jawak') {
      this.loadJawakDataFromDb();
    } else {
      this.toastr.info(`'${this.currentFormat.title}' के लिए डेटाबेस लोडिंग उपलब्ध नहीं है।`);
    }
  }

  private async loadBachatDataFromDb(): Promise<void> {
    if ((!this.mms || this.mms.length === 0) && (!this.gs.Lists?.mm || this.gs.Lists.mm.length === 0)) {
      await this.ensureListsLoaded();
    }
    const mms: any[] = (this.mms && this.mms.length > 0) ? this.mms : (this.gs.Lists?.mm || []);

    if (mms.length > 0) {
      this.selectedMmIdForLoad = this.auth.webUser?.settings?.defaultMM ? String(this.auth.webUser.settings.defaultMM) : 'ALL';
      this.showMmSelectModal = true;
      return;
    }

    this.executeFetchBachat('ALL');
  }

  confirmMmAndLoadBachat(): void {
    this.showMmSelectModal = false;
    this.executeFetchBachat(this.selectedMmIdForLoad || 'ALL');
  }

  private async ensureListsLoaded(): Promise<any> {
    if (this.gs.Lists && this.gs.Lists.mm) {
      this.mms = this.gs.Lists.mm;
      return this.gs.Lists;
    }
    return new Promise((resolve) => {
      this.gs.observeList().subscribe({
        next: (res: any) => {
          if (res && res.mm) {
            this.mms = res.mm;
          } else if (this.gs.Lists && this.gs.Lists.mm) {
            this.mms = this.gs.Lists.mm;
          }
          resolve(res);
        },
        error: (err: any) => {
          this.toastr.error('मास्टर सूचियां लोड करने में त्रुटि आई: ' + (err?.error?.message || err?.message || 'Network error'));
          resolve(null);
        }
      });
    });
  }

  private executeFetchBachat(selectedMmId: string): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('BACHAT') + this.auth.webUser.dept_id).subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          let stockList: any[] = res.result || [];
          if (selectedMmId !== 'ALL') {
            stockList = stockList.filter((s: any) => String(s.mm_id) === String(selectedMmId));
          }

          if (stockList.length === 0) {
            this.toastr.info('चयनित मिनी मधुबन के लिए कोई स्टॉक रिकॉर्ड्स नहीं मिले।');
            return;
          }

          const todayStr = this.getTodayDateFormatted();
          const mappedRows = stockList.map((row: any, idx: number) => ({
            sn: idx + 1,
            date: todayStr,
            mm: row.mm_hin || row.mm_eng || '',
            item: row.item_hin || row.item_eng || '',
            subitem: row.subitem_hin || '',
            unit: row.unit_short || row.unit_full || '',
            condition: row.condition_hin || 'अच्छा',
            sw_qty: row.Stock != null ? row.Stock : (row.bachat != null ? row.bachat : 0),
            qty: '', // Blank for user physical count entry
            company_name: row.company_name || '',
            actual_amt: row.actual_amt || '',
            item_detail: row.item_detail || '',
            description: row.description || '',
            nimmit: row.nimitt_hin || ''
          }));

          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mappedRows);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(
            `${mappedRows.length} स्टॉक रिकॉर्ड्स लोड किए गए। भौतिक मात्रा (Qty) कॉलम खाली रखा गया है ताकि आप गणना दर्ज कर सकें।`,
            'Bachat Stock Loaded'
          );
        } else {
          this.toastr.error('स्टॉक डेटा प्राप्त नहीं हो सका।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('स्टॉक डेटा लोड करने में त्रुटि आई: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private loadMmDataFromDb(): void {
    const mms = this.gs.Lists?.mm || [];
    if (mms.length === 0) {
      this.toastr.info('डेटाबेस में कोई मि.म. रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    const mapped = mms.map((m: any) => ({
      mm_hin: m.mm_hin || '',
      mm_eng: m.mm_eng || '',
      mm_roman: m.mm_roman || '',
      mm_code: m.mm_code || '',
      state: m.state_hin || m.state || '',
      opening_date: m.opening_date ? this.gs.formatDisplayDate(m.opening_date) : '',
      nimitt: m.nimitt_hin || m.nimitt || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} मि.म. रिकॉर्ड्स डेटाबेस से लोड किए गए।`);
  }

  private loadItemDataFromDb(): void {
    const items = this.gs.Lists?.itemmix;
    if (items && items.length > 0) {
      this.applyLoadedItems(items);
    } else {
      this.isLoadingData = true;
      this.http.get(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id).subscribe({
        next: (res: any) => {
          this.isLoadingData = false;
          if (res && res.success && res.result) {
            this.applyLoadedItems(res.result);
          } else {
            this.toastr.error('आइटम सूची प्राप्त नहीं हो सकी।');
          }
        },
        error: (err: any) => {
          this.isLoadingData = false;
          this.toastr.error('आइटम लोड करने में त्रुटि आई: ' + (err?.error?.message || err?.message || 'Network error'));
        }
      });
    }
  }

  private applyLoadedItems(items: any[]): void {
    const mapped = items.map((it: any) => ({
      item_hin: it.item_hin || '',
      item_eng: it.item_eng || '',
      item_roman: it.item_roman || '',
      item_code: it.item_code || '',
      unit: it.unit_short || it.unit || '',
      aliases: Array.isArray(it.aliases) ? it.aliases.join(', ') : (it.aliases || ''),
      min_rate: it.min_rate || '',
      max_rate: it.max_rate || '',
      rate_2025: it.rate_2025 || '',
      rate_2026: it.rate_2026 || it.rate || '',
      extra_note: it.extra_note || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} आइटम्स डेटाबेस से लोड किए गए।`);
  }

  private loadSubitemDataFromDb(): void {
    const items = this.gs.Lists?.itemmix || [];
    const mapped: any[] = [];
    for (const it of items) {
      if (it.subitems && Array.isArray(it.subitems)) {
        for (const sub of it.subitems) {
          mapped.push({
            item_hin: it.item_hin || it.item_eng || '',
            subitem_hin: sub.subitem_hin || '',
            subitem_eng: sub.subitem_eng || '',
            unit: sub.unit_short || it.unit_short || '',
            rate_2026: sub.rate_2026 || sub.rate || ''
          });
        }
      }
    }
    if (mapped.length === 0) {
      this.toastr.info('कोई सबआइटम रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} सबआइटम्स लोड किए गए।`);
  }

  private loadVehicleDataFromDb(): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('VEHICLE') + this.auth.webUser.dept_id).subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          const vList = res.result || [];
          const mapped = vList.map((v: any) => ({
            mm: v.mm_hin || v.mm_eng || '',
            gadi_num: v.gadi_num || '',
            gadi_name: v.gadi_name || '',
            vehicle_type: v.vehicle_type || '',
            fuel_type: v.fuel_type || '',
            owner_name: v.owner_name || '',
            aawak_type: v.aawak_type_hin || v.aawak_type || '',
            rc_date: v.rc_date ? this.gs.formatDisplayDate(v.rc_date) : '',
            rc_exp_date: v.rc_exp_date ? this.gs.formatDisplayDate(v.rc_exp_date) : '',
            rc_amount: v.rc_amount || '',
            insurance_date: v.insurance_date ? this.gs.formatDisplayDate(v.insurance_date) : '',
            insurance_exp_date: v.insurance_exp_date ? this.gs.formatDisplayDate(v.insurance_exp_date) : '',
            insurance_amount: v.insurance_amount || '',
            puc_date: v.puc_date ? this.gs.formatDisplayDate(v.puc_date) : '',
            puc_exp_date: v.puc_exp_date ? this.gs.formatDisplayDate(v.puc_exp_date) : '',
            puc_amount: v.puc_amount || ''
          }));
          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(`${mapped.length} वाहन रिकॉर्ड्स लोड किए गए।`);
        } else {
          this.toastr.error('वाहन रिकॉर्ड्स लोड नहीं हो सके।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('वाहन लोड करने में त्रुटि आई: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private loadPbkDataFromDb(): void {
    const pbks = this.gs.Lists?.pbk || [];
    if (pbks.length === 0) {
      this.toastr.info('कोई सेवाधारी रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }

    const states = this.gs.Lists?.state || [];
    const districts = this.gs.Lists?.district || [];
    const mms = this.gs.Lists?.mm || [];

    const stateMap = new Map<string, string>();
    for (const s of states) {
      const name = s.state_hin || s.state_eng || s.state || '';
      if (s._id != null) stateMap.set(String(s._id), name);
      if (s.state_id != null) stateMap.set(String(s.state_id), name);
    }

    const distMap = new Map<string, string>();
    for (const d of districts) {
      const name = d.district_hin || d.district_eng || d.district || '';
      if (d._id != null) distMap.set(String(d._id), name);
      if (d.district_id != null) distMap.set(String(d.district_id), name);
    }

    const mmMap = new Map<string, string>();
    for (const m of mms) {
      const name = m.mm_hin || m.mm_eng || '';
      if (m._id != null) mmMap.set(String(m._id), name);
      if (m.mm_id != null) mmMap.set(String(m.mm_id), name);
    }

    const mapped = pbks.map((p: any) => ({
      roll_no: p.roll_no || '',
      pbk_hin: p.pbk_hin || '',
      pbk_eng: p.pbk_eng || '',
      _gender: p._gender || p.gender || '',
      state: p.state_hin || p.state || (p.state_id != null ? stateMap.get(String(p.state_id)) || '' : ''),
      district: p.district_hin || p.district || (p.district_id != null ? distMap.get(String(p.district_id)) || '' : ''),
      mo_no: p.mo_no || '',
      class_mm: p.class_mm_hin || p.class_mm || (p.class_mm_id != null ? mmMap.get(String(p.class_mm_id)) || '' : '')
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} सेवाधारी रिकॉर्ड्स लोड किए गए।`);
  }

  private loadNimittDataFromDb(): void {
    const nimitts = this.gs.Lists?.nimitt || [];
    if (nimitts.length === 0) {
      this.toastr.info('कोई निमित्त रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    const states = this.gs.Lists?.state || [];
    const stateMap = new Map<string, string>();
    for (const s of states) {
      const name = s.state_hin || s.state_eng || s.state || '';
      if (s._id != null) stateMap.set(String(s._id), name);
      if (s.state_id != null) stateMap.set(String(s.state_id), name);
    }
    const mapped = nimitts.map((n: any) => ({
      roll_no: n.roll_no || '',
      nimitt_hin: n.nimitt_hin || '',
      nimitt_eng: n.nimitt_eng || '',
      gender: n.gender || '',
      state: n.state_hin || n.state || (n.state_id != null ? stateMap.get(String(n.state_id)) || '' : ''),
      relative_name: n.relative_name || '',
      townarea: n.townarea || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} निमित्त रिकॉर्ड्स लोड किए गए।`);
  }

  private loadProductDataFromDb(): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id).subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          const prList = res.result || [];
          const mapped = prList.map((pr: any) => ({
            sr_num: pr.sr_num || '',
            product_code: pr.product_code || '',
            purchase_date: pr.purchase_date ? this.gs.formatDisplayDate(pr.purchase_date) : '',
            mm: pr.mm_hin || pr.mm || '',
            item: pr.item_hin || pr.item || '',
            subitem: pr.subitem_hin || pr.subitem || '',
            qty: pr.qty != null ? pr.qty : '',
            unit: pr.unit_short || pr.unit || '',
            aawak_type: pr.aawak_type_hin || pr.aawak_type || '',
            company_name: pr.company_name || '',
            modal_name: pr.modal_name || '',
            condition: pr.condition_hin || pr.condition || '',
            warranty_period: pr.warranty_period || '',
            warranty_from: pr.warranty_from || '',
            purchase_from: pr.purchase_from || '',
            purchased_by: pr.purchased_by || '',
            product_detail: pr.product_detail || '',
            accessories: pr.accessories || '',
            nimmit: pr.nimitt_hin || pr.nimmit || ''
          }));
          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(`${mapped.length} उत्पाद / उपकरण रिकॉर्ड्स लोड किए गए।`);
        } else {
          this.toastr.error('उत्पाद रिकॉर्ड्स लोड नहीं हो सके।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('उत्पाद लोड करने में त्रुटि: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private loadCategoryDataFromDb(): void {
    const cats = this.gs.Lists?.category || [];
    if (cats.length === 0) {
      this.toastr.info('कोई श्रेणी उपलब्ध नहीं है।');
      return;
    }
    const mapped = cats.map((c: any) => ({
      category_hin: c.category_hin || '',
      category_eng: c.category_eng || '',
      category_roman: c.category_roman || '',
      parent_category: c.parent_category_hin || c.parent_category || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.markActiveSheetLoaded(mapped.length);
    this.toastr.success(`${mapped.length} श्रेणियां लोड की गईं।`);
  }

  private loadUnitDataFromDb(): void {
    const units = this.gs.Lists?.unit || [];
    if (units.length === 0) {
      this.toastr.info('कोई इकाई रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    const mapped = units.map((u: any) => ({
      unit_short: u.unit_short || u.unit || '',
      unit_full: u.unit_full || u.full_name || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.markActiveSheetLoaded(mapped.length);
    this.toastr.success(`${mapped.length} इकाइयां लोड की गईं।`);
  }

  private loadStateDataFromDb(): void {
    const states = this.gs.Lists?.state || [];
    if (states.length === 0) {
      this.toastr.info('कोई राज्य रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    const mapped = states.map((s: any) => ({
      state_hin: s.state_hin || s.state || '',
      state_eng: s.state_eng || s.nameeng || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.markActiveSheetLoaded(mapped.length);
    this.toastr.success(`${mapped.length} राज्य लोड किए गए।`);
  }

  private loadCityDataFromDb(): void {
    const cities = this.gs.Lists?.city || [];
    if (cities.length === 0) {
      this.toastr.info('कोई शहर रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    const states = this.gs.Lists?.state || [];
    const stateMap = new Map<string, string>();
    for (const s of states) {
      const name = s.state_hin || s.state_eng || s.state || '';
      if (s._id != null) stateMap.set(String(s._id), name);
      if (s.state_id != null) stateMap.set(String(s.state_id), name);
    }
    const mapped = cities.map((c: any) => ({
      city_hin: c.city_hin || c.city || '',
      city_eng: c.city_eng || c.nameeng || '',
      state: c.state_hin || c.state || (c.state_id != null ? stateMap.get(String(c.state_id)) || '' : '')
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.markActiveSheetLoaded(mapped.length);
    this.toastr.success(`${mapped.length} शहर लोड किए गए।`);
  }

  private loadDistrictDataFromDb(): void {
    const dists = this.gs.Lists?.district || [];
    if (dists.length === 0) {
      this.toastr.info('कोई जिला उपलब्ध नहीं है।');
      return;
    }
    const states = this.gs.Lists?.state || [];
    const stateMap = new Map<string, string>();
    for (const s of states) {
      const name = s.state_hin || s.state_eng || s.state || '';
      if (s._id != null) stateMap.set(String(s._id), name);
      if (s.state_id != null) stateMap.set(String(s.state_id), name);
    }
    const mapped = dists.map((d: any) => ({
      district_hin: d.district_hin || '',
      district_eng: d.district_eng || '',
      state: d.state_hin || d.state || (d.state_id != null ? stateMap.get(String(d.state_id)) || '' : '')
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} जिले लोड किए गए।`);
  }

  private loadSupportListDataFromDb(): void {
    const mapped: any[] = [];
    const types = ['aawak_type', 'jawak_type', 'condition', 'gender', 'relation', 'usage_list'];
    for (const t of types) {
      const list = this.gs.Lists?.[t] || [];
      for (const sl of list) {
        mapped.push({
          list_type: t,
          list_name_hin: sl.list_name_hin || '',
          list_name_eng: sl.list_name_eng || '',
          list_name_roman: sl.list_name_roman || '',
          active: sl.active != null ? sl.active : 1
        });
      }
    }
    if (mapped.length === 0) {
      this.toastr.info('कोई सपोर्ट लिस्ट रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} सपोर्ट लिस्ट रिकॉर्ड्स लोड किए गए।`);
  }

  private loadSubitemListDataFromDb(): void {
    const sList = this.gs.Lists?.subitem_list || [];
    if (sList.length === 0) {
      this.toastr.info('कोई सबआइटम लिस्ट रिकॉर्ड्स उपलब्ध नहीं हैं।');
      return;
    }
    const mapped = sList.map((s: any) => ({
      subitem_hin: s.subitem_hin || '',
      subitem_eng: s.subitem_eng || '',
      subitem_roman: s.subitem_roman || '',
      extra_note: s.extra_note || ''
    }));
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} सबआइटम लिस्ट रिकॉर्ड्स लोड किए गए।`);
  }

  private loadVariantDataFromDb(): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('VARIANT') + this.auth.webUser.dept_id).subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          const vList = res.result || [];
          const mapped = vList.map((v: any) => ({
            item: v.item_hin || v.item || '',
            display_name_hin: v.display_name_hin || '',
            display_name_eng: v.display_name_eng || '',
            display_name_roman: v.display_name_roman || '',
            attributes_hin: v.attributes_hin || v.attribute_values || '',
            sku: v.sku || '',
            unit: v.unit_short || v.unit || '',
            min_rate: v.min_rate || '',
            max_rate: v.max_rate || ''
          }));
          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(`${mapped.length} वेरिएंट रिकॉर्ड्स लोड किए गए।`);
        } else {
          this.toastr.error('वेरिएंट लोड नहीं हो सके।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('वेरिएंट लोड करने में त्रुटि: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private loadAttributeDataFromDb(): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('VARIANT') + 'attributes').subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          const aList = res.result || [];
          const mapped = aList.map((a: any) => ({
            attribute_hin: a.attribute_hin || '',
            attribute_eng: a.attribute_eng || '',
            attribute_roman: a.attribute_roman || ''
          }));
          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(`${mapped.length} एट्रीब्यूट्स लोड किए गए।`);
        } else {
          this.toastr.error('एट्रीब्यूट्स लोड नहीं हो सके।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('एट्रीब्यूट्स लोड करने में त्रुटि: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private loadAttributeValueDataFromDb(): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('VARIANT') + 'attr_values').subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          const avList = res.result || [];
          const mapped = avList.map((av: any) => ({
            attribute: av.attribute_hin || av.attribute || '',
            attribute_value_hin: av.attribute_value_hin || '',
            attribute_value_eng: av.attribute_value_eng || '',
            attribute_value_roman: av.attribute_value_roman || ''
          }));
          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(`${mapped.length} एट्रीब्यूट वैल्यूज लोड की गईं।`);
        } else {
          this.toastr.error('एट्रीब्यूट वैल्यूज लोड नहीं हो सकीं।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('एट्रीब्यूट वैल्यूज लोड करने में त्रुटि: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private loadRelItemCategoryDataFromDb(): void {
    const items = this.gs.Lists?.itemmix || [];
    const mapped: any[] = [];
    for (const it of items) {
      if (it.icategories && Array.isArray(it.icategories)) {
        for (const cat of it.icategories) {
          mapped.push({
            item: it.item_hin || it.item_eng || '',
            category: cat.category_hin || cat.category_eng || ''
          });
        }
      }
    }
    if (mapped.length === 0) {
      this.toastr.info('कोई आइटम-श्रेणी संबंध रिकॉर्ड्स नहीं मिले।');
      return;
    }
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} आइटम-श्रेणी संबंध लोड किए गए।`);
  }

  private loadRelSubitemCategoryDataFromDb(): void {
    const items = this.gs.Lists?.itemmix || [];
    const mapped: any[] = [];
    for (const it of items) {
      if (it.subitems && Array.isArray(it.subitems)) {
        for (const sub of it.subitems) {
          const scats = sub.scategories || sub.categories || [];
          if (Array.isArray(scats)) {
            for (const cat of scats) {
              mapped.push({
                item: it.item_hin || it.item_eng || '',
                subitem: sub.subitem_hin || sub.subitem_eng || '',
                category: cat.category_hin || cat.category_eng || ''
              });
            }
          }
        }
      }
    }
    if (mapped.length === 0) {
      this.toastr.info('कोई सबआइटम-श्रेणी संबंध रिकॉर्ड्स नहीं मिले।');
      return;
    }
    this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
    if (this.mode === 'intelligent') {
      this.runAudit();
    } else {
      this.resetAudit();
    }
    this.toastr.success(`${mapped.length} सबआइटम-श्रेणी संबंध लोड किए गए।`);
  }

  private loadJawakDataFromDb(): void {
    this.isLoadingData = true;
    this.http.get(this.api.getUrl('JAWAK') + this.auth.webUser.dept_id).subscribe({
      next: (res: any) => {
        this.isLoadingData = false;
        if (res && res.success) {
          const jList = res.result || [];
          const mapped = jList.map((jw: any) => ({
            date: jw.date ? this.gs.formatDisplayDate(jw.date) : '',
            mm: jw.mm_hin || '',
            jawak_mm: jw.jawak_mm_hin || '',
            pbk: jw.pbk_hin || '',
            item: jw.item_hin || '',
            subitem: jw.subitem_hin || '',
            qty: jw.qty || '',
            unit: jw.unit_short || '',
            condition: jw.condition_hin || '',
            jawak_type: jw.jawak_type_hin || '',
            voucher_no: jw.vch_num || jw.voucher_no || '',
            company_name: jw.company_name || ''
          }));
          this.rows = this.studioService.buildRowsFromRawObjects(this.currentFormat!, mapped);
          if (this.mode === 'intelligent') {
            this.runAudit();
          } else {
            this.resetAudit();
          }
          this.toastr.success(`${mapped.length} जावक रिकॉर्ड्स लोड किए गए।`);
        } else {
          this.toastr.error('जावक रिकॉर्ड्स लोड नहीं हो सके।');
        }
      },
      error: (err: any) => {
        this.isLoadingData = false;
        this.toastr.error('जावक लोड करने में त्रुटि: ' + (err?.error?.message || err?.message || 'Network error'));
      }
    });
  }

  private getTodayDateFormatted(): string {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // ==========================================
  // SAFE SOFTWARE IMPORT PIPELINE HANDOFF
  // ==========================================

  proceedToSoftwareImport(): void {
    if (!this.currentFormat) {
      this.toastr.warning('कृपया पहले "Scan & Attach Format" करें ताकि सॉफ्टवेयर सही फील्ड्स पहचान सके।', 'Format Missing');
      this.openScannerModal();
      return;
    }

    this.runAudit();

    if (this.auditSummary.badCells > 0) {
      Swal.fire({
        title: `शीट में ${this.auditSummary.badCells} गलत सेल्स (Bad Cells) हैं!`,
        text: 'क्या आप पहले गलतियों को ठीक करना चाहते हैं, या सीधे सॉफ्टवेयर इम्पोर्ट विज़ार्ड में आगे बढ़ना चाहते हैं?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'सॉफ्टवेयर इम्पोर्ट में आगे बढ़ें',
        cancelButtonText: 'पहले गलतियाँ सुधारेंगे'
      }).then((res) => {
        if (res.isConfirmed) {
          this.launchSoftwareImportWizard();
        }
      });
    } else {
      this.launchSoftwareImportWizard();
    }
  }

  launchSoftwareImportWizard(): void {
    const cleanData = this.studioService.prepareForImport(this.columns, this.rows);
    if (cleanData.length === 0) {
      this.toastr.warning('शीट में कोई डेटा उपलब्ध नहीं है।');
      return;
    }

    this.importPayload = cleanData;
    this.importTypeForModal = this.currentFormat?.name || 'bachat';
    this.showImportModal = true;
  }

  onImportWizardResponse(res: any): void {
    this.showImportModal = false;
    this.importPayload = null;
    this.toastr.success('सॉफ्टवेयर इम्पोर्ट विज़ार्ड प्रक्रिया पूर्ण हुई!');
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeContextMenu();
    this.isFormatMenuOpen = false;
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    if (event.altKey && (event.key === 'i' || event.key === 'I')) {
      event.preventDefault();
      this.toggleMode();
    }
    if (event.altKey && (event.key === 'e' || event.key === 'E')) {
      event.preventDefault();
      this.jumpToNextError();
    }

    // Row Copy (Ctrl+C / Cmd+C) when row header is selected
    if ((event.ctrlKey || event.metaKey) && (event.key === 'c' || event.key === 'C')) {
      if (this.selectedRowIndex !== null && this.activeRowIndex === null) {
        event.preventDefault();
        this.copySelectedRow();
      }
    }

    // Row Paste (Ctrl+V / Cmd+V) when row header is selected
    if ((event.ctrlKey || event.metaKey) && (event.key === 'v' || event.key === 'V')) {
      if (this.selectedRowIndex !== null && this.activeRowIndex === null) {
        event.preventDefault();
        this.pasteIntoSelectedRow();
      }
    }

    if (event.key === 'Escape') {
      this.selectedRowIndex = null;
      this.isFormatMenuOpen = false;
      this.closeContextMenu();
    }
  }
}
