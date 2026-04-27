// ENTRY__FORMS/variant-generator-entry/variant-generator-entry.component.ts
// Pattern: exact same as hmp-entry.component.ts
//   - @Input() selectedItem, allAttributes, attrValueMap, units, categories
//   - @Output() response = new EventEmitter()
//   - Internal step state (step 1 = pick attrs+values, step 2 = review combos)
//   - Calls API, emits { reload: true, created: N } on success

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

export const SEPARATORS = [
  { label: 'Space', value: ' ' },
  { label: '+', value: '+' },
  { label: '-', value: '-' },
  { label: '/', value: '/' },
  { label: '|', value: '|' },
];

export interface AttrGroup {
  attribute_id: number | null;
  attribute_hin: string;
  selectedValues: any[];   // AttributeValue[]
}

@Component({
  selector: 'app-variant-generator-entry',
  templateUrl: './variant-generator-entry.component.html',
  styleUrls: ['./variant-generator-entry.component.scss'],
})
export class VariantGeneratorEntryComponent implements OnInit, OnChanges {

  @Input() selectedItem: any = null;
  @Input() allAttributes: any[] = [];
  @Input() attrValueMap: any = {};
  @Input() units: any[] = [];
  @Input() categories: any[] = [];
  @Output() response = new EventEmitter<any>();

  // ── Step state ──────────────────────────────────────────────────────────
  step = 1;   // 1 = build attr groups, 2 = review combinations
  isLoader = false;

  // ── Step 1 state ────────────────────────────────────────────────────────
  separator = ' ';
  separators = SEPARATORS;
  attrGroups: AttrGroup[] = [];

  // ── Step 2 state ────────────────────────────────────────────────────────
  combinations: any[] = [];

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedItem']) this.reset();
  }

  reset() {
    this.step = 1;
    this.attrGroups = [];
    this.combinations = [];
    this.separator = ' ';
  }

  // ════════════════════════════════════════════════════════════════════════
  //  STEP 1 — Attribute Groups
  // ════════════════════════════════════════════════════════════════════════

  addGroup() {
    this.attrGroups.push({ attribute_id: null, attribute_hin: '', selectedValues: [] });
  }

  removeGroup(i: number) {
    this.attrGroups.splice(i, 1);
  }

  onAttrSelect(group: AttrGroup, event: Event) {
    const id = Number((event.target as HTMLSelectElement).value);
    const attr = this.allAttributes.find((a: any) => a._id === id);
    if (!attr) return;
    group.attribute_id = attr._id;
    group.attribute_hin = attr.attribute_hin;
    group.selectedValues = [];
  }

  valuesForGroup(group: AttrGroup): any[] {
    return group.attribute_id ? (this.attrValueMap[group.attribute_id] || []) : [];
  }

  toggleValue(group: AttrGroup, val: any) {
    const idx = group.selectedValues.findIndex((v: any) => v._id === val._id);
    if (idx >= 0) group.selectedValues.splice(idx, 1);
    else group.selectedValues.push(val);
  }

  isValueSelected(group: AttrGroup, val_id: number): boolean {
    return group.selectedValues.some((v: any) => v._id === val_id);
  }

  get estimatedCount(): number {
    const valid = this.attrGroups.filter(g => g.attribute_id && g.selectedValues.length > 0);
    if (!valid.length) return 0;
    return valid.reduce((acc, g) => acc * g.selectedValues.length, 1);
  }

  canGoStep2(): boolean {
    return this.attrGroups.some(g => g.attribute_id && g.selectedValues.length > 0);
  }

  // ─── Generate combinations from server (cartesian product) ───────────────
  generateCombinations() {
    const validGroups = this.attrGroups.filter(g => g.attribute_id && g.selectedValues.length > 0);
    if (!validGroups.length) {
      this.toastr.warning('Kam se kam ek attribute aur ek value select karo');
      return;
    }

    const payload = {
      attribute_groups: validGroups.map(g => ({
        attribute_id: g.attribute_id,
        attribute_hin: g.attribute_hin,
        values: g.selectedValues.map((v: any) => ({
          _id: v._id,
          value_hin: v.attribute_value_hin,
          value_eng: v.attribute_value_eng,
          value_roman: v.attribute_value_roman,
        })),
      })),
      separator: this.separator,
    };

    this.isLoader = true;
    this.http.post(this.api.getUrl('VARIANT') + 'preview-combinations', payload)
      .subscribe((d: any) => {
        this.isLoader = false;
        if (d.success) {
          // attach default item unit + categories to each combination
          this.combinations = (d.result || []).map((c: any) => ({
            ...c,
            unit_id: this.selectedItem?.unit_id || null,
            category_ids: [],
            min_rate: 0,
            max_rate: 0,
            extra_note: '',
          }));
          this.step = 2;
        }
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  STEP 2 — Separator change recalculates names client-side
  // ════════════════════════════════════════════════════════════════════════

  onSeparatorChange(sep: string) {
    this.separator = sep;
    for (const c of this.combinations) {
      c.display_name_hin = c.attribute_values.map((av: any) => av.value_hin).filter(Boolean).join(sep);
      c.display_name_eng = c.attribute_values.map((av: any) => av.value_eng).filter(Boolean).join(sep);
      c.display_name_roman = c.attribute_values.map((av: any) => av.value_roman).filter(Boolean).join(sep);
    }
  }

  get selectedCount(): number {
    return this.combinations.filter(c => c.selected).length;
  }

  toggleCategory(combo: any, cat_id: number) {
    if (!combo.category_ids) combo.category_ids = [];
    const idx = combo.category_ids.indexOf(cat_id);
    if (idx >= 0) combo.category_ids.splice(idx, 1);
    else combo.category_ids.push(cat_id);
  }

  isCatSelected(combo: any, cat_id: number): boolean {
    return (combo.category_ids || []).includes(cat_id);
  }

  // ─── Save selected combinations ───────────────────────────────────────────
  saveVariants() {
    const toSave = this.combinations.filter(c => c.selected);
    if (!toSave.length) { this.toastr.warning('Koi combination select nahi hai'); return; }

    const missingName = toSave.find(c => !c.display_name_hin?.trim());
    if (missingName) { this.toastr.warning('Sabhi selected variants ka Hindi name required hai'); return; }

    const payload = {
      item_id: this.selectedItem._id,
      variants: toSave.map(c => ({
        display_name_hin: c.display_name_hin?.trim(),
        display_name_eng: c.display_name_eng?.trim() || null,
        display_name_roman: c.display_name_roman?.trim() || null,
        sku: c.sku?.trim() || null,
        attribute_values: c.attribute_values,
        category_ids: c.category_ids || [],
        unit_id: c.unit_id || null,
        min_rate: c.min_rate || 0,
        max_rate: c.max_rate || 0,
        extra_note: c.extra_note || null,
        aliases: [],
      })),
    };

    this.isLoader = true;
    this.http.post(this.api.getUrl('VARIANT') + 'bulk', payload)
      .subscribe((d: any) => {
        this.isLoader = false;
        if (d.success) {
          this.response.emit({ reload: true, created: d.created });
        }
      });
  }

  backToStep1() { this.step = 1; }
}