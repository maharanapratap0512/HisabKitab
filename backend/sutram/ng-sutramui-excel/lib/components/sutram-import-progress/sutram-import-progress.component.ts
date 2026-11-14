/**
 * sutram-import-progress.component.ts
 * ─────────────────────────────────────────────────────────────
 * Streaming Import Progress Dialog using PrimeNG p-dialog and p-progressBar.
 * Displays live row-by-row status and activates Error Report download
 * when rejected rows exist.
 * ─────────────────────────────────────────────────────────────
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ImportProgressState } from '../../services/sutram-excel-state.service';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';

@Component({
  selector: 'sutram-import-progress',
  templateUrl: './sutram-import-progress.component.html',
  styleUrls: ['./sutram-import-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramImportProgressComponent {
  @Input() visible: boolean = false;
  @Input() progress: ImportProgressState = {
    current: 0,
    total: 0,
    percentage: 0,
    inserted: 0,
    updated: 0,
    duplicate: 0,
    rejected: 0,
    isActive: false
  };
  @Input() tableName: string = '';
  @Input() rejectedRows: any[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancelRequested = new EventEmitter<void>();

  public isDownloadingReport: boolean = false;

  constructor(private api: SutramExcelApiService) {}

  public downloadErrorReport(): void {
    if (!this.rejectedRows || this.rejectedRows.length === 0) return;

    this.isDownloadingReport = true;
    this.api.downloadErrorReport(this.tableName, this.rejectedRows).subscribe({
      next: (blob) => {
        this.isDownloadingReport = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rejected_${this.tableName}_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.isDownloadingReport = false;
        console.error('[SutramImportProgress] Error report download failed:', err);
      }
    });
  }

  public close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
