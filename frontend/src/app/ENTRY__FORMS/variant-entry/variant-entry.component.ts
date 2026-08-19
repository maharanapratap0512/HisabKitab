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

import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
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
export class VariantEntryComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('itemDropdown') itemDropdown: any;
  @ViewChildren('attrValueSelect') attrValueSelects!: QueryList<any>;

  @Input() selectedItem: any = null;
  @Input() items: any[] = [];
  @Input() allAttributes: any[] = [];
  @Input() attrValueMap: any = {};
  @Input() units: any[] = [];
  @Input() categories: any[] = [];
  @Output() response = new EventEmitter<any>();

  // ── Tab state ─────────────────────────────────────────────────────────────
  activeTab: 'single' | 'bulk' = 'single';

  // ── Quick Single Form (Prastav Concept) ───────────────────────────────────
  singleAttrValues: any[] = [null];
  singleForm: any = {
    display_name_hin: '',
    display_name_eng: '',
    display_name_roman: '',
    sku: '',
    unit_id: null,
    min_rate: 0,
    max_rate: 0,
    category_ids: []
  };

  addLine() {
    this.singleAttrValues.push(null);
    this.focusAttrValueIndex(this.singleAttrValues.length - 1);
  }

  removeLine(index: number) {
    if (this.singleAttrValues.length > 1) {
      this.singleAttrValues.splice(index, 1);
      const targetIndex = Math.max(0, index - 1);
      this.focusAttrValueIndex(targetIndex);
    } else {
      this.singleAttrValues[0] = null;
      this.focusAttrValueIndex(0);
    }
    this.recomputeSingleGeneratedName();
  }

  lastSelectTime = 0;

  onSingleFormKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      // If a dropdown selection just happened in the last 400ms, DO NOT submit form
      if (Date.now() - this.lastSelectTime < 400) {
        return;
      }

      const isAnySelectOpen = this.attrValueSelects && this.attrValueSelects.some((s: any) => s.isOpen);
      if (!isAnySelectOpen) {
        event.preventDefault();
        event.stopPropagation();
        this.saveSingleVariant();
      }
    }
  }

  onAttrValueChange(val: any, index: number) {
    this.lastSelectTime = Date.now();
    this.singleAttrValues[index] = val;
    this.recomputeSingleGeneratedName();
  }

  recomputeSingleGeneratedName() {
    const selectedVals = this.singleAttrValues.filter(v => v != null);

    const hinVals = selectedVals.map(v => v.attribute_value_hin).filter(Boolean).join(' ');
    const engVals = selectedVals.map(v => v.attribute_value_eng || v.attribute_value_hin).filter(Boolean).join(' ');
    const romanVals = selectedVals.map(v => v.attribute_value_roman || v.attribute_value_hin).filter(Boolean).join(' ');

    this.singleForm.display_name_hin = hinVals.trim();
    this.singleForm.display_name_eng = engVals.trim();
    this.singleForm.display_name_roman = romanVals.trim();
  }

  compareAttrValue(a: any, b: any) {
    return a && b ? (a._id === b._id) : (a === b);
  }

  onItemDropdownChange(event: any) {
    this.lastSelectTime = Date.now();
    if (event && event.item_id) {
      const selectedObj = event.item || (this.items || []).find((i: any) => i._id === event.item_id) || this.selectedItem;
      this.selectedItem = selectedObj;
    } else {
      this.selectedItem = null;
    }
    this.reset();
    this.focusAttrValueIndex(0);
  }

  focusAttrValueIndex(index: number = 0) {
    setTimeout(() => {
      if (this.attrValueSelects) {
        const arr = this.attrValueSelects.toArray();
        const target = (index >= 0 && index < arr.length) ? arr[index] : arr[arr.length - 1];
        if (target) {
          if (typeof target.focus === 'function') {
            try { target.focus(); } catch (e) { }
          }
          if (target.elementRef && target.elementRef.nativeElement) {
            const input = target.elementRef.nativeElement.querySelector('input');
            if (input) {
              try { input.focus(); } catch (e) { }
            }
          }
        }
      }
    }, 150);
  }

  focusFirstAttrValue() {
    this.focusAttrValueIndex(0);
  }

  focusItemDropdown() {
    this.focusAttrValueIndex(0);
  }

  allAttributeValuesGrouped: any[] = [];

  rebuildAttrValueOptions() {
    const list: any[] = [];
    if (this.allAttributes && this.attrValueMap) {
      for (const a of this.allAttributes) {
        const vals = this.attrValueMap[a._id] || [];
        for (const v of vals) {
          list.push({
            ...v,
            attr_hin: a.attribute_hin,
            attr_eng: a.attribute_eng,
            searchLabel: `${a.attribute_hin || ''} ${v.attribute_value_hin || ''} ${v.attribute_value_eng || ''} ${v.attribute_value_roman || ''}`
          });
        }
      }
    }
    this.allAttributeValuesGrouped = list;
  }

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

  ngOnInit() {
    this.reset();
    this.rebuildAttrValueOptions();
  }

  ngAfterViewInit() {
    if (this.activeTab === 'single') {
      this.focusItemDropdown();
    }
  }

  ngOnChanges(c: SimpleChanges) {
    if (c['selectedItem'] || c['items']) {
      this.reset();
    }
    if (c['allAttributes'] || c['attrValueMap']) {
      this.rebuildAttrValueOptions();
    }
  }

  reset() {
    this.selectedAttrs = [];
    this.attrGroups = [];
    this.combinations = [];
    this.separator = ' ';
    this.defaultUnit = this.selectedItem?.unit_id || null;
    this.defaultCatIds = [];
    this.rebuildAttrValueOptions();
    this.resetSingleForm();
    if (this.selectedItem?.variants?.length > 0) {
      this.loadExistingConfig();
    }
  }

  resetSingleForm() {
    const item = this.selectedItem;
    let catIds: any[] = [];
    if (item?.categories && Array.isArray(item.categories)) {
      catIds = item.categories.map((c: any) => c._id || c.category_id || c);
    } else if (item?.category_ids && Array.isArray(item.category_ids)) {
      catIds = [...item.category_ids];
    }

    this.singleForm = {
      display_name_hin: '',
      display_name_eng: '',
      display_name_roman: '',
      sku: '',
      unit_id: item?.unit_id || null,
      min_rate: 0,
      max_rate: 0,
      category_ids: catIds
    };
    this.singleAttrValues = [null];
  }

  onResetSingleClick() {
    this.resetSingleForm();
    this.focusItemDropdown();
  }

  saveSingleVariant() {
    if (!this.selectedItem?._id) {
      this.toastr.warning('Item not selected.');
      this.focusItemDropdown();
      return;
    }
    if (!this.singleForm.display_name_hin?.trim()) {
      this.toastr.warning('Generated name is required.');
      return;
    }

    const selectedVals = this.singleAttrValues.filter(v => v != null);

    const payload = {
      item_id: this.selectedItem._id,
      variants: [{
        display_name_hin: this.singleForm.display_name_hin.trim(),
        display_name_eng: this.singleForm.display_name_eng?.trim() || null,
        display_name_roman: this.singleForm.display_name_roman?.trim() || null,
        sku: this.singleForm.sku?.trim() || null,
        unit_id: this.singleForm.unit_id || null,
        min_rate: this.singleForm.min_rate || 0,
        max_rate: this.singleForm.max_rate || 0,
        category_ids: this.singleForm.category_ids || [],
        attribute_values: selectedVals.map((v: any) => ({
          attribute_id: v.attribute_id,
          attribute_value_id: v._id
        }))
      }]
    };

    this.isLoader = true;
    this.http.post(this.api.getUrl('VARIANT') + 'bulk', payload)
      .subscribe({
        next: (d: any) => {
          this.isLoader = false;
          if (d.success) {
            this.resetSingleForm();
            this.focusItemDropdown();
            this.response.emit({ reload: true, closeModal: false, ...d });
          } else {
            this.toastr.error(d.message || 'Error occurred while saving variant.');
          }
        },
        error: (err: any) => {
          this.isLoader = false;
          this.toastr.error(err?.error?.message || err?.error || err?.message || 'Error occurred while saving variant.');
        }
      });
  }

  loadExistingConfig() {
    const attrIds = new Set<number>();
    const valueMap = new Map<number, Set<number>>(); // attrId -> Set of valueIds
    const individualAttrIds = new Set<number>();

    for (const v of this.selectedItem.variants) {
      if (v.attributes) {
        // If a variant has only one attribute, it means it's an "Individual" variant for that attribute
        if (v.attributes.length === 1) {
          individualAttrIds.add(v.attributes[0].attribute_id);
        }

        for (const av of v.attributes) {
          if (av.attribute_id) {
            attrIds.add(av.attribute_id);
            if (!valueMap.has(av.attribute_id)) valueMap.set(av.attribute_id, new Set());
            if (av.attribute_value_id) valueMap.get(av.attribute_id)!.add(av.attribute_value_id);
          }
        }
      }
    }

    if (attrIds.size === 0) return;

    // Populate selectedAttrs
    this.selectedAttrs = this.allAttributes.filter(a => attrIds.has(a._id));

    // Populate attrGroups
    this.attrGroups = this.selectedAttrs.map(attr => {
      const selectedValueIds = valueMap.get(attr._id);
      const allValuesForAttr = this.attrValueMap[attr._id] || [];
      const selectedValues = allValuesForAttr.filter((v: any) => selectedValueIds?.has(v._id));
      return {
        attr,
        selectedValues,
        isIndividual: individualAttrIds.has(attr._id)
      };
    });

    this.recompute();
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

    // Mark existing variants by fingerprint
    const existingFingerprints = new Set((this.selectedItem.variants || []).map((v: any) => this.getFingerprint(v.attributes)));

    this.combinations.forEach(v => {
      v.exists = existingFingerprints.has(this.getFingerprint(v.attribute_values));
      if (v.exists) v.selected = true; // Force selection for existing ones
    });

    // Sort: new at top, existing at bottom
    this.combinations.sort((a, b) => {
      if (a.exists === b.exists) return 0;
      return a.exists ? 1 : -1;
    });
  }

  getFingerprint(attribute_values: any[]) {
    return (attribute_values ?? [])
      .map(av => Number(av.attribute_value_id))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b)
      .join('-');
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
        if (d.success) this.response.emit({ reload: true, ...d });
      });
  }
}