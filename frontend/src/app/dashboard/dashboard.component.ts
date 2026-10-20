import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { resourceLimits } from 'worker_threads';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  isLoader: any = false;
  page: any = 1;
  termAawak: any;
  term: any;
  termBachat: any;
  termHistory: any;
  pendingAawakData: any = [];
  pendingAawakDataAll: any = [];
  bachatData: any = [];
  bachatDataAll: any = [];
  historyData: any = [];
  historyDataAll: any = [];
  months: any = [];
  editData: any = {};
  awkDraft: any = {};
  mmsAll: any = [];
  mms: any = [];
  items: any = [];
  nimitts: any = [];
  units: any = [];
  states: any = [];
  departments: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  products: any = [];
  productsAll: any = [];
  categories: any = [];
  showModal: String = '';
  fields: any;
  viewData: any = [];
  mmAwk: any;
  settings: any = {};
  filterObj: any = {
    mm_id: [],
    items: [],
    category_id: null
  }
  historySelectedMM: any = null;
  loadingStatus: any = "मैं आत्मा शांत स्वरूप हूँ ।";
  dictionary: any = [];

  // Modern Dashboard KPI & Operational Metrics (Calculated strictly from Bachat & Aawak remaining_qty)
  totalAawakRemainingQty: number = 0;
  activeAawakBatchesCount: number = 0;
  activeAawakBatches: any[] = [];
  topStockItems: any[] = [];
  lowStockItems: any[] = [];
  positiveStockCount: number = 0;
  zeroStockCount: number = 0;
  totalUsedCount: number = 0;
  maxStockVal: number = 1;
  defaultMM: string = '';
  thisMonthAawakCount: number = 0;
  thisMonthJawakCount: number = 0;
  activePrastavCount: number = 0;
  prastavTransitCount: number = 0;
  prastavPendingCount: number = 0;
  prastavReceivedCount: number = 0;

  // Dead Stock & In-Transit Logistics Alerts
  deadStockCount: number = 0;
  deadStockLots: any[] = [];
  inTransitCount: number = 0;
  inTransitLots: any[] = [];

  // Statistics & Analytics Tab Properties
  statsSelectedMM: any = null;
  statsSelectedYear: string = '2026';
  statsYears: string[] = ['2026', '2025', '2024'];
  statsMonthlyTrend: any[] = [];
  statsYearlyComparison: any[] = [];
  statsMmComparison: any[] = [];
  statsTopStockItems: any[] = [];
  statsTopDistributedItems: any[] = [];
  statsLoading: boolean = false;
  maxMonthlyAawakQty: number = 1;
  maxYearlyQty: number = 1;

  // Quick Stock & Aawak Dispenser Properties
  dispenserSearchTerm: string = '';
  dispenserSelectedMM: any = null;
  dispenserItems: any[] = [];
  selectedItemForLots: any = null;
  expandedItemId: any = null;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    public router: Router) { }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      this.mmsAll = result.mm ? result.mm : [];
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.products = result.product ? result.product : [];
      this.categories = result.category ? result.category : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
      this.updateDefaultMMLabel();
      this.computeDashboardMetrics();
    });
    this.months = this.gs.months;
    this.settings = this.auth.webUser?.settings || {};
    if (this.auth.webUser?.settings?.defaultMM) {
      const defMM = this.auth.webUser.settings.defaultMM;
      this.filterObj.mm_id = [defMM];
      this.historySelectedMM = defMM;
    }
    this.updateDefaultMMLabel();
    this.getBachat();
    this.getImportHistory();
    this.loadStatistics();
    // this.getPendingAawak();
  }

  getProductData() {
    this.isLoader = true
    this.http.put(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id, {}).subscribe((data: any) => {
      if (data['result']) {
        this.products = data['result'];
        this.productsAll = data['result'];
        this.isLoader = false;
      }
    });
    this.isLoader = false;
  }

  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    this.showModal = "";
    $('#showModal').modal('hide');
  }

  getImportHistory() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('IMPORTHISTORY') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.historyDataAll = [];
        for (let row of data['result']) {
          let monthly_detail: any = {};
          for (let m = 1; m <= 12; m++) {
            monthly_detail['m' + m] = false;
            monthly_detail['m' + m + '_date'] = null;
            monthly_detail['m' + m + '_update'] = null;
          }

          for (let i in row.monthly_detail) {

            monthly_detail['m' + row.monthly_detail[i].month] = true;
            monthly_detail['m' + row.monthly_detail[i].month + '_date'] = row.monthly_detail[i].entry_date;
            monthly_detail['m' + row.monthly_detail[i].month + '_update'] = row.monthly_detail[i].updated_at;
          }
          this.historyDataAll.push({ ...row, ...monthly_detail });
        }
        if (this.historySelectedMM) {
          this.historyData = this.historyDataAll.filter((h: { mm_id: any; }) => h.mm_id == this.historySelectedMM);
        } else {
          this.historyData = this.historyDataAll;
        }
      }
      this.isLoader = false;
    });
  }

  getBachat() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('BACHATHOME') + this.auth.webUser.dept_id).subscribe({
      next: (data: any) => {
        if (data && data['success'] && data['result']) {
          this.bachatDataAll = data['result'];
          for (let i in this.bachatDataAll) {
            this.bachatDataAll[i].categories_hin = '';
            this.bachatDataAll[i].categories_eng = '';
            if (this.bachatDataAll[i].scategories && this.bachatDataAll[i].scategories.length > 0) {
              for (let j in this.categories) {
                if (this.bachatDataAll[i].scategories.includes(this.categories[j]._id)) {
                  this.bachatDataAll[i].categories_hin += this.categories[j].category_hin + ', ';
                  this.bachatDataAll[i].categories_eng += this.categories[j].category_eng + ', ';
                }
              }
            } else if (this.bachatDataAll[i].icategories && this.bachatDataAll[i].icategories.length > 0) {
              for (let j in this.categories) {
                if (this.bachatDataAll[i].icategories.includes(this.categories[j]._id)) {
                  this.bachatDataAll[i].categories_hin += this.categories[j].category_hin + ', ';
                  this.bachatDataAll[i].categories_eng += this.categories[j].category_eng + ', ';
                }
              }
            }
          }
          this.bachatData = this.bachatDataAll;
          if (data['this_month_aawak_count'] !== undefined) {
            this.thisMonthAawakCount = Number(data['this_month_aawak_count']) || 0;
          }
          if (data['this_month_jawak_count'] !== undefined) {
            this.thisMonthJawakCount = Number(data['this_month_jawak_count']) || 0;
          }
          if (data['active_prastav_count'] !== undefined) {
            this.activePrastavCount = Number(data['active_prastav_count']) || 0;
          }
          if (data['prastav_transit_count'] !== undefined) {
            this.prastavTransitCount = Number(data['prastav_transit_count']) || 0;
          }
          if (data['prastav_pending_count'] !== undefined) {
            this.prastavPendingCount = Number(data['prastav_pending_count']) || 0;
          }
          if (data['prastav_received_count'] !== undefined) {
            this.prastavReceivedCount = Number(data['prastav_received_count']) || 0;
          }
          if (data['dead_stock_count'] !== undefined) {
            this.deadStockCount = Number(data['dead_stock_count']) || 0;
          }
          if (data['dead_stock_lots']) {
            this.deadStockLots = data['dead_stock_lots'];
          }
          if (data['in_transit_count'] !== undefined) {
            this.inTransitCount = Number(data['in_transit_count']) || 0;
          }
          if (data['in_transit_lots']) {
            this.inTransitLots = data['in_transit_lots'];
          }
          this.filterBachat();
          this.computeDashboardMetrics();
        } else {
          this.toastr.error(data?.message || 'बचत डेटा प्राप्त करने में त्रुटि आई।');
        }
        this.isLoader = false;
      },
      error: (err: any) => {
        this.isLoader = false;
        this.toastr.error('सर्वर से बचत डेटा लोड करने में त्रुटि आई।');
      }
    });
  }

  computeDashboardMetrics() {
    if (!this.bachatDataAll || this.bachatDataAll.length === 0) return;

    let pos = 0;
    let usedSum = 0;
    let maxStock = 1;
    let totalAwkRemaining = 0;
    let awkBatchesCount = 0;
    const allActiveBatches: any[] = [];
    const positiveItemIds = new Set<string>();

    for (const item of this.bachatDataAll) {
      const bachatStock = Number(item.Stock) || 0;
      let itemAwkRemainingSum = 0;

      if (item.aawaks && Array.isArray(item.aawaks)) {
        for (const awk of item.aawaks) {
          const rem = Number(awk.remaining_qty) || 0;
          if (rem > 0 || awk.is_variable_qty) {
            awkBatchesCount++;
            totalAwkRemaining += rem;
            itemAwkRemainingSum += rem;
            allActiveBatches.push({
              _id: awk._id,
              aawak_id: awk._id,
              item_id: item.item_id,
              item_hin: item.item_hin,
              item_eng: item.item_eng,
              subitem_hin: item.subitem_hin,
              subitem_eng: item.subitem_eng,
              unit_short: item.unit_short || awk.unit_short || '',
              date: awk.date,
              aawak_mm_hin: awk.aawak_mm_hin || item.mm_hin || '',
              pkt_num: awk.pkt_num,
              qty: awk.qty,
              remaining_qty: rem,
              is_variable_qty: awk.is_variable_qty,
              condition_hin: awk.condition_hin,
              item_detail: awk.item_detail,
              bachatRef: item
            });
          }
        }
      }

      const effectiveStock = bachatStock > 0 ? bachatStock : itemAwkRemainingSum;
      item.effectiveStock = effectiveStock;
      if (effectiveStock > 0) {
        pos++;
        if (effectiveStock > maxStock) maxStock = effectiveStock;
        if (item.item_id) positiveItemIds.add(String(item.item_id));
      }
      usedSum += Number(item.Used) || 0;
    }

    this.positiveStockCount = pos;
    this.totalUsedCount = usedSum;
    this.maxStockVal = maxStock;
    this.totalAawakRemainingQty = Math.round(totalAwkRemaining * 1000) / 1000;
    this.activeAawakBatchesCount = awkBatchesCount;

    // Latest active Aawak lots with remaining stock (sorted by date descending)
    this.activeAawakBatches = allActiveBatches
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
      .slice(0, 6);

    // Calculate Top Stock Items (based on Bachat stock & Aawak remaining qty)
    const sorted = [...this.bachatDataAll].sort((a: any, b: any) => {
      const stockA = Number(a.Stock) > 0 ? Number(a.Stock) : ((a.aawaks || []).reduce((acc: number, w: any) => acc + (Number(w.remaining_qty) || 0), 0));
      const stockB = Number(b.Stock) > 0 ? Number(b.Stock) : ((b.aawaks || []).reduce((acc: number, w: any) => acc + (Number(w.remaining_qty) || 0), 0));
      return stockB - stockA;
    });
    this.topStockItems = sorted.filter((i: any) => {
      const st = Number(i.Stock) > 0 ? Number(i.Stock) : ((i.aawaks || []).reduce((acc: number, w: any) => acc + (Number(w.remaining_qty) || 0), 0));
      return st > 0;
    }).slice(0, 6);

    // Calculate Zero / Low Stock Items:
    // 1. Records in bachatDataAll where stock <= 0 and no remaining aawak
    const zeroBachat = this.bachatDataAll.filter((i: any) => {
      const bStock = Number(i.Stock) || 0;
      const awkRem = (i.aawaks || []).reduce((acc: number, w: any) => acc + (Number(w.remaining_qty) || 0), 0);
      return bStock <= 0 && awkRem <= 0;
    });

    // 2. Catalog items from this.items that have no positive stock in bachat
    const zeroCatalogItems: any[] = [];
    if (this.items && this.items.length > 0) {
      for (const it of this.items) {
        const id = String(it._id || it.item_id);
        if (!positiveItemIds.has(id)) {
          zeroCatalogItems.push({
            item_hin: it.item_hin || it.list_name_hin,
            item_eng: it.item_eng || it.list_name_eng,
            mm_hin: 'स्टोर कैटलॉग',
            Stock: 0,
            unit_short: it.unit_short || ''
          });
        }
      }
    }

    this.zeroStockCount = zeroCatalogItems.length > 0 ? zeroCatalogItems.length : zeroBachat.length;
    this.lowStockItems = [...zeroBachat, ...zeroCatalogItems].slice(0, 5);
    this.filterDispenserItems();
  }

  filterDispenserItems() {
    if (!this.bachatDataAll || this.bachatDataAll.length === 0) {
      this.dispenserItems = [];
      return;
    }

    let list = this.bachatDataAll;

    if (this.dispenserSelectedMM) {
      list = list.filter((b: any) => b.mm_id == this.dispenserSelectedMM);
    }

    if (this.dispenserSearchTerm && this.dispenserSearchTerm.trim()) {
      const term = this.dispenserSearchTerm.trim().toLowerCase();
      list = list.filter((b: any) => {
        const hin = (b.item_hin || '').toLowerCase();
        const eng = (b.item_eng || '').toLowerCase();
        const subHin = (b.subitem_hin || '').toLowerCase();
        const subEng = (b.subitem_eng || '').toLowerCase();
        const mm = (b.mm_hin || '').toLowerCase();
        const code = (b.item_code || '').toLowerCase();
        return hin.includes(term) || eng.includes(term) || subHin.includes(term) || subEng.includes(term) || mm.includes(term) || code.includes(term);
      });
    }

    const isFiltered = !!(this.dispenserSearchTerm?.trim() || this.dispenserSelectedMM);

    // Filter items with positive stock or active lots unless user explicitly searches
    this.dispenserItems = [...list]
      .filter((item: any) => {
        if (isFiltered) return true;
        const st = Number(item.effectiveStock || item.Stock) || 0;
        return st > 0 || (item.aawaks && item.aawaks.length > 0);
      })
      .sort((a: any, b: any) => {
        const stockA = Number(a.effectiveStock || a.Stock) || 0;
        const stockB = Number(b.effectiveStock || b.Stock) || 0;
        return stockB - stockA;
      })
      .slice(0, isFiltered ? 30 : 8);

    if (this.dispenserSearchTerm && this.dispenserItems.length > 0) {
      this.expandedItemId = this.dispenserItems[0]._id;
    }
  }

  toggleItemAawakLots(itemId: any) {
    this.expandedItemId = this.expandedItemId === itemId ? null : itemId;
  }

  openItemAawakModal(item: any) {
    this.selectedItemForLots = item;
    $('#itemAawakModal').modal('show');
  }

  selectItemForAawakJawak(item: any) {
    this.dispenserSearchTerm = item.item_hin || item.item_eng || '';
    this.filterDispenserItems();
    this.expandedItemId = item._id;
    this.gs.smoothScrollTo('#quickDispenserSection', 20, 300);
  }

  scrollToDispenser() {
    this.gs.smoothScrollTo('#quickDispenserSection', 20, 300);
  }

  scrollToPrastavAlerts() {
    this.gs.smoothScrollTo('#prastavAlertsSection', 20, 300);
  }

  loadStatistics() {
    this.statsLoading = true;
    const payload = {
      year: this.statsSelectedYear,
      mm_id: this.statsSelectedMM || null
    };
    this.http.post(this.api.getUrl('BACHAT') + 'statistics/' + this.auth.webUser.dept_id, payload).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.statsYears = res.years && res.years.length > 0 ? res.years : this.statsYears;
          this.statsMonthlyTrend = res.monthlyTrend || [];
          this.statsYearlyComparison = res.yearlyComparison || [];
          this.statsMmComparison = res.mmComparison || [];
          this.statsTopStockItems = res.topStockItems || [];
          this.statsTopDistributedItems = res.topDistributedItems || [];

          // Compute max scales for responsive chart bar heights
          const maxAwk = Math.max(...this.statsMonthlyTrend.map((m: any) => m.aawakQty || 0), 1);
          const maxJwk = Math.max(...this.statsMonthlyTrend.map((m: any) => m.jawakQty || 0), 1);
          this.maxMonthlyAawakQty = Math.max(maxAwk, maxJwk, 1);

          const maxYAwk = Math.max(...this.statsYearlyComparison.map((y: any) => y.aawakQty || 0), 1);
          const maxYJwk = Math.max(...this.statsYearlyComparison.map((y: any) => y.jawakQty || 0), 1);
          this.maxYearlyQty = Math.max(maxYAwk, maxYJwk, 1);
        } else {
          this.toastr.error(res?.message || 'सांख्यिकी डेटा प्राप्त करने में त्रुटि आई।');
        }
        this.statsLoading = false;
      },
      error: (err: any) => {
        this.statsLoading = false;
        this.toastr.error('सांख्यिकी लोड करने में सर्वर त्रुटि आई।');
      }
    });
  }

  onStatsFilterChange() {
    this.loadStatistics();
  }

  getDistributionMetrics(item: any): { originalQty: number; distributedQty: number; remainingQty: number; percent: number } {
    let original = 0;
    let distributed = 0;
    let remaining = 0;

    if (item.aawaks && Array.isArray(item.aawaks) && item.aawaks.length > 0) {
      for (const awk of item.aawaks) {
        const oQty = Number(awk.qty) || 0;
        const rQty = Number(awk.remaining_qty) || 0;
        original += oQty;
        remaining += rQty;
      }
      distributed = Math.max(0, original - remaining);
    }

    if (original === 0) {
      const stock = Number(item.effectiveStock || item.Stock) || 0;
      const used = Number(item.Used) || 0;
      original = stock + used;
      distributed = used;
      remaining = stock;
    }

    const percent = original > 0 ? Math.round((distributed / original) * 100) : 0;
    return {
      originalQty: Math.round(original * 1000) / 1000,
      distributedQty: Math.round(distributed * 1000) / 1000,
      remainingQty: Math.round(remaining * 1000) / 1000,
      percent: Math.min(100, Math.max(0, percent))
    };
  }

  getDistributedPercentage(item: any): number {
    return this.getDistributionMetrics(item).percent;
  }

  getStockPercentage(stock: any): number {
    return this.getDistributedPercentage(stock);
  }

  updateDefaultMMLabel() {
    const defMM = this.auth.webUser?.settings?.defaultMM;
    if (defMM && this.mms?.length) {
      const found = this.mms.find((m: any) => m._id == defMM);
      if (found) {
        this.defaultMM = found.mm_hin + (found.mm_code ? ' : ' + found.mm_code : '');
        return;
      }
    }
    this.defaultMM = 'डिफ़ॉल्ट MM';
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  filterBachat() {
    const mmIds = (this.filterObj.mm_id || []).map((id: any) => String(id));
    const itemIds = (this.filterObj.items || []).map((id: any) => String(id));

    if (mmIds.length > 0 && itemIds.length > 0) {
      this.bachatData = this.bachatDataAll.filter((b: { mm_id: any, item_id: any; }) =>
        mmIds.includes(String(b.mm_id)) && itemIds.includes(String(b.item_id))
      );
    }
    else if (mmIds.length > 0) {
      this.bachatData = this.bachatDataAll.filter((b: { mm_id: any; }) =>
        mmIds.includes(String(b.mm_id))
      );
    }
    else if (itemIds.length > 0) {
      this.bachatData = this.bachatDataAll.filter((b: { item_id: any; }) =>
        itemIds.includes(String(b.item_id))
      );
    }
    else {
      this.bachatData = this.bachatDataAll;
    }
  }

  itemSelected(ev: any) {
    this.filterObj.items = ev;
    this.filterBachat();
  }

  stateHistorySelected(ev: any) {
    if (ev) {
      this.mms = this.mmsAll.filter((m: { state_id: any; }) => m.state_id == ev);
      this.historyData = this.historyDataAll.filter((h: { state_id: any; }) => h.state_id == ev);
    } else {
      this.mms = this.mmsAll;
      this.historyData = this.historyDataAll;
    }
  }

  mmHistorySelected(ev: any) {
    this.historySelectedMM = ev;
    if (ev) {
      this.historyData = this.historyDataAll.filter((h: { mm_id: any; }) => h.mm_id == ev);
    }
    else {
      this.historyData = this.historyDataAll;
    }
  }

  mmSelected(ev: any) {
    this.filterObj.mm_id = ev;
    this.filterBachat();
  }

  getPendingAawak() {
    this.http.get(this.api.getUrl('PENDING_AWK') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pendingAawakDataAll = data['result'];
        this.pendingAawakData = data['result'];
      }
    });
  }

  catForAwkSelected(ev: any) {
    if (ev) {
      this.pendingAawakData = this.pendingAawakDataAll.filter((a: { icategories: any[], scategories: any[] }) => a.icategories.includes(ev) || a.scategories.includes(ev))
    } else {
      this.pendingAawakData = this.pendingAawakDataAll;
    }

  }

  mmForAwkSelected(ev: any) {
    let body: any = {};
    body.dept_id = this.auth.webUser.dept_id;
    if (ev) {
      body.mm_id = ev;
    }
    this.http.put(this.api.getUrl('PENDING_AWK') + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pendingAawakDataAll = data['result'];
        this.pendingAawakData = data['result'];
      }
    });
  }

  addAawakResponse(ev: any) {
    if (ev._id) {
      // this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.pendingAawakData.unshift(ev);
      this.getBachat();
      // this.isLoader = false;
    }
    else {
      this.awkDraft = ev;
      this.toastr.info("Aawak saved in Draft.")
    }
  }

  addJawak(awk: any, bachat?: any) {
    const parentBachat = bachat || awk.bachatRef || {};
    this.editData = {
      bachat_id: parentBachat._id,
      mm_id: parentBachat.mm_id || awk.mm_id || awk.aawak_mm_id,
      mm_hin: parentBachat.mm_hin || awk.aawak_mm_hin,
      item_id: parentBachat.item_id || awk.item_id,
      item_hin: parentBachat.item_hin || awk.item_hin,
      subitem_id: parentBachat.subitem_id || awk.subitem_id,
      subitem_hin: parentBachat.subitem_hin || awk.subitem_hin,
      unit_id: parentBachat.unit_id || awk.unit_id,
      unit_short: parentBachat.unit_short || awk.unit_short,
      dept_id: parentBachat.dept_id || awk.dept_id || this.auth.webUser?.dept_id,
      aawak_id: awk._id || awk.aawak_id,
      ...awk
    };
    $('#itemAawakModal').modal('hide');
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  showJawak(id: any) {
    if (id) {
      this.http.get(this.api.getUrl('JAWAKBYAWK') + id).subscribe({
        next: (data: any) => {
          if (data && data['success'] && data['result']) {
            if (data['result'].length > 0) {
              this.viewData = data['result'];
              $('#itemAawakModal').modal('hide');
              this.openModal('Show Jawak');
            } else {
              this.toastr.warning("इस आवक की कोई पूर्व जावक नहीं मिली।");
            }
          } else {
            this.toastr.error('जावक विवरण प्राप्त करने में त्रुटि आई।');
          }
        },
        error: () => {
          this.toastr.error('सर्वर से जावक विवरण लोड नहीं हो सका।');
        }
      });
    }
  }

  addJawakResponse(ev: any) {
    if (ev) {
      this.toastr.success('जावक सफलतापूर्वक दर्ज कर ली गई है।');
      this.getBachat();
    }
    $('#showModal').modal('hide');
    this.showModal = '';
  }

  excelImport(ev: any) {
    let workBooks: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      this.isLoader = true;
      this.loadingStatus = "फाइल लोड की जा रही है ।";
      this.getProductData();
      const data = reader.result;
      workBooks = XLSX.read(data, { type: 'binary' });
      jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBooks.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return initial;
      }, {});

      this.loadingStatus = "फाइल का अध्ययन किया जा रहा है।";
      // const dataString = JSON.stringify(jsonData);      
      let sheetdata = jsonData[workBooks.SheetNames[0]];
      let filterdata = sheetdata.filter((i: any) => (!i.includes("बचत")));
      let exceldata = filterdata.filter((i: any) => (i.length));
      let awakStart: any = 0, jawakStart: any = 0, startRow: any = 0;

      for (let i = 0; i < exceldata.length; i++) {
        if (exceldata[i][0] && ['awk detail', 'awak detail', 'aawak detail', 'aawak', 'आवक'].includes(exceldata[i][0].toString().toLowerCase().trim())) {
          startRow = i;
          for (let k in exceldata[i]) {
            if (exceldata[i][k] && ['jwk detail', 'jawak detail', 'jawak', 'जावक'].includes(exceldata[i][k].toString().toLowerCase().trim())) {
              jawakStart = k;
              break;
            }
          }
          break;
        }
      }
      console.log("startRow", startRow);
      console.log("awakStart", awakStart);
      console.log("jawakStart", jawakStart);
      let finalJson: any = [];
      let columns = exceldata[startRow + 1].map((r: any) => (typeof r == "string" ? r.toLowerCase().trim() : r));

      console.log("columns", columns);
      console.log("exceldata", exceldata);

      this.loadingStatus = "डाटा पढ़ा एवं सॉफ्टवेयर के डाटा से जोड़ा जा रहा है।";
      for (let i = startRow + 2; i < exceldata.length; i++) {

        console.log("err", exceldata[i]);

        //aawak form
        var obj: any = {
          type: null,
          date: null,
          pkt_num: null,
          item_detail: null,
          qty: null,
          rate: null,
          actual_amt: null,
          company_name: null,
          description: null,
          isbill: null,
          document: null,
          mm: null,
          mm_id: null,
          pbk: {},
          pbk_id: null,
          aj_mm: null,
          aj_mm_id: null,
          item: null,
          item_id: null,
          subitem: null,
          subitem_id: null,
          product: null,
          product_id: null,
          condition: null,
          condition_id: null,
          unit: null,
          unit_id: null,
          aj_type: null,
          aj_type_id: null,
          nimitt: null,
          nimitt_id: null,
          dept: this.auth.webUser.dept_eng,
          dept_id: this.auth.webUser.dept_id,
          jawak_detail: []
        };
        //jawak form
        let jwkobj: any = {};

        //loop through element of row and separating to aawak and jawak form
        for (let j = 0; j < columns.length; j++) {
          //trim data if type string
          if (typeof exceldata[i][j] == "string") {
            exceldata[i][j] = exceldata[i][j].trim();
          }
          // set null if data id '', '-', or empty/undefine
          if (['', '-', undefined].includes(exceldata[i][j])) {
            exceldata[i][j] = null;
          }

          //for aawak value (0 to jawak start)
          if (j < jawakStart) {
            switch (columns[j]) {
              case "mm": obj.mm = exceldata[i][j];
                let getmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(obj.mm));
                if (getmm) {
                  obj.mm_id = getmm._id;
                } else {
                  let dictmm = this.dictionary.find((d: any) => d.type == "mm" && d.name == obj.mm);
                  obj.mm_id = dictmm ? dictmm.id : null;
                }
                break;
              case "date": obj.date = exceldata[i][j];
                break;
              case "pkt no":
              case "pkt num":
              case "pkt_num":
              case "pkt": obj.pkt_num = exceldata[i][j] ? exceldata[i][j].toString() : exceldata[i][j];
                break;
              case "roll no":
              case "roll_no":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.roll_no = exceldata[i][j];
                  if (obj.pbk.roll_no) {
                    let getpbk = this.pbks.find((p: any) => p.roll_no == obj.pbk.roll_no);
                    obj.pbk_id = getpbk ? getpbk._id : null;
                  }
                }
                break;
              case "pbk":
              case "sewadhari":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.name = exceldata[i][j];
                }
                break;
              case "relation":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.relation = exceldata[i][j];
                }
                break;
              case "relative":
              case "relative_name":
              case "relative name":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.relative = exceldata[i][j];
                }
                break;
              case "item": obj.item = exceldata[i][j];
                let getitem = this.items.find((i: any) => [i.item_hin.trim(), i.item_eng, i.item_code].includes(obj.item));
                if (getitem) {
                  obj.item_id = getitem._id;
                } else {
                  let dictitem = this.dictionary.find((d: any) => d.type == "item" && d.name == obj.item && !d.extra_note)
                  obj.item_id = dictitem ? dictitem.id : null;
                }
                break;
              case "subitem": obj.subitem = exceldata[i][j];
                if (obj.item_id) {
                  let getitem = this.items.find((i: any) => i._id == obj.item_id);
                  let getsubitem = getitem.subitems.find((m: any) => [m.subitem_hin.trim(), m.subitem_eng, m.subitem_code].includes(obj.subitem));
                  obj.subitem_id = getsubitem ? getsubitem._id : null;
                }
                break;
              case "product":
              case "product_code":
              case "product code":
              case "serial no":
              case "sr no":
                if (this.settings.aawak.product_id) {
                  if (!obj.product) {
                    obj.product = exceldata[i][j];
                  }
                  if (!obj.product_id) {

                    let getproduct = this.productsAll.find((p: any) => [p.sr_no, p.product_code].includes(exceldata[i][j]));
                    obj.product_id = getproduct ? getproduct._id : null;
                  }
                }
                break;
              case "company":
              case "company name":
              case "company_name": obj.company_name = exceldata[i][j];
                break;
              case "condition":
                if (this.settings.aawak.condition_id) {
                  obj.condition = exceldata[i][j];
                  let getcondition = this.conditions.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(obj.condition));
                  if (getcondition) {
                    obj.condition_id = getcondition._id;
                  } else {
                    let dictcondition = this.dictionary.find((d: any) => d.type == "condition" && d.name == obj.condition)
                    obj.condition_id = dictcondition ? dictcondition.id : null;
                  }
                }
                break;
              case "aawak mm":
              case "aawak_mm":
              case "awk_mm":
              case "awk mm": obj.aj_mm = exceldata[i][j];
                let getawkmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(obj.aj_mm));
                if (getawkmm) {
                  obj.aj_mm_id = getawkmm._id;
                } else {
                  let dictaj_mm = this.dictionary.find((d: any) => d.type == "aj_mm" && d.name == obj.aj_mm)
                  obj.aj_mm_id = dictaj_mm ? dictaj_mm.id : null;
                }
                break;
              case "aawak type":
              case "awk type":
              case "awk_type":
              case "aawak_type": obj.aj_type = exceldata[i][j];
                let getaawak_type = this.aawak_types.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(obj.aj_type));
                if (getaawak_type) {
                  obj.aj_type_id = getaawak_type._id;
                } else {
                  let dictaj_type = this.dictionary.find((d: any) => d.type == "awk_type" && d.name == obj.aj_type)
                  obj.aj_type_id = dictaj_type ? dictaj_type.id : null;
                }
                break;
              case "qty":
              case "quantity": obj.qty = exceldata[i][j];
                break;
              case "price":
              case "rate": obj.rate = exceldata[i][j];
                break;
              case "amt":
              case "amount":
              case "actual amt":
              case "actual_amt": obj.actual_amt = exceldata[i][j];
                break;
              case "unit": obj.unit = exceldata[i][j];
                let getunit = this.units.find((u: any) => [u.unit_short, u.unit_full].includes(obj.unit));
                if (getunit) {
                  obj.unit_id = getunit._id;
                } else {
                  let dictunit = this.dictionary.find((d: any) => d.type == "unit" && d.name == obj.unit)
                  obj.unit_id = dictunit ? dictunit.id : null;
                }
                break;
              case "bill":
                if (this.settings.aawak.isbill) {
                  if ([true, 'true', 'yes', 1].includes((typeof exceldata[i][j] == "string" ? exceldata[i][j].trim().toLowerCase() : exceldata[i][j]))) {
                    obj.isbill = 1;
                  }
                  else {
                    obj.isbill = 0;
                  }
                }
                break;
              case "nimitt":
                if (this.settings.aawak.nimitt_id) {
                  obj.nimitt = exceldata[i][j];
                  let getnimitt = this.nimitts.find((n: any) => [n.nimitt_hin, n.nimitt_eng, n.roll_no].includes(obj.nimitt));
                  if (getnimitt) {
                    obj.nimitt_id = getnimitt._id;
                  } else {
                    let dictnimitt = this.dictionary.find((d: any) => d.type == "nimitt" && d.name == obj.nimitt)
                    obj.nimitt_id = dictnimitt ? dictnimitt.id : null;
                  }
                }
                break;
              case "item_detail":
              case "item detail":
                obj.item_detail = exceldata[i][j];
                break;
              case "description":
              case "desc":
                obj.description = exceldata[i][j];
                break;
              case "dept":
                // case "department": obj.dept = exceldata[i][j];
                //   let getdept = this.departments.find((d: any) => [d.dept_hin, d.dept_eng, d.dept_code].includes(obj.dept));                
                break;
              default: obj[columns[j]] = exceldata[i][j];
            }

          }
          //for jawak value (jawak start to end)
          else {

            //jwk switch
            switch (columns[j]) {
              case "date": jwkobj.date = exceldata[i][j];
                break;
              case "jwk mm":
              case "jwk_mm":
              case "jawak_mm":
              case "jawak mm": jwkobj.aj_mm = exceldata[i][j];
                let getmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(jwkobj.aj_mm));
                if (getmm) {
                  jwkobj.aj_mm_id = getmm._id;
                  jwkobj.aj_mm_hin = getmm.mm_hin;
                  jwkobj.aj_mm_code = getmm.mm_code;
                } else {
                  let dictaj_mm = this.dictionary.find((d: any) => d.type == "aj_mm" && d.name == jwkobj.aj_mm)
                  jwkobj.aj_mm_id = dictaj_mm ? dictaj_mm.id : null;
                }

                break;
              case "kisko diya":
              case "person":
              case "kisko_diya": jwkobj.nimitt = exceldata[i][j];
                let getnimitt = this.nimitts.find((n: any) => [n.nimitt_hin, n.nimitt_eng, n.roll_no].includes(jwkobj.nimitt));
                if (getnimitt) {
                  jwkobj.nimitt_id = getnimitt._id;
                  jwkobj.nimitt_hin = getnimitt.nimitt_hin;
                  jwkobj.nimitt_state_hin = getnimitt.state_hin;
                } else {
                  let dictnimitt = this.dictionary.find((d: any) => d.type == "nimitt" && d.name == jwkobj.nimitt)
                  jwkobj.nimitt_id = dictnimitt ? dictnimitt.id : null;
                }
                break;
              case "jwk_type":
              case "jwk type":
              case "jawak_type":
              case "jawak type": jwkobj.aj_type = exceldata[i][j];
                let getjawak_type = this.jawak_types.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(jwkobj.aj_type));
                if (getjawak_type) {
                  jwkobj.aj_type_id = getjawak_type._id;
                  jwkobj.aj_type_hin = getjawak_type.list_name_hin;
                } else {
                  let dictaj_type = this.dictionary.find((d: any) => d.type == "jwk_type" && d.name == jwkobj.aj_type)
                  jwkobj.aj_type_id = dictaj_type ? dictaj_type.id : null;
                }
                break;
              case "qty":
              case "quantity": jwkobj.qty = exceldata[i][j];
                break;
              case "pkt no":
              case "pkt num":
              case "pkt_num":
              case "pkt": jwkobj.pkt_num = exceldata[i][j];
                break;
              case "description":
              case "jawak_detail":
              case "jawak detail":
              case "jawak description": jwkobj.description = exceldata[i][j];
                break;
              default:
                jwkobj[columns[j]] = exceldata[i][j];
            }

          }

          //old code 
          // j < jawakStart ? (exceldata[i][j] != undefined ? aawak_values.push(exceldata[i][j]) : aawak_values.push(null)) :
          //   (exceldata[i][j] != undefined ? jawak_values.push(exceldata[i][j]) : jawak_values.push(null));
        }

        if (obj.subitem && !obj.subitem_id) {
          let dictitem = this.dictionary.find((d: any) => d.type == "item" && d.name == obj.item && d.extra_note == obj.subitem)
          obj.item_id = dictitem ? dictitem.id : null;
          obj.subitem_id = dictitem ? dictitem.id2 : null;
        }

        // check for required Fields in aawak object
        if (obj.date && obj.mm && (obj.aj_mm || obj.pbk) && obj.item && obj.qty && obj.unit && obj.aj_type) {

          finalJson.push(obj);
        }
        else {
          console.log("err", obj);

        }
        // check for required Fields in jawak object
        if (jwkobj.qty && (jwkobj.aj_mm || jwkobj.nimitt)) {
          console.log("err", finalJson[finalJson.length - 1]);

          finalJson[finalJson.length - 1].jawak_detail.push(jwkobj);
        }

      }
      console.log("finalJson", finalJson);


      this.loadingStatus = "डाटा को अपलोड किया जा रहा है।";
      //send data to backend
      this.http.post(this.api.getUrl('IMPORTEXPORT'), finalJson).subscribe((data: any) => {
        if (data.total_count) {
          this.openModal("import");
          this.gs.importPending = true;
        }
        this.isLoader = false;
      });
    }


    reader.readAsBinaryString(file);
    ev = '';

  }

  importResponse(ev: any) {
    console.log("respose", ev);

    if (ev) {
      this.closeModal();
      this.gs.checkTempImport();
      this.getBachat();
      this.getImportHistory();
    }
  }



}
