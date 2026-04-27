// ENTRY__FORMS/variant-entry/variant-entry.component.ts  v3
// Single-page design:
//   Top: attribute multi-selects + values multi-selects + separator → live combinations
//   Bottom: combination cards (compact, read-only names, editable SKU/unit/rate/cat)
//   Sequence drag: user reorders attribute order to control name generation
//   No name editing — only separator + sequence changes names

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';

export const SEPARATORS = [
  { label: '"Space"', value: ' ' },
  { label: '"+"', value: '+' },
  { label: '"-"', value: '-' },
  { label: '"/"', value: '/' },
  { label: '"|"', value: '|' },
];


@Component({
  selector: 'app-variant-entry',
  templateUrl: './variant-entry.component.html',
  styleUrls: ['./variant-entry.component.scss']
})
export class VariantEntryComponent implements OnInit, OnChanges {

  @Input() selectedItem: any = null;
  @Input() allAttributes: any[] = [];
  @Input() attrValueMap: any = {};
  @Input() units: any[] = [];
  @Input() categories: any[] = [];
  @Output() response = new EventEmitter<any>();

  // ── Controls ────────────────────────────────────────────────────────────
  separators = SEPARATORS;
  separator = ' ';

  // Selected attributes (ng-select, multiple) → drives valueGroups
  selectedAttrs: any[] = [];   // array of attribute objects

  // Per-attribute selected values: { [attr_id]: any[] }
  selectedValues: any = {};

  // Attribute sequence (for name generation order) — drag to reorder
  attrSequence: any[] = [];   // same objects as selectedAttrs, just ordered

  // ── Live combinations (auto-computed, no API call needed) ────────────────
  combinations: any[] = [];

  // ── Default fields for all combos (apply-all) ────────────────────────────
  defaultUnit: any = null;
  defaultCatIds: any[] = [];

  isLoader = false;

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void { this.reset(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItem']) this.reset();
  }

  reset() {
    this.selectedAttrs = [];
    this.selectedValues = {};
    this.attrSequence = [];
    this.combinations = [];
    this.separator = ' ';
    this.defaultUnit = this.selectedItem?.unit_id || null;
    this.defaultCatIds = [];
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ATTRIBUTE SELECTION  (ng-select multiple)
  // ════════════════════════════════════════════════════════════════════════

  onAttrChange(selected: any[]) {
    this.selectedAttrs = selected || [];
    // add new attrs to sequence, remove deselected
    const ids = this.selectedAttrs.map((a: any) => a._id);
    this.attrSequence = [
      ...this.attrSequence.filter((a: any) => ids.includes(a._id)),
      ...this.selectedAttrs.filter((a: any) => !this.attrSequence.find((s: any) => s._id === a._id)),
    ];
    // clear values for removed attributes
    for (const key of Object.keys(this.selectedValues)) {
      if (!ids.includes(Number(key))) delete this.selectedValues[key];
    }
    this.recomputeCombinations();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  VALUE SELECTION  (per attribute, ng-select multiple)
  // ════════════════════════════════════════════════════════════════════════

  valuesForAttr(attr: any): any[] {
    return this.attrValueMap[attr._id] || [];
  }

  onValueChange(attrId: number, selected: any[]) {
    this.selectedValues[attrId] = selected || [];
    this.recomputeCombinations();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SEQUENCE CONTROL  (move up/down to control name generation order)
  // ════════════════════════════════════════════════════════════════════════

  moveUp(i: number) {
    if (i === 0) return;
    [this.attrSequence[i - 1], this.attrSequence[i]] = [this.attrSequence[i], this.attrSequence[i - 1]];
    this.recomputeCombinations();
  }

  moveDown(i: number) {
    if (i >= this.attrSequence.length - 1) return;
    [this.attrSequence[i], this.attrSequence[i + 1]] = [this.attrSequence[i + 1], this.attrSequence[i]];
    this.recomputeCombinations();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SEPARATOR  → recalculate names only
  // ════════════════════════════════════════════════════════════════════════

  onSeparatorChange(sep: string) {
    this.separator = sep;
    // recalculate only names, keep other fields
    for (const c of this.combinations) {
      c.display_name_hin = c._attr_vals.map((av: any) => av.value_hin).filter(Boolean).join(sep);
      c.display_name_eng = c._attr_vals.map((av: any) => av.value_eng).filter(Boolean).join(sep);
      c.display_name_roman = c._attr_vals.map((av: any) => av.value_roman).filter(Boolean).join(sep);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  LIVE COMBINATION COMPUTATION  (cartesian product, pure TS)
  // ════════════════════════════════════════════════════════════════════════

  recomputeCombinations() {
    // use attrSequence order, filter those that have values selected
    const groups = this.attrSequence
      .filter((a: any) => (this.selectedValues[a._id] || []).length > 0)
      .map((a: any) => ({
        attribute_id: a._id,
        attribute_hin: a.attribute_hin,
        values: (this.selectedValues[a._id] || []).map((v: any) => ({
          _id: v._id,
          attr_id: a._id,
          attr_hin: a.attribute_hin,
          value_hin: v.attribute_value_hin,
          value_eng: v.attribute_value_eng,
          value_roman: v.attribute_value_roman,
        })),
      }));

    if (!groups.length) { this.combinations = []; return; }

    // cartesian product
    const cart = (gs: any[]): any[][] => gs.reduce((acc, g) => {
      const out: any[][] = [];
      for (const existing of acc)
        for (const val of g.values)
          out.push([...existing, val]);
      return out;
    }, [[]]);

    const prevMap: any = {};
    for (const c of this.combinations) prevMap[c._key] = c;

    this.combinations = cart(groups).map((combo: any[]) => {
      const key = combo.map(v => v._id).join('-');
      const prev = prevMap[key];
      return {
        _key: key,
        _attr_vals: combo,
        selected: prev ? prev.selected : true,
        display_name_hin: combo.map(v => v.value_hin).filter(Boolean).join(this.separator),
        display_name_eng: combo.map(v => v.value_eng).filter(Boolean).join(this.separator),
        display_name_roman: combo.map(v => v.value_roman).filter(Boolean).join(this.separator),
        attribute_values: combo.map(v => ({
          attribute_id: v.attr_id, attribute_value_id: v._id,
          value_hin: v.value_hin, value_eng: v.value_eng, value_roman: v.value_roman
        })),
        sku: prev?.sku ?? '',
        unit_id: prev?.unit_id ?? this.defaultUnit,
        category_ids: prev?.category_ids ?? [...this.defaultCatIds],
        min_rate: prev?.min_rate ?? 0,
        max_rate: prev?.max_rate ?? 0,
      };
    });
  }

  // ── Apply defaults to all combos ─────────────────────────────────────────
  applyDefaultsToAll() {
    for (const c of this.combinations) {
      c.unit_id = this.defaultUnit;
      c.category_ids = [...this.defaultCatIds];
    }
  }

  get selectedCount(): number { return this.combinations.filter(c => c.selected).length; }

  toggleAll(checked: boolean) {
    for (const c of this.combinations) {
      c.selected = checked;
    }
  }

  toggleCatOnCombo(combo: any, cat_id: number) {
    if (!combo.category_ids) combo.category_ids = [];
    const idx = combo.category_ids.indexOf(cat_id);
    if (idx >= 0) combo.category_ids.splice(idx, 1);
    else combo.category_ids.push(cat_id);
  }

  isCatOnCombo(combo: any, cat_id: number): boolean {
    return (combo.category_ids || []).includes(cat_id);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SAVE
  // ════════════════════════════════════════════════════════════════════════

  save() {
    const toSave = this.combinations.filter(c => c.selected);
    if (!toSave.length) { this.toastr.warning('Koi combination select nahi hai'); return; }

    const payload = {
      item_id: this.selectedItem._id,
      variants: toSave.map(c => ({
        display_name_hin: c.display_name_hin,
        display_name_eng: c.display_name_eng || null,
        display_name_roman: c.display_name_roman || null,
        sku: c.sku || null,
        attribute_values: c.attribute_values,
        category_ids: c.category_ids || [],
        unit_id: c.unit_id || null,
        min_rate: c.min_rate || 0,
        max_rate: c.max_rate || 0,
        extra_note: null,
        aliases: [],
      })),
    };

    this.isLoader = true;
    this.http.post(this.api.getUrl('VARIANT') + 'bulk', payload)
      .subscribe((d: any) => {
        this.isLoader = false;
        if (d.success) this.response.emit({ reload: true, created: d.created });
      });
  }
}