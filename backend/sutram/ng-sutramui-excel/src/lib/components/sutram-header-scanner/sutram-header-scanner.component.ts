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
  @Input() visible: boolean = false;
  @Input() report: SutramScanReport | null = null;
  @Input() availableHeaders: SutramHeaderConfig[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<SutramScanMatch[]>();
  @Output() cancelled = new EventEmitter<void>();

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

  public confirm(): void {
    if (this.report) {
      this.confirmed.emit(this.report.matches);
    }
    this.close();
  }

  public close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancelled.emit();
  }
}
