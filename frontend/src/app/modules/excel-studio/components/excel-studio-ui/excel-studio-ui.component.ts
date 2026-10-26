import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { AutocompleteOption, StudioCell, StudioColumn, StudioFormat, StudioMode, StudioRow } from '../../models/excel-studio.model';
import { ExcelStudioService } from '../../services/excel-studio.service';
import { MasterIndexerService } from '../../services/master-indexer.service';
import { GlobalService } from 'src/app/services/global.service';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
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

  // Current State
  mode: StudioMode = 'normal'; // 'normal' | 'intelligent'
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

  constructor(
    public studioService: ExcelStudioService,
    public masterIndexer: MasterIndexerService,
    private toastr: ToastrService,
    public gs: GlobalService,
    public auth: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const bachatFmt = this.studioService.getFormat('bachat');
    if (bachatFmt) {
      this.loadFormat(bachatFmt, 'normal', true); // true = initial sample preview
    } else {
      this.initGenericNormalSheet();
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

  loadFormat(format: StudioFormat, targetMode: StudioMode = 'normal', includeSample: boolean = false): void {
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
    this.toastr.info(`'${format.title_hin}' लोड हो गया है।`, 'Format Loaded');
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
    this.mode = 'normal';
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
    this.toastr.success(`फॉर्मेट '${format.title_hin}' सफलतापूर्वक अटैच हो गया!`);
  }

  exportToExcel(): void {
    const filename = this.currentFormat ? `HK_${this.currentFormat.id}` : 'HK_Excel_Sheet';
    this.studioService.exportExcel(this.columns, this.rows, filename);
    this.toastr.success('एक्सेल फाइल सफलतापूर्वक डाउनलोड हो गई!', 'Export Done');
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
