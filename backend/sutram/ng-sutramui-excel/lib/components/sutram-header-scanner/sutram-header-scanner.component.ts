/**
 * sutram-header-scanner.component.ts
 * ─────────────────────────────────────────────────────────────
 * Smart Header Scanner Modal using PrimeNG p-dialog.
 * Matches sheet headers with schema columns and alerts on missing fields.
 * ─────────────────────────────────────────────────────────────
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { SutramScanReport, SutramScanMatch, SutramHeaderConfig } from '../../models/sutram-excel.model';

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
  @Input() sheetNames: string[] = [];
  @Input() currentSheetName: string = '';
  @Input() sheetHeaders: string[] = [];
  @Input() sampleRows: any[][] = [];
  @Input() totalRows: number = 0;
  @Input() tablesList: Array<{ table: string; display_name: string }> = [];
  @Input() selectedTable: string = '';
  @Input() report: SutramScanReport | null = null;
  @Input() availableHeaders: SutramHeaderConfig[] = [];
  @Input() isTableConfigLoading: boolean = false;
  @Input() savedSheets: Array<{ sheetId: string; title: string; savedAt: string; rowCount: number }> = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() sheetChange = new EventEmitter<string>();
  @Output() targetTableChange = new EventEmitter<string>();
  @Output() openDirectNormal = new EventEmitter<{ sheetName: string; headers: string[] }>();
  @Output() openMappedToTable = new EventEmitter<{ targetTable: string; matches: SutramScanMatch[] }>();
  @Output() openSavedSheet = new EventEmitter<string>();
  @Output() deleteSavedSheet = new EventEmitter<string>();
  @Output() triggerFileInput = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  public showMatcherWizard: boolean = false;
  public normalSheetCustomName: string = '';

  public onSelectSavedSheet(sheetId: string): void {
    this.openSavedSheet.emit(sheetId);
  }

  public onDeleteSavedSheetClick(sheetId: string, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.deleteSavedSheet.emit(sheetId);
  }

  public get tableSelectOptions(): Array<{ label: string; value: string }> {
    return (this.tablesList || []).map(t => ({
      label: t.display_name ? `${t.display_name} (${t.table})` : t.table,
      value: t.table
    }));
  }

  public get columnSelectOptions(): Array<{ label: string; value: string }> {
    return (this.availableHeaders || []).map(h => ({
      label: `${h.name}${h.not_null ? ' *' : ''}`,
      value: h.name
    }));
  }

  public toggleMatcherWizard(): void {
    this.showMatcherWizard = !this.showMatcherWizard;
    if (this.showMatcherWizard) {
      const target = this.selectedTable || (this.tablesList.length > 0 ? this.tablesList[0].table : '');
      if (target) {
        this.selectedTable = target;
        this.targetTableChange.emit(target);
      }
    }
  }

  public onSheetSelect(sheet: string): void {
    if (sheet && sheet !== this.currentSheetName) {
      this.currentSheetName = sheet;
      this.normalSheetCustomName = sheet;
      this.sheetChange.emit(sheet);
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
      return;
    }

    const found = this.availableHeaders.find(h => h.name === selectedKey);
    if (found) {
      match.targetColKey = found.name;
      match.targetHeader = found;
      match.status = 'manual';
    }
  }

  public get matchedCount(): number {
    return (this.report?.matches || []).filter(m => m.targetColKey).length;
  }

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
      matches: this.report.matches
    });
    this.close();
  }

  public close(): void {
    this.visible = false;
    this.showMatcherWizard = false;
    this.normalSheetCustomName = '';
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }
}

