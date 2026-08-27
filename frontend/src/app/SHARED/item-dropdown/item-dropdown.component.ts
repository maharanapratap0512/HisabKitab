import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { GlobalService } from 'src/app/services/global.service';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { FilterByDatePipe } from 'src/app/pipe/filter-by-date.pipe';

declare var $: any;

@Component({
  selector: 'app-item-dropdown',
  templateUrl: './item-dropdown.component.html',
  styleUrls: ['./item-dropdown.component.scss'],
  providers: [
    FilterByDatePipe,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ItemDropdownComponent),
      multi: true
    }
  ]
})
export class ItemDropdownComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  @ViewChild(NgSelectComponent) selectComponent: any;

  @Input() items: any[] = [];
  @Input() categoryIds: any[] = [];
  @Input() date: any = null;
  @Input() filterObj: any = {};
  @Input() placeholder: string = 'Select Item';
  @Input() appendTo: string = 'body';
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;

  focus() {
    if (this.selectComponent) {
      try {
        if (typeof this.selectComponent.focus === 'function') {
          this.selectComponent.focus();
        }
        if (this.selectComponent.elementRef && this.selectComponent.elementRef.nativeElement) {
          const input = this.selectComponent.elementRef.nativeElement.querySelector('input');
          if (input) {
            input.focus();
          }
        }
      } catch (e) { }
    }
  }
  @Input() size: 'sm' | 'default' = 'default';
  @Input() multiple: boolean = false;
  @Input() closeOnSelect: boolean = true;

  // Individual ID support
  @Input() itemId: any;
  @Input() subitemId: any;
  @Output() itemIdChange = new EventEmitter<any>();
  @Output() subitemIdChange = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();
  @Output() open = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() addItem = new EventEmitter<void>();
  @Output() addSubitem = new EventEmitter<void>();
  @Output() addVariant = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<string>();

  options: any[] = [];
  selectedValue: any = null;
  internalItems: any[] = [];
  private listSub?: Subscription;

  showModal: string = '';
  modalId: string = 'itemDropModal_' + Math.random().toString(36).substring(2, 9);

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor(
    public gs: GlobalService,
    public auth: AuthService,
    private filterByDatePipe: FilterByDatePipe
  ) { }

  ngOnInit(): void {
    this.listSub = this.gs.observeList().subscribe((result: any) => {
      if (result && result.itemmix) {
        this.internalItems = result.itemmix;
        this.flattenItems();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['categoryIds'] || changes['date'] || changes['filterObj']) {
      this.flattenItems();
    }
    if (changes['itemId'] || changes['subitemId']) {
      this.syncSelectedValue();
    }
  }

  flattenItems() {
    const flat: any[] = [];
    const rawSource = (this.items && this.items.length > 0) ? this.items : (this.internalItems || []);
    if (!rawSource || !Array.isArray(rawSource)) return;

    // 1. Date Filter using project's FilterByDatePipe
    const effectiveDate = this.date || this.filterObj?.date || this.filterObj?.date_from;
    let dateFilteredSource = rawSource;
    if (effectiveDate) {
      dateFilteredSource = this.filterByDatePipe.transform(rawSource, effectiveDate);
    }

    // 2. Category Filter
    const catSource = (this.categoryIds && this.categoryIds.length > 0)
      ? this.categoryIds
      : (this.filterObj?.category_id || this.filterObj?.categoryIds || this.filterObj?.categories || []);

    const catArray = Array.isArray(catSource) ? catSource : (catSource ? [catSource] : []);

    const activeCatIds = catArray
      .map((c: any) => (c && typeof c === 'object') ? (c._id || c.category_id || c.id) : c)
      .filter((c: any) => c !== null && c !== undefined && c !== '' && c !== 'null')
      .map((c: any) => String(c));

    const isCatFilterActive = activeCatIds.length > 0;

    dateFilteredSource.forEach(it => {
      if (!it) return;

      const subitemsList: any[] = Array.isArray(it.subitems) ? it.subitems : [];
      let itemMatches = true;
      let matchingSubitems = subitemsList;

      if (isCatFilterActive) {
        const itemCats: string[] = [];
        if (it.categories && Array.isArray(it.categories)) {
          it.categories.forEach((c: any) => {
            const cid = (c && typeof c === 'object') ? (c._id || c.category_id || c.id) : c;
            if (cid !== null && cid !== undefined) itemCats.push(String(cid));
          });
        }
        if (it.category_ids && Array.isArray(it.category_ids)) {
          it.category_ids.forEach((c: any) => {
            if (c !== null && c !== undefined) itemCats.push(String(c));
          });
        }

        itemMatches = itemCats.some((id: string) => activeCatIds.includes(id));

        if (subitemsList.length > 0) {
          matchingSubitems = subitemsList.filter((sub: any) => {
            const subCats: string[] = [];
            if (sub.categories && Array.isArray(sub.categories)) {
              sub.categories.forEach((c: any) => {
                const cid = (c && typeof c === 'object') ? (c._id || c.category_id || c.id) : c;
                if (cid !== null && cid !== undefined) subCats.push(String(cid));
              });
            }
            if (subCats.length > 0) {
              return subCats.some((id: string) => activeCatIds.includes(id));
            }
            return itemMatches;
          });
        } else {
          matchingSubitems = [];
        }

        if (!itemMatches && matchingSubitems.length === 0) {
          return;
        }
      }

      // Parent item
      const itemHin = it.item_hin ? String(it.item_hin).trim() : '';
      const itemEng = it.item_eng ? String(it.item_eng).trim() : '';
      const itemCode = it.item_code ? String(it.item_code).trim() : '';
      const itemRoman = it.item_roman ? String(it.item_roman).trim() : '';

      let aliasTags = '';
      if (it.item_aliases && Array.isArray(it.item_aliases)) {
        aliasTags = it.item_aliases.map((a: any) => a.alias || '').join(' ');
      }

      if (!isCatFilterActive || itemMatches) {
        flat.push({
          id: `${it._id}:`,
          item_id: it._id,
          subitem_id: null,
          item_hin: itemHin,
          item_eng: itemEng,
          item_code: itemCode,
          item_roman: itemRoman,
          item_aliases: it.item_aliases,
          isSubitem: false,
          item: it,
          searchTags: `${itemHin} ${itemEng} ${itemCode} ${itemRoman} ${aliasTags}`.toLowerCase()
        });
      }

      if (matchingSubitems && matchingSubitems.length > 0) {
        matchingSubitems.forEach((sub: any) => {
          if (!sub) return;
          const subitemHin = sub.subitem_hin ? String(sub.subitem_hin).trim() : '';
          const subitemEng = sub.subitem_eng ? String(sub.subitem_eng).trim() : '';
          const subitemCode = sub.subitem_code ? String(sub.subitem_code).trim() : '';
          const subitemRoman = sub.subitem_roman ? String(sub.subitem_roman).trim() : '';

          flat.push({
            id: `${it._id}:${sub._id}`,
            item_id: it._id,
            subitem_id: sub._id,
            item_hin: itemHin,
            item_eng: itemEng,
            subitem_hin: subitemHin,
            subitem_eng: subitemEng,
            subitem_code: subitemCode,
            subitem_roman: subitemRoman,
            item_aliases: it.item_aliases,
            isSubitem: true,
            item: it,
            searchTags: `${subitemHin} ${itemHin} ${subitemEng} ${itemEng} ${subitemCode} ${subitemRoman} ${itemCode} ${aliasTags}`.toLowerCase()
          });
        });
      }
    });
    this.options = flat;

    // After flattening, we might need to re-sync the selected object
    if (this.itemId !== undefined || this.subitemId !== undefined) {
      this.syncSelectedValue();
    }
  }

  syncSelectedValue() {
    const id = (this.itemId != null) ? (this.subitemId != null ? `${this.itemId}:${this.subitemId}` : `${this.itemId}:`) : null;
    this.selectedValue = id ? this.options.find(o => o.id === id) : null;
  }

  compareById = (a: any, b: any) => {
    return a && b ? a.id === b.id : a === b;
  }

  writeValue(value: any): void {
    if (this.multiple) {
      const values = Array.isArray(value) ? value : (value ? [value] : []);
      this.selectedValue = values.map(v => typeof v === 'string' ? this.options.find(o => o.id === v) : v).filter(Boolean);
    } else {
      if (typeof value === 'string') {
        this.selectedValue = this.options.find(o => o.id === value);
        if (this.selectedValue) {
          const parts = value.split(':');
          this.itemId = parts[0] ? Number(parts[0]) : null;
          this.subitemId = parts[1] ? Number(parts[1]) : null;
          this.itemIdChange.emit(this.itemId);
          this.subitemIdChange.emit(this.subitemId);
        }
      } else {
        this.selectedValue = value;
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }

  onSelectChange(event: any) {
    this.onTouched();
    if (!this.multiple) {
      const selected = event;
      let res: any = null;
      if (selected) {
        res = {
          item_id: selected.item_id,
          subitem_id: selected.subitem_id,
          item: selected.item,
          raw: selected
        };
        this.itemId = selected.item_id;
        this.subitemId = selected.subitem_id;
      } else {
        res = { item_id: null, subitem_id: null, item: null, raw: null };
        this.itemId = null;
        this.subitemId = null;
      }

      this.itemIdChange.emit(res.item_id);
      this.subitemIdChange.emit(res.subitem_id);

      this.onChange(selected ? selected.id : null);
      this.change.emit(res);
    } else {
      // Multiple selection: emit array of ID strings
      const ids = Array.isArray(event) ? event.map(o => o.id) : [];
      this.onChange(ids);
      this.change.emit(ids);
    }
  }

  customSearch(term: string, item: any) {
    if (!term || !term.trim()) return true;
    const words = term.toLowerCase().trim().split(/\s+/);
    const tags = item.searchTags || '';
    return words.every(w => tags.includes(w));
  }

  openSelfModal(type: string) {
    this.showModal = type;
    setTimeout(() => {
      if (typeof $ !== 'undefined') {
        $('#' + this.modalId).appendTo('body').modal('show');
      }
    }, 50);
  }

  onAddItemClick(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.addItem.emit();
    this.addClick.emit('Add Item');
    this.openSelfModal('Add Item');
  }

  onAddSubitemClick(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.addSubitem.emit();
    this.addClick.emit('Add Subitem');
    this.openSelfModal('Add Subitem');
  }

  onAddVariantClick(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.addVariant.emit();
    this.addClick.emit('Add Variant');
    this.openSelfModal('Add Variant');
  }

  get selectedItemObj(): any {
    const source = (this.items && this.items.length > 0) ? this.items : (this.internalItems || []);
    if (this.itemId) {
      return (source || []).find((i: any) => i._id === this.itemId || i.id === this.itemId) || null;
    }
    return null;
  }

  closeSelfModal() {
    if (typeof $ !== 'undefined') {
      $('#' + this.modalId).modal('hide');
    }
    this.showModal = '';
    this.refreshMasterList();
  }

  refreshMasterList() {
    this.gs.observeList(true).subscribe((result: any) => {
      if (result && result.itemmix) {
        this.internalItems = result.itemmix;
        this.flattenItems();
        this.syncSelectedValue();
        if (this.selectedValue) {
          this.onSelectChange(this.selectedValue);
        }
      }
    });
  }

  onSelfVariantCreated(ev: any) {
    if (ev && ev.refreshAttributes) {
      return;
    }
    if (this.gs.Lists && this.gs.Lists.itemmix) {
      this.internalItems = this.gs.Lists.itemmix;
    }
    this.flattenItems();
    if (ev && ev.closeModal !== false) {
      this.closeSelfModal();
    }
  }

  onSelfItemCreated(ev: any) {
    if (ev && ev._id) {
      const source = (this.items && this.items.length > 0) ? this.items : this.internalItems;
      const exists = source.some((it: any) => it._id === ev._id);
      if (!exists) {
        source.push(ev);
      }
      this.flattenItems();

      this.itemId = ev._id;
      this.subitemId = null;
      this.syncSelectedValue();
      if (this.selectedValue) {
        this.onSelectChange(this.selectedValue);
      }
    }
    this.closeSelfModal();
  }

  onSelfSubitemCreated(ev: any) {
    if (ev && ev._id) {
      const source = (this.items && this.items.length > 0) ? this.items : this.internalItems;
      const parentItem = source.find((it: any) => it._id === ev.item_id);
      if (parentItem) {
        if (!parentItem.subitems) {
          parentItem.subitems = [];
        }
        const subExists = parentItem.subitems.some((s: any) => s._id === ev._id);
        if (!subExists) {
          parentItem.subitems.push(ev);
        }
      }
      this.flattenItems();

      this.itemId = ev.item_id;
      this.subitemId = ev._id;
      this.syncSelectedValue();
      if (this.selectedValue) {
        this.onSelectChange(this.selectedValue);
      }
    }
    this.closeSelfModal();
  }

  selectAll() {
    this.selectedValue = [...this.options];
    const ids = this.options.map(o => o.id);
    this.onChange(ids);
    this.change.emit(ids);
  }

  deselectAll() {
    this.selectedValue = [];
    this.onChange([]);
    this.change.emit([]);
  }

  ngOnDestroy(): void {
    if (this.listSub) {
      this.listSub.unsubscribe();
    }
    if (typeof $ !== 'undefined' && this.modalId) {
      $('#' + this.modalId).modal('hide');
      $('#' + this.modalId).remove();
    }
  }
}
