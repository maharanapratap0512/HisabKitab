/**
 * sutram-dictionary-view.component.ts
 * ─────────────────────────────────────────────────────────────
 * Dictionary Manager View using PrimeNG p-table.
 * Allows searching, editing, and soft-deleting persistent correction rules
 * stored in xls_dictionary.
 * ─────────────────────────────────────────────────────────────
 */

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SutramExcelApiService } from '../../services/sutram-excel-api.service';
import { DictionaryEntry } from '../../models/sutram-correction.model';

@Component({
  selector: 'sutram-dictionary-view',
  templateUrl: './sutram-dictionary-view.component.html',
  styleUrls: ['./sutram-dictionary-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SutramDictionaryViewComponent implements OnInit {
  public entries: DictionaryEntry[] = [];
  public isLoading: boolean = false;
  public filterType: string = '';
  public searchQuery: string = '';

  constructor(
    private api: SutramExcelApiService,
    private cdr: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.loadEntries();
  }

  public loadEntries(): void {
    this.isLoading = true;
    this.api.getDictionary(this.filterType || undefined).subscribe({
      next: (list) => {
        this.entries = list;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('[SutramDictionaryView] Load failed:', err);
        this.cdr.markForCheck();
      }
    });
  }

  public deleteEntry(id: number): void {
    if (!confirm('क्या आप इस डिक्शनरी नियम को हटाना चाहते हैं?')) return;

    this.api.deleteDictionaryEntry(id).subscribe({
      next: () => {
        this.entries = this.entries.filter(e => e._id !== id);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('[SutramDictionaryView] Delete failed:', err)
    });
  }

  public onFilterChange(): void {
    this.loadEntries();
  }
}
