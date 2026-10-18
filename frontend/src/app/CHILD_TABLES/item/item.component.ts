import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { BackgroundTaskService } from 'src/app/services/background-task.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { SelectionService } from 'src/app/services/selection.service';
declare var $: any;

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  importType: any;
  excelFile: any;
  page = 1;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;
  expandAll: any = false;
  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  delType: any = null;
  delID: any = null;
  itemDataAll: any = [];
  itemData: any = [];
  categories: any = [];
  total_count: any = 0;
  si_total_count: any = 0;
  subitemData: any = [];
  conditionObj: any = {};
  baseurl: any;
  settings: any = {};
  auto_close: any = true;
  del_permitted_date = new Date('2024-07-30');

  // Yearly Rates UI & Quick Modal state
  currentYear: number = new Date().getFullYear();
  ratesMap: { [key: string]: { [year: number]: number } } = {};
  ratesRawMap: { [key: string]: any[] } = {};
  activeRateItem: any = null;
  activeRateSubitem: any = null;
  quickRatesList: { year: number; rate: any; _id?: number }[] = [];
  quickRateNewYear: number | null = null;
  isQuickRateSaving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
    public selectionService: SelectionService,
    private backgroundTask: BackgroundTaskService,
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getItemData(1);
    this.loadDepartmentRates();
    this.gs.observeList().subscribe(result => {
      this.categories = result.category ? result.category : [];
    });
    this.baseurl = this.api.getUrl('BASE');
    this.settings = this.auth.webUser.settings.item;
  }

  loadDepartmentRates() {
    this.http.get(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id).subscribe((res: any) => {
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
    }, (err: any) => {
      this.toastr.error(err?.error?.message || 'वार्षिक दरें लोड करने में समस्या आई।');
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

  openQuickRateModal(item: any, subitem: any = null) {
    this.activeRateItem = item;
    this.activeRateSubitem = subitem;
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

    $('#quickRateModal').modal('show');
  }

  closeQuickRateModal() {
    $('#quickRateModal').modal('hide');
    this.activeRateItem = null;
    this.activeRateSubitem = null;
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
    this.http.post(this.api.getUrl('ITEMRATE') + this.auth.webUser.dept_id, payload).subscribe((res: any) => {
      if (res && res.success) {
        this.toastr.success(`वर्ष ${rateObj.year} की दर ₹${rateObj.rate} सुरक्षित हो गई।`);
        if (res.result && res.result._id) rateObj._id = res.result._id;
        const key = `${payload.item_id}_${payload.subitem_id || 0}`;
        if (!this.ratesMap[key]) this.ratesMap[key] = {};
        this.ratesMap[key][payload.year] = payload.rate;
      } else {
        this.toastr.error(res?.message || 'दर सुरक्षित करने में समस्या आई।');
      }
    }, (err: any) => {
      this.toastr.error(err?.error?.message || 'दर सुरक्षित करने में समस्या आई।');
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
    this.http.post(this.api.getUrl('ITEMRATE') + 'item/bulk/' + this.auth.webUser.dept_id, payload).subscribe((res: any) => {
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
    }, (err: any) => {
      this.isQuickRateSaving = false;
      this.toastr.error(err?.error?.message || 'दरें सुरक्षित करने में समस्या आई।');
    });
  }

  applyRateToTransactions(rateObj: any) {
    if (!this.activeRateItem || rateObj.rate === null || rateObj.rate === undefined) return;
    const itemName = this.activeRateSubitem ? `${this.activeRateSubitem.subitem_hin} (${this.activeRateItem.item_hin})` : this.activeRateItem.item_hin;
    const confirmMsg = `क्या आप वर्ष ${rateObj.year} के सभी आवक एवं जावक रिकॉर्ड्स में '${itemName}' की दर ₹${rateObj.rate} लागू करना चाहते हैं?`;
    if (!confirm(confirmMsg)) return;

    const payload = {
      dept_id: this.auth.webUser.dept_id,
      item_id: this.activeRateItem._id,
      subitem_id: this.activeRateSubitem ? this.activeRateSubitem._id : null,
      year: Number(rateObj.year),
      rate: Number(rateObj.rate)
    };
    this.http.post(this.api.getUrl('ITEMRATE') + 'apply/bulk', payload).subscribe((res: any) => {
      if (res && res.success) {
        this.toastr.success(res.message || 'दरें आवक/जावक में लागू कर दी गईं।');
      } else {
        this.toastr.error(res?.message || 'दरें लागू करने में समस्या आई।');
      }
    }, (err: any) => {
      this.toastr.error(err?.error?.message || 'दरें लागू करने में समस्या आई।');
    });
  }

  deleteQuickRate(rateObj: any) {
    if (!rateObj._id) {
      rateObj.rate = null;
      return;
    }
    if (!confirm(`क्या आप वर्ष ${rateObj.year} की दर हटाना चाहते हैं?`)) return;

    this.http.delete(this.api.getUrl('ITEMRATE') + rateObj._id).subscribe((res: any) => {
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
    }, (err: any) => {
      this.toastr.error(err?.error?.message || 'दर हटाने में समस्या आई।');
    });
  }

  FilterActive() {
    this.itemData = this.itemDataAll.filter((i: { active: any; }) => !i.active)
  }

  getItemData(pageNo: any) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id, this.conditionObj).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        // this.itemDataAll = data['result'];
        this.itemData = data['result'];
        this.itemDataAll = data['result'];
        this.total_count = data['total_count'];
        this.si_total_count = data['subitem_count']
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  exportToExcel() {
    let item: any[] = [];
    let counter = 1;

    // Collect all unique rate years from ratesMap, descending (e.g. 2026, 2025, 2024...)
    const rateYearsSet = new Set<number>();
    if (this.ratesMap) {
      for (const key of Object.keys(this.ratesMap)) {
        for (const y of Object.keys(this.ratesMap[key])) {
          const yNum = Number(y);
          if (!isNaN(yNum) && yNum > 0) rateYearsSet.add(yNum);
        }
      }
    }
    rateYearsSet.add(this.currentYear);
    const sortedYears = Array.from(rateYearsSet).sort((a, b) => b - a);

    for (let i = 0; i < this.itemData.length; i++) {
      const itm = this.itemData[i];
      const itemKey = `${itm._id}_0`;
      const itemRates = this.ratesMap[itemKey] || {};

      const rowObj: any = {
        No: counter++,
        "Item Hin": itm.item_hin ? itm.item_hin.trim() : '',
        "Item Eng": itm.item_eng || null,
        "Item Roman": itm.item_roman || null,
        "Item Code": itm.item_code || null,
        "Subitem Hin": null,
        "Subitem Eng": null,
        "Subitem Roman": null,
        "Categories": itm.categories ? itm.categories.map((c: any) => c.category_hin).join(", ") : "",
        "Unit": itm.unit_short || null,
        "Extra Note": itm.extra_note || null,
        "Min Rate": itm.min_rate || null,
        "Max Rate": itm.max_rate || null,
        "Restrict Month": itm.restrict_month || null,
        "Restrict Year": itm.restrict_year || null,
      };

      for (const yr of sortedYears) {
        rowObj[`rate_${yr}`] = (itemRates[yr] !== undefined && itemRates[yr] !== null) ? Number(itemRates[yr]) : null;
      }

      item.push(rowObj);

      if (itm.subitems && itm.subitems.length) {
        for (let j = 0; j < itm.subitems.length; j++) {
          const si = itm.subitems[j];
          if (!si) continue;
          const subitemKey = `${itm._id}_${si._id}`;
          const subitemRates = this.ratesMap[subitemKey] || {};

          const siCategories = (si.categories && si.categories.length)
            ? si.categories.map((c: any) => c.category_hin).join(", ")
            : (itm.categories ? itm.categories.map((c: any) => c.category_hin).join(", ") : "");

          const subRowObj: any = {
            No: counter++,
            "Item Hin": itm.item_hin ? itm.item_hin.trim() : '',
            "Item Eng": itm.item_eng || null,
            "Item Roman": itm.item_roman || null,
            "Item Code": itm.item_code || null,
            "Subitem Hin": si.subitem_hin || null,
            "Subitem Eng": si.subitem_eng || null,
            "Subitem Roman": si.subitem_roman || null,
            "Categories": siCategories,
            "Unit": si.unit_short || null,
            "Extra Note": si.extra_note || null,
            "Min Rate": si.min_rate || null,
            "Max Rate": si.max_rate || null,
            "Restrict Month": si.restrict_month || null,
            "Restrict Year": si.restrict_year || null,
          };

          for (const yr of sortedYears) {
            subRowObj[`rate_${yr}`] = (subitemRates[yr] !== undefined && subitemRates[yr] !== null) ? Number(subitemRates[yr]) : null;
          }

          item.push(subRowObj);
        }
      }
    }

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const fileName = `item_list-${day}-${month}-${year}`;

    this.excelExportService.exportStyledExcel(item, fileName, 'आइटम एवं उप-वस्तु सूची (Item & Subitem Master List)');
  }

  // Helper to extract image paths from any document representation
  private getItemImages(doc: any): string[] {
    if (!doc) return [];
    let parsed = doc;
    if (typeof doc === 'string') {
      try {
        parsed = JSON.parse(doc);
        if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      } catch (e) {
        return [];
      }
    }
    if (!parsed) return [];
    let rawList: any[] = [];
    if (Array.isArray(parsed)) {
      rawList = parsed;
    } else if (parsed.images && Array.isArray(parsed.images)) {
      rawList = parsed.images;
    } else if (typeof parsed.images === 'string') {
      try {
        rawList = JSON.parse(parsed.images);
      } catch (e) {
        rawList = [parsed.images];
      }
    }
    return rawList.filter(img => typeof img === 'string' && img.trim().length > 0 && img !== 'null' && img !== '[null]');
  }

  // Normalizes an image path and builds a clean absolute URL
  private buildFullImageUrl(rawPath: string): string {
    if (!rawPath) return '';
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath;
    const cleanBase = (this.baseurl || '').replace(/\/+$/, '');
    const cleanPath = rawPath.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '');
    return `${cleanBase}/${cleanPath}`;
  }

  exportWithImagesPackage() {
    if (!this.itemData || !this.itemData.length) {
      this.toastr.warning('एक्सपोर्ट करने के लिए कोई आइटम नहीं है।');
      return;
    }

    const taskId = 'item_export_zip';
    if (this.backgroundTask.isTaskRunning(taskId)) {
      this.toastr.warning('इमेज पैकेज एक्सपोर्ट पहले से बैकग्राउंड में चल रहा है।');
      return;
    }

    // Start background task with non-blocking toast so user can continue working freely
    this.backgroundTask.startTask(taskId, 'इमेज पैकेज एक्सपोर्ट', 'आइटम डेटा तैयार किया जा रहा है...');

    // Snapshot current state for background thread
    const itemsSnapshot = [...this.itemData];
    const ratesMapSnapshot = { ...this.ratesMap };
    const currentYr = this.currentYear;

    setTimeout(async () => {
      try {
        // 1. Collect all unique rate years from ratesMap
        const rateYearsSet = new Set<number>();
        for (const key of Object.keys(ratesMapSnapshot)) {
          for (const y of Object.keys(ratesMapSnapshot[key])) {
            const yNum = Number(y);
            if (!isNaN(yNum) && yNum > 0) rateYearsSet.add(yNum);
          }
        }
        rateYearsSet.add(currentYr);
        const sortedYears = Array.from(rateYearsSet).sort((a, b) => b - a);

        // 2. Find max images across items & subitems
        let maxImages = 1;
        for (const itm of itemsSnapshot) {
          const itmImgs = this.getItemImages(itm.document);
          if (itmImgs.length > maxImages) maxImages = itmImgs.length;
          if (itm.subitems) {
            for (const si of itm.subitems) {
              if (!si) continue;
              const siImgs = this.getItemImages(si.document);
              if (siImgs.length > maxImages) maxImages = siImgs.length;
            }
          }
        }

        // 3. Prepare rows and image download list with deduplication
        const rows: any[] = [];
        const imageDownloadList: { relPath: string; fullUrl: string }[] = [];
        const imageCacheMap = new Map<string, string>(); // normPath -> uniqueFileName
        const usedFileNames = new Set<string>();
        let counter = 1;

        const getOrAddImage = (rawPath: string): string => {
          const normKey = rawPath.replace(/\\/g, '/').replace(/\/+/g, '/').trim();
          if (imageCacheMap.has(normKey)) {
            return imageCacheMap.get(normKey)!;
          }

          let baseName = normKey.split('/').pop() || `image_${imageCacheMap.size + 1}.jpg`;
          baseName = baseName.split('?')[0].replace(/[^a-zA-Z0-9._-]/g, '_');
          if (!baseName.includes('.')) baseName += '.jpg';

          let uniqueFileName = baseName;
          let dupCounter = 1;
          while (usedFileNames.has(uniqueFileName.toLowerCase())) {
            const dotIdx = baseName.lastIndexOf('.');
            if (dotIdx > 0) {
              uniqueFileName = `${baseName.substring(0, dotIdx)}_${dupCounter}${baseName.substring(dotIdx)}`;
            } else {
              uniqueFileName = `${baseName}_${dupCounter}`;
            }
            dupCounter++;
          }

          usedFileNames.add(uniqueFileName.toLowerCase());
          imageCacheMap.set(normKey, uniqueFileName);

          imageDownloadList.push({
            relPath: uniqueFileName,
            fullUrl: this.buildFullImageUrl(rawPath)
          });

          return uniqueFileName;
        };

        for (let i = 0; i < itemsSnapshot.length; i++) {
          const itm = itemsSnapshot[i];
          const itemKey = `${itm._id}_0`;
          const itemRates = ratesMapSnapshot[itemKey] || {};
          const itmImgs = this.getItemImages(itm.document);

          const rowObj: any = {
            No: counter++,
          };

          // Place Image column(s) in 2nd position right after No (deduplicated)
          for (let imgIdx = 0; imgIdx < maxImages; imgIdx++) {
            const colTitle = maxImages === 1 ? 'Image' : `Image ${imgIdx + 1}`;
            if (itmImgs[imgIdx]) {
              const rawPath = itmImgs[imgIdx];
              const imgFileName = getOrAddImage(rawPath);
              const relHyperlink = `images/${imgFileName}`;

              rowObj[colTitle] = {
                text: relHyperlink,
                hyperlink: relHyperlink
              };
            } else {
              rowObj[colTitle] = '-';
            }
          }

          rowObj["Item Hin"] = itm.item_hin ? itm.item_hin.trim() : '';
          rowObj["Item Eng"] = itm.item_eng || null;
          rowObj["Item Roman"] = itm.item_roman || null;
          rowObj["Item Code"] = itm.item_code || null;
          rowObj["Subitem Hin"] = null;
          rowObj["Subitem Eng"] = null;
          rowObj["Subitem Roman"] = null;
          rowObj["Categories"] = itm.categories ? itm.categories.map((c: any) => c.category_hin).join(", ") : "";
          rowObj["Unit"] = itm.unit_short || null;
          rowObj["Extra Note"] = itm.extra_note || null;
          rowObj["Min Rate"] = itm.min_rate || null;
          rowObj["Max Rate"] = itm.max_rate || null;
          rowObj["Restrict Month"] = itm.restrict_month || null;
          rowObj["Restrict Year"] = itm.restrict_year || null;

          for (const yr of sortedYears) {
            rowObj[`rate_${yr}`] = (itemRates[yr] !== undefined && itemRates[yr] !== null) ? Number(itemRates[yr]) : null;
          }

          rows.push(rowObj);

          // Subitems
          if (itm.subitems && itm.subitems.length) {
            for (let j = 0; j < itm.subitems.length; j++) {
              const si = itm.subitems[j];
              if (!si) continue;
              const subitemKey = `${itm._id}_${si._id}`;
              const subitemRates = ratesMapSnapshot[subitemKey] || {};
              const siImgs = this.getItemImages(si.document);

              const siCategories = (si.categories && si.categories.length)
                ? si.categories.map((c: any) => c.category_hin).join(", ")
                : (itm.categories ? itm.categories.map((c: any) => c.category_hin).join(", ") : "");

              const subRowObj: any = {
                No: counter++,
              };

              // Place Image column(s) in 2nd position right after No (deduplicated)
              for (let imgIdx = 0; imgIdx < maxImages; imgIdx++) {
                const colTitle = maxImages === 1 ? 'Image' : `Image ${imgIdx + 1}`;
                if (siImgs[imgIdx]) {
                  const rawPath = siImgs[imgIdx];
                  const imgFileName = getOrAddImage(rawPath);
                  const relHyperlink = `images/${imgFileName}`;

                  subRowObj[colTitle] = {
                    text: relHyperlink,
                    hyperlink: relHyperlink
                  };
                } else {
                  subRowObj[colTitle] = '-';
                }
              }

              subRowObj["Item Hin"] = itm.item_hin ? itm.item_hin.trim() : '';
              subRowObj["Item Eng"] = itm.item_eng || null;
              subRowObj["Item Roman"] = itm.item_roman || null;
              subRowObj["Item Code"] = itm.item_code || null;
              subRowObj["Subitem Hin"] = si.subitem_hin || null;
              subRowObj["Subitem Eng"] = si.subitem_eng || null;
              subRowObj["Subitem Roman"] = si.subitem_roman || null;
              subRowObj["Categories"] = siCategories;
              subRowObj["Unit"] = si.unit_short || null;
              subRowObj["Extra Note"] = si.extra_note || null;
              subRowObj["Min Rate"] = si.min_rate || null;
              subRowObj["Max Rate"] = si.max_rate || null;
              subRowObj["Restrict Month"] = si.restrict_month || null;
              subRowObj["Restrict Year"] = si.restrict_year || null;

              for (const yr of sortedYears) {
                subRowObj[`rate_${yr}`] = (subitemRates[yr] !== undefined && subitemRates[yr] !== null) ? Number(subitemRates[yr]) : null;
              }

              rows.push(subRowObj);
            }
          }
        }

        // 4. File names
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const baseName = `item_list-${day}-${month}-${year}`;

        // 5. Run package export with background progress reporting
        const result = await this.excelExportService.exportPackageWithImages(
          rows,
          imageDownloadList,
          `${baseName}_with_images`,
          baseName,
          'आइटम एवं उप-वस्तु सूची (इमेज पैकेज सहित)',
          (current, total, message) => {
            this.backgroundTask.updateProgress(taskId, message, current, total);
          }
        );

        const successMsg = result.imageCount > 0
          ? `इमेज पैकेज (.zip) डाउनलोड हो गया! (${result.imageCount} फोटो शामिल)`
          : `पैकेज (.zip) डाउनलोड हो गया! (सूची में कोई फोटो उपलब्ध नहीं थी)`;
        this.backgroundTask.completeTask(taskId, successMsg);
      } catch (err: any) {
        console.error('Error exporting package with images:', err);
        this.backgroundTask.failTask(taskId, 'इमेज पैकेज एक्सपोर्ट करने में समस्या आई।');
      }
    }, 50);
  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    if (this.auto_close) {
      $('#showModal').modal('hide');
      this.showModal = '';
    }
  }

  excelImport(ev: any) {
    if (ev) {
      this.excelFile = ev;
      this.importResponse(null);
    }
    ev = null;
  }

  importedItems: any = [];
  importedSubitems: any = [];

  importResponse(iType: any, data?: any) {
    switch (iType) {
      case 'item':
        if (data && Array.isArray(data)) this.importedItems = data;
        this.gs.observeList(true).subscribe(() => {
          this.importType = 'item_category';
          this.openModal('ei_item_category');
        });
        break;

      case 'rel_item_category':
        this.importType = 'subitem';
        this.openModal('ei_subitem');
        break;

      case 'subitem':
        if (data && Array.isArray(data)) this.importedSubitems = data;
        this.gs.observeList(true).subscribe(() => {
          this.importType = 'rel_subitem_category';
          this.openModal('ei_subitem_category');
        });
        break;

      case 'rel_subitem_category':
        this.importType = '';
        this.closeModal();
        break;

      default:
        this.importedItems = [];
        this.importedSubitems = [];
        this.importType = 'item';
        this.openModal('ei_item');
    }
  }



  lockItem(id: any) {
    this.app.appModal$ = new Subject();
    this.app.appModal$.subscribe((result: any) => {
      if (result) {
        this.toggleLock({ _id: id, ...result }, 'ITEM');
      }
    });
    this.app.openModal('lockModal');
  }

  unlockItem(id: any) {
    this.toggleLock({ _id: id, restrict_month: null, restrict_year: null }, 'ITEM');
  }

  lockSubitem(id: any) {
    this.app.appModal$ = new Subject();
    this.app.appModal$.subscribe((result: any) => {
      if (result) {
        this.toggleLock({ _id: id, ...result }, 'SUBITEM');
      }
    });
    this.app.openModal('lockModal');
  }

  unlockSubitem(itemId: any, id: any) {
    let i = this.itemData.findIndex((it: any) => it._id === itemId);
    if (i > -1 && this.itemData[i].restrict_year) {
      this.toggleLock({ _id: itemId, restrict_month: null, restrict_year: null }, 'ITEM');
    }
    this.toggleLock({ _id: id, restrict_month: null, restrict_year: null }, 'SUBITEM');
  }

  toggleLock(row: any, APIname: any) {
    this.http.put(this.api.getUrl(APIname) + 'lock/', row).subscribe((data: any) => {
      if (data['result'].restrict_year) {
        this.toastr.success(APIname + " Lock Successfully.");
      }
      else {
        this.toastr.success(APIname + " Unlock Successfully.");
      }
      if (APIname == 'SUBITEM') {
        let i = this.itemData.findIndex((it: any) => it._id === data['result'].item_id);
        if (i > -1) {
          let j = this.itemData[i].subitems.findIndex((si: any) => si._id === data['result']._id);
          if (j > -1) {
            this.itemData[i].subitems[j].restrict_month = data['result'].restrict_month;
            this.itemData[i].subitems[j].restrict_year = data['result'].restrict_year;
          }
        }
      } else {
        let i = this.itemData.findIndex((it: any) => it._id === data['result']._id);
        if (i > -1) {
          this.itemData[i].restrict_month = data['result'].restrict_month;
          this.itemData[i].restrict_year = data['result'].restrict_year;
        }
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

  viewProduct(data: any) {
    this.editData = data;
    this.openModal('View Product');
  }

  catSelected(ev: any) {
    if (ev) {
      this.conditionObj.categories = ev;
      this.getItemData(1);
    }
    else {
      this.conditionObj.categories = null;
      this.getItemData(1);
    }
  }



  addSubitem(item: any) {
    this.editData = {
      item_id: item._id,
      categories: item.categories,
      unit_id: item.unit_id
    }
    this.openModal('Add Subitem From Item');
  }

  cloneWithSubitem(item: any) {
    this.editData = {
      categories: item.categories,
      unit_id: item.unit_id,
      subitems: item.subitems
    }
    this.openModal('Clone Item');
  }

  cloneItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      for (let i in this.editData.subitems) {
        let subitem = this.editData.subitems[i];
        subitem.item_id = ev._id;
        subitem.categories = ev.categories;
        this.http.post(this.api.getUrl('SUBITEM') + this.auth.webUser.dept_id, subitem).subscribe((data: any) => {
          if (data['result'] && data['success']) {
            // this.gs.Lists.subitem.unshift(data['result'])
            let j = this.gs.Lists.itemmix.findIndex((i: { _id: any; }) => i._id == ev._id);
            this.gs.Lists.itemmix[j].subitems.push(data['result']);
            // ev.subitems.push(data['result']);
            this.toastr.success('SUBITEM added successfully.')
          } else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        }, err => {
          this.toastr.error(err['error']);
          this.isLoader = false;
        });
      }
      this.itemData.unshift(ev);
      this.closeModal();
      this.isLoader = false;
    }
    else {
      console.log("clone item", ev);

    }
  }

  addItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      if (ev.unit) {
        ev.unit_full = ev.unit.unit_full;
        ev.unit_short = ev.unit.unit_short;
      }
      this.itemData.unshift(ev);
      this.loadDepartmentRates();
      this.isLoader = false;
    }
    else {
      console.log("message", ev)
    }
  }

  editItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      if (ev.unit) {
        ev.unit_full = ev.unit.unit_full;
        ev.unit_short = ev.unit.unit_short;
      }
      let index = this.itemData.findIndex((it: any) => it._id === ev._id);

      if (index >= 0) {
        console.log("index", index);
        // ev.categories = this.itemData[index].categories;
        ev.subitems = this.itemData[index].subitems;
        this.itemData.splice(index, 1, ev);
      }
      this.loadDepartmentRates();
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }


  addSubitemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      if (ev.unit) {
        ev.unit_full = ev.unit.unit_full;
        ev.unit_short = ev.unit.unit_short;
      }
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == ev.item_id);
      if (i > -1) {
        this.itemData[i].subitems.push(ev);
        this.si_total_count++;
      }
      this.loadDepartmentRates();
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }

  editSubitemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      if (ev.unit) {
        ev.unit_full = ev.unit.unit_full;
        ev.unit_short = ev.unit.unit_short;
      }
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == ev.item_id);
      if (i > -1) {
        let j = this.itemData[i].subitems.findIndex((si: any) => si._id == ev._id);
        if (j > -1) {
          Object.assign(this.itemData[i].subitems[j], ev);
        }
      }
      this.loadDepartmentRates();
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }

  edit(data: any, type: any = null) {
    if (type == 'subitem') {
      this.editData = data;
      this.openModal('Edit Subitem');
    }
    else {
      this.editData = data;
      this.openModal('Edit Item');
    }
  }

  deleteItem(id: any) {
    this.delID = id;
    this.delType = 'item';
    this.openModal('delete_item');
  }

  deleteSelected() {
    const selectedIds = this.selectionService.getSelected('item');
    if (!selectedIds || selectedIds.length === 0) {
      this.toastr.warning('Please select at least one item to delete.');
      return;
    }
    this.delID = selectedIds;
    this.delType = 'item';
    this.openModal('delete_item');
  }

  deleteResponse(ev: any) {
    if (ev) {
      this.selectionService.clear('item');
      this.closeModal();
      this.toastr.success((this.delType || 'Item') + " deleted successfully.");
      this.getItemData(this.currentPage);
    }
  }

  deleteOld(i: any, id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('ITEM') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.itemData.splice(i, 1);
            // const mmIndex = this.gs.Lists.mm.findIndex((m: any) => m._id === id);
            // if (mmIndex > -1) {
            //   this.gs.Lists.mm.splice(mmIndex, 1);
            // }
            this.total_count -= 1;
            this.toastr.success('Deleted Successfully');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        });
      }
    })
  }

  deleteSubitem(itemId: any, id: any) {
    this.delID = id;
    this.delType = 'subitem';
    this.openModal('delete_item');
  }

  protectionToggle(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('ITEM'), body).subscribe((data: any) => {
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == data['result']._id);

      this.itemData[i].active = data['result'].active;
      this.isLoader = false;
      if (data['result'].active) {
        this.toastr.success("Protetion Shield Activated");
      }
      else {
        this.toastr.success("Protetion Shield Deactivated");
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

  protectionToggleSubitem(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('SUBITEM'), body).subscribe((data: any) => {
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == data['result'].item_id);
      let j = this.itemData[i].subitems.findIndex((s: { _id: any; }) => s._id == data['result']._id);

      this.itemData[i].subitems[j].active = data['result'].active;
      this.isLoader = false;
      if (data['result'].active) {
        this.toastr.success("Protetion Shield Activated");
      }
      else {
        this.toastr.success("Protetion Shield Deactivated");
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }



}
