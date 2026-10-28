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
  SimpleChanges
} from '@angular/core';
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
export class SutramGridComponent implements OnChanges {
  @Input() headers: SutramHeaderConfig[] = [];
  @Input() rows: SutramRow[] = [];
  @Input() filterOnlyErrors: boolean = false;

  @Output() cellChanged = new EventEmitter<{ rowIdx: number; colKey: string; value: any }>();
  @Output() solveAllTriggered = new EventEmitter<{
    colKey: string;
    badValue: string;
    resolvedDisplay: string;
    resolvedId?: any;
    saveToDict: boolean;
  }>();

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

  // Context menu items
  public contextMenuItems: any[] = [];
  public contextSelectedRow: SutramRow | null = null;

  constructor(
    public state: SutramExcelStateService,
    private clipboard: SutramClipboardService,
    private audit: SutramAuditService,
    public refCache: SutramRefCacheService
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
  }

  private initContextMenu(): void {
    this.contextMenuItems = [
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
      },
      {
        separator: true
      },
      {
        label: 'पंक्ति हटाएं (Delete Row)',
        icon: 'pi pi-trash',
        command: () => this.deleteSelectedRow()
      }
    ];
  }

  public get visibleRows(): SutramRow[] {
    if (!this.filterOnlyErrors) return this.rows;
    return this.rows.filter(r => r.hasError);
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
    const updated = this.rows.filter(r => r.rowNum !== this.contextSelectedRow!.rowNum);
    this.state.setRows(updated);
  }
}
