/**
 * sutram-grid.component.ts
 * ─────────────────────────────────────────────────────────────
 * Interactive PrimeNG Virtual Table Component for Excel Editing.
 * Supports in-cell FK dropdown autocomplete, bilingual search,
 * cell modification tracking (eye-protect mode), new row highlighting,
 * and inline batch mistake resolution prompts.
 * ─────────────────────────────────────────────────────────────
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SutramExcelStateService } from '../../services/sutram-excel-state.service';
import { SutramHeaderConfig, SutramRow, SutramCell } from '../../models/sutram-excel.model';
import { SutramClipboardService } from '../../services/sutram-clipboard.service';
import { SutramAuditService } from '../../services/sutram-audit.service';
import { SutramRefCacheService, SutramRefOption } from '../../services/sutram-ref-cache.service';
import { cleanString } from '../../utils/normalization.utils';

interface InlinePromptState {
  visible: boolean;
  rowIdx: number;
  colKey: string;
  originalBadValue: string;
  newSelectedValue: any;
  newSelectedDisplay: string;
  matchingCount: number;
  saveToDictionary: boolean;
}

@Component({
  selector: 'sutram-grid',
  templateUrl: './sutram-grid.component.html',
  styleUrls: ['./sutram-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramGridComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() headers: SutramHeaderConfig[] = [];
  @Input() rows: SutramRow[] = [];
  @Input() filterOnlyErrors: boolean = false;
  @Input() enableDelete: boolean = true;

  @Output() cellChanged = new EventEmitter<{ rowIdx: number; colKey: string; value: any }>();
  @Output() solveAllTriggered = new EventEmitter<{
    colKey: string;
    badValue: string;
    resolvedDisplay: string;
    resolvedId?: any;
    saveToDict: boolean;
  }>();
  @Output() loadMore = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<any>();
  @Output() sortChanged = new EventEmitter<any>();

  // Autocomplete suggestions state
  public filteredSuggestions: SutramRefOption[] = [];

  // Inline "Solve All" prompt state
  public promptState: InlinePromptState = {
    visible: false,
    rowIdx: -1,
    colKey: '',
    originalBadValue: '',
    newSelectedValue: null,
    newSelectedDisplay: '',
    matchingCount: 0,
    saveToDictionary: true
  };

  // Excel Column Header Filter Popover State
  public activeFilterCol: SutramHeaderConfig | null = null;
  public filterChecklistSearch: string = '';
  public currentChecklistItems: Array<{ display: string; value: any; code?: string; count?: number }> = [];
  public selectedChecklistValues: Set<any> = new Set<any>();

  // Context menu items
  public contextMenuItems: any[] = [];
  public contextSelectedRow: SutramRow | null = null;

  private scrollCleanup?: () => void;

  constructor(
    public state: SutramExcelStateService,
    private clipboard: SutramClipboardService,
    private audit: SutramAuditService,
    public refCache: SutramRefCacheService,
    private el: ElementRef
  ) {
    this.initContextMenu();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['headers'] && this.headers) {
      const refTables = this.headers
        .filter(h => h.ref_table || h.type === 'ref')
        .map(h => h.ref_table!)
        .filter(Boolean);
      this.refCache.preloadTables(refTables);
    }
    if (changes['enableDelete']) {
      this.initContextMenu();
    }
  }

  public ngAfterViewInit(): void {
    const wrapper = this.el.nativeElement.querySelector('.p-datatable-wrapper');
    if (wrapper) {
      const scrollHandler = () => {
        if (wrapper.scrollTop + wrapper.clientHeight >= wrapper.scrollHeight - 150) {
          this.loadMore.emit();
        }
      };
      wrapper.addEventListener('scroll', scrollHandler, { passive: true });
      this.scrollCleanup = () => wrapper.removeEventListener('scroll', scrollHandler);
    }
  }

  public ngOnDestroy(): void {
    if (this.scrollCleanup) {
      this.scrollCleanup();
    }
  }

  private initContextMenu(): void {
    const items: any[] = [
      {
        label: 'कॉपी करें (Copy)',
        icon: 'pi pi-copy',
        command: () => this.copySelectedRow()
      },
      {
        label: 'ऊपर पंक्ति जोड़ें (Insert Row Above)',
        icon: 'pi pi-arrow-up',
        command: () => this.insertRowAbove()
      },
      {
        label: 'नीचे पंक्ति जोड़ें (Insert Row Below)',
        icon: 'pi pi-arrow-down',
        command: () => this.insertRowBelow()
      }
    ];

    if (this.enableDelete) {
      items.push(
        { separator: true },
        {
          label: 'पंक्ति हटाएं (Delete Row)',
          icon: 'pi pi-trash',
          command: () => this.deleteSelectedRow()
        }
      );
    }

    this.contextMenuItems = items;
  }

  public get visibleRows(): SutramRow[] {
    let result = this.rows;

    if (this.filterOnlyErrors) {
      result = result.filter(r => r.hasError);
    }

    const colFilters = this.state.columnFilters();
    const filterKeys = Object.keys(colFilters);

    if (this.state.filtersEnabled() && filterKeys.length > 0) {
      result = result.filter(r => {
        for (const colKey of filterKeys) {
          const allowed = colFilters[colKey];
          if (!allowed || allowed.size === 0) continue;

          const cell = r.cells[colKey];
          const rawVal = cell ? String(cell.value ?? '').trim() : '';
          const refId = cell?.refId !== undefined && cell?.refId !== null ? String(cell.refId) : null;

          if (rawVal === '') {
            if (!allowed.has('__BLANK__') && !allowed.has('')) return false;
          } else {
            const matchesVal = allowed.has(rawVal);
            const matchesId = refId !== null && allowed.has(refId);
            if (!matchesVal && !matchesId) return false;
          }
        }
        return true;
      });
    }

    const sort = this.state.activeSort();
    if (this.state.sortingEnabled() && sort && sort.colKey) {
      const { colKey, order } = sort;
      const colDef = this.headers.find(h => h.name === colKey);
      const isNum = colDef?.type === 'number';

      result = [...result].sort((a, b) => {
        const valA = a.cells[colKey]?.value;
        const valB = b.cells[colKey]?.value;

        if (valA === valB) return 0;
        if (valA === undefined || valA === null || valA === '') return 1;
        if (valB === undefined || valB === null || valB === '') return -1;

        if (isNum) {
          const numA = Number(valA);
          const numB = Number(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            return order === 'ASC' ? numA - numB : numB - numA;
          }
        }

        const cmp = String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base', numeric: true });
        return order === 'ASC' ? cmp : -cmp;
      });
    }

    return result;
  }

  // ── Column Filter Popover Methods ────────────────────────────

  public isColumnFiltered(colName: string): boolean {
    const filters = this.state.columnFilters();
    return !!filters[colName] && filters[colName].size > 0;
  }

  public isSortActive(colName: string, order: 'ASC' | 'DESC'): boolean {
    const s = this.state.activeSort();
    return s?.colKey === colName && s?.order === order;
  }

  public openColumnFilter(event: MouseEvent, col: SutramHeaderConfig, op: any): void {
    event.stopPropagation();
    this.activeFilterCol = col;
    this.filterChecklistSearch = '';
    this.selectedChecklistValues.clear();

    const isFk = col.type === 'ref' || !!col.ref_table;
    const itemsMap = new Map<any, { display: string; value: any; code?: string; count?: number }>();

    // For Foreign Key columns: load all options from SutramRefCacheService (Rule 8)
    if (isFk && col.ref_table) {
      const refOptions = this.refCache.getOptions(col.ref_table);
      for (const opt of refOptions) {
        itemsMap.set(opt.display, {
          display: opt.display,
          value: opt.display,
          code: opt.code,
          count: 0
        });
      }
    }

    // Tally occurrences from loaded rows and capture distinct non-ref values or blanks
    let blankCount = 0;
    for (const r of this.rows) {
      const cell = r.cells[col.name];
      const val = cell?.value !== undefined && cell?.value !== null ? String(cell.value).trim() : '';

      if (val === '') {
        blankCount++;
      } else {
        if (itemsMap.has(val)) {
          const item = itemsMap.get(val)!;
          item.count = (item.count || 0) + 1;
        } else {
          itemsMap.set(val, {
            display: val,
            value: val,
            count: 1
          });
        }
      }
    }

    const itemsList = Array.from(itemsMap.values());

    if (col.type === 'number') {
      itemsList.sort((a, b) => (Number(a.value) || 0) - (Number(b.value) || 0));
    } else {
      itemsList.sort((a, b) => a.display.localeCompare(b.display, undefined, { numeric: true }));
    }

    if (blankCount > 0) {
      itemsList.push({
        display: '(रिक्त / Blanks)',
        value: '__BLANK__',
        count: blankCount
      });
    }

    this.currentChecklistItems = itemsList;

    const existing = this.state.columnFilters()[col.name];
    if (existing && existing.size > 0) {
      this.selectedChecklistValues = new Set(existing);
    } else {
      this.selectedChecklistValues = new Set(itemsList.map(i => i.value));
    }

    op.toggle(event);
  }

  public get filteredChecklistItems(): Array<{ display: string; value: any; code?: string; count?: number }> {
    if (!this.filterChecklistSearch) return this.currentChecklistItems;
    const q = cleanString(this.filterChecklistSearch);
    return this.currentChecklistItems.filter(i => {
      const d = cleanString(i.display);
      const c = i.code ? cleanString(i.code) : '';
      return d.includes(q) || c.includes(q);
    });
  }

  public isAllChecklistSelected(): boolean {
    if (this.currentChecklistItems.length === 0) return false;
    return this.selectedChecklistValues.size === this.currentChecklistItems.length;
  }

  public toggleSelectAllChecklist(event: any): void {
    const checked = event.target.checked;
    if (checked) {
      this.selectedChecklistValues = new Set(this.currentChecklistItems.map(i => i.value));
    } else {
      this.selectedChecklistValues.clear();
    }
  }

  public toggleChecklistItem(value: any): void {
    if (this.selectedChecklistValues.has(value)) {
      this.selectedChecklistValues.delete(value);
    } else {
      this.selectedChecklistValues.add(value);
    }
  }

  public applyCurrentColFilter(op: any): void {
    if (!this.activeFilterCol) return;
    const colName = this.activeFilterCol.name;

    if (
      this.selectedChecklistValues.size === 0 ||
      this.selectedChecklistValues.size === this.currentChecklistItems.length
    ) {
      this.state.clearColumnFilter(colName);
    } else {
      this.state.setColumnFilter(colName, new Set(this.selectedChecklistValues));
    }

    this.filterChanged.emit(this.state.columnFilters());
    op.hide();
  }

  public clearCurrentColFilter(op: any): void {
    if (!this.activeFilterCol) return;
    this.state.clearColumnFilter(this.activeFilterCol.name);
    this.selectedChecklistValues = new Set(this.currentChecklistItems.map(i => i.value));
    this.filterChanged.emit(this.state.columnFilters());
    op.hide();
  }

  /**
   * Directly cycle column sort on clicking table header: None -> ASC -> DESC -> None
   */
  public onHeaderClick(col: SutramHeaderConfig): void {
    if (!this.state.sortingEnabled() || !col?.name) return;

    const currentSort = this.state.activeSort();
    if (currentSort?.colKey === col.name) {
      if (currentSort.order === 'ASC') {
        this.state.setSort(col.name, 'DESC');
      } else {
        this.state.clearSort();
      }
    } else {
      this.state.setSort(col.name, 'ASC');
    }
    this.sortChanged.emit(this.state.activeSort());
  }

  public applySort(colKey: string, order: 'ASC' | 'DESC', op?: any): void {
    this.state.setSort(colKey, order);
    this.sortChanged.emit(this.state.activeSort());
    if (op) op.hide();
  }

  public clearSort(op?: any): void {
    this.state.clearSort();
    this.sortChanged.emit(null);
    if (op) op.hide();
  }

  /**
   * Cell clicked / focused
   */
  public onCellClick(rowIdx: number, colKey: string): void {
    this.state.setSelectedCell({ rowIdx, colKey });
  }

  /**
   * Search suggestions for Foreign Key reference autocomplete
   */
  public searchRefOptions(event: any, header: SutramHeaderConfig, row?: SutramRow): void {
    const query = event?.query || '';
    const refTable = header.ref_table || header.name;

    let parentId: any = undefined;
    if (refTable.toLowerCase() === 'subitem' && row) {
      const itemHeader = this.headers.find(h => h.ref_table === 'item' || h.name.includes('item'));
      if (itemHeader && row.cells[itemHeader.name]) {
        parentId = row.cells[itemHeader.name].refId || row.cells[itemHeader.name].value;
      }
    }

    this.filteredSuggestions = this.refCache.searchOptions(refTable, query, parentId, 30);
  }

  /**
   * Selection from reference autocomplete dropdown
   */
  public onRefSuggestionSelect(
    option: SutramRefOption,
    rowIdx: number,
    colKey: string,
    cell: SutramCell,
    header: SutramHeaderConfig,
    row?: SutramRow
  ): void {
    if (!option) return;

    const originalValue = cell.value ? String(cell.value) : '';
    const resolvedDisplay = option.display || option.hin || option.eng || '';
    const resolvedId = option.id !== undefined ? option.id : resolvedDisplay;

    // Track modification
    if (cell.originalValue === undefined) {
      cell.originalValue = originalValue;
    }
    if (originalValue !== resolvedDisplay) {
      cell.isModified = true;
      if (row) row.isModified = true;
    }

    cell.value = resolvedDisplay;
    cell.refId = resolvedId;
    cell.refDisplay = resolvedDisplay;

    // Validate cell
    this.audit.validateCell(cell, header, row, this.headers);
    if (row) {
      this.audit.validateRow(row, this.headers);
    }

    // Check if other rows have the exact same old value to offer "Solve All"
    if (originalValue && originalValue !== resolvedDisplay) {
      const sameCount = this.state.findSameMistakeRowIndices(colKey, originalValue).length;
      if (sameCount > 1) {
        this.promptState = {
          visible: true,
          rowIdx,
          colKey,
          originalBadValue: originalValue,
          newSelectedValue: resolvedId,
          newSelectedDisplay: resolvedDisplay,
          matchingCount: sameCount,
          saveToDictionary: true
        };
      }
    }

    this.cellChanged.emit({ rowIdx, colKey, value: cell.value });
  }

  /**
   * Value edited directly in cell
   */
  public onCellValueCommit(
    rowIdx: number,
    colKey: string,
    cell: SutramCell,
    header: SutramHeaderConfig,
    row?: SutramRow
  ): void {
    if (cell.originalValue === undefined) {
      cell.originalValue = cell.value;
    }

    const valStr = cell.value === null || cell.value === undefined ? '' : String(cell.value).trim();
    const origStr = cell.originalValue === null || cell.originalValue === undefined ? '' : String(cell.originalValue).trim();

    if (valStr !== origStr) {
      cell.isModified = true;
      if (row) row.isModified = true;
    }

    this.audit.validateCell(cell, header, row, this.headers);
    if (row) {
      this.audit.validateRow(row, this.headers);
    }

    this.cellChanged.emit({ rowIdx, colKey, value: cell.value });
  }

  /**
   * User clicked "Apply to All" in prompt
   */
  public confirmSolveAll(): void {
    this.solveAllTriggered.emit({
      colKey: this.promptState.colKey,
      badValue: this.promptState.originalBadValue || '',
      resolvedDisplay: this.promptState.newSelectedDisplay || '',
      resolvedId: this.promptState.newSelectedValue,
      saveToDict: this.promptState.saveToDictionary
    });
    this.promptState.visible = false;
  }

  /**
   * User chose to update only this single cell
   */
  public applySingleCellOnly(): void {
    this.state.updateCellValue(
      this.promptState.rowIdx,
      this.promptState.colKey,
      this.promptState.newSelectedDisplay,
      this.promptState.newSelectedValue
    );
    this.promptState.visible = false;
  }

  public dismissPrompt(): void {
    this.promptState.visible = false;
  }

  // ── Context Menu Handlers ────────────────────────────────────

  private copySelectedRow(): void {
    if (this.contextSelectedRow) {
      this.clipboard.copyRowsToClipboard([this.contextSelectedRow], this.headers);
    }
  }

  private insertRowAbove(): void {
    if (!this.contextSelectedRow) return;
    const idx = this.rows.findIndex(r => r.rowNum === this.contextSelectedRow!.rowNum);
    if (idx !== -1) {
      const newRow: SutramRow = {
        rowNum: this.rows.length + 1,
        cells: {},
        hasError: false,
        errorCount: 0,
        isNew: true
      };
      this.headers.forEach(h => (newRow.cells[h.name] = { value: '', isValid: true, isNew: true }));
      const updated = [...this.rows];
      updated.splice(idx, 0, newRow);
      this.state.setRows(updated);
    }
  }

  private insertRowBelow(): void {
    if (!this.contextSelectedRow) return;
    const idx = this.rows.findIndex(r => r.rowNum === this.contextSelectedRow!.rowNum);
    if (idx !== -1) {
      const newRow: SutramRow = {
        rowNum: this.rows.length + 1,
        cells: {},
        hasError: false,
        errorCount: 0,
        isNew: true
      };
      this.headers.forEach(h => (newRow.cells[h.name] = { value: '', isValid: true, isNew: true }));
      const updated = [...this.rows];
      updated.splice(idx + 1, 0, newRow);
      this.state.setRows(updated);
    }
  }

  private deleteSelectedRow(): void {
    if (!this.contextSelectedRow) return;
    const idx = this.rows.findIndex(r => r.rowNum === this.contextSelectedRow!.rowNum);
    this.state.trackDeletedRow(this.contextSelectedRow, idx);
    const updated = this.rows.filter(r => r.rowNum !== this.contextSelectedRow!.rowNum);
    this.state.setRows(updated);
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

  public getColumnWidth(col: SutramHeaderConfig): number {
    if (col.width) return col.width;
    const name = (col.name || '').toLowerCase();
    if (name === '_id' || name === 'id') return 60;
    if (name === 'active') return 80;
    if (name === 'sort_order' || name === 'order' || name === 'roll_no') return 90;
    if (name === 'gender' || name.includes('code')) return 95;
    if (name === 'parent' || name === 'alias') return 120;
    return Math.max(130, Math.min(220, (col.name || '').length * 10 + 35));
  }

  public openRowContextMenu(event: MouseEvent, row: SutramRow, cm: any): void {
    event.preventDefault();
    this.contextSelectedRow = row;
    if (cm) cm.show(event);
  }
}
