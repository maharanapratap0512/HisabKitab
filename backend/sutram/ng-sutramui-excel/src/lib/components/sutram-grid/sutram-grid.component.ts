/**
 * sutram-grid.component.ts
 * ─────────────────────────────────────────────────────────────
 * Interactive Spreadsheet Grid Component for Sutram Excel Studio.
 * Features:
 *  - Excel-grade single-click cell selection & Formula bar sync
 *  - Double-click, Enter, F2, or direct-typing inline cell editing
 *  - Smart FK Reference autocomplete with bilingual search & keyboard selection
 *  - Pixel-perfect right-click context menu (Row & Cell actions, Duplicate, Delete)
 *  - Eye-protect warm yellow for edited cells, light green for new rows
 *  - Inline "Solve All Mistakes" batch prompt modal
 * ─────────────────────────────────────────────────────────────
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener
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

export interface ContextMenuState {
  visible: boolean;
  type: 'row' | 'cell';
  x: number;
  y: number;
  rowIdx: number;
  colKey: string | null;
  row: SutramRow | null;
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
  @Output() openConfig = new EventEmitter<MouseEvent>();

  // ── Inline Cell Editing State ────────────────────────────────
  public editingCell: { rowIdx: number; colKey: string } | null = null;
  public editingValue: string = '';
  public originalEditingValue: string = '';
  public editingColDef: SutramHeaderConfig | null = null;

  // ── Smart FK Autocomplete Dropdown State ─────────────────────
  public dropdownOpen: boolean = false;
  public dropdownOptions: SutramRefOption[] = [];
  public highlightedIdx: number = -1;
  public dropdownPos = { top: 0, left: 0, minWidth: 270 };

  // ── Row Selection State ─────────────────────────────────────
  public selectedRowIdx: number | null = null;

  // ── Sleek Custom Context Menu State ──────────────────────────
  public contextMenuState: ContextMenuState = {
    visible: false,
    type: 'row',
    x: 0,
    y: 0,
    rowIdx: -1,
    colKey: null,
    row: null
  };

  // ── Column Filter Popover State ──────────────────────────────
  public activeFilterCol: SutramHeaderConfig | null = null;
  public filterChecklistSearch: string = '';
  public currentChecklistItems: Array<{ display: string; value: any; code?: string; count?: number }> = [];
  public selectedChecklistValues: Set<any> = new Set<any>();

  // ── Inline Batch Mistake Prompt State ────────────────────────
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

  private scrollCleanups: Array<() => void> = [];
  private lastLoadMoreEmitTime = 0;
  private lastKnownScrollTop = 0;
  private isRestoringScroll = false;
  private isResetting = false;

  public trackByRowNum = (index: number, row: SutramRow): any => {
    return row.rowNum ?? (row as any)._id ?? (row as any).id ?? index;
  };

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

  constructor(
    public state: SutramExcelStateService,
    private clipboard: SutramClipboardService,
    private audit: SutramAuditService,
    public refCache: SutramRefCacheService,
    private el: ElementRef,
    public cdr: ChangeDetectorRef
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['headers'] && this.headers) {
      const refTables = this.headers
        .filter(h => h.ref_table || h.type === 'ref')
        .map(h => h.ref_table!)
        .filter(Boolean);
      this.refCache.preloadTables(refTables);
    }

    if (changes['rows']) {
      const prev = changes['rows'].previousValue as SutramRow[] | undefined;
      const curr = changes['rows'].currentValue as SutramRow[] | undefined;
      // When new chunks are appended, preserve scroll position so speedy scrolling doesn't jump to top
      if (prev && curr && curr.length > prev.length && this.lastKnownScrollTop > 40) {
        const savedScroll = this.lastKnownScrollTop;
        requestAnimationFrame(() => {
          const scrollerEl = this.el.nativeElement.querySelector('.p-scroller') as HTMLElement;
          if (scrollerEl && scrollerEl.scrollTop < savedScroll - 30) {
            this.isRestoringScroll = true;
            scrollerEl.scrollTop = savedScroll;
            setTimeout(() => { this.isRestoringScroll = false; }, 60);
          }
        });
      }
    }
  }

  public resetScroll(): void {
    this.isResetting = true;
    this.lastKnownScrollTop = 0;
    const scrollerEl = this.el.nativeElement.querySelector('.p-scroller') as HTMLElement;
    if (scrollerEl) {
      scrollerEl.scrollTop = 0;
    }
    setTimeout(() => {
      this.isResetting = false;
    }, 250);
  }

  public ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  public ngOnDestroy(): void {
    this.scrollCleanups.forEach(fn => fn());
    this.scrollCleanups = [];
  }

  /**
   * Evaluates if any scrollable container is near the bottom and emits loadMore
   */
  private checkAndEmitLoadMore(scrollEl?: HTMLElement): void {
    const el = scrollEl
      || this.el.nativeElement.querySelector('.p-scroller')
      || this.el.nativeElement.querySelector('.p-scroller-viewport')
      || this.el.nativeElement.querySelector('.p-datatable-wrapper');

    if (!el) return;

    const scrollHeight = el.scrollHeight;
    const scrollTop = el.scrollTop;
    const clientHeight = el.clientHeight;

    // 500px prefetch threshold ensures smooth loading ahead of time during fast scrolling
    const threshold = 500;
    const isNearBottom = (scrollTop + clientHeight >= scrollHeight - threshold);

    if (isNearBottom) {
      const now = Date.now();
      if (now - this.lastLoadMoreEmitTime > 300) {
        this.lastLoadMoreEmitTime = now;
        this.loadMore.emit();
      }
    }
  }

  /**
   * Sets up multi-layer scroll detection for PrimeNG virtual scrolling and outer wrappers
   */
  private setupInfiniteScroll(): void {
    const root = this.el.nativeElement as HTMLElement;
    if (!root) return;

    // 1. Capture-phase scroll listener on host element (catches scroll on .p-scroller, .p-datatable-wrapper, etc.)
    const onScrollCapture = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.scrollHeight > target.clientHeight) {
        if (this.isRestoringScroll) return;

        // Glitch Jump Guard: If target.scrollTop dropped to 0 while user was scrolled down (> 120px)
        if (target.scrollTop === 0 && this.lastKnownScrollTop > 120 && !this.isResetting) {
          const restoreVal = this.lastKnownScrollTop;
          this.isRestoringScroll = true;
          target.scrollTop = restoreVal;
          requestAnimationFrame(() => {
            if (target.scrollTop === 0) {
              target.scrollTop = restoreVal;
            }
            setTimeout(() => {
              this.isRestoringScroll = false;
            }, 60);
          });
          return;
        }

        if (target.scrollTop > 0) {
          this.lastKnownScrollTop = target.scrollTop;
        }
        this.checkAndEmitLoadMore(target);
      } else {
        this.checkAndEmitLoadMore();
      }
    };
    root.addEventListener('scroll', onScrollCapture, { passive: true, capture: true });
    this.scrollCleanups.push(() => root.removeEventListener('scroll', onScrollCapture, true));

    // 2. Direct wheel listener: if user scrolls wheel downward when already near the bottom
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        this.checkAndEmitLoadMore();
      }
    };
    root.addEventListener('wheel', onWheel, { passive: true });
    this.scrollCleanups.push(() => root.removeEventListener('wheel', onWheel));

    // 3. Arrow Down / Page Down keyboard navigation
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End') {
        setTimeout(() => this.checkAndEmitLoadMore(), 50);
      }
    };
    root.addEventListener('keydown', onKeyDown, { passive: true });
    this.scrollCleanups.push(() => root.removeEventListener('keydown', onKeyDown));

    // 4. Also watch canvas if present
    const canvas = root.closest('.spreadsheet-canvas') as HTMLElement;
    if (canvas) {
      const onCanvasScroll = () => this.checkAndEmitLoadMore(canvas);
      canvas.addEventListener('scroll', onCanvasScroll, { passive: true });
      this.scrollCleanups.push(() => canvas.removeEventListener('scroll', onCanvasScroll));
    }
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

  // ── Cell Selection & Inline Editing ──────────────────────────

  public isCellEditing(rowIdx: number, colKey: string): boolean {
    return this.editingCell?.rowIdx === rowIdx && this.editingCell?.colKey === colKey;
  }

  public isFkColumn(col: SutramHeaderConfig | null | undefined): boolean {
    return !!col && (col.type === 'ref' || !!col.ref_table) && !!col.ref_table;
  }

  public onCellClick(rowIdx: number, colKey: string, event: MouseEvent): void {
    if (this.contextMenuState.visible) {
      this.closeContextMenu();
    }
    this.selectedRowIdx = null; // Clear full row selection when individual cell clicked
    // If clicking on another cell while editing, commit current edit first
    if (this.editingCell && (this.editingCell.rowIdx !== rowIdx || this.editingCell.colKey !== colKey)) {
      this.commitCellEdit();
    }
    this.state.setSelectedCell({ rowIdx, colKey });
    this.cdr.markForCheck();
  }

  public onRowHeaderClick(rowIdx: number, row: SutramRow, event: MouseEvent): void {
    if (this.contextMenuState.visible) {
      this.closeContextMenu();
    }
    if (this.editingCell) {
      this.commitCellEdit();
    }
    this.selectedRowIdx = rowIdx; // Select entire row
    const firstCol = this.headers[0]?.name || '';
    this.state.setSelectedCell({ rowIdx, colKey: firstCol });
    this.cdr.markForCheck();
  }

  public startCellEdit(
    rowIdx: number,
    colKey: string,
    row: SutramRow,
    event?: MouseEvent,
    initialChar?: string
  ): void {
    this.closeContextMenu();
    if (this.editingCell && (this.editingCell.rowIdx !== rowIdx || this.editingCell.colKey !== colKey)) {
      this.commitCellEdit();
    }

    this.state.setSelectedCell({ rowIdx, colKey });
    const colDef = this.headers.find(h => h.name === colKey) || null;
    this.editingColDef = colDef;
    const curVal = row.cells[colKey]?.value;
    this.originalEditingValue = curVal !== undefined && curVal !== null ? String(curVal) : '';
    this.editingValue = initialChar !== undefined ? initialChar : this.originalEditingValue;
    this.editingCell = { rowIdx, colKey };

    // Auto-focus input
    setTimeout(() => {
      const inputEl = this.el.nativeElement.querySelector('.raw-cell-editor') as HTMLInputElement;
      if (inputEl) {
        inputEl.focus();
        if (initialChar === undefined) {
          inputEl.select();
        }
      }
    }, 10);

    // If FK column, open autocomplete dropdown
    if (this.isFkColumn(colDef)) {
      let targetEl: HTMLElement | null = null;
      if (event?.target) {
        targetEl = (event.target as HTMLElement).closest('.cell-box') as HTMLElement;
      }
      if (!targetEl) {
        targetEl = this.el.nativeElement.querySelector('.cell-box.cell-active') as HTMLElement;
      }
      if (targetEl) {
        this.positionFkDropdown(targetEl.getBoundingClientRect());
      }
      this.updateFkOptions(colDef!, this.editingValue, row);
    } else {
      this.dropdownOpen = false;
    }

    this.cdr.markForCheck();
  }

  public onEditorInput(val: string, col: SutramHeaderConfig, row: SutramRow): void {
    this.editingValue = val;
    if (this.isFkColumn(col)) {
      const targetEl = this.el.nativeElement.querySelector('.cell-box.cell-editing') as HTMLElement;
      if (targetEl) {
        this.positionFkDropdown(targetEl.getBoundingClientRect());
      }
      this.updateFkOptions(col, val, row);
    }
  }

  public positionFkDropdown(rect: DOMRect): void {
    let top = rect.bottom + 2;
    let left = rect.left;
    const minWidth = Math.max(rect.width, 270);

    if (top + 200 > window.innerHeight) {
      top = Math.max(10, rect.top - 200);
    }
    if (left + minWidth > window.innerWidth) {
      left = Math.max(10, window.innerWidth - minWidth - 12);
    }

    this.dropdownPos = { top, left, minWidth };
    this.dropdownOpen = true;
  }

  public updateFkOptions(col: SutramHeaderConfig, query: string, row?: SutramRow): void {
    if (!col.ref_table) return;
    let parentId: any = undefined;
    if (col.ref_table.toLowerCase() === 'subitem' && row) {
      const itemHeader = this.headers.find(h => h.ref_table === 'item' || h.name.includes('item'));
      if (itemHeader && row.cells[itemHeader.name]) {
        parentId = row.cells[itemHeader.name].refId || row.cells[itemHeader.name].value;
      }
    }

    this.dropdownOptions = this.refCache.searchOptions(col.ref_table, query, parentId, 50);
    this.highlightedIdx = this.dropdownOptions.length > 0 ? 0 : -1;
    this.dropdownOpen = true;
    this.cdr.markForCheck();
  }

  public selectDropdownOption(opt: SutramRefOption, event?: MouseEvent, moveToNextRow = true): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.editingCell) return;

    const { rowIdx, colKey } = this.editingCell;
    const row = this.visibleRows[rowIdx];
    const col = this.editingColDef;

    this.editingValue = opt.display;
    this.dropdownOpen = false;
    this.editingCell = null;

    if (row && col) {
      const cell = row.cells[colKey];
      if (cell) {
        if (cell.originalValue === undefined) {
          cell.originalValue = this.originalEditingValue;
        }

        const origStr = String(cell.originalValue ?? '').trim();
        const currentEditStr = String(this.originalEditingValue ?? '').trim();
        const changedFromCurrent = opt.display !== currentEditStr;
        const changedFromOriginal = opt.display !== origStr;

        if (!changedFromCurrent && !cell.isModified && !row.isNew) {
          if (moveToNextRow) {
            this.navigateCell(rowIdx + 1, colKey);
          }
          this.cdr.markForCheck();
          return;
        }

        cell.value = opt.display;
        cell.refId = opt.id;
        cell.refDisplay = opt.display;
        cell.isValid = true;
        cell.errorMessage = undefined;

        if (changedFromOriginal) {
          cell.isModified = true;
        } else if (!row.isNew) {
          cell.isModified = false;
        }
        row.isModified = row.isNew || Object.values(row.cells).some((c: any) => c && c.isModified);
      }

      this.audit.validateCell(cell, col, row, this.headers);
      this.audit.validateRow(row, this.headers);
      this.cellChanged.emit({ rowIdx, colKey, value: opt.display });
      this.state.updateCellValue(rowIdx, colKey, opt.display, opt.id);

      if (rowIdx === this.visibleRows.length - 1 && this.isRowPopulated(row)) {
        this.state.addNewBlankRow();
      }
    }

    if (moveToNextRow) {
      this.navigateCell(rowIdx + 1, colKey);
    }
    this.cdr.markForCheck();
  }

  public onCellEditorKeydown(event: KeyboardEvent, rowIdx: number, colKey: string, row: SutramRow): void {
    // Dropdown arrow navigation
    if (this.dropdownOpen && this.dropdownOptions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.highlightedIdx = Math.min(this.dropdownOptions.length - 1, this.highlightedIdx + 1);
        this.scrollHighlightedDropdownItem();
        this.cdr.markForCheck();
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.highlightedIdx = Math.max(0, this.highlightedIdx - 1);
        this.scrollHighlightedDropdownItem();
        this.cdr.markForCheck();
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.highlightedIdx >= 0 && this.dropdownOptions[this.highlightedIdx]) {
          this.selectDropdownOption(this.dropdownOptions[this.highlightedIdx], undefined, true);
        } else {
          this.commitCellEdit(true, false);
        }
        return;
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        if (this.highlightedIdx >= 0 && this.dropdownOptions[this.highlightedIdx]) {
          this.selectDropdownOption(this.dropdownOptions[this.highlightedIdx], undefined, false);
        } else {
          this.commitCellEdit(false, true);
        }
        return;
      }
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitCellEdit(true, false); // advance to next row
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        this.commitCellEdit(false, false);
        this.navigateCell(rowIdx, this.getPrevColKey(colKey));
      } else {
        this.commitCellEdit(false, true); // advance to next column
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelCellEdit();
      return;
    }
  }

  public onCellEditorBlur(rowIdx: number, colKey: string, row: SutramRow): void {
    // Delay slightly to permit any mousedown on autocomplete dropdown to execute first
    setTimeout(() => {
      if (this.isCellEditing(rowIdx, colKey)) {
        this.commitCellEdit();
      }
    }, 150);
  }

  public commitCellEdit(moveToNextRow: boolean = false, moveToNextCol: boolean = false): void {
    if (!this.editingCell) return;
    const { rowIdx, colKey } = this.editingCell;
    const row = this.visibleRows[rowIdx];
    const col = this.headers.find(h => h.name === colKey);
    const newVal = (this.editingValue ?? '').trim();

    this.editingCell = null;
    this.dropdownOpen = false;

    if (row && col) {
      const cell = row.cells[colKey];
      if (cell) {
        if (cell.originalValue === undefined) {
          cell.originalValue = this.originalEditingValue;
        }

        const origStr = String(cell.originalValue ?? '').trim();
        const currentEditStr = String(this.originalEditingValue ?? '').trim();
        const changedFromCurrent = newVal !== currentEditStr;
        const changedFromOriginal = newVal !== origStr;

        // If data hasn't changed at all during this edit session and cell was not already modified,
        // do not mark anything modified or dirty!
        if (!changedFromCurrent && !cell.isModified && !row.isNew) {
          if (moveToNextRow) {
            this.navigateCell(rowIdx + 1, colKey);
          } else if (moveToNextCol) {
            this.navigateCell(rowIdx, this.getNextColKey(colKey));
          }
          this.cdr.markForCheck();
          return;
        }

        cell.value = newVal;

        if (changedFromOriginal) {
          cell.isModified = true;
        } else if (!row.isNew) {
          cell.isModified = false;
        }

        // Foreign Key validation & auto-matching
        if (this.isFkColumn(col)) {
          const match = this.refCache.findRefMatch(col.ref_table!, newVal);
          if (match.found) {
            cell.value = match.display;
            cell.refId = match.id;
            cell.refDisplay = match.display;
            cell.isValid = true;
            cell.errorMessage = undefined;
          } else if (newVal !== '') {
            cell.isValid = false;
            cell.errorMessage = `अमान्य ${col.name}: '${col.ref_table}' में नहीं मिला`;

            if (this.originalEditingValue && changedFromCurrent) {
              const sameCount = this.state.findSameMistakeRowIndices(colKey, this.originalEditingValue).length;
              if (sameCount > 1) {
                this.promptState = {
                  visible: true,
                  rowIdx,
                  colKey,
                  originalBadValue: this.originalEditingValue,
                  newSelectedValue: null,
                  newSelectedDisplay: newVal,
                  matchingCount: sameCount,
                  saveToDictionary: true
                };
              }
            }
          }
        }

        row.isModified = row.isNew || Object.values(row.cells).some((c: any) => c && c.isModified);

        this.audit.validateCell(cell, col, row, this.headers);
        this.audit.validateRow(row, this.headers);
        this.cellChanged.emit({ rowIdx, colKey, value: cell.value });
        this.state.updateCellValue(rowIdx, colKey, cell.value, cell.refId);

        if (rowIdx === this.visibleRows.length - 1 && this.isRowPopulated(row)) {
          this.state.addNewBlankRow();
        }
      }
    }

    if (moveToNextRow) {
      this.navigateCell(rowIdx + 1, colKey);
    } else if (moveToNextCol) {
      this.navigateCell(rowIdx, this.getNextColKey(colKey));
    }
    this.cdr.markForCheck();
  }

  public cancelCellEdit(): void {
    this.editingCell = null;
    this.dropdownOpen = false;
    this.cdr.markForCheck();
  }

  private scrollHighlightedDropdownItem(): void {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector('.ref-dropdown-item.highlighted');
      if (el) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }, 10);
  }

  public navigateCell(targetRowIdx: number, targetColKey: string): void {
    if (this.visibleRows.length === 0) return;
    const rowIdx = Math.max(0, Math.min(this.visibleRows.length - 1, targetRowIdx));
    const colExists = this.headers.some(h => h.name === targetColKey);
    const colKey = colExists ? targetColKey : (this.headers[0]?.name || '');
    this.state.setSelectedCell({ rowIdx, colKey });
    this.cdr.markForCheck();
  }

  private getNextColKey(curColKey: string): string {
    const idx = this.headers.findIndex(h => h.name === curColKey);
    if (idx >= 0 && idx + 1 < this.headers.length) {
      return this.headers[idx + 1].name;
    }
    return curColKey;
  }

  private getPrevColKey(curColKey: string): string {
    const idx = this.headers.findIndex(h => h.name === curColKey);
    if (idx > 0) {
      return this.headers[idx - 1].name;
    }
    return curColKey;
  }

  // ── Keyboard Navigation Across Canvas ────────────────────────

  @HostListener('document:keydown', ['$event'])
  public onDocumentKeydown(event: KeyboardEvent): void {
    if (this.contextMenuState.visible) {
      if (event.key === 'Escape') {
        this.closeContextMenu();
        event.preventDefault();
      }
      return;
    }

    if (this.editingCell) {
      if (event.key === 'Escape') {
        this.cancelCellEdit();
        event.preventDefault();
      }
      return;
    }

    const sel = this.state.selectedCell();
    if (!sel) return;

    // Ignore if focus is in an input outside grid (e.g. formula bar or top search bar)
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
      !activeEl.classList.contains('raw-cell-editor')
    ) {
      return;
    }

    // ── Row-Level Keyboard Operations (When entire row is selected) ─
    if (this.selectedRowIdx !== null) {
      const curRowIdx = this.selectedRowIdx;
      const targetRow = this.visibleRows[curRowIdx];

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedRowIdx = Math.min(this.visibleRows.length - 1, curRowIdx + 1);
        const firstCol = this.headers[0]?.name || '';
        this.state.setSelectedCell({ rowIdx: this.selectedRowIdx, colKey: firstCol });
        this.cdr.markForCheck();
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedRowIdx = Math.max(0, curRowIdx - 1);
        const firstCol = this.headers[0]?.name || '';
        this.state.setSelectedCell({ rowIdx: this.selectedRowIdx, colKey: firstCol });
        this.cdr.markForCheck();
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.selectedRowIdx = null;
        this.cdr.markForCheck();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        if (targetRow) {
          this.clipboard.copyRowsToClipboard([targetRow], this.headers);
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        this.pasteRowData(curRowIdx);
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        this.clearSelectedRow(curRowIdx);
        return;
      }
    }

    const { rowIdx, colKey } = sel;
    const row = this.visibleRows[rowIdx];

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateCell(rowIdx + 1, colKey);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateCell(rowIdx - 1, colKey);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.navigateCell(rowIdx, this.getNextColKey(colKey));
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.navigateCell(rowIdx, this.getPrevColKey(colKey));
    } else if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      if (row) this.startCellEdit(rowIdx, colKey, row);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.state.updateCellValue(rowIdx, colKey, '');
      this.cellChanged.emit({ rowIdx, colKey, value: '' });
      this.cdr.markForCheck();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      if (row) {
        const val = row.cells[colKey]?.value ?? '';
        navigator.clipboard.writeText(String(val));
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
      navigator.clipboard.readText().then(text => {
        if (text !== undefined && text !== null) {
          const val = text.trim();
          this.state.updateCellValue(rowIdx, colKey, val);
          this.cellChanged.emit({ rowIdx, colKey, value: val });
          this.cdr.markForCheck();
        }
      });
    } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Direct typing into selected cell starts edit immediately!
      if (row) {
        this.startCellEdit(rowIdx, colKey, row, undefined, event.key);
      }
    }
  }

  public async pasteRowData(rowIdx: number): Promise<void> {
    const matrix = await this.clipboard.readClipboardMatrix();
    if (!matrix || matrix.length === 0) return;
    const targetRow = this.visibleRows[rowIdx];
    if (!targetRow) return;

    const rowValues = matrix[0];
    this.headers.forEach((h, colIndex) => {
      if (colIndex < rowValues.length) {
        const val = (rowValues[colIndex] ?? '').trim();
        this.state.updateCellValue(rowIdx, h.name, val);
        this.cellChanged.emit({ rowIdx, colKey: h.name, value: val });
      }
    });
    this.cdr.markForCheck();
  }

  public clearSelectedRow(rowIdx: number): void {
    const targetRow = this.visibleRows[rowIdx];
    if (!targetRow) return;

    this.headers.forEach(h => {
      this.state.updateCellValue(rowIdx, h.name, '');
      this.cellChanged.emit({ rowIdx, colKey: h.name, value: '' });
    });
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    if (this.contextMenuState.visible) {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-context-menu')) {
        this.closeContextMenu();
      }
    }

    if (this.editingCell) {
      const target = event.target as HTMLElement;
      if (!target.closest('.raw-cell-editor') && !target.closest('.ref-dropdown-menu')) {
        this.commitCellEdit();
      }
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  public onWindowChange(): void {
    if (this.contextMenuState.visible) {
      this.closeContextMenu();
    }
    if (this.dropdownOpen) {
      const targetEl = this.el.nativeElement.querySelector('.cell-box.cell-editing') as HTMLElement;
      if (targetEl) {
        this.positionFkDropdown(targetEl.getBoundingClientRect());
      } else {
        this.dropdownOpen = false;
      }
      this.cdr.markForCheck();
    }
  }

  // ── Context Menu Actions (Row & Cell) ────────────────────────

  public openRowContextMenu(event: MouseEvent, row: SutramRow, rowIdx: number): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedRowIdx = rowIdx;
    const firstCol = this.headers[0]?.name || '';
    this.state.setSelectedCell({ rowIdx, colKey: firstCol });
    this.positionContextMenu(event, 'row', rowIdx, null, row);
  }

  public openCellContextMenu(event: MouseEvent, rowIdx: number, colKey: string, row: SutramRow): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectedRowIdx = null;
    this.state.setSelectedCell({ rowIdx, colKey });
    this.positionContextMenu(event, 'cell', rowIdx, colKey, row);
  }

  private positionContextMenu(
    event: MouseEvent,
    type: 'row' | 'cell',
    rowIdx: number,
    colKey: string | null,
    row: SutramRow
  ): void {
    const menuWidth = 220;
    const menuHeight = type === 'cell' ? 240 : 160;
    let x = event.clientX;
    let y = event.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = Math.max(10, window.innerWidth - menuWidth - 10);
    }
    if (y + menuHeight > window.innerHeight) {
      y = Math.max(10, window.innerHeight - menuHeight - 10);
    }

    this.contextMenuState = {
      visible: true,
      type,
      x,
      y,
      rowIdx,
      colKey,
      row
    };
    this.cdr.markForCheck();
  }

  public closeContextMenu(): void {
    if (this.contextMenuState.visible) {
      this.contextMenuState.visible = false;
      this.cdr.markForCheck();
    }
  }

  public copyActiveCell(): void {
    const { row, colKey } = this.contextMenuState;
    this.closeContextMenu();
    if (row && colKey) {
      const val = row.cells[colKey]?.value ?? '';
      navigator.clipboard.writeText(String(val));
    }
  }

  public cutActiveCell(): void {
    const { rowIdx, colKey, row } = this.contextMenuState;
    this.closeContextMenu();
    if (row && colKey && rowIdx >= 0) {
      const val = row.cells[colKey]?.value ?? '';
      navigator.clipboard.writeText(String(val));
      this.state.updateCellValue(rowIdx, colKey, '');
      this.cellChanged.emit({ rowIdx, colKey, value: '' });
      this.cdr.markForCheck();
    }
  }

  public pasteToActiveCell(): void {
    const { rowIdx, colKey } = this.contextMenuState;
    this.closeContextMenu();
    if (colKey && rowIdx >= 0) {
      navigator.clipboard.readText().then(text => {
        if (text !== undefined && text !== null) {
          const val = text.trim();
          this.state.updateCellValue(rowIdx, colKey, val);
          this.cellChanged.emit({ rowIdx, colKey, value: val });
          this.cdr.markForCheck();
        }
      });
    }
  }

  public copySelectedRow(): void {
    const row =
      this.contextMenuState.row ||
      (this.contextMenuState.rowIdx >= 0 ? this.rows[this.contextMenuState.rowIdx] : null);
    this.closeContextMenu();
    if (row) {
      this.clipboard.copyRowsToClipboard([row], this.headers);
    }
  }

  public insertRowAbove(): void {
    const rowIdx = this.contextMenuState.rowIdx;
    this.closeContextMenu();
    if (rowIdx < 0) return;

    const newCells: Record<string, SutramCell> = {};
    this.headers.forEach(h => {
      newCells[h.name] = {
        value: '',
        isValid: !h.not_null,
        isModified: false,
        isNew: true
      };
    });

    const newRow: SutramRow = {
      rowNum: rowIdx + 1,
      cells: newCells,
      hasError: false,
      errorCount: 0,
      isNew: true
    };

    const current = [...this.rows];
    current.splice(rowIdx, 0, newRow);
    current.forEach((r, idx) => (r.rowNum = idx + 1));
    this.state.setRows(current);
    this.state.setSelectedCell({ rowIdx, colKey: this.headers[0]?.name || '' });
    this.cdr.markForCheck();
  }

  public insertRowBelow(): void {
    const rowIdx = this.contextMenuState.rowIdx;
    this.closeContextMenu();
    if (rowIdx < 0) return;

    const newCells: Record<string, SutramCell> = {};
    this.headers.forEach(h => {
      newCells[h.name] = {
        value: '',
        isValid: !h.not_null,
        isModified: false,
        isNew: true
      };
    });

    const newRow: SutramRow = {
      rowNum: rowIdx + 2,
      cells: newCells,
      hasError: false,
      errorCount: 0,
      isNew: true
    };

    const current = [...this.rows];
    current.splice(rowIdx + 1, 0, newRow);
    current.forEach((r, idx) => (r.rowNum = idx + 1));
    this.state.setRows(current);
    this.state.setSelectedCell({ rowIdx: rowIdx + 1, colKey: this.headers[0]?.name || '' });
    this.cdr.markForCheck();
  }

  public duplicateRow(): void {
    const rowIdx = this.contextMenuState.rowIdx;
    const srcRow = this.contextMenuState.row || this.rows[rowIdx];
    this.closeContextMenu();
    if (!srcRow || rowIdx < 0) return;

    const clonedCells: Record<string, SutramCell> = {};
    for (const h of this.headers) {
      const srcCell = srcRow.cells[h.name];
      clonedCells[h.name] = {
        value: srcCell?.value ?? '',
        isValid: true,
        isModified: false,
        isNew: true,
        refId: srcCell?.refId,
        refDisplay: srcCell?.refDisplay
      };
    }

    const clonedRow: SutramRow = {
      rowNum: rowIdx + 2,
      cells: clonedCells,
      hasError: false,
      errorCount: 0,
      isNew: true
    };

    const current = [...this.rows];
    current.splice(rowIdx + 1, 0, clonedRow);
    current.forEach((r, idx) => (r.rowNum = idx + 1));
    this.state.setRows(current);
    this.state.setSelectedCell({ rowIdx: rowIdx + 1, colKey: this.headers[0]?.name || '' });
    this.cdr.markForCheck();
  }

  public deleteSelectedRow(): void {
    this.deleteRow();
  }

  public deleteRow(): void {
    const rowIdx = this.contextMenuState.rowIdx;
    const targetRow = this.contextMenuState.row || this.rows[rowIdx];
    this.closeContextMenu();
    if (!targetRow || rowIdx < 0 || this.rows.length <= 1) return;

    this.state.trackDeletedRow(targetRow, rowIdx);
    const updated = this.rows.filter((_, idx) => idx !== rowIdx);
    updated.forEach((r, idx) => (r.rowNum = idx + 1));
    this.state.setRows(updated);
    const nextRowIdx = Math.min(rowIdx, updated.length - 1);
    this.state.setSelectedCell({ rowIdx: nextRowIdx, colKey: this.headers[0]?.name || '' });
    this.cdr.markForCheck();
  }

  // ── Column Filter Popover Methods ────────────────────────────

  public isColumnFiltered(colName: string): boolean {
    const filters = this.state.columnFilters();
    return !!filters[colName] && filters[colName].size > 0;
  }

  public openColumnFilter(event: MouseEvent, col: SutramHeaderConfig, op: any): void {
    event.stopPropagation();
    this.activeFilterCol = col;
    this.filterChecklistSearch = '';
    this.selectedChecklistValues.clear();

    const isFk = col.type === 'ref' || !!col.ref_table;
    const itemsMap = new Map<any, { display: string; value: any; code?: string; count?: number }>();

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

  public selectAllFilteredItems(): void {
    for (const item of this.filteredChecklistItems) {
      this.selectedChecklistValues.add(item.value);
    }
    this.cdr.markForCheck();
  }

  public clearAllFilteredItems(): void {
    for (const item of this.filteredChecklistItems) {
      this.selectedChecklistValues.delete(item.value);
    }
    this.cdr.markForCheck();
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

  // ── Batch Fix Prompt Methods ─────────────────────────────────

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

  // ── Column Geometry & Headers ────────────────────────────────

  public getColLetter(idx: number): string {
    let letter = '';
    let temp = idx;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  public getColumnWidth(col: SutramHeaderConfig | any): number {
    if (col.width) return col.width;
    const name = (col.short_name || col.name || col.col_name || '').toLowerCase();
    const key = (col.key || '').toLowerCase();
    if (name === '_id' || name === 'id' || col.is_fk_raw || key.endsWith('_id')) return 75;
    if (name === 'active') return 80;
    if (name === 'sort_order' || name === 'order' || name === 'roll_no') return 90;
    if (name === 'gender' || name.includes('code')) return 95;
    if (name.includes('date') || name.includes('time')) return 120;
    if (col.is_fk_main || col.ref_table || col.type === 'ref') {
      return Math.max(160, Math.min(260, (col.short_name || col.name || '').length * 11 + 55));
    }
    return Math.max(130, Math.min(220, (col.short_name || col.name || '').length * 10 + 35));
  }
}
