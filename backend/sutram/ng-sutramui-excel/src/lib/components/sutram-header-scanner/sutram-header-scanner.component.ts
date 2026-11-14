/**
 * sutram-header-scanner.component.ts
 * ─────────────────────────────────────────────────────────────
 * Smart Header Scanner & File Manager Modal using PrimeNG p-dialog.
 * Matches sheet headers with schema columns, shows live data samples,
 * provides drag-and-drop ingestion, and allows default value fallbacks.
 * ─────────────────────────────────────────────────────────────
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SutramScanReport, SutramScanMatch, SutramHeaderConfig } from '../../models/sutram-excel.model';
import { cleanString, stringSimilarity } from '../../utils/normalization.utils';

@Component({
  selector: 'sutram-header-scanner',
  templateUrl: './sutram-header-scanner.component.html',
  styleUrls: ['./sutram-header-scanner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramHeaderScannerComponent {
  public Math = Math;

  @Input() visible: boolean = false;
  @Input() fileName: string = '';
  @Input() fileSize: number = 0;
  @Input() sheetNames: string[] = [];
  @Input() currentSheetName: string = '';
  @Input() sheetHeaders: string[] = [];
  @Input() sampleRows: any[][] = [];
  @Input() totalRows: number = 0;
  @Input() totalRawRowsCount: number = 0;
  @Input() headerRowIndex: number = 0;
  @Input() tablesList: Array<{ table: string; display_name: string }> = [];
  @Input() selectedTable: string = '';
  @Input() report: SutramScanReport | null = null;
  @Input() availableHeaders: SutramHeaderConfig[] = [];
  @Input() isTableConfigLoading: boolean = false;
  @Input() savedSheets: Array<{ sheetId: string; title: string; savedAt: string; rowCount: number; type?: string }> = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() sheetChange = new EventEmitter<string>();
  @Output() targetTableChange = new EventEmitter<string>();
  @Output() headerRowChange = new EventEmitter<number>();
  @Output() openDirectNormal = new EventEmitter<{ sheetName: string; headers: string[] }>();
  @Output() openMappedToTable = new EventEmitter<{ targetTable: string; matches: SutramScanMatch[]; defaultValues?: Record<string, any> }>();
  @Output() openSavedSheet = new EventEmitter<string>();
  @Output() deleteSavedSheet = new EventEmitter<string>();
  @Output() triggerFileInput = new EventEmitter<void>();
  @Output() fileDropped = new EventEmitter<File>();
  @Output() cancelled = new EventEmitter<void>();

  public activeMode: 'normal' | 'matcher' = 'matcher';
  public filterTab: 'all' | 'mapped' | 'unmatched' | 'mandatory' = 'all';
  public searchQuery: string = '';
  public isDragOver: boolean = false;
  public normalSheetCustomName: string = '';
  public defaultValues: Record<string, any> = {};
  public deleteConfirmSheetId: string | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  public onSelectSavedSheet(sheetId: string): void {
    this.openSavedSheet.emit(sheetId);
  }

  public promptDeleteSavedSheet(sheetId: string, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.deleteConfirmSheetId = sheetId;
  }

  public confirmDeleteSavedSheet(sheetId: string, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.deleteSavedSheet.emit(sheetId);
    this.deleteConfirmSheetId = null;
  }

  public cancelDeleteSavedSheet(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.deleteConfirmSheetId = null;
  }

  public get tableSelectOptions(): Array<{ label: string; value: string }> {
    return (this.tablesList || []).map(t => ({
      label: t.display_name ? `${t.display_name} (${t.table})` : t.table,
      value: t.table
    }));
  }

  public get sheetDropdownOptions(): Array<{ label: string; value: string }> {
    return (this.sheetNames || []).map(s => ({
      label: s,
      value: s
    }));
  }

  public get headerRowOptions(): Array<{ label: string; value: number }> {
    const maxRows = Math.min(10, Math.max(5, this.totalRawRowsCount || 5));
    const opts: Array<{ label: string; value: number }> = [];
    for (let i = 0; i < maxRows; i++) {
      opts.push({
        label: `पंक्ति ${i + 1} (Row ${i + 1})${i === this.headerRowIndex ? ' ★' : ''}`,
        value: i
      });
    }
    return opts;
  }

  public get columnSelectOptions(): Array<{ label: string; value: string }> {
    const opts: Array<{ label: string; value: string }> = [
      { label: '⊘ (छोड़ दें / Skip this column)', value: '' }
    ];

    (this.availableHeaders || []).forEach(h => {
      let typeLabel = h.type || 'text';
      if (h.ref_table) typeLabel = `🔗 ${h.ref_table}`;
      else if (h.type === 'number' || h.type === 'decimal' || h.type === 'integer') typeLabel = '# number';
      else if (h.type === 'date') typeLabel = '📅 date';

      const displayName = h.name !== h.col_name ? ` : ${h.col_name}` : '';
      opts.push({
        label: `${h.name}${displayName}${h.not_null ? ' *' : ''} [${typeLabel}]`,
        value: h.name
      });
    });

    return opts;
  }

  public get filteredMatches(): SutramScanMatch[] {
    if (!this.report?.matches) return [];
    let list = this.report.matches;

    if (this.filterTab === 'mapped') {
      list = list.filter(m => m.targetColKey);
    } else if (this.filterTab === 'unmatched') {
      list = list.filter(m => !m.targetColKey);
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(m =>
        (m.sheetHeader && m.sheetHeader.toLowerCase().includes(q)) ||
        (m.targetColKey && m.targetColKey.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public get totalColsCount(): number {
    return this.report?.matches?.length || 0;
  }

  public get mappedCount(): number {
    return (this.report?.matches || []).filter(m => m.targetColKey).length;
  }

  public get unmatchedCount(): number {
    return (this.report?.matches || []).filter(m => !m.targetColKey).length;
  }

  public get missingMandatoryCount(): number {
    return this.report?.missingMandatory?.length || 0;
  }

  public get matchPercentage(): number {
    if (!this.totalColsCount) return 0;
    return Math.round((this.mappedCount / this.totalColsCount) * 100);
  }

  public onSheetSelect(sheet: string): void {
    if (sheet && sheet !== this.currentSheetName) {
      this.currentSheetName = sheet;
      this.normalSheetCustomName = sheet;
      this.sheetChange.emit(sheet);
    }
  }

  public onHeaderRowSelect(rowIdx: number): void {
    if (rowIdx !== undefined && rowIdx !== null && rowIdx !== this.headerRowIndex) {
      this.headerRowIndex = rowIdx;
      this.headerRowChange.emit(rowIdx);
    }
  }

  public onTableChange(table: string): void {
    this.selectedTable = table;
    this.targetTableChange.emit(table);
  }

  public onTargetColumnChange(match: SutramScanMatch, selectedKey: string): void {
    if (!selectedKey) {
      match.targetColKey = null;
      match.targetHeader = undefined;
      match.status = 'unmatched';
      match.confidence = 0;
      this.recalculateMissingMandatory();
      return;
    }

    const found = this.availableHeaders.find(h => h.name === selectedKey);
    if (found) {
      match.targetColKey = found.name;
      match.targetHeader = found;
      match.status = 'manual';
      match.confidence = 1.0;
    }
    this.recalculateMissingMandatory();
  }

  public recalculateMissingMandatory(): void {
    if (!this.report) return;
    const usedKeys = new Set((this.report.matches || []).map(m => m.targetColKey).filter(Boolean));
    this.report.missingMandatory = (this.availableHeaders || []).filter(h => h.not_null && !usedKeys.has(h.name));
  }

  public autoMapAll(): void {
    if (!this.report?.matches || !this.availableHeaders?.length) return;
    const used = new Set<string>();

    this.report.matches.forEach(m => {
      const cleanHeader = cleanString(m.sheetHeader);
      let bestMatch: SutramHeaderConfig | null = null;
      let highestScore = 0;

      for (const targetCol of this.availableHeaders) {
        const candidates = [targetCol.name, targetCol.col_name, ...(targetCol.alt_names || [])];
        for (const candidate of candidates) {
          const score = stringSimilarity(cleanHeader, cleanString(candidate));
          if (score > highestScore) {
            highestScore = score;
            bestMatch = targetCol;
          }
        }
      }

      if (bestMatch && highestScore >= 0.70 && !used.has(bestMatch.name)) {
        used.add(bestMatch.name);
        m.targetColKey = bestMatch.name;
        m.targetHeader = bestMatch;
        m.status = highestScore >= 0.95 ? 'matched' : 'manual';
        m.confidence = highestScore;
      }
    });

    this.recalculateMissingMandatory();
    this.cdr.markForCheck();
  }

  public clearAllMappings(): void {
    if (!this.report?.matches) return;
    this.report.matches.forEach(m => {
      m.targetColKey = null;
      m.targetHeader = undefined;
      m.status = 'unmatched';
      m.confidence = 0;
    });
    this.recalculateMissingMandatory();
    this.cdr.markForCheck();
  }

  public formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Drag & Drop Handlers ──────────────────────────────────────

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
        this.fileDropped.emit(file);
      }
    }
  }

  // ── Confirm Actions ───────────────────────────────────────────

  public confirmDirectNormal(): void {
    const finalName = (this.normalSheetCustomName || this.currentSheetName || this.fileName?.replace(/\.[^/.]+$/, '') || 'Sheet').trim();
    this.openDirectNormal.emit({
      sheetName: finalName,
      headers: this.sheetHeaders
    });
    this.close();
  }

  public confirmMappedToTable(): void {
    if (!this.selectedTable || !this.report) return;
    this.openMappedToTable.emit({
      targetTable: this.selectedTable,
      matches: this.report.matches,
      defaultValues: this.defaultValues
    });
    this.close();
  }

  public close(): void {
    this.visible = false;
    this.searchQuery = '';
    this.filterTab = 'all';
    this.normalSheetCustomName = '';
    this.deleteConfirmSheetId = null;
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }
}
