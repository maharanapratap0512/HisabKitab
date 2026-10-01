import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-report-item-ledger',
  templateUrl: './report-item-ledger.component.html',
  styleUrls: ['./report-item-ledger.component.scss']
})
export class ReportItemLedgerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoader: any = false;
  loadingStatus: any = 'Loading...';
  filterBody: any = {
    from: null,
    to: null,
    mm_id: null,
    category_id: null,
    item_subitem_ids: []
  };

  activeDimension: 'item' | 'pbk' | 'mm' = 'item';

  monthYearOptions: any[] = [];
  mms: any = [];
  categories: any = [];
  items: any = [];
  states: any = [];
  pbks: any = [];
  filteredPbks: any = [];

  filterBodyPbk: any = {
    from: null,
    to: null,
    mm_id: null,
    state_id: null,
    pbk_ids: []
  };

  filterBodyMm: any = {
    from: null,
    to: null,
    state_id: null,
    category_id: null,
    mm_ids: []
  };

  viewMode: 'chips' | 'scroll' = 'chips';

  reportData: any = [];
  groupedReportData: any = [];
  activeCategoryIndex: number = 0;
  activeReportIndex: number = 0;

  reportDataPbk: any = [];
  groupedReportDataPbk: any = [];
  activeStateIndex: number = 0;
  activePbkIndex: number = 0;

  reportDataMm: any = [];
  groupedReportDataMm: any = [];
  activeStateIndexMm: number = 0;
  activeMmIndex: number = 0;
  filteredMmsForMmDimension: any = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().pipe(takeUntil(this.destroy$)).subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.categories = result.category ? result.category : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.states = result.state ? result.state : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.filteredPbks = [...this.pbks];
      this.filteredMmsForMmDimension = [...this.mms];

      this.buildMonthYearOptions();

      this.filterBody.mm_id = this.auth.webUser?.settings?.defaultMM;
      this.filterBodyPbk.mm_id = this.auth.webUser?.settings?.defaultMM;

      this.isLoader = false;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.reportData = [];
    this.groupedReportData = [];
    this.reportDataPbk = [];
    this.groupedReportDataPbk = [];
    this.reportDataMm = [];
    this.groupedReportDataMm = [];
    this.items = [];
    this.pbks = [];
    this.filteredPbks = [];
    this.mms = [];
    this.filteredMmsForMmDimension = [];
  }

  buildMonthYearOptions() {
    this.monthYearOptions = [];
    for (let yr of this.gs.years) {
      let months = this.gs.yearChangedGetMonth(yr);
      for (let m of months) {
        this.monthYearOptions.push({
          y: yr,
          m: m.m,
          name: `${m.name} ${yr}`,
          name_hin: `${m.name_hin} ${yr}`
        });
      }
    }
  }

  categorySelected(ev: any) {
    // We don't auto-select here anymore based on user request.
    // The items will only be auto-selected when Generate Report is clicked and the items list is empty.
  }

  getItemCategories(item: any): any[] {
    if (!item || !item.categories || !Array.isArray(item.categories)) return [];
    return item.categories.filter((c: any) => c && c._id);
  }

  getSubitemCategories(subitem: any, parentItem: any): any[] {
    if (!subitem) return [];
    let subCats = subitem.categories && Array.isArray(subitem.categories)
      ? subitem.categories.filter((c: any) => c && c._id)
      : [];
    if (subCats.length > 0) {
      return subCats;
    }
    return this.getItemCategories(parentItem);
  }

  getCategoryItems(categoryId: any): string[] {
    let matchingIds: string[] = [];
    for (let item of this.items) {
      let itemCats = this.getItemCategories(item);
      let itemMatches = itemCats.some((c: any) => c._id === categoryId);

      if (item.subitems && item.subitems.length > 0) {
        for (let sub of item.subitems) {
          let subCats = this.getSubitemCategories(sub, item);
          let subMatches = subCats.some((c: any) => c._id === categoryId);
          if (subMatches) {
            matchingIds.push(`${item._id}:${sub._id}`);
          }
        }
      } else {
        if (itemMatches) {
          matchingIds.push(`${item._id}:`);
        }
      }
    }
    return matchingIds;
  }

  searchReports() {
    if (!this.filterBody.from || !this.filterBody.to) {
      this.toastr.error('Please select From and To Date');
      return;
    }

    // Auto-select items if category is chosen but item list is cleared
    if ((!this.filterBody.item_subitem_ids || this.filterBody.item_subitem_ids.length === 0) && this.filterBody.category_id) {
      this.filterBody.item_subitem_ids = this.getCategoryItems(this.filterBody.category_id);
    }

    // Auto-select ALL items if both category and item list are cleared
    if ((!this.filterBody.item_subitem_ids || this.filterBody.item_subitem_ids.length === 0) && !this.filterBody.category_id) {
      this.filterBody.item_subitem_ids = [];
      for (let cat of this.categories) {
        this.filterBody.item_subitem_ids.push(...this.getCategoryItems(cat._id));
      }
    }

    if (!this.filterBody.item_subitem_ids || this.filterBody.item_subitem_ids.length === 0) {
      this.toastr.error('Please select at least one item');
      return;
    }

    // Process ids to backend format
    let itemSubitemParsed = this.filterBody.item_subitem_ids.map((idStr: string) => {
      let parts = idStr.split(':');
      let i_id = Number(parts[0]);
      let s_id = parts[1] ? Number(parts[1]) : null;

      let itemObj = this.items.find((i: any) => i._id === i_id);
      let item_hin = itemObj ? itemObj.item_hin : '';
      let item_eng = itemObj ? itemObj.item_eng : '';
      let subitem_hin = '';
      let subitem_eng = '';
      if (itemObj && s_id) {
        let subObj = itemObj.subitems.find((s: any) => s._id === s_id);
        if (subObj) {
          subitem_hin = subObj.subitem_hin;
          subitem_eng = subObj.subitem_eng;
        }
      }

      return {
        item_id: i_id,
        subitem_id: s_id,
        item_hin: item_hin,
        item_eng: item_eng,
        subitem_hin: subitem_hin,
        subitem_eng: subitem_eng
      };
    });

    let body = { ...this.filterBody, item_subitem_ids: itemSubitemParsed };

    this.isLoader = true;
    this.http.put(this.api.getUrl('REPORT_ITEM_LEDGER') + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data.success) {
        // Filter out reports where all values are 0
        this.reportData = data.data.filter((r: any) =>
          r.overview.total_aawak !== 0 ||
          r.overview.total_jawak !== 0 ||
          r.overview.current_bachat !== 0
        );

        // Group reportData by category
        this.groupedReportData = [];
        for (let r of this.reportData) {
          let itemObj = this.items.find((i: any) => i._id === r.item_id);
          let catId: any = 'uncategorized';
          if (itemObj) {
            let subObj = itemObj.subitems && r.subitem_id ? itemObj.subitems.find((s: any) => s._id === r.subitem_id) : null;
            let effectiveCats = subObj ? this.getSubitemCategories(subObj, itemObj) : this.getItemCategories(itemObj);
            if (effectiveCats.length > 0) {
              catId = effectiveCats[0]._id;
            }
          }

          let catObj = this.categories.find((c: any) => c._id === catId);
          let catName = catObj ? (catObj.category_hin || catObj.category_eng) : 'Uncategorized';

          let group = this.groupedReportData.find((g: any) => g.category_id === catId);
          if (!group) {
            group = { category_id: catId, category_name: catName, reports: [] };
            this.groupedReportData.push(group);
          }
          group.reports.push(r);
        }

        // Sort groupedReportData based on the master order of this.categories
        this.groupedReportData.sort((a: any, b: any) => {
          if (a.category_id === 'uncategorized') return 1;
          if (b.category_id === 'uncategorized') return -1;
          let idxA = this.categories.findIndex((c: any) => c._id === a.category_id);
          let idxB = this.categories.findIndex((c: any) => c._id === b.category_id);
          if (idxA === -1) idxA = 9999;
          if (idxB === -1) idxB = 9999;
          return idxA - idxB;
        });

        // Sort reports inside each category group alphabetically by item/subitem name
        for (let group of this.groupedReportData) {
          group.reports.sort((a: any, b: any) => {
            let nameA = (a.item_hin || '') + (a.subitem_hin ? ' ' + a.subitem_hin : '');
            let nameB = (b.item_hin || '') + (b.subitem_hin ? ' ' + b.subitem_hin : '');
            return nameA.localeCompare(nameB, 'hi');
          });
        }

        if (this.reportData.length === 0) {
          this.toastr.info('No activity (Aawak/Jawak/Bachat) found for the selected items in this date range.');
        }

        this.activeCategoryIndex = 0;
        this.activeReportIndex = 0;
        this.isLoader = false;
      }
    }, (err: any) => {
      console.log(err);
      this.isLoader = false;
      this.toastr.error(err.message);
    });
  }

  async exportCurrentExcel() {
    if (!this.groupedReportData || this.groupedReportData.length === 0) {
      this.toastr.error('No data to export');
      return;
    }
    let currentGroup = this.groupedReportData[this.activeCategoryIndex];
    if (!currentGroup || !currentGroup.reports || currentGroup.reports.length === 0) {
      this.toastr.error('No data for this category');
      return;
    }
    let catObj = this.categories.find((c: any) => c._id === currentGroup.category_id);
    let { buffer, title } = await this.buildExcelBuffer(currentGroup.reports, catObj);
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(data, title + '.xlsx');
  }

  async fetchAllCategoriesData(): Promise<Array<{ categoryObj: any, reports: any[] }>> {
    if (!this.filterBody.from || !this.filterBody.to || !this.filterBody.mm_id) {
      this.toastr.error('Please select From Date, To Date, and MM for Export.');
      return [];
    }

    let validCategories = this.categories.filter((c: any) => this.getCategoryItems(c._id).length > 0);
    if (validCategories.length === 0) {
      this.toastr.warning('No items selected across categories.');
      return [];
    }

    let allCategoryGroups: Array<{ categoryObj: any, reports: any[] }> = [];

    for (let i = 0; i < validCategories.length; i++) {
      let catObj = validCategories[i];
      let items = this.getCategoryItems(catObj._id);
      let catName = catObj.category_hin || catObj.category_eng || 'Category';

      this.isLoader = true;
      this.loadingStatus = `Fetching ledger records for ${catName}... (${i + 1}/${validCategories.length})`;

      let itemSubitemParsed = items.map((idStr: string) => {
        let parts = idStr.split(':');
        let i_id = Number(parts[0]);
        let s_id = parts[1] ? Number(parts[1]) : null;
        let itemObj = this.items.find((item: any) => item._id === i_id);
        let subitem_hin = '';
        let subitem_eng = '';
        if (itemObj && s_id) {
          let subObj = itemObj.subitems.find((s: any) => s._id === s_id);
          if (subObj) {
            subitem_hin = subObj.subitem_hin;
            subitem_eng = subObj.subitem_eng;
          }
        }
        return {
          item_id: i_id, subitem_id: s_id,
          item_hin: itemObj?.item_hin || '', item_eng: itemObj?.item_eng || '',
          subitem_hin: subitem_hin, subitem_eng: subitem_eng
        };
      });

      let body = { ...this.filterBody, item_subitem_ids: itemSubitemParsed, category_name: catName };
      try {
        let res: any = await this.http.put(this.api.getUrl('REPORT_ITEM_LEDGER') + this.auth.webUser.dept_id, body).toPromise();
        if (res && res.success) {
          let validReports = res.data.filter((r: any) =>
            r.overview.total_aawak !== 0 || r.overview.total_jawak !== 0 || r.overview.current_bachat !== 0 || r.overview.past_bachat !== 0
          );
          if (validReports.length > 0) {
            allCategoryGroups.push({
              categoryObj: catObj,
              reports: validReports
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching category ${catName}`, err);
      }
    }

    return allCategoryGroups;
  }

  async exportSingleHeavyExcel() {
    let allGroups = await this.fetchAllCategoriesData();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    this.isLoader = true;
    this.loadingStatus = 'Building Master Single Heavy Excel Workbook...';

    const workbook = new Workbook();
    let mmObj = this.mms.find((m: any) => m._id === this.filterBody.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';
    const periodStr = `${this.filterBody.from.name_hin} से ${this.filterBody.to.name_hin}`;

    // Pre-calculate unique sheet names for all categories to construct hyperlinks
    const usedSheetNames = new Set<string>();
    usedSheetNames.add('Master Category Saar');

    let categorySheetMap: Array<{ g: any, catName: string, catSheetName: string }> = [];

    for (let g of allGroups) {
      let catName = g.categoryObj.category_hin || g.categoryObj.category_eng || 'Cat';
      let safeCatSheetName = ('Index - ' + catName).substring(0, 30).replace(/[\\*?:\[\]/]/g, '');

      let catSheetIdx = 1;
      let finalCatSheetName = safeCatSheetName;
      while (usedSheetNames.has(finalCatSheetName)) {
        finalCatSheetName = safeCatSheetName.substring(0, 26) + `_${catSheetIdx++}`;
      }
      usedSheetNames.add(finalCatSheetName);

      categorySheetMap.push({
        g: g,
        catName: catName,
        catSheetName: finalCatSheetName
      });
    }

    // --- SHEET 1: Master Category Saar Index ---
    const masterIndexSheet = workbook.addWorksheet('Master Category Saar');
    masterIndexSheet.mergeCells('A1:G1');
    let titleCell = masterIndexSheet.getCell('A1');
    titleCell.value = `${periodStr} तक, ${mmName} का संपूर्ण श्रेणीवार सार (Master Category Summary)`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    masterIndexSheet.getRow(1).height = 32;

    const masterHeaders = ['No.', 'Category Name (श्रेणी)', 'Total Items (वस्तुएं)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Current Bachat (वर्तमान)'];
    masterIndexSheet.getRow(3).values = masterHeaders;
    masterIndexSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    masterIndexSheet.getRow(3).eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let masterRowIdx = 4;
    let grandTotals = { items: 0, past: 0, aawak: 0, jawak: 0, bachat: 0 };

    for (let i = 0; i < categorySheetMap.length; i++) {
      let itemMap = categorySheetMap[i];
      let g = itemMap.g;
      let catName = itemMap.catName;
      let catSheetName = itemMap.catSheetName;

      let catPast = g.reports.reduce((s: number, r: any) => s + Number(r.overview.past_bachat || 0), 0);
      let catAwk = g.reports.reduce((s: number, r: any) => s + Number(r.overview.total_aawak || 0), 0);
      let catJwk = g.reports.reduce((s: number, r: any) => s + Number(r.overview.total_jawak || 0), 0);
      let catBcht = g.reports.reduce((s: number, r: any) => s + Number(r.overview.current_bachat || 0), 0);

      grandTotals.items += g.reports.length;
      grandTotals.past += catPast;
      grandTotals.aawak += catAwk;
      grandTotals.jawak += catJwk;
      grandTotals.bachat += catBcht;

      let row = masterIndexSheet.getRow(masterRowIdx);
      row.values = [
        i + 1,
        '',
        g.reports.length,
        catPast.toFixed(2),
        catAwk.toFixed(2),
        catJwk.toFixed(2),
        catBcht.toFixed(2)
      ];

      let catCell = masterIndexSheet.getCell(`B${masterRowIdx}`);
      catCell.value = { text: catName, hyperlink: `#'${catSheetName}'!A1` };
      catCell.font = { color: { argb: 'FF1F4E79' }, underline: true, bold: true };

      row.eachCell((c, cIdx) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { vertical: 'middle', horizontal: cIdx <= 2 ? (cIdx === 1 ? 'center' : 'left') : 'right' };
      });
      masterRowIdx++;
    }

    // Master Summary Total Row
    masterIndexSheet.getRow(masterRowIdx).values = [
      '*',
      'Grand Summary Total',
      grandTotals.items,
      grandTotals.past.toFixed(2),
      grandTotals.aawak.toFixed(2),
      grandTotals.jawak.toFixed(2),
      grandTotals.bachat.toFixed(2)
    ];
    masterIndexSheet.getRow(masterRowIdx).font = { bold: true };
    masterIndexSheet.getRow(masterRowIdx).eachCell((c, cIdx) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
      c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
      c.alignment = { vertical: 'middle', horizontal: cIdx <= 2 ? (cIdx === 1 ? 'center' : 'left') : 'right' };
    });

    masterIndexSheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 8 : (idx === 1 ? 32 : 18);
    });

    // --- SHEETS 2+: Category Index Sheets & Item Detailed Sheets ---
    for (let itemMap of categorySheetMap) {
      let g = itemMap.g;
      let catName = itemMap.catName;
      let finalCatSheetName = itemMap.catSheetName;

      const catIndexSheet = workbook.addWorksheet(finalCatSheetName);
      catIndexSheet.mergeCells('A1:E1');
      let catTitleCell = catIndexSheet.getCell('A1');
      catTitleCell.value = `${periodStr} तक, ${mmName} के ${catName} का सार`;
      catTitleCell.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
      catTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
      catTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      catIndexSheet.getRow(1).height = 30;

      catIndexSheet.getCell('F1').value = { text: '⬅️ Master Index', hyperlink: "#'Master Category Saar'!A1" };
      catIndexSheet.getCell('F1').font = { bold: true, color: { argb: 'FFFFFFFF' }, underline: true };
      catIndexSheet.getCell('F1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF34495E' } };
      catIndexSheet.getCell('F1').alignment = { horizontal: 'center', vertical: 'middle' };

      const catHeaders = ['No.', 'Item Name (वस्तु)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Current Bachat (वर्तमान)'];
      catIndexSheet.getRow(3).values = catHeaders;
      catIndexSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      catIndexSheet.getRow(3).eachCell(c => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5D6D7E' } };
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      let cRow = 4;
      let catPastTotal = 0, catAwkTotal = 0, catJwkTotal = 0, catBchtTotal = 0;
      let itemSheetNames: string[] = [];

      for (let i = 0; i < g.reports.length; i++) {
        let r = g.reports[i];
        let itemName = r.item_hin + (r.subitem_hin ? ' (' + r.subitem_hin + ')' : '');

        let baseSheetName = itemName.substring(0, 30).replace(/[\\*?:\[\]/]/g, '');
        let itemSheetIdx = 1;
        let finalItemSheetName = baseSheetName || 'Item';
        while (usedSheetNames.has(finalItemSheetName)) {
          finalItemSheetName = baseSheetName.substring(0, 26) + `_${itemSheetIdx++}`;
        }
        usedSheetNames.add(finalItemSheetName);
        itemSheetNames.push(finalItemSheetName);

        let pVal = Number(r.overview.past_bachat || 0);
        let aVal = Number(r.overview.total_aawak || 0);
        let jVal = Number(r.overview.total_jawak || 0);
        let bVal = Number(r.overview.current_bachat || 0);

        catPastTotal += pVal;
        catAwkTotal += aVal;
        catJwkTotal += jVal;
        catBchtTotal += bVal;

        let row = catIndexSheet.getRow(cRow);
        row.values = [
          i + 1,
          '',
          `${pVal.toFixed(2)} ${r.unit_short}`,
          `${aVal.toFixed(2)} ${r.unit_short}`,
          `${jVal.toFixed(2)} ${r.unit_short}`,
          `${bVal.toFixed(2)} ${r.unit_short}`
        ];

        let itemCell = catIndexSheet.getCell(`B${cRow}`);
        itemCell.value = { text: itemName, hyperlink: `#'${finalItemSheetName}'!A1` };
        itemCell.font = { color: { argb: 'FF2980B9' }, underline: true, bold: true };

        row.eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } });
        cRow++;
      }

      // Category Summary Total Row
      catIndexSheet.getRow(cRow).values = [
        '*',
        `${catName} Total`,
        catPastTotal.toFixed(2),
        catAwkTotal.toFixed(2),
        catJwkTotal.toFixed(2),
        catBchtTotal.toFixed(2)
      ];
      catIndexSheet.getRow(cRow).font = { bold: true };
      catIndexSheet.getRow(cRow).eachCell((c, cIdx) => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
        c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
        c.alignment = { vertical: 'middle', horizontal: cIdx <= 2 ? (cIdx === 1 ? 'center' : 'left') : 'right' };
      });

      catIndexSheet.columns.forEach((col, i) => {
        col.width = i === 0 ? 8 : (i === 1 ? 35 : 20);
      });

      // Save itemSheetNames on itemMap so item sheets can be generated after all category index sheets
      (itemMap as any).itemSheetNames = itemSheetNames;
    }

    // --- SHEETS (K+1)+: Populate ALL Item Detailed Sheets after all index sheets ---
    for (let itemMap of categorySheetMap) {
      let g = itemMap.g;
      let finalCatSheetName = itemMap.catSheetName;
      let itemSheetNames = (itemMap as any).itemSheetNames;
      this.populateItemSheetsForWorkbook(workbook, g.reports, mmName, usedSheetNames, itemSheetNames, finalCatSheetName);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `Item_Ledger_Single_Heavy_Master_${Date.now()}.xlsx`;
    FileSaver.saveAs(new Blob([buffer]), fileName);

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
    this.toastr.success('Single Heavy Master Excel exported successfully!');
  }

  async exportSingleHeavyPDF() {
    let allGroups = await this.fetchAllCategoriesData();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    this.isLoader = true;
    this.loadingStatus = 'Generating Single Heavy Master PDF Document...';

    let mmObj = this.mms.find((m: any) => m._id === this.filterBody.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';

    // Build categories payload for backend single heavy PDF generator
    let categoriesPayload = allGroups.map(g => ({
      category_id: g.categoryObj._id,
      category_hin: g.categoryObj.category_hin || g.categoryObj.category_eng || '',
      category_eng: g.categoryObj.category_eng || '',
      reports: g.reports
    }));

    let body = {
      ...this.filterBody,
      isHeavySinglePdf: true,
      categoriesPayload: categoriesPayload,
      from_name_hin: this.filterBody.from.name_hin,
      to_name_hin: this.filterBody.to.name_hin,
      mmName: mmName
    };

    let title = `Item_Ledger_Single_Heavy_Master_${Date.now()}`;

    this.downloadPdfBlobAsync(body, title, (statusMsg) => {
      this.loadingStatus = `Single Heavy PDF: ${statusMsg}`;
    }).then(({ blob, title }) => {
      FileSaver.saveAs(blob, title + '.pdf');
      this.toastr.success('Single Heavy Master PDF downloaded successfully!');
    }).catch(err => {
      console.error(err);
    });
  }

  async exportBulkExcel() {
    if (!this.filterBody.from || !this.filterBody.to || !this.filterBody.mm_id) {
      this.toastr.error('Please select From Date, To Date, and MM for Bulk Export.');
      return;
    }

    let validCategories = this.categories.filter((c: any) => this.getCategoryItems(c._id).length > 0);
    if (validCategories.length === 0) return;

    let zip = new JSZip();
    let count = 0;

    for (let i = 0; i < validCategories.length; i++) {
      let catObj = validCategories[i];
      let items = this.getCategoryItems(catObj._id);

      this.isLoader = true;
      this.loadingStatus = `Exporting Excel for ${catObj.category_hin}... (${i + 1}/${validCategories.length})`;

      let itemSubitemParsed = items.map((idStr: string) => {
        let parts = idStr.split(':');
        let i_id = Number(parts[0]);
        let s_id = parts[1] ? Number(parts[1]) : null;
        let itemObj = this.items.find((item: any) => item._id === i_id);
        let subitem_hin = '';
        let subitem_eng = '';
        if (itemObj && s_id) {
          let subObj = itemObj.subitems.find((s: any) => s._id === s_id);
          if (subObj) {
            subitem_hin = subObj.subitem_hin;
            subitem_eng = subObj.subitem_eng;
          }
        }
        return {
          item_id: i_id, subitem_id: s_id,
          item_hin: itemObj?.item_hin || '', item_eng: itemObj?.item_eng || '',
          subitem_hin: subitem_hin, subitem_eng: subitem_eng
        };
      });

      let body = { ...this.filterBody, item_subitem_ids: itemSubitemParsed };
      try {
        let res: any = await this.http.put(this.api.getUrl('REPORT_ITEM_LEDGER') + this.auth.webUser.dept_id, body).toPromise();
        if (res && res.success) {
          let validReports = res.data.filter((r: any) =>
            r.overview.total_aawak !== 0 || r.overview.total_jawak !== 0 || r.overview.current_bachat !== 0
          );
          if (validReports.length > 0) {
            let { buffer, title } = await this.buildExcelBuffer(validReports, catObj);
            zip.file(title + '.xlsx', buffer);
            count++;
          }
        }
      } catch (err) {
        console.error(`Error exporting excel category ${catObj.category_hin}`, err);
      }
    }

    if (count > 0) {
      this.loadingStatus = 'Zipping files...';
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(zipBlob, `Item_Ledger_Bulk_Excel_${Date.now()}.zip`);
    } else {
      this.toastr.info('No activity found to export.');
    }

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
  }

  async buildExcelBuffer(reportsToExport: any[], categoryObj: any): Promise<{ buffer: any, title: string }> {
    const workbook = new Workbook();

    let mmObj = this.mms.find((m: any) => m._id === this.filterBody.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';
    let catName = categoryObj ? (categoryObj.category_hin || categoryObj.category_eng || 'Index') : 'Index';

    // Create Index Sheet
    const indexSheet = workbook.addWorksheet('Index');
    indexSheet.mergeCells('A1:F1');
    let indexTitleCell = indexSheet.getCell('A1');
    indexTitleCell.value = `${this.filterBody.from.name_hin} से ${this.filterBody.to.name_hin} तक, ${mmName} के ${catName} का सार`;
    indexTitleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    indexTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E73DF' } };
    indexTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    indexSheet.getRow(1).height = 30;

    const indexHeaders = ['No.', 'Item Name', 'Past Bachat', 'Total Aawak', 'Total Jawak', 'Current Bachat'];
    indexSheet.getRow(3).values = indexHeaders;
    indexSheet.getRow(3).font = { bold: true };
    indexSheet.getRow(3).eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let indexRow = 4;
    for (let i = 0; i < reportsToExport.length; i++) {
      let report = reportsToExport[i];
      let itemName = report.item_hin + (report.subitem_hin ? ' (' + report.subitem_hin + ')' : '');
      indexSheet.getRow(indexRow).values = [
        i + 1,
        itemName,
        `${Number(report.overview.past_bachat || 0).toFixed(2).replace(/\\.00$/, '')} ${report.unit_short}`,
        `${Number(report.overview.total_aawak || 0).toFixed(2).replace(/\\.00$/, '')} ${report.unit_short}`,
        `${Number(report.overview.total_jawak || 0).toFixed(2).replace(/\\.00$/, '')} ${report.unit_short}`,
        `${Number(report.overview.current_bachat || 0).toFixed(2).replace(/\\.00$/, '')} ${report.unit_short}`
      ];
      indexSheet.getRow(indexRow).eachCell(c => c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } });
      indexRow++;
    }

    indexSheet.columns.forEach((col, i) => {
      col.width = i === 0 ? 8 : (i === 1 ? 40 : 20);
    });

    // Process each item to create a separate sheet
    const usedSheetNames = new Set<string>(['Index']);
    this.populateItemSheetsForWorkbook(workbook, reportsToExport, mmName, usedSheetNames);

    const buffer = await workbook.xlsx.writeBuffer();
    let title = 'Item_Ledger_' + this.filterBody.from.name.replace(' ', '') + '_to_' + this.filterBody.to.name.replace(' ', '');
    if (categoryObj) {
      let catName = categoryObj.category_eng || categoryObj.category_hin || '';
      if (catName) title += '_' + catName.replace(/ /g, '_');
    }
    return { buffer: buffer, title: title };
  }

  populateItemSheetsForWorkbook(
    workbook: Workbook,
    reportsToExport: any[],
    mmName: string,
    usedSheetNames: Set<string>,
    precalculatedSheetNames?: string[],
    backCatSheetName?: string
  ): void {
    for (let idx = 0; idx < reportsToExport.length; idx++) {
      let report = reportsToExport[idx];
      let itemName = report.item_hin + (report.subitem_hin ? ' (' + report.subitem_hin + ')' : '');

      let finalSheetName = '';
      if (precalculatedSheetNames && precalculatedSheetNames[idx]) {
        finalSheetName = precalculatedSheetNames[idx];
      } else {
        let baseSheetName = itemName.substring(0, 30).replace(/[\\*?:\[\]/]/g, '');
        let itemSheetIdx = 1;
        finalSheetName = baseSheetName || 'Item';
        while (usedSheetNames.has(finalSheetName)) {
          finalSheetName = baseSheetName.substring(0, 26) + `_${itemSheetIdx++}`;
        }
        usedSheetNames.add(finalSheetName);
      }

      const worksheet = workbook.addWorksheet(finalSheetName);

      // Big Heading
      worksheet.mergeCells('A1:I1');
      let titleCell = worksheet.getCell('A1');
      titleCell.value = `${this.filterBody.from.name_hin} से ${this.filterBody.to.name_hin} तक, ${mmName} के ${itemName} का सार`;
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E73DF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 30;

      // Link back to Category Index sheet (or Master Index)
      if (backCatSheetName) {
        worksheet.mergeCells('J1:K1');
        let backCell = worksheet.getCell('J1');
        backCell.value = { text: '⬅️ Category Index', hyperlink: `#'${backCatSheetName}'!A1` };
        backCell.font = { bold: true, color: { argb: 'FFFFFFFF' }, underline: true };
        backCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E73DF' } };
        backCell.alignment = { horizontal: 'center', vertical: 'middle' };
      }

      // Summary View (Software Style: 4 Boxes)
      worksheet.mergeCells('A3:B3');
      worksheet.mergeCells('A4:B4');
      worksheet.mergeCells('C3:E3');
      worksheet.mergeCells('C4:E4');
      worksheet.mergeCells('F3:H3');
      worksheet.mergeCells('F4:H4');
      worksheet.mergeCells('I3:K3');
      worksheet.mergeCells('I4:K4');

      worksheet.getCell('A3').value = 'Past Bachat (पिछली बचत)';
      worksheet.getCell('A4').value = `${Number(report.overview.past_bachat || 0).toFixed(2).replace(/\.00$/, '')} ${report.unit_short}`;

      worksheet.getCell('C3').value = 'Total Aawak (कुल आवक)';
      worksheet.getCell('C4').value = `${Number(report.overview.total_aawak || 0).toFixed(2).replace(/\.00$/, '')} ${report.unit_short}`;

      worksheet.getCell('F3').value = 'Total Jawak (कुल जावक)';
      worksheet.getCell('F4').value = `${Number(report.overview.total_jawak || 0).toFixed(2).replace(/\.00$/, '')} ${report.unit_short}`;

      worksheet.getCell('I3').value = 'Current Bachat (वर्तमान बचत)';
      worksheet.getCell('I4').value = `${Number(report.overview.current_bachat || 0).toFixed(2).replace(/\.00$/, '')} ${report.unit_short}`;

      // Styling Summary Boxes
      let boxHeaders = ['A3', 'C3', 'F3', 'I3'];
      let boxValues = ['A4', 'C4', 'F4', 'I4'];

      boxHeaders.forEach(c => {
        let cell = worksheet.getCell(c);
        cell.font = { bold: true, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      boxValues.forEach(c => {
        let cell = worksheet.getCell(c);
        cell.font = { bold: true, size: 14 };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Past Bachat Box Color
      worksheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E3E5' } };
      worksheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E3E5' } };
      worksheet.getCell('A3').font = { bold: true, color: { argb: 'FF41464B' } };
      worksheet.getCell('A4').font = { bold: true, size: 14, color: { argb: 'FF41464B' } };

      // Aawak Box Color
      worksheet.getCell('C3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
      worksheet.getCell('C4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
      worksheet.getCell('C3').font = { bold: true, color: { argb: 'FF0F5132' } };
      worksheet.getCell('C4').font = { bold: true, size: 14, color: { argb: 'FF0F5132' } };

      // Jawak Box Color
      worksheet.getCell('F3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
      worksheet.getCell('F4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
      worksheet.getCell('F3').font = { bold: true, color: { argb: 'FF842029' } };
      worksheet.getCell('F4').font = { bold: true, size: 14, color: { argb: 'FF842029' } };

      // Bachat Box Color
      worksheet.getCell('I3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1ECF1' } };
      worksheet.getCell('I4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1ECF1' } };
      worksheet.getCell('I3').font = { bold: true, color: { argb: 'FF055160' } };
      worksheet.getCell('I4').font = { bold: true, size: 14, color: { argb: 'FF055160' } };

      worksheet.getRow(3).height = 25;
      worksheet.getRow(4).height = 30;

      // Helper to format date YYYY-MM-DD to DD-MM-YYYY
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
      };

      // Helper to sanitize numeric values and round to 2 decimal places
      const getNumericValue = (val: any) => {
        if (val === undefined || val === null || val === '') return '-';
        const num = Number(val);
        return isNaN(num) ? '-' : Number(num.toFixed(2));
      };

      // Aawak Table
      let currentRow = 6;
      worksheet.getCell(`A${currentRow}`).value = '--- AAWAK ENTRIES (आवक) ---';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF0F5132' } };
      currentRow++;

      const aawakHeaders = ['तारीख', 'लॉट नं.', 'कहाँ से आया', 'किसने दिया', 'कन्डिशन', 'क्वानटिटी', 'यूनिट', 'रेट', 'अमाउंट', 'आवक टाइप', 'डिस्क्रिप्शन'];
      worksheet.getRow(currentRow).values = aawakHeaders;
      worksheet.getRow(currentRow).font = { bold: true, color: { argb: 'FF0F5132' } };
      worksheet.getRow(currentRow).eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } });
      currentRow++;

      if (report.aawaks && report.aawaks.length > 0) {
        for (let a of report.aawaks) {
          worksheet.getRow(currentRow).values = [
            formatDate(a.date), a.lot_no, a.aawak_mm_hin, (a.roll_no ? a.roll_no + ' ' : '') + (a.pbk_hin ? a.pbk_hin : ''),
            a.condition_hin, getNumericValue(a.qty), a.unit_short, getNumericValue(a.rate), getNumericValue(a.actual_amt), a.aawak_type_hin, a.description
          ];
          currentRow++;
        }
      } else {
        worksheet.getCell(`A${currentRow}`).value = 'No Aawak entries';
        currentRow++;
      }

      currentRow += 2;

      // Jawak Table
      worksheet.getCell(`A${currentRow}`).value = '--- JAWAK ENTRIES (जावक) ---';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF842029' } };
      currentRow++;

      const jawakHeaders = ['तारीख', 'लॉट नं.', 'कहाँ भेजा', 'किसको दिया', 'कन्डिशन', 'क्वानटिटी', 'यूनिट', 'रेट', 'अमाउंट', 'जावक टाइप', 'डिस्क्रिप्शन'];
      worksheet.getRow(currentRow).values = jawakHeaders;
      worksheet.getRow(currentRow).font = { bold: true, color: { argb: 'FF842029' } };
      worksheet.getRow(currentRow).eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } });
      currentRow++;

      if (report.jawaks && report.jawaks.length > 0) {
        for (let j of report.jawaks) {
          worksheet.getRow(currentRow).values = [
            formatDate(j.date), j.lot_no, j.jawak_mm_hin, (j.roll_no ? j.roll_no + ' ' : '') + (j.pbk_hin ? j.pbk_hin : ''),
            j.condition_hin, getNumericValue(j.qty), j.unit_short, getNumericValue(j.rate), getNumericValue(j.actual_amt), j.jawak_type_hin, j.description
          ];
          currentRow++;
        }
      } else {
        worksheet.getCell(`A${currentRow}`).value = 'No Jawak entries';
        currentRow++;
      }

      // Set column widths
      worksheet.columns.forEach((col, i) => {
        col.width = i === 0 ? 15 : (i === 10 ? 40 : 18);
      });
    }
  }

  exportCurrentPDF() {
    if (!this.groupedReportData || this.groupedReportData.length === 0) {
      this.toastr.error('No data to export');
      return;
    }
    let currentGroup = this.groupedReportData[this.activeCategoryIndex];
    if (!currentGroup || !currentGroup.reports || currentGroup.reports.length === 0) {
      this.toastr.error('No data for this category');
      return;
    }
    let catObj = this.categories.find((c: any) => c._id === currentGroup.category_id);

    let itemSubitemParsed = currentGroup.reports.map((r: any) => {
      return {
        item_id: r.item_id, subitem_id: r.subitem_id,
        item_hin: r.item_hin, subitem_hin: r.subitem_hin,
        item_eng: r.item_eng, subitem_eng: r.subitem_eng
      };
    });

    let category_name = catObj ? (catObj.category_hin || catObj.category_eng || '') : '';
    let title = 'Item_Ledger_' + this.filterBody.from.name.replace(' ', '') + '_to_' + this.filterBody.to.name.replace(' ', '');
    if (category_name) title += '_' + category_name.replace(/ /g, '_');

    let body = { ...this.filterBody, item_subitem_ids: itemSubitemParsed, category_name: category_name };

    this.downloadPdfBlobAsync(body, title).then(({ blob, title }) => {
      FileSaver.saveAs(blob, title + '.pdf');
    }).catch(e => console.error(e));
  }

  async exportBulkPDF() {
    if (!this.filterBody.from || !this.filterBody.to || !this.filterBody.mm_id) {
      this.toastr.error('Please select From Date, To Date, and MM for Bulk Export.');
      return;
    }

    let validCategories = this.categories.filter((c: any) => this.getCategoryItems(c._id).length > 0);
    if (validCategories.length === 0) return;

    let zip = new JSZip();
    let count = 0;

    for (let i = 0; i < validCategories.length; i++) {
      let catObj = validCategories[i];
      let items = this.getCategoryItems(catObj._id);
      let category_name = catObj ? (catObj.category_hin || catObj.category_eng || '') : '';

      let itemSubitemParsed = items.map((idStr: string) => {
        let parts = idStr.split(':');
        let i_id = Number(parts[0]);
        let s_id = parts[1] ? Number(parts[1]) : null;
        let itemObj = this.items.find((i: any) => i._id === i_id);
        let subitem_hin = '';
        let subitem_eng = '';
        if (itemObj && s_id) {
          let subObj = itemObj.subitems.find((s: any) => s._id === s_id);
          if (subObj) {
            subitem_hin = subObj.subitem_hin;
            subitem_eng = subObj.subitem_eng;
          }
        }
        return {
          item_id: i_id, subitem_id: s_id,
          item_hin: itemObj?.item_hin || '', item_eng: itemObj?.item_eng || '',
          subitem_hin: subitem_hin, subitem_eng: subitem_eng
        };
      });

      let title = 'Item_Ledger_' + this.filterBody.from.name.replace(' ', '') + '_to_' + this.filterBody.to.name.replace(' ', '');
      if (category_name) title += '_' + category_name.replace(/ /g, '_');

      let body = { ...this.filterBody, item_subitem_ids: itemSubitemParsed, category_name: category_name };

      try {
        let res: any = await this.http.put(this.api.getUrl('REPORT_ITEM_LEDGER') + this.auth.webUser.dept_id, body).toPromise();
        if (res && res.success) {
          let validReports = res.data.filter((r: any) =>
            r.overview.total_aawak !== 0 || r.overview.total_jawak !== 0 || r.overview.current_bachat !== 0
          );
          if (validReports.length > 0) {
            this.isLoader = true;
            this.loadingStatus = `Exporting PDF for ${catObj.category_hin}... (${i + 1}/${validCategories.length})`;

            let { blob } = await this.downloadPdfBlobAsync(body, title, (statusMsg) => {
              this.loadingStatus = `Exporting PDF for ${catObj.category_hin}... (${i + 1}/${validCategories.length}) - ${statusMsg}`;
            });
            zip.file(title + '.pdf', blob);
            count++;
          }
        }
      } catch (err) {
        console.error(`Error exporting pdf category ${catObj.category_hin}`, err);
      }
    }

    if (count > 0) {
      this.loadingStatus = 'Zipping files...';
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(zipBlob, `Item_Ledger_Bulk_PDF_${Date.now()}.zip`);
    } else {
      this.toastr.info('No activity found to export.');
    }

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
  }

  downloadPdfBlobAsync(body: any, title: string, progressCallback?: (status: string) => void): Promise<{ blob: Blob, title: string }> {
    return new Promise((resolve, reject) => {
      let taskId = 'pdf_' + Date.now();
      body.taskId = taskId;

      this.isLoader = true;
      if (!progressCallback) this.loadingStatus = 'Initializing PDF export...';

      let progressInterval = setInterval(() => {
        this.http.get(this.api.getUrl('REPORT') + 'pdf-progress/' + taskId).subscribe((res: any) => {
          if (res && res.status) {
            if (progressCallback) {
              progressCallback(res.status);
            } else {
              this.loadingStatus = res.status;
            }
          }
        }, err => { });
      }, 1000);

      this.http.downloadPostData(this.api.getUrl('REPORT') + 'item_ledger_pdf/' + this.auth.webUser.dept_id, body).subscribe((data: any) => {
        clearInterval(progressInterval);
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
        resolve({ blob: data, title: title });
      }, (err: any) => {
        clearInterval(progressInterval);
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
        this.toastr.error(err.message || 'Error generating PDF');
        resolve({ blob: new Blob([]), title: title }); // Resolve empty to not break bulk loop
      });
    });
  }

  setActiveCategory(index: number) {
    this.activeCategoryIndex = index;
    this.activeReportIndex = 0;
  }

  setActiveReport(index: number) {
    this.activeReportIndex = index;
  }

  setDimension(dim: 'item' | 'pbk' | 'mm') {
    this.activeDimension = dim;
  }

  onStateChangeMm(stateId: any) {
    if (!stateId) {
      this.filteredMmsForMmDimension = [...this.mms];
    } else {
      this.filteredMmsForMmDimension = this.mms.filter((m: any) => m.state_id === stateId);
    }
    this.filterBodyMm.mm_ids = [];
  }

  getMmState(mm: any): { state_id: any, state_hin: string, state_eng: string } {
    if (!mm || !mm.state_id) return { state_id: 'uncategorized', state_hin: 'Uncategorized', state_eng: 'Uncategorized' };
    let st = this.states.find((s: any) => s._id === mm.state_id);
    if (st) {
      return {
        state_id: st._id,
        state_hin: st.state_hin || st.state_eng || 'State',
        state_eng: st.state_eng || st.state_hin || 'State'
      };
    }
    return { state_id: mm.state_id, state_hin: 'State ' + mm.state_id, state_eng: 'State ' + mm.state_id };
  }

  searchReportsMm() {
    if (!this.filterBodyMm.from || !this.filterBodyMm.to) {
      this.toastr.error('Please select From and To Date');
      return;
    }

    let selectedMmIds = this.filterBodyMm.mm_ids || [];
    if (selectedMmIds.length === 0) {
      selectedMmIds = this.filteredMmsForMmDimension.map((m: any) => m._id);
    }

    if (selectedMmIds.length === 0) {
      this.toastr.error('Please select at least one MM');
      return;
    }

    let mmObjsParsed = selectedMmIds.map((mm_id: number) => {
      let m = this.mms.find((mm: any) => mm._id === mm_id);
      let st = this.getMmState(m);
      return {
        mm_id: mm_id,
        mm_hin: m ? m.mm_hin : '',
        mm_eng: m ? m.mm_eng : '',
        mm_code: m ? m.mm_code : '',
        state_id: st.state_id,
        state_hin: st.state_hin,
        state_eng: st.state_eng
      };
    });

    let body = {
      from: this.filterBodyMm.from,
      to: this.filterBodyMm.to,
      mm_objs: mmObjsParsed
    };

    this.isLoader = true;
    this.http.put(this.api.getUrl('REPORT_MM_LEDGER') + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data.success) {
        this.reportDataMm = data.data.filter((r: any) =>
          r.overview.total_aawak !== 0 ||
          r.overview.total_jawak !== 0 ||
          r.overview.current_bachat !== 0 ||
          r.overview.past_bachat !== 0
        );

        this.groupedReportDataMm = [];
        for (let r of this.reportDataMm) {
          let stateId = r.state_id || 'uncategorized';
          let stateName = r.state_hin || r.state_eng || 'Uncategorized';

          let group = this.groupedReportDataMm.find((g: any) => g.state_id === stateId);
          if (!group) {
            group = { state_id: stateId, state_name: stateName, reports: [] };
            this.groupedReportDataMm.push(group);
          }
          group.reports.push(r);
        }

        this.groupedReportDataMm.sort((a: any, b: any) => {
          if (a.state_id === 'uncategorized') return 1;
          if (b.state_id === 'uncategorized') return -1;
          let idxA = this.states.findIndex((s: any) => s._id === a.state_id);
          let idxB = this.states.findIndex((s: any) => s._id === b.state_id);
          if (idxA === -1) idxA = 9999;
          if (idxB === -1) idxB = 9999;
          return idxA - idxB;
        });

        for (let group of this.groupedReportDataMm) {
          group.reports.sort((a: any, b: any) => (a.mm_hin || '').localeCompare(b.mm_hin || '', 'hi'));
        }

        if (this.reportDataMm.length === 0) {
          this.toastr.info('No activity found for the selected MMs in this date range.');
        }

        this.activeStateIndexMm = 0;
        this.activeMmIndex = 0;
        this.isLoader = false;
      }
    }, (err: any) => {
      console.log(err);
      this.isLoader = false;
      this.toastr.error(err.message || 'Failed to fetch MM ledger report');
    });
  }

  setActiveStateMm(index: number) {
    this.activeStateIndexMm = index;
    this.activeMmIndex = 0;
  }

  setActiveMm(index: number) {
    this.activeMmIndex = index;
  }

  async exportCurrentExcelMm() {
    if (!this.groupedReportDataMm || this.groupedReportDataMm.length === 0) {
      this.toastr.error('No MM data to export');
      return;
    }
    let currentGroup = this.groupedReportDataMm[this.activeStateIndexMm];
    if (!currentGroup || !currentGroup.reports || currentGroup.reports.length === 0) {
      this.toastr.error('No data for this state');
      return;
    }
    let stateObj = this.states.find((s: any) => s._id === currentGroup.state_id);
    let { buffer, title } = await this.buildMmExcelBuffer(currentGroup.reports, stateObj);
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(data, title + '.xlsx');
  }

  async buildMmExcelBuffer(reports: any[], stateObj: any): Promise<{ buffer: ArrayBuffer, title: string }> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(stateObj ? (stateObj.state_hin || stateObj.state_eng) : 'MM Ledger');

    let stateName = stateObj ? (stateObj.state_hin || stateObj.state_eng) : 'All States';

    worksheet.mergeCells('A1:H1');
    let titleCell = worksheet.getCell('A1');
    titleCell.value = `${this.filterBodyMm.from.name_hin} से ${this.filterBodyMm.to.name_hin} तक, ${stateName} MM लेजर रिपोर्ट`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    let currentRow = 3;

    for (let report of reports) {
      let mmTitle = `${report.mm_hin || ''} ${report.mm_code ? '(' + report.mm_code + ')' : ''}`;

      worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
      let itemHeader = worksheet.getCell(`A${currentRow}`);
      itemHeader.value = `MM / Store: ${mmTitle} | State: ${report.state_hin || report.state_eng}`;
      itemHeader.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      itemHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF115E59' } };
      worksheet.getRow(currentRow).height = 24;
      currentRow++;

      const tableHeaders = ['No.', 'Category (श्रेणी)', 'Item / Subitem (वस्तु)', 'Unit (इकाई)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Final Bachat (वर्तमान)'];
      worksheet.getRow(currentRow).values = tableHeaders;
      worksheet.getRow(currentRow).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(currentRow).eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } });
      currentRow++;

      if (report.itemsSummary && report.itemsSummary.length > 0) {
        for (let idx = 0; idx < report.itemsSummary.length; idx++) {
          let item = report.itemsSummary[idx];
          let itemEng = item.item_eng ? ' : ' + item.item_eng : '';
          let subitemStr = '';
          if (item.subitem_hin || item.subitem_eng) {
            let subHin = item.subitem_hin || '';
            let subEng = item.subitem_eng ? (subHin ? ' : ' + item.subitem_eng : item.subitem_eng) : '';
            subitemStr = ` (${subHin}${subEng})`;
          }
          let itemStr = (item.item_hin || '') + itemEng + subitemStr;
          if (!itemStr.trim()) itemStr = item.item_hin || item.item_eng || '';

          let catStr = (item.category_hin || '') + (item.category_eng ? ' : ' + item.category_eng : '');
          if (!catStr.trim()) catStr = 'सामान्य : General';

          let row = worksheet.getRow(currentRow);
          row.values = [
            idx + 1,
            catStr,
            itemStr,
            item.unit_short || '',
            Number(item.past_bachat || 0).toFixed(2),
            Number(item.total_aawak || 0).toFixed(2),
            Number(item.total_jawak || 0).toFixed(2),
            Number(item.current_bachat || 0).toFixed(2)
          ];
          row.eachCell((c, colIdx) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { vertical: 'middle', horizontal: colIdx <= 4 ? (colIdx === 1 || colIdx === 4 ? 'center' : 'left') : 'right' };
          });
          currentRow++;
        }

        if (report.overview) {
          let totalRow = worksheet.getRow(currentRow);
          totalRow.values = [
            '*',
            'Total Summary',
            '',
            '',
            Number(report.overview.past_bachat || 0).toFixed(2),
            Number(report.overview.total_aawak || 0).toFixed(2),
            Number(report.overview.total_jawak || 0).toFixed(2),
            Number(report.overview.current_bachat || 0).toFixed(2)
          ];
          totalRow.font = { bold: true };
          totalRow.eachCell((c, colIdx) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
            c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
            c.alignment = { vertical: 'middle', horizontal: colIdx <= 4 ? (colIdx === 1 || colIdx === 4 ? 'center' : 'left') : 'right' };
          });
          currentRow++;
        }
      } else {
        worksheet.getRow(currentRow).values = ['No item summary entries found'];
        currentRow++;
      }

      currentRow += 2;
    }

    worksheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 8 : (idx === 1 ? 22 : (idx === 2 ? 35 : (idx === 3 ? 12 : 18)));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const title = `MM_Ledger_${stateName}_${Date.now()}`;
    return { buffer, title };
  }

  async fetchAllStatesDataMm(): Promise<Array<{ stateObj: any, reports: any[] }>> {
    if (!this.filterBodyMm.from || !this.filterBodyMm.to) {
      this.toastr.error('Please select From Date and To Date for Export.');
      return [];
    }

    let validStates = this.states.filter((s: any) => this.mms.some((m: any) => m.state_id === s._id));
    if (validStates.length === 0) {
      this.toastr.warning('No MMs found across states.');
      return [];
    }

    let allStateGroups: Array<{ stateObj: any, reports: any[] }> = [];

    for (let i = 0; i < validStates.length; i++) {
      let stateObj = validStates[i];
      let stateMms = this.mms.filter((m: any) => m.state_id === stateObj._id);
      let stateName = stateObj.state_hin || stateObj.state_eng || 'State';

      this.isLoader = true;
      this.loadingStatus = `Fetching MM ledger records for ${stateName}... (${i + 1}/${validStates.length})`;

      let mmObjsParsed = stateMms.map((m: any) => ({
        mm_id: m._id,
        mm_hin: m.mm_hin,
        mm_eng: m.mm_eng,
        mm_code: m.mm_code || '',
        state_id: stateObj._id,
        state_hin: stateObj.state_hin || stateObj.state_eng || '',
        state_eng: stateObj.state_eng || ''
      }));

      let body = {
        from: this.filterBodyMm.from,
        to: this.filterBodyMm.to,
        mm_objs: mmObjsParsed,
        state_name: stateName
      };

      try {
        let res: any = await this.http.put(this.api.getUrl('REPORT_MM_LEDGER') + this.auth.webUser.dept_id, body).toPromise();
        if (res && res.success) {
          let validReports = res.data.filter((r: any) =>
            r.overview.total_aawak !== 0 || r.overview.total_jawak !== 0 || r.overview.current_bachat !== 0 || r.overview.past_bachat !== 0
          );
          if (validReports.length > 0) {
            allStateGroups.push({
              stateObj: stateObj,
              reports: validReports
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching MM state ${stateName}`, err);
      }
    }

    return allStateGroups;
  }

  async exportBulkExcelMm() {
    let allGroups = await this.fetchAllStatesDataMm();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    const zip = new JSZip();
    let count = 0;

    for (let g of allGroups) {
      let stateObj = g.stateObj;
      let stateName = stateObj.state_hin || stateObj.state_eng || 'State';
      let { buffer, title } = await this.buildMmExcelBuffer(g.reports, stateObj);
      zip.file(title + '.xlsx', buffer);
      count++;
    }

    if (count > 0) {
      this.loadingStatus = 'Zipping files...';
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(zipBlob, `MM_Ledger_Bulk_Excel_${Date.now()}.zip`);
    }

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
  }

  async exportSingleHeavyExcelMm() {
    let allGroups = await this.fetchAllStatesDataMm();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    this.isLoader = true;
    this.loadingStatus = 'Building Master Single Heavy Excel Workbook...';

    const workbook = new Workbook();
    const periodStr = `${this.filterBodyMm.from.name_hin} से ${this.filterBodyMm.to.name_hin}`;

    const usedSheetNames = new Set<string>();
    usedSheetNames.add('Master State Saar');

    const masterIndexSheet = workbook.addWorksheet('Master State Saar');
    masterIndexSheet.mergeCells('A1:H1');
    let titleCell = masterIndexSheet.getCell('A1');
    titleCell.value = `${periodStr} तक, राज्यवार संपूर्ण मण्डल लेजर सार (Master MM Index)`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    masterIndexSheet.getRow(1).height = 32;

    const masterHeaders = ['No.', 'MM / Store Name (मण्डल)', 'MM Code', 'State Name (राज्य)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Current Bachat (वर्तमान)'];
    masterIndexSheet.getRow(3).values = masterHeaders;
    masterIndexSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    masterIndexSheet.getRow(3).eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF115E59' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let masterRowIdx = 4;
    let grandTotals = { mms: 0, past: 0, aawak: 0, jawak: 0, bachat: 0 };
    let mmEntries: Array<{ report: any, stateName: string, mmSheetName: string }> = [];

    for (let i = 0; i < allGroups.length; i++) {
      let g = allGroups[i];
      let stateName = g.stateObj.state_hin || g.stateObj.state_eng || 'State';

      // State Group Banner Row in Index Sheet
      masterIndexSheet.mergeCells(`A${masterRowIdx}:H${masterRowIdx}`);
      let stateBannerCell = masterIndexSheet.getCell(`A${masterRowIdx}`);
      stateBannerCell.value = `📍 State: ${stateName} (Total MMs: ${g.reports.length})`;
      stateBannerCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      stateBannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } };
      stateBannerCell.alignment = { vertical: 'middle', horizontal: 'left' };
      masterIndexSheet.getRow(masterRowIdx).height = 24;
      masterRowIdx++;

      for (let rIdx = 0; rIdx < g.reports.length; rIdx++) {
        let report = g.reports[rIdx];
        let rawName = 'MM - ' + (report.mm_hin || 'Store');
        let cleanName = rawName.replace(/[\\*?:\[\]/]/g, '').trim();
        if (cleanName.length > 28) cleanName = cleanName.substring(0, 28);

        let stIdx = 1;
        let mmSheetName = cleanName;
        while (usedSheetNames.has(mmSheetName)) {
          let suffix = `_${stIdx++}`;
          let base = cleanName.substring(0, 31 - suffix.length);
          mmSheetName = base + suffix;
        }
        usedSheetNames.add(mmSheetName);

        mmEntries.push({ report, stateName, mmSheetName });

        let pastVal = Number(report.overview?.past_bachat || 0);
        let awkVal = Number(report.overview?.total_aawak || 0);
        let jwkVal = Number(report.overview?.total_jawak || 0);
        let bchtVal = Number(report.overview?.current_bachat || 0);

        grandTotals.mms++;
        grandTotals.past += pastVal;
        grandTotals.aawak += awkVal;
        grandTotals.jawak += jwkVal;
        grandTotals.bachat += bchtVal;

        let row = masterIndexSheet.getRow(masterRowIdx);
        row.values = [
          `${i + 1}.${rIdx + 1}`,
          '',
          report.mm_code || '',
          stateName,
          pastVal.toFixed(2),
          awkVal.toFixed(2),
          jwkVal.toFixed(2),
          bchtVal.toFixed(2)
        ];

        let mmCell = masterIndexSheet.getCell(`B${masterRowIdx}`);
        mmCell.value = { text: report.mm_hin || 'MM', hyperlink: `#'${mmSheetName}'!A1` };
        mmCell.font = { color: { argb: 'FF0F766E' }, underline: true, bold: true };

        row.eachCell((c, cIdx) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { vertical: 'middle', horizontal: cIdx <= 4 ? (cIdx === 1 || cIdx === 3 ? 'center' : 'left') : 'right' };
        });
        masterRowIdx++;
      }
    }

    // Grand Total Row in Master Index Sheet
    masterIndexSheet.getRow(masterRowIdx).values = [
      '*',
      'Grand Summary Total',
      '',
      `${grandTotals.mms} MMs`,
      grandTotals.past.toFixed(2),
      grandTotals.aawak.toFixed(2),
      grandTotals.jawak.toFixed(2),
      grandTotals.bachat.toFixed(2)
    ];
    masterIndexSheet.getRow(masterRowIdx).font = { bold: true };
    masterIndexSheet.getRow(masterRowIdx).eachCell((c, cIdx) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
      c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
      c.alignment = { vertical: 'middle', horizontal: cIdx <= 4 ? (cIdx === 1 || cIdx === 3 ? 'center' : 'left') : 'right' };
    });

    masterIndexSheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 8 : (idx === 1 ? 28 : (idx === 2 ? 12 : (idx === 3 ? 20 : 16)));
    });

    // Create Separate Sheet for Each Individual MM with Items Table
    for (let entry of mmEntries) {
      let report = entry.report;
      let stateName = entry.stateName;
      let mmSheetName = entry.mmSheetName;

      const worksheet = workbook.addWorksheet(mmSheetName);

      worksheet.mergeCells('A1:H1');
      let titleC = worksheet.getCell('A1');
      let mmTitle = `${report.mm_hin || ''} ${report.mm_code ? '(' + report.mm_code + ')' : ''}`;
      titleC.value = `MM / Store: ${mmTitle} | State: ${stateName}`;
      titleC.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
      titleC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
      titleC.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 30;

      // Link Back to Main Index
      worksheet.mergeCells('A2:H2');
      let backLinkCell = worksheet.getCell('A2');
      backLinkCell.value = { text: '⬆️ Back to Main Index (मुख्य अनुक्रमणिका पर जाएं)', hyperlink: "#'Master State Saar'!A1" };
      backLinkCell.font = { color: { argb: 'FF0D9488' }, bold: true, size: 10, underline: true };
      backLinkCell.alignment = { horizontal: 'right', vertical: 'middle' };

      const tableHeaders = ['No.', 'Category (श्रेणी)', 'Item / Subitem (वस्तु)', 'Unit (इकाई)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Final Bachat (वर्तमान)'];
      worksheet.getRow(4).values = tableHeaders;
      worksheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(4).eachCell(c => {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF115E59' } };
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      worksheet.getRow(4).height = 24;

      let currentRow = 5;

      if (report.itemsSummary && report.itemsSummary.length > 0) {
        for (let idx = 0; idx < report.itemsSummary.length; idx++) {
          let item = report.itemsSummary[idx];
          let itemEng = item.item_eng ? ' : ' + item.item_eng : '';
          let subitemStr = '';
          if (item.subitem_hin || item.subitem_eng) {
            let subHin = item.subitem_hin || '';
            let subEng = item.subitem_eng ? (subHin ? ' : ' + item.subitem_eng : item.subitem_eng) : '';
            subitemStr = ` (${subHin}${subEng})`;
          }
          let itemStr = (item.item_hin || '') + itemEng + subitemStr;
          if (!itemStr.trim()) itemStr = item.item_hin || item.item_eng || '';

          let catStr = (item.category_hin || '') + (item.category_eng ? ' : ' + item.category_eng : '');
          if (!catStr.trim()) catStr = 'सामान्य : General';

          let row = worksheet.getRow(currentRow);
          row.values = [
            idx + 1,
            catStr,
            itemStr,
            item.unit_short || '',
            Number(item.past_bachat || 0).toFixed(2),
            Number(item.total_aawak || 0).toFixed(2),
            Number(item.total_jawak || 0).toFixed(2),
            Number(item.current_bachat || 0).toFixed(2)
          ];
          row.eachCell((c, colIdx) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { vertical: 'middle', horizontal: colIdx <= 4 ? (colIdx === 1 || colIdx === 4 ? 'center' : 'left') : 'right' };
          });
          currentRow++;
        }

        if (report.overview) {
          let totalRow = worksheet.getRow(currentRow);
          totalRow.values = [
            '*',
            'Total Summary',
            '',
            '',
            Number(report.overview.past_bachat || 0).toFixed(2),
            Number(report.overview.total_aawak || 0).toFixed(2),
            Number(report.overview.total_jawak || 0).toFixed(2),
            Number(report.overview.current_bachat || 0).toFixed(2)
          ];
          totalRow.font = { bold: true };
          totalRow.eachCell((c, colIdx) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
            c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
            c.alignment = { vertical: 'middle', horizontal: colIdx <= 4 ? (colIdx === 1 || colIdx === 4 ? 'center' : 'left') : 'right' };
          });
          currentRow++;
        }
      } else {
        worksheet.getRow(currentRow).values = ['No item summary entries found for this MM'];
        currentRow++;
      }

      worksheet.columns.forEach((col, idx) => {
        col.width = idx === 0 ? 8 : (idx === 1 ? 22 : (idx === 2 ? 35 : (idx === 3 ? 12 : 18)));
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `MM_Ledger_Single_Heavy_Master_${Date.now()}.xlsx`;
    FileSaver.saveAs(new Blob([buffer]), fileName);

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
    this.toastr.success('Single Heavy Master MM Excel exported successfully!');
  }

  async exportCurrentPDFMm() {
    if (!this.groupedReportDataMm || this.groupedReportDataMm.length === 0) {
      this.toastr.error('No MM data to export');
      return;
    }
    let currentGroup = this.groupedReportDataMm[this.activeStateIndexMm];
    if (!currentGroup || !currentGroup.reports || currentGroup.reports.length === 0) {
      this.toastr.error('No data for this state');
      return;
    }

    let mmObjsParsed = currentGroup.reports.map((r: any) => ({
      mm_id: r.mm_id,
      mm_hin: r.mm_hin,
      mm_eng: r.mm_eng,
      mm_code: r.mm_code || '',
      state_id: r.state_id,
      state_hin: r.state_hin,
      state_eng: r.state_eng
    }));

    let body = {
      from: this.filterBodyMm.from,
      to: this.filterBodyMm.to,
      mm_objs: mmObjsParsed,
      state_name: currentGroup.state_name
    };

    let title = `MM_Ledger_${currentGroup.state_name.replace(/ /g, '_')}_${Date.now()}`;

    let { blob } = await this.downloadMmPdfBlobAsync(body, title);
    if (blob.size > 0) {
      FileSaver.saveAs(blob, title + '.pdf');
      this.toastr.success('MM Ledger PDF downloaded successfully!');
    }
  }

  async exportBulkPDFMm() {
    let allGroups = await this.fetchAllStatesDataMm();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    const zip = new JSZip();
    let count = 0;

    for (let i = 0; i < allGroups.length; i++) {
      let g = allGroups[i];
      let stateObj = g.stateObj;
      let stateName = stateObj.state_hin || stateObj.state_eng || 'State';
      let title = `MM_Ledger_${stateName}_${Date.now()}`;

      let mmObjsParsed = g.reports.map((r: any) => ({
        mm_id: r.mm_id,
        mm_hin: r.mm_hin,
        mm_eng: r.mm_eng,
        mm_code: r.mm_code || '',
        state_id: r.state_id,
        state_hin: r.state_hin,
        state_eng: r.state_eng
      }));

      let body = {
        from: this.filterBodyMm.from,
        to: this.filterBodyMm.to,
        mm_objs: mmObjsParsed,
        state_name: stateName
      };

      try {
        this.isLoader = true;
        this.loadingStatus = `Exporting PDF for ${stateName}... (${i + 1}/${allGroups.length})`;

        let { blob } = await this.downloadMmPdfBlobAsync(body, title, (statusMsg) => {
          this.loadingStatus = `Exporting PDF for ${stateName}... (${i + 1}/${allGroups.length}) - ${statusMsg}`;
        });
        if (blob.size > 0) {
          zip.file(title + '.pdf', blob);
          count++;
        }
      } catch (err) {
        console.error(`Error exporting pdf for state ${stateName}`, err);
      }
    }

    if (count > 0) {
      this.loadingStatus = 'Zipping files...';
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(zipBlob, `MM_Ledger_Bulk_PDF_${Date.now()}.zip`);
    }

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
  }

  async exportSingleHeavyPDFMm() {
    let allGroups = await this.fetchAllStatesDataMm();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    this.isLoader = true;
    this.loadingStatus = 'Generating Single Heavy Master MM PDF Document...';

    let statesPayload = allGroups.map(g => ({
      state_id: g.stateObj._id,
      state_hin: g.stateObj.state_hin || g.stateObj.state_eng || '',
      state_eng: g.stateObj.state_eng || '',
      reports: g.reports
    }));

    let body = {
      from: this.filterBodyMm.from,
      to: this.filterBodyMm.to,
      isHeavySinglePdf: true,
      statesPayload: statesPayload,
      from_name_hin: this.filterBodyMm.from.name_hin,
      to_name_hin: this.filterBodyMm.to.name_hin
    };

    let title = `MM_Ledger_Single_Heavy_Master_${Date.now()}`;
    let { blob } = await this.downloadMmPdfBlobAsync(body, title);
    if (blob.size > 0) {
      FileSaver.saveAs(blob, title + '.pdf');
    }
  }

  downloadMmPdfBlobAsync(body: any, title: string, progressCallback?: (status: string) => void): Promise<{ blob: Blob, title: string }> {
    return new Promise((resolve, reject) => {
      let taskId = 'pdf_mm_' + Date.now();
      body.taskId = taskId;

      this.isLoader = true;
      if (!progressCallback) this.loadingStatus = 'Initializing MM PDF export...';

      let progressInterval = setInterval(() => {
        this.http.get(this.api.getUrl('REPORT') + 'pdf-progress/' + taskId).subscribe((res: any) => {
          if (res && res.status) {
            if (progressCallback) {
              progressCallback(res.status);
            } else {
              this.loadingStatus = res.status;
            }
          }
        }, err => { });
      }, 1000);

      this.http.downloadPostData(this.api.getUrl('REPORT') + 'mm_ledger_pdf/' + this.auth.webUser.dept_id, body).subscribe((data: any) => {
        clearInterval(progressInterval);
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
        resolve({ blob: data, title: title });
      }, (err: any) => {
        clearInterval(progressInterval);
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
        this.toastr.error(err.message || 'Error generating MM PDF');
        resolve({ blob: new Blob([]), title: title });
      });
    });
  }

  onStateChangePbk(stateId: any) {
    if (!stateId) {
      this.filteredPbks = [...this.pbks];
    } else {
      this.filteredPbks = this.pbks.filter((p: any) => p.state_id === stateId);
    }
    this.filterBodyPbk.pbk_ids = [];
  }

  getPbkState(pbk: any): { state_id: any, state_hin: string, state_eng: string } {
    if (!pbk || !pbk.state_id) return { state_id: 'uncategorized', state_hin: 'Uncategorized', state_eng: 'Uncategorized' };
    let st = this.states.find((s: any) => s._id === pbk.state_id);
    if (st) {
      return {
        state_id: st._id,
        state_hin: st.state_hin || st.state_eng || 'State',
        state_eng: st.state_eng || st.state_hin || 'State'
      };
    }
    return { state_id: pbk.state_id, state_hin: 'State ' + pbk.state_id, state_eng: 'State ' + pbk.state_id };
  }

  searchReportsPbk() {
    if (!this.filterBodyPbk.from || !this.filterBodyPbk.to) {
      this.toastr.error('Please select From and To Date');
      return;
    }

    if ((!this.filterBodyPbk.pbk_ids || this.filterBodyPbk.pbk_ids.length === 0) && this.filterBodyPbk.state_id) {
      let statePbks = this.pbks.filter((p: any) => p.state_id === this.filterBodyPbk.state_id);
      this.filterBodyPbk.pbk_ids = statePbks.map((p: any) => p._id);
    }

    if ((!this.filterBodyPbk.pbk_ids || this.filterBodyPbk.pbk_ids.length === 0) && !this.filterBodyPbk.state_id) {
      this.filterBodyPbk.pbk_ids = this.pbks.map((p: any) => p._id);
    }

    if (!this.filterBodyPbk.pbk_ids || this.filterBodyPbk.pbk_ids.length === 0) {
      this.toastr.error('Please select at least one PBK');
      return;
    }

    let pbkParsed = this.filterBodyPbk.pbk_ids.map((id: any) => {
      let pbkObj = this.pbks.find((p: any) => p._id === id);
      let stInfo = this.getPbkState(pbkObj);
      return {
        pbk_id: id,
        roll_no: pbkObj ? pbkObj.roll_no : '',
        pbk_hin: pbkObj ? pbkObj.pbk_hin : '',
        pbk_eng: pbkObj ? pbkObj.pbk_eng : '',
        state_id: stInfo.state_id,
        state_hin: stInfo.state_hin,
        state_eng: stInfo.state_eng
      };
    });

    let body = { ...this.filterBodyPbk, pbk_ids: pbkParsed };

    this.isLoader = true;
    this.loadingStatus = 'Fetching PBK ledger records...';

    this.http.put(this.api.getUrl('REPORT_PBK_LEDGER') + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data.success) {
        this.reportDataPbk = data.data.filter((r: any) =>
          r.overview.total_aawak !== 0 ||
          r.overview.total_jawak !== 0 ||
          r.overview.current_bachat !== 0 ||
          r.overview.past_bachat !== 0
        );

        this.groupedReportDataPbk = [];
        for (let r of this.reportDataPbk) {
          let stId = r.state_id || 'uncategorized';
          let stName = r.state_hin || r.state_eng || 'Uncategorized State';

          let group = this.groupedReportDataPbk.find((g: any) => g.state_id === stId);
          if (!group) {
            group = { state_id: stId, state_name: stName, reports: [] };
            this.groupedReportDataPbk.push(group);
          }
          group.reports.push(r);
        }

        this.groupedReportDataPbk.sort((a: any, b: any) => {
          if (a.state_id === 'uncategorized') return 1;
          if (b.state_id === 'uncategorized') return -1;
          let idxA = this.states.findIndex((s: any) => s._id === a.state_id);
          let idxB = this.states.findIndex((s: any) => s._id === b.state_id);
          if (idxA === -1) idxA = 9999;
          if (idxB === -1) idxB = 9999;
          return idxA - idxB;
        });

        for (let group of this.groupedReportDataPbk) {
          group.reports.sort((a: any, b: any) => {
            let nameA = (a.pbk_hin || '') + (a.roll_no ? ' ' + a.roll_no : '');
            let nameB = (b.pbk_hin || '') + (b.roll_no ? ' ' + b.roll_no : '');
            return nameA.localeCompare(nameB, 'hi');
          });
        }

        if (this.reportDataPbk.length === 0) {
          this.toastr.info('No activity found for the selected PBKs in this date range.');
        }

        this.activeStateIndex = 0;
        this.activePbkIndex = 0;
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
      }
    }, (err: any) => {
      console.error(err);
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.error(err.message || 'Error loading PBK ledger data');
    });
  }

  setActiveState(index: number) {
    this.activeStateIndex = index;
    this.activePbkIndex = 0;
  }

  setActivePbk(index: number) {
    this.activePbkIndex = index;
  }

  async buildPbkExcelBuffer(reports: any[], stateObj: any): Promise<{ buffer: ArrayBuffer, title: string }> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(stateObj ? (stateObj.state_hin || stateObj.state_eng) : 'PBK Ledger');

    let mmObj = this.mms.find((m: any) => m._id === this.filterBodyPbk.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';
    let stateName = stateObj ? (stateObj.state_hin || stateObj.state_eng) : 'All States';

    worksheet.mergeCells('A1:H1');
    let titleCell = worksheet.getCell('A1');
    titleCell.value = `${this.filterBodyPbk.from.name_hin} से ${this.filterBodyPbk.to.name_hin} तक, ${mmName} का ${stateName} PBK लेजर रिपोर्ट`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    let currentRow = 3;

    for (let report of reports) {
      let pbkTitle = `${report.pbk_hin || ''} ${report.roll_no ? '(Roll: ' + report.roll_no + ')' : ''}`;

      worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
      let itemHeader = worksheet.getCell(`A${currentRow}`);
      itemHeader.value = `PBK: ${pbkTitle} | State: ${report.state_hin || report.state_eng}`;
      itemHeader.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      itemHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF115E59' } };
      worksheet.getRow(currentRow).height = 24;
      currentRow++;

      const tableHeaders = ['No.', 'Category (श्रेणी)', 'Item / Subitem (वस्तु)', 'Unit (इकाई)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Final Bachat (वर्तमान)'];
      worksheet.getRow(currentRow).values = tableHeaders;
      worksheet.getRow(currentRow).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(currentRow).eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } });
      currentRow++;

      if (report.itemsSummary && report.itemsSummary.length > 0) {
        for (let idx = 0; idx < report.itemsSummary.length; idx++) {
          let item = report.itemsSummary[idx];
          let itemEng = item.item_eng ? ' : ' + item.item_eng : '';
          let subitemStr = '';
          if (item.subitem_hin || item.subitem_eng) {
            let subHin = item.subitem_hin || '';
            let subEng = item.subitem_eng ? (subHin ? ' : ' + item.subitem_eng : item.subitem_eng) : '';
            subitemStr = ` (${subHin}${subEng})`;
          }
          let itemStr = (item.item_hin || '') + itemEng + subitemStr;
          if (!itemStr.trim()) itemStr = item.item_hin || item.item_eng || '';

          let catStr = (item.category_hin || '') + (item.category_eng ? ' : ' + item.category_eng : '');
          if (!catStr.trim()) catStr = 'सामान्य : General';

          let row = worksheet.getRow(currentRow);
          row.values = [
            idx + 1,
            catStr,
            itemStr,
            item.unit_short || '',
            Number(item.past_bachat || 0).toFixed(2),
            Number(item.total_aawak || 0).toFixed(2),
            Number(item.total_jawak || 0).toFixed(2),
            Number(item.current_bachat || 0).toFixed(2)
          ];
          row.eachCell((c, colIdx) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { vertical: 'middle', horizontal: colIdx <= 4 ? (colIdx === 1 || colIdx === 4 ? 'center' : 'left') : 'right' };
          });
          currentRow++;
        }

        // Summary Total Row for this PBK
        if (report.overview) {
          let totalRow = worksheet.getRow(currentRow);
          totalRow.values = [
            '*',
            'Total Summary',
            '',
            '',
            Number(report.overview.past_bachat || 0).toFixed(2),
            Number(report.overview.total_aawak || 0).toFixed(2),
            Number(report.overview.total_jawak || 0).toFixed(2),
            Number(report.overview.current_bachat || 0).toFixed(2)
          ];
          totalRow.font = { bold: true };
          totalRow.eachCell((c, colIdx) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
            c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
            c.alignment = { vertical: 'middle', horizontal: colIdx <= 4 ? (colIdx === 1 || colIdx === 4 ? 'center' : 'left') : 'right' };
          });
          currentRow++;
        }
      } else {
        worksheet.getRow(currentRow).values = ['No item summary entries found'];
        currentRow++;
      }

      currentRow += 2;
    }

    worksheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 8 : (idx === 1 ? 22 : (idx === 2 ? 35 : (idx === 3 ? 12 : 18)));
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const title = `PBK_Ledger_${stateName}_${Date.now()}`;
    return { buffer, title };
  }

  async exportCurrentExcelPbk() {
    if (!this.groupedReportDataPbk || this.groupedReportDataPbk.length === 0) {
      this.toastr.error('No data to export');
      return;
    }
    let currentGroup = this.groupedReportDataPbk[this.activeStateIndex];
    if (!currentGroup || !currentGroup.reports || currentGroup.reports.length === 0) {
      this.toastr.error('No data for this state');
      return;
    }
    let stateObj = this.states.find((s: any) => s._id === currentGroup.state_id);
    let { buffer, title } = await this.buildPbkExcelBuffer(currentGroup.reports, stateObj);
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(data, title + '.xlsx');
  }

  async fetchAllStatesDataPbk(): Promise<Array<{ stateObj: any, reports: any[] }>> {
    if (!this.filterBodyPbk.from || !this.filterBodyPbk.to) {
      this.toastr.error('Please select From Date and To Date for Export.');
      return [];
    }

    let validStates = this.states.filter((s: any) => this.pbks.some((p: any) => p.state_id === s._id));
    if (validStates.length === 0) {
      this.toastr.warning('No PBKs found across states.');
      return [];
    }

    let allStateGroups: Array<{ stateObj: any, reports: any[] }> = [];

    for (let i = 0; i < validStates.length; i++) {
      let stateObj = validStates[i];
      let statePbks = this.pbks.filter((p: any) => p.state_id === stateObj._id);
      let stateName = stateObj.state_hin || stateObj.state_eng || 'State';

      this.isLoader = true;
      this.loadingStatus = `Fetching PBK ledger records for ${stateName}... (${i + 1}/${validStates.length})`;

      let pbkParsed = statePbks.map((p: any) => ({
        pbk_id: p._id,
        roll_no: p.roll_no,
        pbk_hin: p.pbk_hin,
        pbk_eng: p.pbk_eng,
        state_id: stateObj._id,
        state_hin: stateObj.state_hin || stateObj.state_eng || '',
        state_eng: stateObj.state_eng || ''
      }));

      let body = { ...this.filterBodyPbk, pbk_ids: pbkParsed, state_name: stateName };
      try {
        let res: any = await this.http.put(this.api.getUrl('REPORT_PBK_LEDGER') + this.auth.webUser.dept_id, body).toPromise();
        if (res && res.success) {
          let validReports = res.data.filter((r: any) =>
            r.overview.total_aawak !== 0 || r.overview.total_jawak !== 0 || r.overview.current_bachat !== 0 || r.overview.past_bachat !== 0
          );
          if (validReports.length > 0) {
            allStateGroups.push({
              stateObj: stateObj,
              reports: validReports
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching state ${stateName}`, err);
      }
    }

    return allStateGroups;
  }

  async exportBulkExcelPbk() {
    let allGroups = await this.fetchAllStatesDataPbk();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    const zip = new JSZip();
    let count = 0;

    for (let g of allGroups) {
      let stateObj = g.stateObj;
      let stateName = stateObj.state_hin || stateObj.state_eng || 'State';
      let { buffer, title } = await this.buildPbkExcelBuffer(g.reports, stateObj);
      zip.file(title + '.xlsx', buffer);
      count++;
    }

    if (count > 0) {
      this.loadingStatus = 'Zipping files...';
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(zipBlob, `PBK_Ledger_Bulk_Excel_${Date.now()}.zip`);
    }

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
  }

  async exportSingleHeavyExcelPbk() {
    let allGroups = await this.fetchAllStatesDataPbk();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    this.isLoader = true;
    this.loadingStatus = 'Building Master Single Heavy Excel Workbook...';

    const workbook = new Workbook();
    let mmObj = this.mms.find((m: any) => m._id === this.filterBodyPbk.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';
    const periodStr = `${this.filterBodyPbk.from.name_hin} से ${this.filterBodyPbk.to.name_hin}`;

    const usedSheetNames = new Set<string>();
    usedSheetNames.add('Master State Saar');

    let stateSheetMap: Array<{ g: any, stateName: string, stateSheetName: string }> = [];

    for (let g of allGroups) {
      let stateName = g.stateObj.state_hin || g.stateObj.state_eng || 'State';
      let safeStateSheetName = ('Index - ' + stateName).substring(0, 30).replace(/[\\*?:\[\]/]/g, '');

      let stIdx = 1;
      let finalStateSheetName = safeStateSheetName;
      while (usedSheetNames.has(finalStateSheetName)) {
        finalStateSheetName = safeStateSheetName.substring(0, 26) + `_${stIdx++}`;
      }
      usedSheetNames.add(finalStateSheetName);

      stateSheetMap.push({
        g: g,
        stateName: stateName,
        stateSheetName: finalStateSheetName
      });
    }

    const masterIndexSheet = workbook.addWorksheet('Master State Saar');
    masterIndexSheet.mergeCells('A1:G1');
    let titleCell = masterIndexSheet.getCell('A1');
    titleCell.value = `${periodStr} तक, ${mmName} का संपूर्ण राज्यवार PBK सार (Master State PBK Summary)`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    masterIndexSheet.getRow(1).height = 32;

    const masterHeaders = ['No.', 'State Name (राज्य)', 'Total PBKs (कुल जिज्ञासु)', 'Past Bachat (पिछला)', 'Total Aawak (आवक)', 'Total Jawak (जावक)', 'Current Bachat (वर्तमान)'];
    masterIndexSheet.getRow(3).values = masterHeaders;
    masterIndexSheet.getRow(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    masterIndexSheet.getRow(3).eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF115E59' } };
      c.alignment = { horizontal: 'center', vertical: 'middle' };
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let masterRowIdx = 4;
    let grandTotals = { pbks: 0, past: 0, aawak: 0, jawak: 0, bachat: 0 };

    for (let i = 0; i < stateSheetMap.length; i++) {
      let itemMap = stateSheetMap[i];
      let g = itemMap.g;
      let stateName = itemMap.stateName;
      let stateSheetName = itemMap.stateSheetName;

      let stPast = g.reports.reduce((s: number, r: any) => s + Number(r.overview.past_bachat || 0), 0);
      let stAwk = g.reports.reduce((s: number, r: any) => s + Number(r.overview.total_aawak || 0), 0);
      let stJwk = g.reports.reduce((s: number, r: any) => s + Number(r.overview.total_jawak || 0), 0);
      let stBcht = g.reports.reduce((s: number, r: any) => s + Number(r.overview.current_bachat || 0), 0);

      grandTotals.pbks += g.reports.length;
      grandTotals.past += stPast;
      grandTotals.aawak += stAwk;
      grandTotals.jawak += stJwk;
      grandTotals.bachat += stBcht;

      let row = masterIndexSheet.getRow(masterRowIdx);
      row.values = [
        i + 1,
        '',
        g.reports.length,
        stPast.toFixed(2),
        stAwk.toFixed(2),
        stJwk.toFixed(2),
        stBcht.toFixed(2)
      ];

      let stCell = masterIndexSheet.getCell(`B${masterRowIdx}`);
      stCell.value = { text: stateName, hyperlink: `#'${stateSheetName}'!A1` };
      stCell.font = { color: { argb: 'FF0F766E' }, underline: true, bold: true };

      row.eachCell((c, cIdx) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { vertical: 'middle', horizontal: cIdx <= 2 ? (cIdx === 1 ? 'center' : 'left') : 'right' };
      });
      masterRowIdx++;
    }

    masterIndexSheet.getRow(masterRowIdx).values = [
      '*',
      'Grand Summary Total',
      grandTotals.pbks,
      grandTotals.past.toFixed(2),
      grandTotals.aawak.toFixed(2),
      grandTotals.jawak.toFixed(2),
      grandTotals.bachat.toFixed(2)
    ];
    masterIndexSheet.getRow(masterRowIdx).font = { bold: true };
    masterIndexSheet.getRow(masterRowIdx).eachCell((c, cIdx) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAECEE' } };
      c.border = { top: { style: 'double' }, left: { style: 'thin' }, bottom: { style: 'double' }, right: { style: 'thin' } };
      c.alignment = { vertical: 'middle', horizontal: cIdx <= 2 ? (cIdx === 1 ? 'center' : 'left') : 'right' };
    });

    masterIndexSheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 8 : (idx === 1 ? 32 : 18);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `PBK_Ledger_Single_Heavy_Master_${Date.now()}.xlsx`;
    FileSaver.saveAs(new Blob([buffer]), fileName);

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
    this.toastr.success('Single Heavy Master PBK Excel exported successfully!');
  }

  async exportCurrentPDFPbk() {
    if (!this.groupedReportDataPbk || this.groupedReportDataPbk.length === 0) {
      this.toastr.error('No data to export');
      return;
    }
    let currentGroup = this.groupedReportDataPbk[this.activeStateIndex];
    if (!currentGroup || !currentGroup.reports || currentGroup.reports.length === 0) {
      this.toastr.error('No data for this state');
      return;
    }
    let stateObj = this.states.find((s: any) => s._id === currentGroup.state_id);
    let stateName = stateObj ? (stateObj.state_hin || stateObj.state_eng) : 'State';

    let pbkParsed = currentGroup.reports.map((r: any) => ({
      pbk_id: r.pbk_id,
      roll_no: r.roll_no,
      pbk_hin: r.pbk_hin,
      pbk_eng: r.pbk_eng,
      state_id: r.state_id,
      state_hin: r.state_hin,
      state_eng: r.state_eng
    }));

    let body = { ...this.filterBodyPbk, pbk_ids: pbkParsed, state_name: stateName };
    let title = `PBK_Ledger_${stateName}_${Date.now()}`;

    let { blob } = await this.downloadPbkPdfBlobAsync(body, title);
    if (blob.size > 0) {
      FileSaver.saveAs(blob, title + '.pdf');
    }
  }

  async exportBulkPDFPbk() {
    let allGroups = await this.fetchAllStatesDataPbk();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    const zip = new JSZip();
    let count = 0;

    for (let i = 0; i < allGroups.length; i++) {
      let g = allGroups[i];
      let stateObj = g.stateObj;
      let stateName = stateObj.state_hin || stateObj.state_eng || 'State';
      let title = `PBK_Ledger_${stateName}_${Date.now()}`;

      let pbkParsed = g.reports.map((r: any) => ({
        pbk_id: r.pbk_id,
        roll_no: r.roll_no,
        pbk_hin: r.pbk_hin,
        pbk_eng: r.pbk_eng,
        state_id: r.state_id,
        state_hin: r.state_hin,
        state_eng: r.state_eng
      }));

      let body = { ...this.filterBodyPbk, pbk_ids: pbkParsed, state_name: stateName };

      try {
        this.isLoader = true;
        this.loadingStatus = `Exporting PDF for ${stateName}... (${i + 1}/${allGroups.length})`;

        let { blob } = await this.downloadPbkPdfBlobAsync(body, title, (statusMsg) => {
          this.loadingStatus = `Exporting PDF for ${stateName}... (${i + 1}/${allGroups.length}) - ${statusMsg}`;
        });
        if (blob.size > 0) {
          zip.file(title + '.pdf', blob);
          count++;
        }
      } catch (err) {
        console.error(`Error exporting pdf for state ${stateName}`, err);
      }
    }

    if (count > 0) {
      this.loadingStatus = 'Zipping files...';
      let zipBlob = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(zipBlob, `PBK_Ledger_Bulk_PDF_${Date.now()}.zip`);
    }

    this.isLoader = false;
    this.loadingStatus = 'Loading...';
  }

  async exportSingleHeavyPDFPbk() {
    let allGroups = await this.fetchAllStatesDataPbk();
    if (!allGroups || allGroups.length === 0) {
      this.isLoader = false;
      this.loadingStatus = 'Loading...';
      this.toastr.info('No activity found to export.');
      return;
    }

    this.isLoader = true;
    this.loadingStatus = 'Generating Single Heavy Master PBK PDF Document...';

    let mmObj = this.mms.find((m: any) => m._id === this.filterBodyPbk.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';

    let statesPayload = allGroups.map(g => ({
      state_id: g.stateObj._id,
      state_hin: g.stateObj.state_hin || g.stateObj.state_eng || '',
      state_eng: g.stateObj.state_eng || '',
      reports: g.reports
    }));

    let body = {
      ...this.filterBodyPbk,
      isHeavySinglePdf: true,
      statesPayload: statesPayload,
      from_name_hin: this.filterBodyPbk.from.name_hin,
      to_name_hin: this.filterBodyPbk.to.name_hin,
      mmName: mmName
    };

    let title = `PBK_Ledger_Single_Heavy_Master_${Date.now()}`;
    let { blob } = await this.downloadPbkPdfBlobAsync(body, title);
    if (blob.size > 0) {
      FileSaver.saveAs(blob, title + '.pdf');
    }
  }

  downloadPbkPdfBlobAsync(body: any, title: string, progressCallback?: (status: string) => void): Promise<{ blob: Blob, title: string }> {
    return new Promise((resolve, reject) => {
      let taskId = 'pdf_pbk_' + Date.now();
      body.taskId = taskId;

      this.isLoader = true;
      if (!progressCallback) this.loadingStatus = 'Initializing PBK PDF export...';

      let progressInterval = setInterval(() => {
        this.http.get(this.api.getUrl('REPORT') + 'pdf-progress/' + taskId).subscribe((res: any) => {
          if (res && res.status) {
            if (progressCallback) {
              progressCallback(res.status);
            } else {
              this.loadingStatus = res.status;
            }
          }
        }, err => { });
      }, 1000);

      this.http.downloadPostData(this.api.getUrl('REPORT') + 'pbk_ledger_pdf/' + this.auth.webUser.dept_id, body).subscribe((data: any) => {
        clearInterval(progressInterval);
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
        resolve({ blob: data, title: title });
      }, (err: any) => {
        clearInterval(progressInterval);
        this.isLoader = false;
        this.loadingStatus = 'Loading...';
        this.toastr.error(err.message || 'Error generating PBK PDF');
        resolve({ blob: new Blob([]), title: title });
      });
    });
  }

}
