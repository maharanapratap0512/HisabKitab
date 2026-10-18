// CHILD_TABLES/variant/variant.component.ts
// Pattern: exact same as item.component.ts + hmp.component.ts
//   - showModal string state
//   - openModal(type) / closeModal()
//   - jQuery $('#showModal').modal('show/hide')
//   - Entry forms are separate components used inside modal via *ngIf
//   - Reads from gs.observeList() for master data
//   - NO local styling → theme CSS classes (card, btn, form-control etc.)

import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

declare var $: any;

export const SEPARATORS = [
  { label: 'Space', value: ' ' },
  { label: '+', value: '+' },
  { label: '-', value: '-' },
  { label: '/', value: '/' },
  { label: '|', value: '|' },
];

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss'],
})
export class VariantComponent implements OnInit {

  // ── Settings (from dept config) ─────────────────────────────────────────
  settings: any = {};

  // ── Item list (left panel) ───────────────────────────────────────────────
  itemData: any[] = [];
  total_count = 0;
  page = 1;
  itemsPerPage = 100;
  isLoader = false;
  conditionObj: any = {};   // filter body sent to ITEMMIX API

  // ── Master lists (from resolver) ─────────────────────────────────────────
  categories: any[] = [];
  units: any[] = [];

  // ── Selected item context ────────────────────────────────────────────────
  selectedItem: any = null;
  itemVariants: any[] = [];
  unlinkedSubitems: any[] = [];
  itemAliases: any[] = [];
  allAttributes: any[] = [];
  attrValueMap: any = {};   // attribute_id → AttributeValue[]

  // ── Modal state — same pattern as item.component.ts ─────────────────────
  showModal = '';
  editData: any = null;
  isEdit = false;

  // ── Inline alias quick-add on right panel ────────────────────────────────
  newAliasText = '';
  newAliasLanguage = 'hin';

  // ── Yearly Rates State ───────────────────────────────────────────────────
  currentYear: number = new Date().getFullYear();
  ratesMap: { [key: string]: { [year: number]: number } } = {};
  ratesRawMap: { [key: string]: any[] } = {};
  activeRateItem: any = null;
  activeRateSubitem: any = null;
  activeRateVariant: any = null;
  quickRatesList: { year: number; rate: any; _id?: number }[] = [];
  quickRateNewYear: number | null = null;
  isQuickRateSaving = false;

  separators = SEPARATORS;

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.settings = this.auth.webUser.settings?.variant ?? {};
    this.gs.observeList().subscribe((result: any) => {
      this.categories = result.category || [];
      this.units = result.unit || [];
    });
    this.getItemData(1);
    this.loadDepartmentRates();
    this.loadAttributes();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ITEM LIST
  // ════════════════════════════════════════════════════════════════════════

  getItemData(pageNo: number) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id, this.conditionObj)
      .subscribe((data: any) => {
        if (data.success) {
          this.itemData = data.result || [];
          this.total_count = data.total_count || 0;
          this.page = pageNo;
        }
        this.isLoader = false;
      });
  }

  onCatFilter(cat_id: any) {
    this.conditionObj.categories = cat_id || undefined;
    this.getItemData(1);
  }

  onSearch(term: string) {
    this.conditionObj.search = term || undefined;
    this.getItemData(1);
  }

  // ─── Select item → load variant data ─────────────────────────────────────
  selectItem(item: any) {
    this.selectedItem = item;
    this.itemVariants = [];
    this.unlinkedSubitems = [];
    this.itemAliases = [];
    this.loadItemVariantData(item._id);
  }

  loadItemVariantData(item_id: number) {
    this.spinner.show();
    this.http.get(this.api.getUrl('VARIANT') + 'item/' + item_id)
      .subscribe((d: any) => {
        this.spinner.hide();
        if (d.success && d.result) {
          this.itemVariants = d.result.variants || [];
          this.unlinkedSubitems = d.result.unlinked_subitems || [];
          this.itemAliases = d.result.item_aliases || [];
          this.attrValueMap = d.result.attr_value_map || {};
          this.allAttributes = d.result.all_attributes || [];
        }
      });
  }

  loadAttributes() {
    this.http.get(this.api.getUrl('VARIANT') + 'attributes')
      .subscribe((d: any) => {
        if (d.success) this.allAttributes = d.result || [];
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MODAL CONTROL — exact item.component.ts pattern
  // ════════════════════════════════════════════════════════════════════════

  openModal(type: string) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
    this.editData = null;
    this.isEdit = false;
  }

  // ─── Open variant generator (fresh) ──────────────────────────────────────
  openGenerator() {
    if (!this.selectedItem) { this.toastr.warning('Pehle ek item select karo'); return; }
    this.isEdit = false;
    this.editData = null;
    this.openModal('Generate Variants');
  }

  // ─── Open edit variant modal ──────────────────────────────────────────────
  openEditVariant(v: any) {
    this.isEdit = true;
    this.editData = v;
    this.openModal('Edit Variant');
  }

  // ─── Open attribute manager modal ─────────────────────────────────────────
  openAttributeManager(mode: 'attributes' | 'attr_values') {
    this.editData = { mode };
    this.openModal(mode === 'attributes' ? 'Manage Attributes' : 'Manage Attribute Values');
  }

  // ─── Open item alias manager ──────────────────────────────────────────────
  openAliasManager() {
    if (!this.selectedItem) return;
    this.editData = this.selectedItem;
    this.openModal('Manage Item Aliases');
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RESPONSE HANDLERS  (called by entry-form components via (response) Output)
  // ════════════════════════════════════════════════════════════════════════

  onVariantsGenerated(result: any) {
    // result: { created: number } from variant-generator-entry
    if (result?.reload) {
      this.toastr.success(`${result.created || result.createdCount || ''} variant(s) create ho gaye!`);
      if (result.closeModal !== false) {
        this.closeModal();
      }
      if (this.selectedItem?._id) {
        this.loadItemVariantData(this.selectedItem._id);
      }
      this.getItemData(this.page);   // refresh subitem count in left panel
    }
  }

  onVariantEdited(result: any) {
    if (result?.reload) {
      this.toastr.success('Variant update ho gaya!');
      this.closeModal();
      if (this.selectedItem?._id) {
        this.loadItemVariantData(this.selectedItem._id);
      }
    }
  }

  onAttributeSaved(result: any) {
    if (result?.reload || result?.refreshAttributes) {
      this.loadAttributes();
      if (this.selectedItem?._id) {
        this.loadItemVariantData(this.selectedItem._id);
      }
    }
  }

  onAliasSaved(result: any) {
    if (result?.reload) {
      this.loadItemVariantData(this.selectedItem._id);
    }
  }

  itemAddResponse(ev: any) {
    this.closeModal();
    if (ev) {
      this.getItemData(1);
    }
  }

  subitemAddResponse(ev: any) {
    this.closeModal();
    if (ev) {
      this.getItemData(this.page);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DELETE VARIANT
  // ════════════════════════════════════════════════════════════════════════

  deleteVariant(v: any) {
    Swal.fire({
      title: 'Delete Variant?',
      text: `"${v.display_name}" aur iska linked subitem dono delete honge.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Haan, Delete Karo',
      cancelButtonText: 'Nahi',
    }).then(r => {
      if (r.isConfirmed) {
        this.http.delete(this.api.getUrl('VARIANT') + v._id)
          .subscribe((d: any) => {
            if (d.success) {
              this.toastr.success('Variant delete ho gaya!');
              this.loadItemVariantData(this.selectedItem._id);
              this.getItemData(this.page);
            }
          });
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════════════════

  getSubitemCount(item: any): number {
    try { return JSON.parse(item.subitems || '[]').length; }
    catch { return item.subitems?.length || 0; }
  }

  trackById(_: any, item: any) { return item._id; }

  // ── Yearly Rates Methods ─────────────────────────────────────────────────
  loadDepartmentRates() {
    this.http.get(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id).subscribe({
      next: (res: any) => {
        if (res && res.success && res.result) {
          const map: { [key: string]: { [year: number]: number } } = {};
          const rawMap: { [key: string]: any[] } = {};
          for (const r of res.result) {
            const key = `${r.item_id}_${r.subitem_id || 0}`;
            if (!map[key]) map[key] = {};
            if (!rawMap[key]) rawMap[key] = [];
            map[key][r.year] = Number(r.rate);
            rawMap[key].push(r);
          }
          this.ratesMap = map;
          this.ratesRawMap = rawMap;
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'वार्षिक दरें लोड करने में समस्या आई।');
      }
    });
  }

  getRate(itemId: number, subitemId?: number): number | null {
    const key = `${itemId}_${subitemId || 0}`;
    const itemRates = this.ratesMap[key];
    if (itemRates && itemRates[this.currentYear] !== undefined && itemRates[this.currentYear] !== null) {
      return itemRates[this.currentYear];
    }
    return null;
  }

  getRateTooltip(itemId: number, subitemId?: number): string {
    const key = `${itemId}_${subitemId || 0}`;
    const itemRates = this.ratesMap[key];
    if (!itemRates) return 'कोई दर दर्ज नहीं';
    const years = Object.keys(itemRates).sort((a, b) => Number(b) - Number(a));
    if (!years.length) return 'कोई दर दर्ज नहीं';
    return years.map(y => `${y}: ₹${itemRates[Number(y)]}`).join(' | ');
  }

  openQuickRateModal(item: any, subitem: any = null, variant: any = null) {
    this.activeRateItem = item;
    this.activeRateSubitem = subitem;
    this.activeRateVariant = variant;
    this.quickRateNewYear = null;

    const key = `${item._id}_${subitem ? subitem._id : 0}`;
    const existing = this.ratesMap[key] || {};
    const existingRaw = this.ratesRawMap[key] || [];

    const defaultYears = [
      this.currentYear,
      this.currentYear - 1,
      this.currentYear - 2,
      this.currentYear - 3,
      this.currentYear - 4,
      this.currentYear - 5
    ];
    const allYears = Array.from(new Set([...defaultYears, ...Object.keys(existing).map(Number)])).sort((a, b) => b - a);

    this.quickRatesList = allYears.map(year => {
      const rawObj = existingRaw.find((r: any) => Number(r.year) === year);
      return {
        year,
        rate: existing[year] !== undefined ? existing[year] : null,
        _id: rawObj ? rawObj._id : undefined
      };
    });

    $('#quickRateModalVariant').modal('show');
  }

  closeQuickRateModal() {
    $('#quickRateModalVariant').modal('hide');
    this.activeRateItem = null;
    this.activeRateSubitem = null;
    this.activeRateVariant = null;
    this.quickRatesList = [];
    this.quickRateNewYear = null;
  }

  addQuickRateYear() {
    if (!this.quickRateNewYear) return;
    const yr = Number(this.quickRateNewYear);
    if (isNaN(yr) || yr < 2000 || yr > 2100) {
      this.toastr.warning('कृपया सही वर्ष दर्ज करें (उदा. 2023, 2028)');
      return;
    }
    if (this.quickRatesList.some(r => r.year === yr)) {
      this.toastr.info(`वर्ष ${yr} पहले से सूची में है।`);
      return;
    }
    this.quickRatesList.push({ year: yr, rate: null });
    this.quickRatesList.sort((a, b) => b.year - a.year);
    this.quickRateNewYear = null;
  }

  saveSingleQuickRate(rateObj: any) {
    if (!this.activeRateItem) return;
    if (rateObj.rate === null || rateObj.rate === undefined || isNaN(Number(rateObj.rate))) {
      this.toastr.warning('कृपया दर (Rate) दर्ज करें।');
      return;
    }
    const payload = {
      item_id: this.activeRateItem._id,
      subitem_id: this.activeRateSubitem ? this.activeRateSubitem._id : null,
      year: Number(rateObj.year),
      rate: Number(rateObj.rate)
    };
    this.http.post(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id, payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.toastr.success(`वर्ष ${rateObj.year} की दर ₹${rateObj.rate} सुरक्षित हो गई।`);
          if (res.result && res.result._id) rateObj._id = res.result._id;
          const key = `${payload.item_id}_${payload.subitem_id || 0}`;
          if (!this.ratesMap[key]) this.ratesMap[key] = {};
          this.ratesMap[key][payload.year] = payload.rate;
        } else {
          this.toastr.error(res?.message || 'दर सुरक्षित करने में समस्या आई।');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'दर सुरक्षित करने में समस्या आई।');
      }
    });
  }

  saveAllQuickRates() {
    if (!this.activeRateItem) return;
    const validRates = this.quickRatesList.filter(r => r.rate !== null && r.rate !== undefined && !isNaN(Number(r.rate)));
    if (!validRates.length) {
      this.toastr.warning('कोई वैध दर दर्ज नहीं है।');
      return;
    }
    this.isQuickRateSaving = true;
    const payload = {
      item_id: this.activeRateItem._id,
      subitem_id: this.activeRateSubitem ? this.activeRateSubitem._id : null,
      rates: validRates.map(r => ({ year: r.year, rate: Number(r.rate) }))
    };
    this.http.post(this.api.getUrl('ITEMRATE') + 'item/bulk/' + this.auth.webUser.dept_id, payload).subscribe({
      next: (res: any) => {
        this.isQuickRateSaving = false;
        if (res && res.success) {
          this.toastr.success('सभी दरें सफलतापूर्वक सुरक्षित कर दी गईं।');
          const key = `${payload.item_id}_${payload.subitem_id || 0}`;
          if (!this.ratesMap[key]) this.ratesMap[key] = {};
          for (const r of validRates) {
            this.ratesMap[key][r.year] = Number(r.rate);
          }
          this.closeQuickRateModal();
        } else {
          this.toastr.error(res?.message || 'दरें सुरक्षित करने में समस्या आई।');
        }
      },
      error: (err: any) => {
        this.isQuickRateSaving = false;
        this.toastr.error(err?.error?.message || 'दरें सुरक्षित करने में समस्या आई।');
      }
    });
  }

  applyRateToTransactions(rateObj: any) {
    if (!this.activeRateItem || rateObj.rate === null || rateObj.rate === undefined) return;
    const label = this.activeRateVariant ? this.activeRateVariant.display_name : (this.activeRateSubitem ? this.activeRateSubitem.subitem_hin : this.activeRateItem.item_hin);
    const fullName = `${label} (${this.activeRateItem.item_hin})`;
    const confirmMsg = `क्या आप वर्ष ${rateObj.year} के सभी आवक एवं जावक रिकॉर्ड्स में '${fullName}' की दर ₹${rateObj.rate} लागू करना चाहते हैं?`;
    if (!confirm(confirmMsg)) return;

    const payload = {
      dept_id: this.auth.webUser.dept_id,
      item_id: this.activeRateItem._id,
      subitem_id: this.activeRateSubitem ? this.activeRateSubitem._id : null,
      year: Number(rateObj.year),
      rate: Number(rateObj.rate)
    };
    this.http.post(this.api.getUrl('ITEMRATE') + 'apply/bulk', payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.toastr.success(res.message || 'दरें आवक/जावक में लागू कर दी गईं।');
        } else {
          this.toastr.error(res?.message || 'दरें लागू करने में समस्या आई।');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'दरें लागू करने में समस्या आई।');
      }
    });
  }

  deleteQuickRate(rateObj: any) {
    if (!rateObj._id) {
      rateObj.rate = null;
      return;
    }
    if (!confirm(`क्या आप वर्ष ${rateObj.year} की दर हटाना चाहते हैं?`)) return;

    this.http.delete(this.api.getUrl('ITEMRATE') + rateObj._id).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.toastr.success(`वर्ष ${rateObj.year} की दर हटा दी गई।`);
          rateObj.rate = null;
          rateObj._id = undefined;
          const key = `${this.activeRateItem._id}_${this.activeRateSubitem ? this.activeRateSubitem._id : 0}`;
          if (this.ratesMap[key]) {
            delete this.ratesMap[key][rateObj.year];
          }
        } else {
          this.toastr.error(res?.message || 'दर हटाने में समस्या आई।');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'दर हटाने में समस्या आई।');
      }
    });
  }
}