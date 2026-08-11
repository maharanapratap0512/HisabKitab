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

declare var $: any;

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
  @Input() isAdd: boolean = true;
  @Input() showAdd: boolean = true;
  @Input() isAddButton: boolean = true;

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
  showModal = false;
  modalId: string = 'aawakRefDropModal_' + Math.random().toString(36).substring(2, 9);
  presetAawakData: any = null;

  @ViewChild('select') select!: NgSelectComponent;

  selectedValue: any = null;
  originalValue: any = null;
  isJustUpdated = false;
  private updateAnimTimer: any = null;
  private searchSub: Subscription;
  private previousFilterJson = '';
  private fetchingSingleIds = new Set<string>();

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
    let mmChanged = false;
    let filterChanged = false;

    if (changes['mmId'] && !changes['mmId'].firstChange && changes['mmId'].previousValue !== changes['mmId'].currentValue) {
      mmChanged = true;
    }

    if (changes['filterObj']) {
      const currentJson = JSON.stringify(changes['filterObj'].currentValue || {});
      if (currentJson !== this.previousFilterJson) {
        filterChanged = true;
        this.previousFilterJson = currentJson;
      }
    }

    if (mmChanged) {
      this.items = [];
      this.totalCount = 0;
    }

    if (mmChanged || filterChanged) {
      this.checkAndFetchSelectedAawak();
    }
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
    if (this.updateAnimTimer) clearTimeout(this.updateAnimTimer);
  }

  checkAndFetchSelectedAawak() {
    if (this.selectedValue && this.deptId) {
      const targetId = typeof this.selectedValue === 'object' ? this.selectedValue._id : this.selectedValue;
      if (targetId && !this.items.some(item => item._id === targetId)) {
        this.fetchSingleAawak(targetId);
      }
    }
  }

  fetchSingleAawak(id: any) {
    const targetId = typeof id === 'object' ? id?._id : id;
    if (!targetId || !this.deptId) return;

    const idStr = String(targetId);
    if (this.fetchingSingleIds.has(idStr)) {
      return;
    }

    this.fetchingSingleIds.add(idStr);
    const body = {
      _id: targetId,
      limit: 1
    };
    this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.deptId, body).subscribe({
      next: (res: any) => {
        if (res && res.success && res.result && res.result.length > 0) {
          const selectedItem = res.result[0];
          if (!this.items.some(item => item._id === selectedItem._id)) {
            this.items = [selectedItem, ...this.items];
          }
        }
      },
      error: () => {
        this.fetchingSingleIds.delete(idStr);
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
      page: page,
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

  onAddAawakClick(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const data: any = {};
    if (this.mmId) {
      data.aawak_mm_id = this.mmId;
    }
    if (this.filterObj) {
      if (this.filterObj.pbk_id) data.pbk_id = this.filterObj.pbk_id;
      if (this.filterObj.aawak_mm_id) data.aawak_mm_id = this.filterObj.aawak_mm_id;
      if (this.filterObj.nimitt_id) data.nimitt_id = this.filterObj.nimitt_id;
      if (this.filterObj.item_id) data.item_id = this.filterObj.item_id;
      if (this.filterObj.subitem_id) data.subitem_id = this.filterObj.subitem_id;
      if (this.filterObj.condition_id) data.condition_id = this.filterObj.condition_id;
      if (this.filterObj.aawak_source_id) data.aawak_source_id = this.filterObj.aawak_source_id;
      if (this.filterObj.aawak_type_id) data.aawak_type_id = this.filterObj.aawak_type_id;
      if (this.filterObj.product_id) data.product_id = this.filterObj.product_id;
    }

    this.presetAawakData = data;
    this.showModal = true;
    setTimeout(() => {
      if (typeof $ !== 'undefined') {
        $('#' + this.modalId).modal('show');
      }
    }, 50);
  }

  closeSelfModal() {
    if (typeof $ !== 'undefined') {
      $('#' + this.modalId).modal('hide');
    }
    this.showModal = false;
    this.presetAawakData = null;
  }

  onSelfAawakCreated(ev: any) {
    if (ev) {
      let createdItem: any = null;
      if (Array.isArray(ev)) {
        createdItem = ev[0];
      } else if (ev.aawaks && Array.isArray(ev.aawaks)) {
        createdItem = ev.aawaks[0];
      } else if (ev.result && Array.isArray(ev.result)) {
        createdItem = ev.result[0];
      } else {
        createdItem = ev;
      }

      if (createdItem && createdItem._id) {
        if (!this.items.some((i: any) => i._id === createdItem._id)) {
          this.items.unshift(createdItem);
        }
        this.selectedValue = createdItem._id;
        this.commitChange(createdItem._id, createdItem);
      }
    }
    this.closeSelfModal();
  }
}
