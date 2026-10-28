/**
 * sutram-correction-sidebar.component.ts
 * ─────────────────────────────────────────────────────────────
 * Collapsible Batch Correction Sidebar using PrimeNG p-sidebar.
 * Displays grouped unmatched values from verify API, allowing batch
 * resolution and one-click saving to xls_dictionary.
 * ─────────────────────────────────────────────────────────────
 */

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CorrectionGroup } from '../../models/sutram-correction.model';
import { SutramExcelStateService } from '../../services/sutram-excel-state.service';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';

@Component({
  selector: 'sutram-correction-sidebar',
  templateUrl: './sutram-correction-sidebar.component.html',
  styleUrls: ['./sutram-correction-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramCorrectionSidebarComponent {
  @Input() visible: boolean = false;
  @Input() groups: CorrectionGroup[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() resolved = new EventEmitter<{ group: CorrectionGroup; newDisplay: string; newId: any }>();

  constructor(
    private state: SutramExcelStateService,
    private api: SutramExcelApiService
  ) {}

  public resolveGroup(group: CorrectionGroup, newDisplay: string, newId?: any): void {
    if (!newDisplay) return;

    // Apply batch correction to grid
    this.state.applyBatchCorrection(group.type, group.name, newDisplay, newId);

    // If Save to Dictionary checked, call backend API
    if (group.saveToDictionary) {
      this.api.addDictionaryEntry({
        type: group.type,
        name: group.name,
        ref_id: newId !== undefined ? newId : newDisplay
      }).subscribe({
        next: () => console.log(`[SutramCorrection] Saved to dictionary: ${group.name} -> ${newDisplay}`),
        error: (err) => console.error('[SutramCorrection] Dictionary save failed:', err)
      });
    }

    group.isResolved = true;
    this.resolved.emit({ group, newDisplay, newId });
  }

  public close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
