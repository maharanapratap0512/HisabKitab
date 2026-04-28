import { Component, Input, Output, EventEmitter, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

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

  options: any[] = [];
  selectedValue: any = null;

  onChange: any = () => { };
  onTouched: any = () => { };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
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
      // Parent item
      const itemHin = it.item_hin ? it.item_hin.trim() : '';
      const itemEng = it.item_eng ? it.item_eng.trim() : '';
      
      let aliasTags = '';
      if (it.item_aliases && Array.isArray(it.item_aliases)) {
          aliasTags = it.item_aliases.map((a: any) => a.alias).join(' ');
      }
      
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

      if (it.subitems && it.subitems.length > 0) {
        it.subitems.forEach((sub: any) => {
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
}
