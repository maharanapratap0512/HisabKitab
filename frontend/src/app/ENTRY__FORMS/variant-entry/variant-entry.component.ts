// ENTRY__FORMS/variant-entry/variant-entry.component.ts  — FINAL VERSION
// New features vs previous:
//   1. Inline "+" button on attribute dropdown → quick add attribute without leaving
//   2. Inline "+" button on each value dropdown → quick add value, auto-selects it
//   3. Checkbox per attribute value → checked = ALSO generate as individual variant
//      (unchecked = only participates in combinations, no individual row)
//   4. Combination logic = ALL subsets of checked-group attrs + full cartesian
//      e.g. type:[LCD,LED]✓ + color:[black,red] + size:[32",40"]✓
//      → LCD, LED, 32", 40"  (individuals from checked attrs)
//      → LCD 32", LCD 40", LED 32", LED 40"  (checked×checked combos)
//      → LCD black, LCD red, LED black, LED red  (checked×unchecked)
//      → LCD 32" black, LCD 40" black ... (full 3-way)
//      → all possible subsets that include at least one value from each group

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';

declare var $: any;

export const SEPARATORS = [
  { label: '"Space"', value: ' ' },
  { label: '"+"', value: '+' },
  { label: '"-"', value: '-' },
  { label: '"/"', value: '/' },
  { label: '"|"', value: '|' },
];

interface AttrGroup {
  attr: any;            // attribute object
  selectedValues: any[];          // values chosen in dropdown
  isIndividual: boolean;          // if true, every value in this group gets an individual variant row
}

@Component({
  selector: 'app-variant-entry',
  templateUrl: './variant-entry.component.html',
  styleUrls: ['./variant-entry.component.scss'],
})
export class VariantEntryComponent implements OnInit, OnChanges {

  @Input() selectedItem: any = null;
  @Input() allAttributes: any[] = [];
  @Input() attrValueMap: any = {};
  @Input() units: any[] = [];
  @Input() categories: any[] = [];
  @Output() response = new EventEmitter<any>();

  // ── Top controls ─────────────────────────────────────────────────────────
  separators = SEPARATORS;
  separator = ' ';
  selectedAttrs: any[] = [];      // drives attrGroups
  attrGroups: AttrGroup[] = [];
  defaultUnit: any = null;
  defaultCatIds: any[] = [];

  // ── Combinations ─────────────────────────────────────────────────────────
  combinations: any[] = [];

  // ── Modal state ──────────────────────────────────────────────────────────
  attrModalMode: 'attributes' | 'attr_values' | '' = '';
  attrModalInitialId: any = null;
  isLoader = false;

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() { this.reset(); }
  ngOnChanges(c: SimpleChanges) { if (c['selectedItem']) this.reset(); }

  reset() {
    this.selectedAttrs = [];
    this.attrGroups = [];
    this.combinations = [];
    this.separator = ' ';
    this.defaultUnit = this.selectedItem?.unit_id || null;
    this.defaultCatIds = [];
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ATTRIBUTE SELECTION
  // ════════════════════════════════════════════════════════════════════════

  onAttrChange(selected: any[]) {
    this.selectedAttrs = selected || [];
    const ids = this.selectedAttrs.map((a: any) => a._id);

    // sync attrGroups: keep existing (preserve selectedValues + individualMap)
    const existing = new Map(this.attrGroups.map(g => [g.attr._id, g]));
    this.attrGroups = this.selectedAttrs.map(attr => {
      if (existing.has(attr._id)) return existing.get(attr._id)!;
      return { attr, selectedValues: [], isIndividual: false };
    });

    // prune deleted
    this.attrGroups = this.attrGroups.filter(g => ids.includes(g.attr._id));
    this.recompute();
  }

  moveUp(i: number) {
    if (i === 0) return;
    [this.attrGroups[i - 1], this.attrGroups[i]] = [this.attrGroups[i], this.attrGroups[i - 1]];
    this.recompute();
  }

  moveDown(i: number) {
    if (i >= this.attrGroups.length - 1) return;
    [this.attrGroups[i], this.attrGroups[i + 1]] = [this.attrGroups[i + 1], this.attrGroups[i]];
    this.recompute();
  }

  valuesForGroup(g: AttrGroup): any[] {
    return this.attrValueMap[g.attr._id] || [];
  }

  onValChange(g: AttrGroup, selected: any[]) {
    g.selectedValues = selected || [];
    this.recompute();
  }

  openAttrModal(mode: 'attributes' | 'attr_values', attrId: any = null) {
    this.attrModalMode = mode;
    this.attrModalInitialId = attrId;
    $('#variantAttrModal').modal('show');
  }

  closeAttrModal() {
    $('#variantAttrModal').modal('hide');
    setTimeout(() => {
      this.attrModalMode = '';
      this.attrModalInitialId = null;
    }, 300);
  }

  onAttrSaved(res: any) {
    if (res?.reload) {
      this.response.emit({ refreshAttributes: true });
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  SEPARATOR / DEFAULTS
  // ════════════════════════════════════════════════════════════════════════

  onSeparatorChange(sep: string) {
    this.separator = sep;
    for (const c of this.combinations) {
      c.display_name_hin = c._attr_vals.map((av: any) => av.value_hin).filter(Boolean).join(sep);
      c.display_name_eng = c._attr_vals.map((av: any) => av.value_eng).filter(Boolean).join(sep);
      c.display_name_roman = c._attr_vals.map((av: any) => av.value_roman).filter(Boolean).join(sep);
    }
  }

  applyDefaultsToAll() {
    for (const c of this.combinations) {
      c.unit_id = this.defaultUnit;
      c.category_ids = [...this.defaultCatIds];
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  COMBINATION LOGIC
  //
  //  For each non-empty group, generate ALL subsets of groups (powerset),
  //  then for each subset take cartesian product.
  //  Additionally, for each value marked as individual, add a single-value row.
  //  De-duplicate by key. Preserve previous user edits (sku/unit/rate/cat).
  // ════════════════════════════════════════════════════════════════════════

  recompute() {
    const groups = this.attrGroups
      .filter(g => g.selectedValues.length > 0)
      .map(g => ({
        attr_id: g.attr._id,
        attr_hin: g.attr.attribute_hin,
        values: g.selectedValues.map((v: any) => ({
          _id: v._id,
          attr_id: g.attr._id,
          attr_hin: g.attr.attribute_hin,
          value_hin: v.attribute_value_hin,
          value_eng: v.attribute_value_eng,
          value_roman: v.attribute_value_roman,
          individual: g.isIndividual,
        })),
      }));

    if (!groups.length) { this.combinations = []; return; }

    const prevMap: any = {};
    for (const c of this.combinations) prevMap[c._key] = c;

    const comboSet = new Map<string, any[]>();

    // ── Step 1: Individual rows (checked values) ───────────────────────────
    for (const g of groups) {
      for (const v of g.values) {
        if (!v.individual) continue;
        const key = String(v._id);
        if (!comboSet.has(key)) comboSet.set(key, [v]);
      }
    }

    // ── Step 2: All powerset subsets of groups (size ≥ 2), cartesian ────────
    // Powerset of groups (exclude empty set and single-group already done above)
    const ps = this._powerset(groups);
    for (const subset of ps) {
      if (subset.length < 2) continue;   // skip: individuals handled above; skip empty
      // cartesian product of the subset's values
      const combos = this._cartesian(subset.map(g => g.values));
      for (const combo of combos) {
        const key = combo.map((v: any) => v._id).join('-');
        if (!comboSet.has(key)) comboSet.set(key, combo);
      }
    }

    // Also single-group combos (each value as its own row if NOT individual)
    // — already covered by individual check above; but non-individual single-group
    // values participate in multi-group combos only, not standalone.
    // Exception: if only one group exists, all its values are individual-style.
    if (groups.length === 1) {
      for (const v of groups[0].values) {
        const key = String(v._id);
        if (!comboSet.has(key)) comboSet.set(key, [v]);
      }
    }

    // ── Step 3: Build combination rows ────────────────────────────────────
    this.combinations = Array.from(comboSet.entries()).map(([key, combo]) => {
      const prev = prevMap[key];
      return {
        _key: key,
        _attr_vals: combo,
        selected: prev ? prev.selected : true,
        display_name_hin: combo.map((v: any) => v.value_hin).filter(Boolean).join(this.separator),
        display_name_eng: combo.map((v: any) => v.value_eng).filter(Boolean).join(this.separator),
        display_name_roman: combo.map((v: any) => v.value_roman).filter(Boolean).join(this.separator),
        attribute_values: combo.map((v: any) => ({
          attribute_id: v.attr_id,
          attribute_value_id: v._id,
          value_hin: v.value_hin,
          value_eng: v.value_eng,
          value_roman: v.value_roman,
        })),
        sku: prev?.sku ?? '',
        unit_id: prev?.unit_id ?? this.defaultUnit,
        category_ids: prev?.category_ids ?? [...this.defaultCatIds],
        min_rate: prev?.min_rate ?? 0,
        max_rate: prev?.max_rate ?? 0,
      };
    });
  }

  // Powerset of an array (all subsets)
  _powerset<T>(arr: T[]): T[][] {
    return arr.reduce<T[][]>(
      (subsets, val) => subsets.concat(subsets.map(s => [...s, val])),
      [[]]
    );
  }

  // Cartesian product of arrays
  _cartesian(arrays: any[][]): any[][] {
    return arrays.reduce<any[][]>((acc, arr) => {
      const out: any[][] = [];
      for (const existing of acc) {
        for (const val of arr) {
          out.push([...existing, val]);
        }
      }
      return out;
    }, [[]]);
  }

  get selectedCount(): number { return this.combinations.filter(c => c.selected).length; }

  toggleAll(checked: boolean) {
    for (const c of this.combinations) c.selected = checked;
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
        display_name_hin: c.display_name_hin?.trim() || null,
        display_name_eng: c.display_name_eng?.trim() || null,
        display_name_roman: c.display_name_roman?.trim() || null,
        sku: c.sku?.trim() || null,
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