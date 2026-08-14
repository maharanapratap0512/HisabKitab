import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, SimpleChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: 'app-aawak-ref',
  templateUrl: './aawak-ref.component.html',
  styleUrls: ['./aawak-ref.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AawakRefComponent),
      multi: true
    }
  ]
})
export class AawakRefComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @Input() mmId: any;
  @Input() maxDate: any;
  @Input() deptId: any;
  @Input() filterObj: any = {};
  @Input() placeholder: string = 'Select Aawak';
  @Input() size: 'sm' | 'default' = 'default';
  @Input() mode: 'default' | 'tiny' | 'compact' = 'default';
  @Input() readonly: boolean = false;

  // Auto-save related
  @Input() autoSave: boolean = false;
  @Input() jawakId: any;
  @Output() saved = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();
  @Output() splitsChange = new EventEmitter<any>();
  @Output() splitsSelected = new EventEmitter<any>();

  @Input() totalSplitQty = 0;
  @Input() selectedSplitsData: any[] = [];

  // Multi-split modal properties
  showSplitModal = false;
  splitModalId: string = 'aawakRefModal_' + Math.random().toString(36).substring(2, 9);
  splitList: any[] = [];
  splitSearchTerm = '';
  splitSearch$ = new Subject<string>();
  splitPage = 1;
  splitTotalCount = 0;
  splitLoading = false;
  noMoreSplitItems = false;
  private splitSearchSub!: Subscription;

  selectedValue: any = null;
  originalValue: any = null;
  isJustUpdated = false;
  private previousFilterJson = '';

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.jawakId && (!this.selectedSplitsData || this.selectedSplitsData.length === 0)) {
      this.fetchJawakSplits();
    }

    this.splitSearchSub = this.splitSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.splitSearchTerm = term;
      this.splitPage = 1;
      this.splitLoading = true;
      this.noMoreSplitItems = false;
      this.fetchData(term, 1).subscribe((res: any) => {
        this.splitLoading = false;
        this.splitTotalCount = res.total_count || 0;
        const fetched = res.result || [];
        if (fetched.length < 30 || (this.splitTotalCount > 0 && fetched.length >= this.splitTotalCount)) {
          this.noMoreSplitItems = true;
        }
        this.mergeSplitResults(fetched, true);
      }, () => {
        this.splitLoading = false;
      });
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

    if (changes['selectedSplitsData']) {
      const val = changes['selectedSplitsData'].currentValue;
      this.selectedSplitsData = Array.isArray(val) ? val : [];
      this.totalSplitQty = this.selectedSplitsData.reduce((sum: number, s: any) => sum + (Number(s.split_qty) || 0), 0);
      if (this.selectedSplitsData.length > 0 && !this.selectedValue) {
        this.selectedValue = this.selectedSplitsData[0].aawak_id || this.selectedSplitsData[0]._id;
      }
      if (this.selectedSplitsData.length === 0) {
        this.selectedValue = null;
        if (this.splitList) {
          this.splitList.forEach((i: any) => {
            i.selected = false;
            i.split_qty = 0;
          });
        }
      }
    }
    if (changes['totalSplitQty'] && changes['totalSplitQty'].currentValue !== undefined) {
      this.totalSplitQty = Number(changes['totalSplitQty'].currentValue) || 0;
    }
  }

  ngOnDestroy(): void {
    if (this.splitSearchSub) this.splitSearchSub.unsubscribe();
    if (typeof $ !== 'undefined') {
      const $modal = $('#' + this.splitModalId);
      if ($modal.length) {
        $modal.modal('hide');
        $modal.remove();
      }
      $('.modal-backdrop').remove();
      $('body').removeClass('modal-open').css('padding-right', '');
    }
  }

  fetchJawakSplits(callback?: Function) {
    if (!this.jawakId) {
      if (callback) callback();
      return;
    }
    this.http.get(this.api.getUrl('JAWAK') + 'splits/' + this.jawakId).subscribe((res: any) => {
      if (res && res.success && Array.isArray(res.result) && res.result.length > 0) {
        this.selectedSplitsData = res.result.map((s: any) => ({
          aawak_id: s.aawak_id,
          split_qty: Number(s.effective_split_qty !== undefined ? s.effective_split_qty : (s.split_qty !== null && s.split_qty !== undefined ? s.split_qty : s.qty)),
          qty: Number(s.qty),
          lot_no: s.lot_no,
          pkt_num: s.pkt_num,
          item_hin: s.item_hin,
          remaining_qty: s.remaining_qty,
          aawak_obj: s
        }));
        this.totalSplitQty = this.selectedSplitsData.reduce((sum, s) => sum + s.split_qty, 0);
        this.selectedValue = this.selectedSplitsData[0]?.aawak_id || null;
        this.splitsChange.emit({
          splits: this.selectedSplitsData,
          totalQty: this.totalSplitQty,
          primaryAawak: this.selectedSplitsData[0]?.aawak_obj
        });
      }
      if (callback) callback();
    }, () => {
      if (callback) callback();
    });
  }

  // --- ControlValueAccessor ---
  writeValue(value: any): void {
    this.selectedValue = value;
    if (this.originalValue === null) {
      this.originalValue = value;
    }
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.readonly = isDisabled; }

  fetchData(search: string, page: number): any {
    if (!this.mmId) {
      return of({ success: true, result: [], total_count: 0 });
    }
    const first = this.getFirstSelectedItem();
    const autoFilterObj: any = {};
    if (first) {
      if (first.item_id) autoFilterObj.item_id = [first.item_id];
      if (first.subitem_id) autoFilterObj.subitem_id = [first.subitem_id];
      if (first.condition_id) autoFilterObj.condition_id = [first.condition_id];
      if (first.aawak_source_id) autoFilterObj.aawak_source_id = [first.aawak_source_id];
      if (first.unit_id) autoFilterObj.unit_id = [first.unit_id];
    }

    const includeIds: number[] = [];
    if (this.selectedValue) {
      const val = Number(this.selectedValue);
      if (!isNaN(val) && val > 0) includeIds.push(val);
    }
    if (this.selectedSplitsData && this.selectedSplitsData.length > 0) {
      this.selectedSplitsData.forEach((s: any) => {
        const id = Number(s.aawak_id || s._id);
        if (!isNaN(id) && id > 0 && !includeIds.includes(id)) {
          includeIds.push(id);
        }
      });
    }

    const body = {
      ...this.filterObj,
      ...autoFilterObj,
      mm_id: Array.isArray(this.mmId) ? this.mmId : (this.mmId ? [this.mmId] : []),
      max_date: this.maxDate,
      include_ids: includeIds,
      remaining_qty: true,
      search: search,
      page: page,
      pageNo: page,
      limit: 30
    };
    return this.http.put(this.api.getUrl('AAWAK') + 'dropdown/' + this.deptId, body);
  }

  // --- Multi-Split Aawak Modal Logic ---
  /**
   * Public API method to open modal, optionally initializing input data (Parent-Child entry form pattern)
   */
  open(data?: any, e?: Event): void {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (data) {
      if (data.mmId !== undefined) this.mmId = data.mmId;
      if (data.jawakId !== undefined) this.jawakId = data.jawakId;
      if (data.filterObj !== undefined) this.filterObj = data.filterObj;
      if (data.selectedSplitsData !== undefined) this.selectedSplitsData = data.selectedSplitsData;
      if (data.totalSplitQty !== undefined) this.totalSplitQty = data.totalSplitQty;
      if (data.selectedValue !== undefined) this.selectedValue = data.selectedValue;
      if (data.mode !== undefined) this.mode = data.mode;
    }
    this.openSplitModal(e);
  }

  openModal(e?: Event, data?: any): void {
    this.open(data || e, e instanceof Event ? e : undefined);
  }

  openSplitModal(e?: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!this.mmId) {
      this.toastr.warning('Please select Mandi/MM first');
      return;
    }

    if (this.jawakId && (!this.selectedSplitsData || this.selectedSplitsData.length === 0)) {
      this.fetchJawakSplits(() => this.openSplitModalBody());
    } else {
      this.openSplitModalBody();
    }
  }

  openSplitModalBody() {
    this.splitSearchTerm = '';
    this.splitPage = 1;
    this.splitLoading = true;
    this.noMoreSplitItems = false;
    this.showSplitModal = true;

    if (typeof $ !== 'undefined') {
      const $modal = $('#' + this.splitModalId);
      if ($modal.length) {
        if ($modal.parent()[0] !== document.body) {
          $modal.appendTo('body');
        }
        $modal.modal('show');
      }
    }

    this.fetchData('', 1).subscribe((res: any) => {
      this.splitLoading = false;
      let fetched = res.result || [];
      this.splitTotalCount = res.total_count || 0;
      if (fetched.length < 30 || (this.splitTotalCount > 0 && fetched.length >= this.splitTotalCount)) {
        this.noMoreSplitItems = true;
      }

      const selectedMap = new Map<number, number>();
      if (this.selectedSplitsData && this.selectedSplitsData.length > 0) {
        this.selectedSplitsData.forEach((s: any) => selectedMap.set(s.aawak_id || s._id, s.split_qty));
      } else if (this.selectedValue) {
        selectedMap.set(this.selectedValue, this.totalSplitQty || 0);
      }

      // Merge any selected items not present on page 1 into fetched list so they are visible & checked
      const existingIds = new Set(fetched.map((i: any) => i._id));
      if (this.selectedSplitsData) {
        for (const s of this.selectedSplitsData) {
          const awkId = s.aawak_id || s._id;
          if (awkId && !existingIds.has(awkId) && s.aawak_obj) {
            fetched.unshift({
              ...s.aawak_obj,
              _id: awkId
            });
            existingIds.add(awkId);
          }
        }
      }

      this.splitList = fetched.map((item: any) => ({
        ...item,
        selected: selectedMap.has(item._id),
        split_qty: selectedMap.has(item._id) ? selectedMap.get(item._id) : (item.remaining_qty !== undefined ? item.remaining_qty : item.qty)
      })).sort((a: any, b: any) => {
        if (a.selected !== b.selected) return a.selected ? -1 : 1;
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        return a._id - b._id;
      });

      this.onSplitQtyChange();
    }, () => {
      this.splitLoading = false;
      this.toastr.error('Failed to load Aawaks for split');
    });
  }

  clearAllSelectionsAndSave(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (this.splitList) {
      this.splitList.forEach((i: any) => {
        i.selected = false;
        i.split_qty = 0;
      });
    }
    this.selectedSplitsData = [];
    this.totalSplitQty = 0;
    this.selectedValue = null;
    this.onChange(null);
    this.splitsChange.emit({ splits: [], totalQty: 0, primaryAawak: null });
    this.splitsSelected.emit({ splits: [], totalQty: 0, primaryAawak: null });
    this.selectionChange.emit(null);

    if (this.autoSave && this.jawakId) {
      this.saveRefSplits([]);
    }
  }

  closeSplitModal() {
    if (typeof $ !== 'undefined') {
      const $modal = $('#' + this.splitModalId);
      if ($modal.length) {
        $modal.modal('hide');
      }
    }
    this.showSplitModal = false;
  }

  onSplitSearchInput() {
    this.splitSearch$.next(this.splitSearchTerm);
  }

  mergeSplitResults(newItems: any[], reset: boolean): number {
    const selectedMap = new Map<number, any>();
    this.splitList.forEach((item: any) => {
      if (item.selected) {
        selectedMap.set(item._id, item);
      }
    });

    const mappedNew = newItems.map((item: any) => {
      if (selectedMap.has(item._id)) {
        return selectedMap.get(item._id);
      }
      return {
        ...item,
        selected: false,
        split_qty: item.remaining_qty !== undefined ? item.remaining_qty : item.qty
      };
    });

    let addedCount = 0;
    if (reset) {
      const newIds = new Set(mappedNew.map((i: any) => i._id));
      const previousSelectedUnlisted = Array.from(selectedMap.values()).filter((i: any) => !newIds.has(i._id));
      this.splitList = [...previousSelectedUnlisted, ...mappedNew];
      this.splitList.sort((a: any, b: any) => {
        if (a.selected !== b.selected) return a.selected ? -1 : 1;
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        return a._id - b._id;
      });
      addedCount = mappedNew.length;
    } else {
      const existingIds = new Set(this.splitList.map(s => s._id));
      const incomingFiltered = mappedNew.filter((i: any) => !existingIds.has(i._id));
      this.splitList.push(...incomingFiltered);
      addedCount = incomingFiltered.length;
    }

    this.onSplitQtyChange();
    return addedCount;
  }

  onSplitScroll(event: any) {
    const element = event.target;
    if (this.splitLoading || this.noMoreSplitItems) return;
    if (this.splitTotalCount > 0 && this.splitList.length >= this.splitTotalCount) return;

    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 60) {
      this.splitLoading = true;
      const nextPage = this.splitPage + 1;
      this.fetchData(this.splitSearchTerm, nextPage).subscribe((res: any) => {
        this.splitLoading = false;
        const newItems = res.result || [];
        if (newItems.length === 0) {
          this.noMoreSplitItems = true;
          return;
        }
        this.splitPage = nextPage;
        this.splitTotalCount = res.total_count || this.splitTotalCount;
        const addedCount = this.mergeSplitResults(newItems, false);
        if (addedCount === 0 || newItems.length < 30 || (this.splitTotalCount > 0 && this.splitList.length >= this.splitTotalCount)) {
          this.noMoreSplitItems = true;
        }
      }, () => {
        this.splitLoading = false;
      });
    }
  }

  onSplitCardClick(awk: any, event: Event) {
    const target = event.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
      if (!awk.selected) {
        awk.selected = true;
        awk.split_qty = awk.remaining_qty !== undefined ? awk.remaining_qty : awk.qty;
        this.onSplitQtyChange();
      }
      return;
    }
    awk.selected = !awk.selected;
    if (awk.selected) {
      awk.split_qty = awk.remaining_qty !== undefined ? awk.remaining_qty : awk.qty;
    }
    this.onSplitQtyChange();
  }

  onSplitCheckToggle(awk: any) {
    if (awk.selected) {
      awk.split_qty = awk.remaining_qty !== undefined ? awk.remaining_qty : awk.qty;
    }
    this.onSplitQtyChange();
  }

  onSplitQtyChange() {
    this.totalSplitQty = this.splitList
      .filter((i: any) => i.selected)
      .reduce((sum: number, i: any) => sum + (Number(i.split_qty) || 0), 0);
  }

  getSelectedCount(): number {
    return this.splitList.filter((i: any) => i.selected).length;
  }

  getFirstSelectedItem(): any {
    if (!this.splitList) return null;
    const selected = this.splitList.filter((i: any) => i.selected);
    return selected.length > 0 ? selected[0] : null;
  }

  isItemCompatible(item: any): boolean {
    const first = this.getFirstSelectedItem();
    if (!first) return true;

    const matchItem = item.item_id === first.item_id;
    const matchSubitem = (item.subitem_id || null) === (first.subitem_id || null);
    const matchCondition = (item.condition_id || null) === (first.condition_id || null);
    const matchSource = (item.aawak_source_id || null) === (first.aawak_source_id || null);
    const matchUnit = item.unit_id === first.unit_id;

    return matchItem && matchSubitem && matchCondition && matchSource && matchUnit;
  }

  getVisibleSplitList(): any[] {
    const first = this.getFirstSelectedItem();
    if (!first) return this.splitList;
    return this.splitList.filter((item: any) => item.selected || this.isItemCompatible(item));
  }

  clearAllSelections() {
    if (this.splitList) {
      this.splitList.forEach((i: any) => {
        i.selected = false;
        i.split_qty = 0;
      });
    }
    this.selectedSplitsData = [];
    this.totalSplitQty = 0;
    this.selectedValue = null;
    this.onSplitQtyChange();
  }

  applySplitSelection() {
    const selected = this.splitList.filter((i: any) => i.selected && Number(i.split_qty) > 0);
    if (selected.length === 0) {
      this.toastr.warning('Please select at least one Aawak');
      return;
    }
    this.selectedSplitsData = selected.map((i: any) => ({
      aawak_id: i._id,
      split_qty: Number(i.split_qty),
      lot_no: i.lot_no,
      pkt_num: i.pkt_num,
      item_hin: i.item_hin,
      remaining_qty: i.remaining_qty,
      aawak_obj: i
    }));

    const primaryAawak = selected[0];
    this.selectedValue = primaryAawak._id;
    this.onChange(primaryAawak._id);

    const totalRemaining = selected.reduce((sum: number, s: any) => sum + (Number(s.remaining_qty) || 0), 0);
    const totalOriginalQty = selected.reduce((sum: number, s: any) => sum + (Number(s.qty) || 0), 0);
    const lotNos = selected.map((s: any) => s.lot_no).filter((l: any) => l).join(', ');

    const compositeAawak = {
      ...primaryAawak,
      qty: selected.length > 1 ? this.totalSplitQty : primaryAawak.qty,
      remaining_qty: selected.length > 1 ? totalRemaining : primaryAawak.remaining_qty,
      allocated_qty: this.totalSplitQty,
      total_split_qty: this.totalSplitQty,
      is_split: selected.length > 1 ? 1 : 0,
      splits_count: selected.length,
      lot_no: selected.length > 1 ? (lotNos ? `Lot: ${lotNos}` : `${selected.length} Aawaks`) : primaryAawak.lot_no,
      splits: this.selectedSplitsData
    };

    const payload = {
      splits: this.selectedSplitsData,
      totalQty: this.totalSplitQty,
      primaryAawak: compositeAawak
    };

    this.splitsChange.emit(payload);
    this.splitsSelected.emit(payload);
    this.selectionChange.emit(compositeAawak);

    if (this.autoSave && this.jawakId) {
      this.saveRefSplits(this.selectedSplitsData);
    }
    this.closeSplitModal();
  }

  saveRefSplits(splits: any[]) {
    this.splitLoading = true;
    this.http.put(this.api.getUrl('JAWAK') + 'ref-link/' + this.jawakId, { aawak_splits: splits })
      .subscribe((res: any) => {
        this.splitLoading = false;
        if (res.success) {
          this.toastr.success('Multi-Aawak splits saved successfully');
          this.saved.emit({ jawakId: this.jawakId, aawak_splits: splits });
        }
      }, err => {
        this.splitLoading = false;
        this.toastr.error('Failed to save splits');
      });
  }
}
