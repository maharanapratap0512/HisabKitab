import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GlobalService } from 'src/app/services/global.service';

declare var $: any;

@Component({
  selector: 'app-item-dropdown',
  templateUrl: './item-dropdown.component.html',
  styleUrls: ['./item-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ItemDropdownComponent),
      multi: true
    }
  ]
})
export class ItemDropdownComponent implements ControlValueAccessor, OnChanges {
  @Input() items: any[] = [];
  @Input() categoryIds: any[] = [];
  @Input() placeholder: string = 'Select Item';
  @Input() appendTo: string = 'body';
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() size: 'sm' | 'default' = 'default';
  @Input() multiple: boolean = false;
  @Input() closeOnSelect: boolean = true;

  // Individual ID support
  @Input() itemId: any;
  @Input() subitemId: any;
  @Output() itemIdChange = new EventEmitter<any>();
  @Output() subitemIdChange = new EventEmitter<any>();
  @Output() change = new EventEmitter<any>();
  @Output() addItem = new EventEmitter<void>();
  @Output() addSubitem = new EventEmitter<void>();
  @Output() addClick = new EventEmitter<string>();

  options: any[] = [];
  selectedValue: any = null;

  showModal: string = '';
  modalId: string = 'itemDropModal_' + Math.random().toString(36).substring(2, 9);

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor(public gs: GlobalService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['categoryIds']) {
      this.flattenItems();
    }
    if (changes['itemId'] || changes['subitemId']) {
      this.syncSelectedValue();
    }
  }

  flattenItems() {
    const flat: any[] = [];
    if (!this.items) return;

    this.items.forEach(it => {
      let itemMatches = true;
      let matchingSubitems = it.subitems || [];

      if (this.categoryIds && this.categoryIds.length > 0) {
        itemMatches = it.categories && it.categories.some((c: any) => this.categoryIds.includes(c._id));

        if (!itemMatches && it.subitems && it.subitems.length > 0) {
          matchingSubitems = it.subitems.filter((sub: any) => sub.categories && sub.categories.some((c: any) => this.categoryIds.includes(c._id)));
        } else if (itemMatches) {
          matchingSubitems = it.subitems || [];
        } else {
          matchingSubitems = [];
        }
      }

      if (this.categoryIds && this.categoryIds.length > 0 && !itemMatches && matchingSubitems.length === 0) {
        return; // skip entirely
      }

      // Parent item
      const itemHin = it.item_hin ? it.item_hin.trim() : '';
      const itemEng = it.item_eng ? it.item_eng.trim() : '';

      let aliasTags = '';
      if (it.item_aliases && Array.isArray(it.item_aliases)) {
        aliasTags = it.item_aliases.map((a: any) => a.alias).join(' ');
      }

      if (!this.categoryIds || this.categoryIds.length === 0 || itemMatches) {
        flat.push({
          id: `${it._id}:`,
          item_id: it._id,
          subitem_id: null,
          item_hin: itemHin,
          item_eng: itemEng,
          item_code: it.item_code,
          item_roman: it.item_roman,
          item_aliases: it.item_aliases,
          isSubitem: false,
          item: it,
          searchTags: `${itemHin} ${itemEng} ${it.item_code || ''} ${it.item_roman || ''} ${aliasTags}`.toLowerCase()
        });
      }

      if (matchingSubitems && matchingSubitems.length > 0) {
        matchingSubitems.forEach((sub: any) => {
          const subitemHin = sub.subitem_hin ? String(sub.subitem_hin).trim() : '';
          const subitemEng = sub.subitem_eng ? String(sub.subitem_eng).trim() : '';

          flat.push({
            id: `${it._id}:${sub._id}`,
            item_id: it._id,
            subitem_id: sub._id,
            item_hin: itemHin,
            item_eng: itemEng,
            subitem_hin: subitemHin,
            subitem_eng: subitemEng,
            subitem_code: sub.subitem_code,
            subitem_roman: sub.subitem_roman,
            item_aliases: it.item_aliases,
            isSubitem: true,
            item: it,
            searchTags: `${subitemHin} ${itemHin} ${subitemEng} ${itemEng} ${sub.subitem_code || ''} ${sub.subitem_roman || ''} ${it.item_code || ''} ${aliasTags}`.toLowerCase()
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
    this.selectedValue = event;

    if (!this.multiple) {
      const selected = event; // event is the object now
      const res = selected ? { item_id: selected.item_id, subitem_id: selected.subitem_id, item: selected.item } : { item_id: null, subitem_id: null, item: null };

      this.itemId = res.item_id;
      this.subitemId = res.subitem_id;
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
    term = term.toLowerCase();
    return item.searchTags.indexOf(term) > -1;
  }

  onAddItemClick(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.addItem.emit();
    this.addClick.emit('Add Item');
    this.showModal = 'Add Item';
    setTimeout(() => {
      if (typeof $ !== 'undefined') {
        $('#' + this.modalId).modal('show');
      }
    }, 50);
  }

  onAddSubitemClick(e: Event) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.addSubitem.emit();
    this.addClick.emit('Add Subitem');
    this.showModal = 'Add Subitem';
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
    this.showModal = '';
  }

  onSelfItemCreated(ev: any) {
    if (ev && ev._id) {
      if (!this.items) {
        this.items = [];
      }
      const exists = this.items.some((it: any) => it._id === ev._id);
      if (!exists) {
        this.items.push(ev);
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
      if (!this.items) {
        this.items = [];
      }
      const parentItem = this.items.find((it: any) => it._id === ev.item_id);
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
}
