
// CHILD_TABLES/variant/variant.component.ts  — v3 COMPLETE REDESIGN
// Main page: Full-width accordion table (item row → expand → variants + subitems)
// Generator: Single-page, ng-select multi dropdowns, live combination preview

import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ExcelExportService } from 'src/app/services/excel-export.service';

declare var $: any;

@Component({
  selector: 'app-variant-new',
  templateUrl: './variant-new.component.html',
  styleUrls: ['./variant-new.component.scss']
})
export class VariantNewComponent implements OnInit {

  settings: any = {};
  menuItems: any[] = [];

  delID: any;
  delType: string = '';

  // ── Item table data ─────────────────────────────────────────────────────
  itemData: any[] = [];
  total_count = 0;
  page = 1;
  itemsPerPage = 50;
  isLoader = false;
  conditionObj: any = {};
  expandAll = false;

  // ── Expanded item (accordion open) ──────────────────────────────────────
  expandedItemId: number | null = null;
  expandedVariants: any[] = [];
  expandedUnlinked: any[] = [];
  expandedAliases: any[] = [];
  expandedLoading = false;

  // ── Master lists ─────────────────────────────────────────────────────────
  categories: any[] = [];
  units: any[] = [];
  allAttributes: any[] = [];
  attrValueMap: any = {};   // attribute_id → values[]
  allItems: any[] = [];

  // ── Modal state ──────────────────────────────────────────────────────────
  showModal = '';
  editData: any = null;
  isEdit = false;
  activeItem: any = null;   // item context for generator/alias modals
  guideStep = 1;

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

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private app: AppComponent,
    private excelExportService: ExcelExportService
  ) { }

  ngOnInit(): void {
    this.settings = this.auth.webUser.settings?.variant ?? {};
    this.gs.observeList().subscribe((r: any) => {
      this.categories = r.category || [];
      this.units = r.unit || [];
      this.allItems = r.itemmix || [];
    });
    this.getItemData(1);
    this.loadDepartmentRates();
    this.loadAttributes();
    this.setupContextMenu();
  }

  setupContextMenu() {
    this.menuItems = [
      {
        label: 'Edit Item',
        icon: 'uil uil-pen',
        action: (item: any) => this.openEditItem(item),
        disabled: !this.auth.webUser.settings?.item?.edit
      },
      {
        label: 'Add Alias',
        icon: 'uil uil-plus-circle',
        action: (item: any) => this.openAliasManager(item)
      },
      {
        label: 'Generate Variants',
        icon: 'uil uil-layers',
        action: (item: any) => this.openGenerator(item)
      },
      {
        label: 'Lock Item',
        icon: 'uil uil-lock-alt',
        action: (item: any) => this.lockItem(item._id),
        disabled: (item: any) => item.restrict_year
      },
      {
        label: 'Unlock Item',
        icon: 'uil uil-unlock-alt',
        action: (item: any) => this.unlockItem(item._id),
        disabled: (item: any) => !item.restrict_year
      },
      {
        label: 'Delete Item',
        icon: 'uil uil-trash',
        action: (item: any) => this.deleteItem(item),
        disabled: !this.auth.webUser.settings?.item?.delete
      }
    ];
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ITEM TABLE
  // ════════════════════════════════════════════════════════════════════════

  getItemData(pageNo: number) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('VARIANT') + 'items/' + this.auth.webUser.dept_id, this.conditionObj)
      .subscribe((d: any) => {
        if (d.success) {
          this.itemData = d.result || [];
          this.total_count = d.total_count || 0;
          this.page = pageNo;
          // parse subitems JSON if string
          for (const item of this.itemData) {
            try { item.subitems = typeof item.subitems === 'string' ? JSON.parse(item.subitems) : (item.subitems || []); }
            catch { item.subitems = []; }
            try { item.categories = typeof item.categories === 'string' ? JSON.parse(item.categories) : (item.categories || []); }
            catch { item.categories = []; }
          }
          if (this.expandedItemId) {
            const expItem = this.itemData.find(i => i._id == this.expandedItemId);
            if (expItem) {
              this.expandedVariants = expItem.variants || [];
              this.expandedUnlinked = expItem.unlinked_subitems || [];
              this.expandedAliases = expItem.item_aliases || [];
            }
          }
        }
        this.isLoader = false;
      });
  }

  onSearch(term: string) { this.conditionObj.search = term || undefined; this.getItemData(1); }
  onCatFilter(v: any) { this.conditionObj.categories = v || undefined; this.getItemData(1); }

  applyFilter() {
    this.getItemData(1);
  }

  async exportToExcel() {
    this.spinner.show();
    const body = { ...this.conditionObj, limit: -1, offset: 0 };
    this.http.put(this.api.getUrl('VARIANT') + 'items/' + this.auth.webUser.dept_id, body)
      .subscribe({
        next: async (d: any) => {
          this.spinner.hide();
          if (!d.success || !d.result) {
            this.toastr.error(d?.message || 'Export failed: No data found.');
            return;
          }
          const fullData = d.result || [];

          // Collect all unique rate years from ratesMap, sorted descending (e.g. 2026, 2025, 2024...)
          const yearSet = new Set<number>();
          yearSet.add(this.currentYear);
          if (this.ratesMap) {
            for (const key of Object.keys(this.ratesMap)) {
              for (const y of Object.keys(this.ratesMap[key])) {
                yearSet.add(Number(y));
              }
            }
          }
          const sortedRateYears = Array.from(yearSet).sort((a, b) => b - a);

          const exportRows: any[] = [];
          let srNo = 1;

          for (const item of fullData) {
            const itemKey = `${item._id}_0`;
            const itemRates = this.ratesMap[itemKey] || {};
            const cats = (item.categories || []).map((c: any) => c.category_hin).join(', ');

            if (item.variants && item.variants.length > 0) {
              item.variants.forEach((v: any, vIdx: number) => {
                const attrs = (v.attributes || []).map((a: any) => `${a.attribute_hin}: ${a.value_hin}`).join(', ');
                const variantKey = `${item._id}_${v.subitem?._id || 0}`;
                const variantRates = this.ratesMap[variantKey] || {};

                const rowObj: any = {
                  'No': vIdx === 0 ? srNo : '',
                  'Item (वस्तु)': vIdx === 0 ? item.item_hin : '',
                  'Code (कोड)': vIdx === 0 ? (item.item_code || '') : '',
                  'Variant Name (वैरिएंट)': v.display_name,
                  'SKU': v.sku || '',
                  'Attributes (विशेषताएं)': attrs,
                  'Unit (इकाई)': v.subitem?.unit_short || item.unit_short || '',
                  'Categories (श्रेणी)': vIdx === 0 ? cats : '',
                  'Min Rate': v.subitem?.min_rate || '',
                  'Max Rate': v.subitem?.max_rate || ''
                };

                for (const yr of sortedRateYears) {
                  const rateVal = variantRates[yr] !== undefined ? variantRates[yr] : (vIdx === 0 && itemRates[yr] !== undefined ? itemRates[yr] : '');
                  rowObj[`${yr} Rate (दर)`] = rateVal !== '' && rateVal !== null && rateVal !== undefined ? Number(rateVal) : '';
                }

                exportRows.push(rowObj);
              });
              srNo++;
            } else {
              const rowObj: any = {
                'No': srNo++,
                'Item (वस्तु)': item.item_hin,
                'Code (कोड)': item.item_code || '',
                'Variant Name (वैरिएंट)': '—',
                'SKU': '—',
                'Attributes (विशेषताएं)': '—',
                'Unit (इकाई)': item.unit_short || '',
                'Categories (श्रेणी)': cats,
                'Min Rate': item.min_rate || '',
                'Max Rate': item.max_rate || ''
              };

              for (const yr of sortedRateYears) {
                const rateVal = itemRates[yr] !== undefined ? itemRates[yr] : '';
                rowObj[`${yr} Rate (दर)`] = rateVal !== '' && rateVal !== null && rateVal !== undefined ? Number(rateVal) : '';
              }

              exportRows.push(rowObj);
            }
          }

          try {
            await this.excelExportService.exportStyledExcel(exportRows, 'Variants_Report', 'Item & Variant Master Report');
            this.toastr.success('Excel export successfully generated.');
          } catch (e: any) {
            this.toastr.error(e?.message || 'Excel export error.');
          }
        },
        error: (err: any) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Export failed!');
        }
      });
  }

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

  // ── Toggle accordion row ────────────────────────────────────────────────
  toggleAccordion(item: any) {
    if (this.expandedItemId === item._id) {
      this.expandedItemId = null;
      return;
    }
    this.expandedItemId = item._id;
    this.expandedVariants = [];
    this.expandedUnlinked = [];
    this.expandedAliases = [];

    // Use embedded data if available to avoid API call
    if (item.variants !== undefined) {
      this.expandedVariants = item.variants || [];
      this.expandedUnlinked = item.unlinked_subitems || [];
      this.expandedLoading = false;
      return;
    }

    this.expandedLoading = true;
    this.http.get(this.api.getUrl('VARIANT') + 'item/' + item._id)
      .subscribe((d: any) => {
        this.expandedLoading = false;
        if (d.success && d.result) {
          this.expandedVariants = d.result.variants || [];
          this.expandedUnlinked = d.result.unlinked_subitems || [];
          this.expandedAliases = d.result.item_aliases || [];
          this.attrValueMap = d.result.attr_value_map || {};
          this.allAttributes = d.result.all_attributes || [];
        }
      });
  }

  isExpanded(item: any): boolean { return this.expandedItemId === item._id; }

  loadAttributes() {
    this.http.get(this.api.getUrl('VARIANT') + 'attributes')
      .subscribe((d: any) => {
        if (d.success) this.allAttributes = d.result || [];
      });
    this.http.get(this.api.getUrl('VARIANT') + 'attribute-values')
      .subscribe((d: any) => {
        if (d.success) {
          this.attrValueMap = {};
          for (const av of (d.result || [])) {
            if (!this.attrValueMap[av.attribute_id]) this.attrValueMap[av.attribute_id] = [];
            this.attrValueMap[av.attribute_id].push(av);
          }
        }
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MODAL CONTROL
  // ════════════════════════════════════════════════════════════════════════

  openModal(type: string) { this.showModal = type; $('#showModal').modal('show'); }

  closeModal() {
    const isAttrOrVariantModal = this.showModal === 'Manage Attributes' ||
      this.showModal === 'Manage Attribute Values' ||
      this.showModal === 'Generate Variants' ||
      this.showModal === 'Edit Variant';
    const activeId = this.activeItem?._id;
    $('#showModal').modal('hide');
    this.showModal = '';
    this.editData = null;
    this.isEdit = false;

    if (isAttrOrVariantModal) {
      this.loadAttributes();
      if (activeId) {
        this.refreshItemData(activeId, true);
      } else {
        this.getItemData(this.page);
      }
    }
    this.activeItem = null;
  }

  openEditItem(item: any) {
    this.activeItem = item;
    this.editData = item;
    this.isEdit = true;
    this.openModal('Edit Item');
  }

  lockItem(id: any) {
    this.app.appModal$ = new Subject();
    this.app.appModal$.subscribe((result: any) => {
      if (result) this.toggleLock({ _id: id, ...result });
    });
    this.app.openModal('lockModal');
  }

  unlockItem(id: any) {
    this.toggleLock({ _id: id, restrict_month: null, restrict_year: null });
  }

  toggleLock(row: any) {
    this.http.put(this.api.getUrl('ITEM') + 'lock/', row).subscribe((data: any) => {
      this.toastr.success(data['result'].restrict_year ? "Locked Successfully" : "Unlocked Successfully");
      const idx = this.itemData.findIndex(i => i._id === data['result']._id);
      if (idx > -1) {
        this.itemData[idx].restrict_month = data['result'].restrict_month;
        this.itemData[idx].restrict_year = data['result'].restrict_year;
      }
    });
  }

  deleteItem(item: any) {
    this.delID = item._id;
    this.delType = 'item';
    this.openModal('delete_item');
  }

  deleteResponse(ev: any) {
    if (ev) {
      this.closeModal();
      this.toastr.success((this.delType || 'Item') + " deleted successfully.");
      this.getItemData(this.page);
    }
  }

  openGenerator(item: any) {
    this.activeItem = item;
    this.isEdit = false;
    this.editData = null;
    this.openModal('Generate Variants');
  }

  openEditVariant(v: any, item: any) {
    this.activeItem = item;
    this.isEdit = true;
    this.editData = v;
    this.openModal('Edit Variant');
  }

  openAttributeManager(mode: 'attributes' | 'attr_values') {
    this.editData = { mode };
    this.openModal(mode === 'attributes' ? 'Manage Attributes' : 'Manage Attribute Values');
  }

  openAliasManager(item: any) {
    this.activeItem = item;
    this.editData = item;
    this.openModal('Manage Item Aliases');
  }

  startGuide() {
    this.guideStep = 1;
    this.openModal('Full Guide');
  }

  nextGuide() {
    if (this.guideStep < 5) this.guideStep++;
  }

  prevGuide() {
    if (this.guideStep > 1) this.guideStep--;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RESPONSE HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  onVariantsGenerated(result: any) {
    if (result?.refreshAttributes) {
      this.loadAttributes();
      return;
    }
    if (!result?.reload) return;
    
    const targetItemId = result?.item_id || this.activeItem?._id;

    const createdCount = result.createdCount !== undefined ? result.createdCount : (result.created ? result.created.length : (result.result?.length || 0));
    const skippedCount = result.skippedCount !== undefined ? result.skippedCount : (result.skipped ? result.skipped.length : 0);

    if (createdCount > 0) {
      this.toastr.success(`${createdCount} variant(s) create ho gaye!`);
      if (skippedCount > 0) {
        this.toastr.warning(`${skippedCount} variant(s) already exist karte hain (skipped).`);
      }
    } else if (skippedCount > 0) {
      this.toastr.warning('यह वेरिएंट पहले से मौजूद है! (Variant already exists)');
    }

    if (result.closeModal !== false) {
      this.closeModal();
    } else {
      // In single entry mode (modal remains open), refresh item and accordion data in background
      if (targetItemId) {
        this.refreshItemData(targetItemId, true);
      }
    }
  }

  refreshItemData(itemId: number, autoExpand: boolean = false) {
    if (!itemId) return;
    // We fetch the updated list with clean pagination/filter override to avoid offset/filter collisions
    this.http.put(this.api.getUrl('VARIANT') + 'items/' + this.auth.webUser.dept_id, {
      item_ids: [itemId],
      pageNo: 1,
      limit: 1,
      offset: 0
    }).subscribe({
      next: (d: any) => {
        if (d && d.success && d.result?.[0]) {
          const updated = d.result[0];
          try { updated.subitems = typeof updated.subitems === 'string' ? JSON.parse(updated.subitems) : (updated.subitems || []); }
          catch { updated.subitems = []; }
          try { updated.categories = typeof updated.categories === 'string' ? JSON.parse(updated.categories) : (updated.categories || []); }
          catch { updated.categories = []; }

          const idx = this.itemData.findIndex(i => i._id == itemId);
          if (idx > -1) {
            this.itemData[idx] = updated;
            this.itemData = [...this.itemData]; // Force refresh for pipes (like paginate)
          }

          // If this item is currently expanded in accordion, or autoExpand is requested:
          // Immediately update expanded accordion data so the new variants are visible
          if (this.expandedItemId == itemId || autoExpand) {
            this.expandedItemId = itemId;
            this.expandedVariants = updated.variants || [];
            this.expandedUnlinked = updated.unlinked_subitems || [];
            this.expandedAliases = updated.item_aliases || [];
            this.expandedLoading = false;
          }
        } else if (!d || !d.success) {
          this.toastr.error(d?.message || 'Item data refresh failed.');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || err?.error || err?.message || 'Error refreshing item data.');
      }
    });
  }

  onVariantEdited(result: any) {
    if (!result?.reload) return;
    this.toastr.success('Variant update ho gaya!');
    const activeId = this.activeItem?._id;
    this.closeModal();
    if (activeId) this.refreshItemData(activeId, true);
  }

  onItemEdited(result: any) {
    if (!result?._id) return;
    this.closeModal();

    // 1. Immediately update local row for instant visual feedback
    const idx = this.itemData.findIndex(i => i._id == result._id);
    if (idx > -1) {
      const existing = this.itemData[idx];

      let unit_short = existing.unit_short;
      let unit_full = existing.unit_full;
      if (result.unit) {
        unit_short = result.unit.unit_short;
        unit_full = result.unit.unit_full;
      } else if (result.unit_id && this.units?.length) {
        const u = this.units.find((x: any) => x._id == result.unit_id);
        if (u) {
          unit_short = u.unit_short;
          unit_full = u.unit_full;
        }
      }

      let cats = existing.categories;
      if (Array.isArray(result.categories)) {
        cats = result.categories;
      }

      this.itemData[idx] = {
        ...existing,
        ...result,
        unit_short,
        unit_full,
        categories: cats,
        variants: existing.variants,
        variant_count: existing.variant_count,
        subitem_count: existing.subitem_count,
        unlinked_subitems: existing.unlinked_subitems,
        item_aliases: existing.item_aliases
      };
      this.itemData = [...this.itemData];
    }

    // 2. Refresh rates map in case rates were modified
    this.loadDepartmentRates();

    // 3. Fetch fresh aggregated row from server
    this.refreshItemData(result._id);
  }

  onAttributeSaved(result: any) {
    if (result?.reload || result?.refreshAttributes) {
      this.loadAttributes();
      if (this.activeItem?._id) {
        this.refreshItemData(this.activeItem._id);
      } else {
        this.getItemData(this.page);
      }
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

  onAliasSaved(result: any) {
    if (!result?.reload) return;
    const activeId = this.activeItem?._id;
    this.closeModal();
    if (activeId) this.refreshItemData(activeId, true);
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DELETE
  // ════════════════════════════════════════════════════════════════════════

  deleteVariant(v: any) {
    Swal.fire({
      title: 'Delete Variant?', text: `"${v.display_name}" aur iska subitem delete hoga.`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Haan, delete karo', cancelButtonText: 'Cancel'
    })
      .then(r => {
        if (!r.isConfirmed) return;
        this.http.delete(this.api.getUrl('VARIANT') + v._id)
          .subscribe({
            next: (d: any) => {
              if (d.success) {
                this.toastr.success('Variant successfully deleted!');
                this.expandedVariants = this.expandedVariants.filter((x: any) => x._id !== v._id);
                this.getItemData(this.page);
              } else {
                this.toastr.error(d.message || 'Failed to delete variant.');
              }
            },
            error: (err: any) => {
              this.toastr.error(err?.error?.message || err?.error || err?.message || 'Failed to delete variant.');
            }
          });
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════════════════

  subitemCount(item: any): number { return item.subitem_count ?? item.subitems?.length ?? 0; }
  variantCount(item: any): number { return item.variant_count ?? item.subitems?.filter((s: any) => s.variant_id)?.length ?? 0; }
  aliasDisplay(item: any): string {
    const aliases = item.item_aliases;
    if (!Array.isArray(aliases) || aliases.length === 0) return '';
    return aliases.map((a: any) => a.alias).filter(Boolean).join(', ');
  }
  trackById(_: any, item: any) { return item._id; }
}