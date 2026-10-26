import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ScanReport, StudioColumn, StudioFormat } from '../../models/excel-studio.model';
import { ExcelStudioService } from '../../services/excel-studio.service';

@Component({
  selector: 'app-format-scanner-modal',
  templateUrl: './format-scanner-modal.component.html',
  styleUrls: ['./format-scanner-modal.component.scss']
})
export class FormatScannerModalComponent implements OnInit {
  @Input() rawRows: any[][] = [];
  @Input() currentFormat: StudioFormat | null = null;
  @Output() apply = new EventEmitter<{ format: StudioFormat; columnMap: { [sheetIndex: number]: string }; headerRow: number }>();
  @Output() close = new EventEmitter<void>();

  selectedFormatId: string = 'bachat';
  headerRowIndex: number = 0;
  scanReport: ScanReport | null = null;
  formats: StudioFormat[] = [];

  constructor(public studioService: ExcelStudioService) {
    this.formats = this.studioService.formats;
  }

  ngOnInit(): void {
    if (this.currentFormat) {
      this.selectedFormatId = this.currentFormat.id;
    }
    this.runScan();
  }

  onFormatChange(): void {
    this.runScan();
  }

  onHeaderRowChange(newIndex: number): void {
    this.headerRowIndex = newIndex;
    this.runScan();
  }

  runScan(): void {
    const target = this.studioService.getFormat(this.selectedFormatId);
    if (!target) return;

    const headerRow = this.rawRows[this.headerRowIndex] || [];
    const headers = headerRow.map((h: any) => String(h || '').trim());
    this.scanReport = this.studioService.scanAndMatch(headers, target, this.headerRowIndex);
  }

  onManualMapChange(matchItem: any, targetColKey: string | null): void {
    matchItem.targetColKey = targetColKey;
    matchItem.status = targetColKey ? 'manual' : 'unmatched';

    // Recalculate missing mandatory
    if (this.scanReport) {
      const mappedKeys = new Set(this.scanReport.matches.map(m => m.targetColKey).filter(k => !!k));
      this.scanReport.missingMandatory = this.scanReport.targetFormat.columns.filter(
        c => c.not_null && !mappedKeys.has(c.key)
      );
    }
  }

  applyMapping(): void {
    if (!this.scanReport) return;

    const columnMap: { [sheetIndex: number]: string } = {};
    for (const m of this.scanReport.matches) {
      if (m.targetColKey) {
        columnMap[m.sheetColIndex] = m.targetColKey;
      }
    }

    this.apply.emit({
      format: this.scanReport.targetFormat,
      columnMap: columnMap,
      headerRow: this.headerRowIndex
    });
  }

  dismiss(): void {
    this.close.emit();
  }
}
