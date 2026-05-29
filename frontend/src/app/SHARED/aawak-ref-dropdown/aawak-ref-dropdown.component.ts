import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { ViewChild } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HttpService } from 'src/app/services/http.service';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-aawak-ref-dropdown',
  templateUrl: './aawak-ref-dropdown.component.html',
  styleUrls: ['./aawak-ref-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AawakRefDropdownComponent),
      multi: true
    }
  ]
})
export class AawakRefDropdownComponent implements ControlValueAccessor, OnChanges, OnDestroy {
  @Input() mmId: any;
  @Input() maxDate: any;
  @Input() deptId: any;
  @Input() filterObj: any = {};
  @Input() placeholder: string = 'Select Aawak';
  @Input() size: 'sm' | 'default' = 'default';
  @Input() mode: 'default' | 'tiny' = 'default';
  @Input() readonly: boolean = false;

  // Auto-save related
  @Input() autoSave: boolean = false;
  @Input() jawakId: any;
  @Output() saved = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();

  items: any[] = [];
  loading = false;
  totalCount = 0;
  page = 1;
  search$ = new Subject<string>();
  currentSearchTerm = '';

  @ViewChild('select') select!: NgSelectComponent;

  selectedValue: any = null;
  originalValue: any = null;
  isJustUpdated = false;
  private updateAnimTimer: any = null;
  private searchSub: Subscription;

  onChange: any = () => { };
  onTouched: any = () => { };

  alwaysTrue = () => true;

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService
  ) {
    this.searchSub = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.currentSearchTerm = term;
        this.page = 1;
        this.loading = true;
        return this.fetchData(term, 1);
      })
    ).subscribe((res: any) => {
      this.items = res.result || [];
      this.totalCount = res.total_count || 0;
      this.loading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mmId'] || changes['filterObj']) {
      // Clear items if MM changes to prevent cross-contamination, but only if not just initializing
      if (!changes['mmId']?.firstChange) {
        this.items = [];
        this.totalCount = 0;
      }
    }
    this.checkAndFetchSelectedAawak();
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
    if (this.updateAnimTimer) clearTimeout(this.updateAnimTimer);
  }

  checkAndFetchSelectedAawak() {
    if (this.selectedValue && this.deptId) {
      if (!this.items.some(item => item._id === this.selectedValue)) {
        this.fetchSingleAawak(this.selectedValue);
      }
    }
  }

  fetchSingleAawak(id: any) {
    if (!this.deptId) return;
    const body = {
      _id: id,
      limit: 1
    };
    this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.deptId, body).subscribe((res: any) => {
      if (res && res.success && res.result && res.result.length > 0) {
        const selectedItem = res.result[0];
        if (!this.items.some(item => item._id === selectedItem._id)) {
          this.items = [selectedItem, ...this.items];
        }
      }
    });
  }

  // --- ControlValueAccessor ---
  writeValue(value: any): void {
    this.selectedValue = value;
    if (this.originalValue === null) {
      this.originalValue = value;
    }
    this.checkAndFetchSelectedAawak();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.readonly = isDisabled; }

  // --- Dropdown Logic ---
  onDropdownOpen() {
    if (!this.mmId) return;
    this.page = 1;
    this.loading = true;
    this.fetchData(this.currentSearchTerm, 1).subscribe((res: any) => {
      this.items = res.result || [];
      this.totalCount = res.total_count || 0;
      this.loading = false;
    });
  }

  onScrollToEnd() {
    if (this.loading || this.items.length >= this.totalCount) return;
    this.loading = true;
    this.page++;
    this.fetchData(this.currentSearchTerm, this.page).subscribe((res: any) => {
      this.items = [...this.items, ...(res.result || [])];
      this.loading = false;
    });
  }

  fetchData(search: string, page: number): any {
    if (!this.mmId) {
      this.items = [];
      this.totalCount = 0;
      return of({ success: true, result: [], total_count: 0 });
    }
    const body = {
      ...this.filterObj,
      mm_id: Array.isArray(this.mmId) ? this.mmId : (this.mmId ? [this.mmId] : []),
      max_date: this.maxDate,
      search: search,
      pageNo: page,
      limit: 30
    };
    return this.http.put(this.api.getUrl('AAWAK') + 'dropdown/' + this.deptId, body);
  }

  onSelectChange(event: any) {
    const newValue = event ? event._id : null;

    // If autoSave is enabled, and there was already a reference saved
    if (this.autoSave && this.jawakId && this.originalValue && newValue !== this.originalValue) {
      Swal.fire({
        title: 'Change Reference?',
        text: "You are about to change an existing reference. The stock will be recalculated automatically. Proceed?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it'
      }).then((result) => {
        if (result.isConfirmed) {
          this.commitChange(newValue, event);
        } else {
          // Revert selection
          this.selectedValue = this.originalValue;
        }
      });
    } else {
      // Normal flow (no original value, or autoSave disabled)
      this.commitChange(newValue, event);
    }
  }

  private commitChange(newValue: any, event: any) {
    this.onChange(newValue);
    this.selectionChange.emit(event);

    if (this.autoSave && this.jawakId) {
      this.saveRef(newValue);
    }
  }

  saveRef(aawakRefId: any) {
    this.loading = true;
    this.isJustUpdated = false; // reset so animation can replay
    if (this.updateAnimTimer) clearTimeout(this.updateAnimTimer);
    this.http.put(this.api.getUrl('JAWAK') + 'ref-link/' + this.jawakId, { aawak_ref_id: aawakRefId })
      .subscribe((res: any) => {
        this.loading = false;
        if (res.success) {
          this.toastr.success('Aawak linked successfully');
          this.originalValue = aawakRefId;
          this.isJustUpdated = true;
          this.updateAnimTimer = setTimeout(() => {
            this.isJustUpdated = false;
          }, 2000);
          this.saved.emit({ jawakId: this.jawakId, aawak_ref_id: aawakRefId });
        }
      }, err => {
        this.loading = false;
        this.toastr.error('Failed to link Aawak');
      });
  }
}
