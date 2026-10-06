import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ActivatedRoute } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Workbook } from 'exceljs';
import * as FileSaver from 'file-saver';

import { TourService } from 'src/app/services/tour.service';
import { REPORT_TYPE_SAAR_TOUR_CONFIG } from './report-awk-type-saar.tour';

@Component({
  selector: 'app-report-awk-type-saar',
  templateUrl: './report-awk-type-saar.component.html',
  styleUrls: ['./report-awk-type-saar.component.scss']
})
export class ReportAwkTypeSaarComponent implements OnInit, OnDestroy {
  @Input() defaultMode: 'aawak' | 'jawak' = 'aawak';

  private destroy$ = new Subject<void>();

  reportMode: 'aawak' | 'jawak' = 'aawak';
  isLoader: boolean = false;
  term: string = '';
  filterBody: any = {
    year: new Date().getFullYear(),
    months: [],
    dept_id: null,
    category_id: null,
    aawak_type_id: null,
    item_subitem_ids: [],
    hideZeroRows: false
  };

  months: any[] = [];
  monthsSel: any[] = [];
  departments: any[] = [];
  categories: any[] = [];
  aawakTypes: any[] = [];
  jawakTypes: any[] = [];
  submitted: boolean = false;

  reportData: any[] = [];
  groupedReportData: any[] = [];
  grandMonthTotals: number[] = [];
  grandTotalQty: number = 0;

  viewType: 'grouped' | 'flat' = 'grouped';

  // Transaction Details Modal State
  showModal: boolean = false;
  modalLoader: boolean = false;
  modalTitle: string = '';
  modalData: any[] = [];
  modalTerm: string = '';
  lastDetailPayload: any = null;

  // Edit / Delete / Reference Modal State
  showEditEntryModal: boolean = false;
  editingEntry: any = null;
  editingEntryTitle: string = '';
  showRefModal: boolean = false;
  refJawakItem: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private httpClient: HttpClient,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
    private route: ActivatedRoute,
    private tourService: TourService
  ) {}

  startTour(): void {
    this.tourService.startTour(REPORT_TYPE_SAAR_TOUR_CONFIG);
  }

  ngOnInit(): void {
    this.spinner.show();

    if (this.defaultMode) {
      this.reportMode = this.defaultMode;
    }

    const path = this.route.snapshot.routeConfig?.path || '';
    if (path.includes('report-jt')) {
      this.reportMode = 'jawak';
    }

    if (!this.filterBody.year) {
      this.filterBody.year = new Date().getFullYear();
    }

    if (this.auth.webUser?.dept_id) {
      this.filterBody.dept_id = [this.auth.webUser.dept_id];
    }

    this.gs.observeList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.departments = result.department ? result.department : [];
        this.categories = result.category ? result.category : [];
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error('Failed to load master lists');
      }
    });

    this.loadSupportLists();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.reportData = [];
    this.groupedReportData = [];
    this.categories = [];
    this.aawakTypes = [];
    this.jawakTypes = [];
    this.modalData = [];
  }

  setReportMode(mode: 'aawak' | 'jawak'): void {
    if (this.reportMode === mode) return;
    this.reportMode = mode;
    this.filterBody.aawak_type_id = null;
    if (this.submitted) {
      this.searchReports();
    }
  }

  loadSupportLists(): void {
    const deptId = this.auth.webUser?.dept_id;
    if (!deptId) return;
    this.http.get(this.api.getUrl('SPLIST') + deptId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const list = res.result || [];
          this.aawakTypes = list.filter((item: any) => item.list_type === 'aawak_type');
          this.jawakTypes = list.filter((item: any) => item.list_type === 'jawak_type');
        }
      },
      error: (err: any) => {
        console.error('Failed to load support lists:', err);
      }
    });
  }

  get activeTypeOptions(): any[] {
    return this.reportMode === 'jawak' ? this.jawakTypes : this.aawakTypes;
  }

  searchReports(): void {
    this.submitted = true;
    if (!this.filterBody.months || this.filterBody.months.length === 0) {
      this.toastr.error('Please Select Month');
      return;
    }

    if (!this.filterBody.dept_id || (Array.isArray(this.filterBody.dept_id) && this.filterBody.dept_id.length === 0)) {
      if (this.auth.webUser?.dept_id) {
        this.filterBody.dept_id = [this.auth.webUser.dept_id];
      }
    }

    this.isLoader = true;
    const urlKey = this.reportMode === 'jawak' ? 'REPORT_JT' : 'REPORT_AT';

    this.http.put(this.api.getUrl(urlKey), this.filterBody).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.reportData = data.result || [];
          this.monthsSel = this.gs.months.filter((m: { m: any }) => data.months.includes(m.m));
          this.processReportData();
          this.isLoader = false;
        } else {
          this.isLoader = false;
          this.toastr.error(data.message || 'Failed to fetch report data');
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoader = false;
        this.toastr.error(err.message || 'Server Error while fetching report');
      }
    });
  }

  processReportData(): void {
    this.groupedReportData = [];
    this.grandMonthTotals = new Array(this.monthsSel.length).fill(0);
    this.grandTotalQty = 0;

    const groupsMap = new Map<string, any>();

    for (let i = 0; i < this.reportData.length; i++) {
      let row = this.reportData[i];

      row.type_hin = this.reportMode === 'jawak' ? row.jawak_type_hin : row.aawak_type_hin;
      row.type_eng = this.reportMode === 'jawak' ? row.jawak_type_eng : row.aawak_type_eng;
      row.type_id = this.reportMode === 'jawak' ? row.jawak_type_id : row.aawak_type_id;

      row.categories_hin = '';
      row.categories_eng = '';

      if (row.arr_subitem_categories && row.arr_subitem_categories.length > 0) {
        for (let j in this.categories) {
          if (row.arr_subitem_categories.includes(this.categories[j]._id)) {
            row.categories_hin += (row.categories_hin ? ', ' : '') + this.categories[j].category_hin;
            row.categories_eng += (row.categories_eng ? ', ' : '') + this.categories[j].category_eng;
          }
        }
      } else if (row.arr_item_categories && row.arr_item_categories.length > 0) {
        for (let j in this.categories) {
          if (row.arr_item_categories.includes(this.categories[j]._id)) {
            row.categories_hin += (row.categories_hin ? ', ' : '') + this.categories[j].category_hin;
            row.categories_eng += (row.categories_eng ? ', ' : '') + this.categories[j].category_eng;
          }
        }
      }

      row.row_total_qty = (row.arr_sum_qty || []).reduce((acc: number, val: number) => acc + (Number(val) || 0), 0);

      if (this.filterBody.hideZeroRows && row.row_total_qty === 0) {
        continue;
      }

      for (let mIdx = 0; mIdx < this.monthsSel.length; mIdx++) {
        this.grandMonthTotals[mIdx] += (Number(row.arr_sum_qty[mIdx]) || 0);
      }
      this.grandTotalQty += row.row_total_qty;

      const groupKey = `${row.dept_id}_${row.item_id}_${row.subitem_id || 0}_${row.unit_id || 0}`;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          dept_id: row.dept_id,
          dept_hin: row.dept_hin,
          dept_eng: row.dept_eng,
          dept_code: row.dept_code,
          categories_hin: row.categories_hin,
          categories_eng: row.categories_eng,
          item_id: row.item_id,
          item_hin: row.item_hin,
          item_eng: row.item_eng,
          subitem_id: row.subitem_id,
          subitem_hin: row.subitem_hin,
          subitem_eng: row.subitem_eng,
          unit_short: row.unit_short,
          unit_full: row.unit_full,
          rows: [],
          item_sum_qty: new Array(this.monthsSel.length).fill(0),
          item_total_qty: 0
        });
      }

      const group = groupsMap.get(groupKey);
      group.rows.push(row);

      for (let mIdx = 0; mIdx < this.monthsSel.length; mIdx++) {
        group.item_sum_qty[mIdx] += (Number(row.arr_sum_qty[mIdx]) || 0);
      }
      group.item_total_qty += row.row_total_qty;
    }

    this.groupedReportData = Array.from(groupsMap.values());
  }

  openDetailModal(row: any, monthObj?: any): void {
    const itemLabel = `${row.item_hin}${row.subitem_hin ? ' : ' + row.subitem_hin : ''}`;
    const typeLabel = row.type_hin ? ` (${row.type_hin})` : '';
    const modeLabel = this.reportMode === 'jawak' ? 'जावक' : 'आवक';

    let monthMonths: number[] = [];
    if (monthObj) {
      monthMonths = [monthObj.m];
      this.modalTitle = `${modeLabel} प्रविष्टियाँ: ${itemLabel}${typeLabel} - ${monthObj.name_hin || monthObj.name} ${this.filterBody.year}`;
    } else {
      monthMonths = this.filterBody.months;
      this.modalTitle = `${modeLabel} प्रविष्टियाँ: ${itemLabel}${typeLabel} - वर्ष ${this.filterBody.year} (सभी चयनित महीने)`;
    }

    this.showModal = true;
    this.modalLoader = true;
    this.modalData = [];
    this.modalTerm = '';

    this.lastDetailPayload = {
      mode: this.reportMode,
      year: this.filterBody.year,
      months: monthMonths,
      dept_id: row.dept_id,
      item_id: row.item_id,
      subitem_id: row.subitem_id,
      type_id: row.type_id
    };

    this.fetchModalDetails();
  }

  fetchModalDetails(): void {
    if (!this.lastDetailPayload) return;
    this.modalLoader = true;
    this.http.put(this.api.URLS.BASE + 'reports/type_saar_details/', this.lastDetailPayload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.modalLoader = false;
        if (res && res.success) {
          this.modalData = res.result || [];
        } else {
          this.toastr.error('Failed to load transaction details');
        }
      },
      error: (err: any) => {
        this.modalLoader = false;
        console.error(err);
        this.toastr.error('Error fetching transaction details');
      }
    });
  }

  closeDetailModal(): void {
    this.showModal = false;
    this.modalData = [];
    this.lastDetailPayload = null;
  }

  // Edit / Delete / Reference Actions in Drilldown Modal
  editEntry(item: any): void {
    const modeLabel = this.reportMode === 'jawak' ? 'Jawak' : 'Aawak';
    this.editingEntryTitle = `Edit ${modeLabel} Entry #${item._id}`;
    this.editingEntry = { ...item };
    this.showEditEntryModal = true;
  }

  closeEditEntryModal(): void {
    this.showEditEntryModal = false;
    this.editingEntry = null;
  }

  onEntryEdited(res: any): void {
    this.closeEditEntryModal();
    this.toastr.success('प्रविष्टि सफलतापूर्वक अपडेट की गई');
    this.fetchModalDetails();
    this.searchReports();
  }

  deleteEntry(item: any): void {
    if (!confirm('क्या आप इस प्रविष्टि को हटाना चाहते हैं? (Are you sure you want to delete this entry?)')) {
      return;
    }

    const urlKey = this.reportMode === 'jawak' ? 'JAWAK' : 'AAWAK';
    this.http.delete(this.api.getUrl(urlKey) + item._id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res && res.success !== false) {
          this.toastr.success('प्रविष्टि सफलतापूर्वक हटा दी गई');
          this.fetchModalDetails();
          this.searchReports();
        } else {
          this.toastr.error(res?.message || 'Failed to delete entry');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.toastr.error(err.message || 'Error deleting entry');
      }
    });
  }

  onAawakRefSaved(event: any, item: any): void {
    if (event) {
      if (Array.isArray(event.aawak_splits)) {
        item.aawak_splits = event.aawak_splits;
        item.aawak_ref_id = event.aawak_splits.length > 0 ? (event.aawak_splits[0].aawak_id || event.aawak_splits[0]._id) : null;
      } else if (typeof event === 'number' || typeof event === 'string') {
        item.aawak_ref_id = event;
      } else {
        item.aawak_splits = [];
        item.aawak_ref_id = null;
      }
    } else {
      item.aawak_splits = [];
      item.aawak_ref_id = null;
    }
    this.toastr.success('आवक संदर्भ सफलतापूर्वक अपडेट किया गया');
    this.fetchModalDetails();
    this.searchReports();
  }

  viewReference(item: any): void {
    this.refJawakItem = item;
    this.showRefModal = true;
  }

  closeRefModal(): void {
    this.showRefModal = false;
    this.refJawakItem = null;
  }

  // Option 1: Combined Hindi & English in Same Excel Sheet
  exportGeneralExcelCombo(): void {
    if (!this.reportData || this.reportData.length === 0) {
      this.toastr.error('No data available to export');
      return;
    }

    const modeName = this.reportMode === 'jawak' ? 'Jawak' : 'Aawak';
    const modeHin = this.reportMode === 'jawak' ? 'जावक' : 'आवक';

    let data: any[] = [];
    for (let i = 0; i < this.reportData.length; i++) {
      let r = this.reportData[i];
      let rowObj: any = {
        'Sr No': i + 1,
        'Department (हिन्दी)': r.dept_hin || '-',
        'Department (Eng)': r.dept_eng ? `${r.dept_eng} (${r.dept_code})` : '-',
        'Category (हिन्दी)': r.categories_hin || '-',
        'Category (Eng)': r.categories_eng || '-',
        'Item (हिन्दी)': r.item_hin || '-',
        'Item (Eng)': r.item_eng || '-',
        'Subitem (हिन्दी)': r.subitem_hin || '-',
        'Subitem (Eng)': r.subitem_eng || '-',
        [modeHin + ' टाइप']: r.type_hin || 'सामान्य',
        [modeName + ' Type']: r.type_eng || 'General',
        'Unit (यूनिट)': r.unit_short || '-'
      };
      for (let j in this.monthsSel) {
        rowObj[`${this.monthsSel[j].name_hin || this.monthsSel[j].name}-${this.filterBody.year}`] = r.arr_sum_qty[j];
      }
      rowObj['Total Qty (कुल मात्रा)'] = r.row_total_qty;
      data.push(rowObj);
    }

    const fileName = `${this.auth.webUser.dept_code || 'REPORT'}_${modeName}_Type_Saar_General_${this.monthsSel[0]?.name_hin || ''}_to_${this.monthsSel[this.monthsSel.length - 1]?.name_hin || ''}_${this.filterBody.year}`;
    const title = `${modeHin} एवं ${modeName} टाइप-वार सार रिपोर्ट (General Combo) (${this.filterBody.year})`;
    this.excelExportService.exportStyledExcel(data, fileName, title);
  }

  // Option 2: Multi-Sheet Excel with Main Saar + Monthly Entry Sheets
  async exportMultiSheetDetailedExcel(): Promise<void> {
    if (!this.reportData || this.reportData.length === 0) {
      this.toastr.error('No data available to export');
      return;
    }

    this.spinner.show();
    try {
      const workbook = new Workbook();
      const modeName = this.reportMode === 'jawak' ? 'Jawak' : 'Aawak';
      const modeHin = this.reportMode === 'jawak' ? 'जावक' : 'आवक';

      // ── Sheet 1: Main Saar Summary ──
      const mainSheet = workbook.addWorksheet('Saar Summary');
      mainSheet.views = [{ showGridLines: true }];

      let dataRows: any[] = [];
      for (let i = 0; i < this.reportData.length; i++) {
        let r = this.reportData[i];
        let rowObj: any = {
          'Sr No': i + 1,
          'Department (विभाग)': `${r.dept_hin || ''} (${r.dept_code || ''})`,
          'Category (श्रेणी)': r.categories_hin || r.categories_eng || '-',
          'Item (आइटम)': r.item_hin || r.item_eng || '-',
          'Subitem (सबआइटम)': r.subitem_hin || r.subitem_eng || '-',
          [modeName + ' Type (' + modeHin + ' प्रकार)']: r.type_hin || r.type_eng || 'सामान्य',
          'Unit (यूनिट)': r.unit_short || '-'
        };
        for (let j in this.monthsSel) {
          rowObj[`${this.monthsSel[j].name_hin || this.monthsSel[j].name}-${this.filterBody.year}`] = r.arr_sum_qty[j];
        }
        rowObj['Total Qty (कुल मात्रा)'] = r.row_total_qty;
        dataRows.push(rowObj);
      }

      if (dataRows.length > 0) {
        const keys = Object.keys(dataRows[0]);
        const headerRow = mainSheet.getRow(1);
        headerRow.values = keys;
        headerRow.height = 22;
        headerRow.eachCell(cell => {
          cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FF000000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
          };
        });

        dataRows.forEach(rowObj => {
          const row = mainSheet.addRow(keys.map(k => rowObj[k]));
          row.height = 19;
          row.eachCell(cell => {
            cell.font = { name: 'Calibri', size: 9.5 };
            cell.alignment = typeof cell.value === 'number' ? { vertical: 'middle', horizontal: 'right' } : { vertical: 'middle', horizontal: 'left' };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
            };
          });
        });
      }

      // ── Sheets 2..N: One sheet per selected month ──
      for (let mn of this.monthsSel) {
        const sheetName = `${mn.name}-${this.filterBody.year}`.substring(0, 31);
        const mSheet = workbook.addWorksheet(sheetName);
        mSheet.views = [{ showGridLines: true }];

        const payload = {
          mode: this.reportMode,
          year: this.filterBody.year,
          months: [mn.m],
          dept_id: this.filterBody.dept_id,
          category_id: this.filterBody.category_id,
          item_subitem_ids: this.filterBody.item_subitem_ids,
          type_id: this.filterBody.aawak_type_id
        };

        const res: any = await this.http.put(this.api.URLS.BASE + 'reports/type_saar_details/', payload).toPromise();
        const monthRecords = (res && res.success) ? (res.result || []) : [];

        const mHeaders = ['Sr No', 'Date', 'Voucher / Lot', 'Pkt Num', 'Department', 'MM', 'PBK', 'Item', 'Subitem', 'Type', 'Qty', 'Unit', 'Rate', 'Amount', 'Description'];
        const mHeaderRow = mSheet.getRow(1);
        mHeaderRow.values = mHeaders;
        mHeaderRow.height = 22;
        mHeaderRow.eachCell(cell => {
          cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FF000000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
            right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
          };
        });

        monthRecords.forEach((rec: any, idx: number) => {
          const row = mSheet.addRow([
            idx + 1,
            rec.date ? new Date(rec.date).toLocaleDateString('en-GB') : '-',
            rec.voucher_no || rec.lot_no || '-',
            rec.pkt_num || '-',
            rec.dept_hin || rec.dept_code || '-',
            rec.mm_hin ? `${rec.mm_hin} (${rec.mm_code || ''})` : '-',
            rec.pbk_hin || '-',
            rec.item_hin || rec.item_eng || '-',
            rec.subitem_hin || rec.subitem_eng || '-',
            rec.type_hin || rec.type_eng || 'सामान्य',
            rec.qty || 0,
            rec.unit_short || '-',
            rec.rate || 0,
            rec.actual_amt || rec.amount || 0,
            rec.description || rec.remarks || '-'
          ]);
          row.height = 19;
          row.eachCell(cell => {
            cell.font = { name: 'Calibri', size: 9.5 };
            cell.alignment = typeof cell.value === 'number' ? { vertical: 'middle', horizontal: 'right' } : { vertical: 'middle', horizontal: 'left' };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
              right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
            };
          });
        });
      }

      const fileName = `${this.auth.webUser.dept_code || 'REPORT'}_${modeName}_Type_Saar_Detailed_${this.filterBody.year}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, fileName);

      this.spinner.hide();
      this.toastr.success('Multi-sheet Excel report generated successfully');
    } catch (err: any) {
      this.spinner.hide();
      console.error(err);
      this.toastr.error('Failed to generate multi-sheet Excel report');
    }
  }

  // Standard Client-Side jsPDF Export (Using English fields to prevent garbled font characters)
  exportNormalPDF(): void {
    if (!this.reportData || this.reportData.length === 0) {
      this.toastr.error('No data available to export');
      return;
    }

    try {
      const modeName = this.reportMode === 'jawak' ? 'Jawak' : 'Aawak';
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const deptCode = this.auth.webUser?.dept_code || 'STR';
      const title = `${deptCode} - ${modeName} Type Wise Saar Report (${this.filterBody.year})`;

      doc.setFontSize(13);
      doc.text(title, 14, 12);

      doc.setFontSize(9);
      const monthsStr = this.monthsSel.map(m => m.name).join(', ');
      doc.text(`Months: ${monthsStr} ${this.filterBody.year}`, 14, 17);

      const headers: string[] = ['#', 'Department', 'Category', 'Item / Subitem', `${modeName} Type`];
      this.monthsSel.forEach(m => headers.push(`${m.name.substring(0, 3)}-${this.filterBody.year}`));
      headers.push('Total Qty');

      const body: any[] = [];

      if (this.viewType === 'grouped') {
        this.groupedReportData.forEach((group, gIdx) => {
          group.rows.forEach((row: any, rIdx: number) => {
            const itemEngText = group.item_eng ? `${group.item_eng}${group.subitem_eng ? ' : ' + group.subitem_eng : ''}` : (group.item_hin || '-');
            const rowData: any[] = [
              rIdx === 0 ? (gIdx + 1).toString() : '',
              rIdx === 0 ? (group.dept_code || group.dept_eng || '-') : '',
              rIdx === 0 ? (group.categories_eng || group.categories_hin || '-') : '',
              rIdx === 0 ? itemEngText : '',
              row.type_eng || row.type_hin || 'General'
            ];

            row.arr_sum_qty.forEach((q: number) => {
              rowData.push(q !== 0 ? q.toLocaleString() : '-');
            });
            rowData.push(row.row_total_qty !== 0 ? row.row_total_qty.toLocaleString() : '-');

            body.push(rowData);
          });

          if (group.rows.length > 1) {
            const itemEngText = group.item_eng || group.item_hin || '';
            const subRow: any[] = [
              '', '', '',
              `${itemEngText} Total:`,
              ''
            ];
            group.item_sum_qty.forEach((sq: number) => {
              subRow.push(sq !== 0 ? sq.toLocaleString() : '-');
            });
            subRow.push(group.item_total_qty !== 0 ? group.item_total_qty.toLocaleString() : '-');
            body.push(subRow);
          }
        });
      } else {
        this.reportData.forEach((row, idx) => {
          const itemEngText = row.item_eng ? `${row.item_eng}${row.subitem_eng ? ' : ' + row.subitem_eng : ''}` : (row.item_hin || '-');
          const rowData: any[] = [
            (idx + 1).toString(),
            row.dept_code || row.dept_eng || '-',
            row.categories_eng || row.categories_hin || '-',
            itemEngText,
            row.type_eng || row.type_hin || 'General'
          ];
          row.arr_sum_qty.forEach((q: number) => {
            rowData.push(q !== 0 ? q.toLocaleString() : '-');
          });
          rowData.push(row.row_total_qty !== 0 ? row.row_total_qty.toLocaleString() : '-');
          body.push(rowData);
        });
      }

      // Grand Total Footer Row
      const grandRow: any[] = ['Grand Total', '', '', '', ''];
      this.grandMonthTotals.forEach(gq => {
        grandRow.push(gq !== 0 ? gq.toLocaleString() : '-');
      });
      grandRow.push(this.grandTotalQty !== 0 ? this.grandTotalQty.toLocaleString() : '-');
      body.push(grandRow);

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 21,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 1.5 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [52, 73, 94], textColor: 255, fontStyle: 'bold' }
      });

      const fileName = `${this.auth.webUser?.dept_code || 'REPORT'}_${modeName}_Type_Saar_${this.filterBody.year}_Standard.pdf`;
      doc.save(fileName);
      this.toastr.success('Standard PDF generated successfully');
    } catch (err: any) {
      console.error(err);
      this.toastr.error('Failed to generate standard PDF');
    }
  }

  // PDF Export Progress Overlay State
  isPdfExporting: boolean = false;
  pdfProgressStatus: string = '';

  // Backend Puppeteer PDF Export
  exportToPDF(pdfType: 'summary' | 'detailed' = 'summary'): void {
    if (!this.reportData || this.reportData.length === 0) {
      this.toastr.error('No data available to export');
      return;
    }

    const taskId = `pdf_type_saar_${Date.now()}`;
    this.isPdfExporting = true;
    this.pdfProgressStatus = 'Initializing PDF Export...';

    const payload = {
      reportData: this.reportData,
      groupedReportData: this.groupedReportData,
      monthsSel: this.monthsSel,
      grandMonthTotals: this.grandMonthTotals,
      grandTotalQty: this.grandTotalQty,
      filterBody: this.filterBody,
      reportMode: this.reportMode,
      viewType: this.viewType,
      pdfType,
      deptName: this.auth.webUser?.dept_hin || this.auth.webUser?.dept_code || 'HisabKitab',
      taskId
    };

    const progressInterval = setInterval(() => {
      this.http.get(this.api.URLS.BASE + 'reports/pdf-progress/' + taskId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res && res.status) {
            this.pdfProgressStatus = res.status;
          }
        },
        error: () => {}
      });
    }, 800);

    this.httpClient.put(this.api.URLS.BASE + 'reports/type_saar_pdf/', payload, { responseType: 'blob' }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        clearInterval(progressInterval);
        this.isPdfExporting = false;
        this.pdfProgressStatus = '';
        const blob = new Blob([res], { type: 'application/pdf' });
        const modeName = this.reportMode === 'jawak' ? 'Jawak' : 'Aawak';
        const fileName = `${this.auth.webUser?.dept_code || 'REPORT'}_${modeName}_Type_Saar_${pdfType}_${this.filterBody.year}.pdf`;
        FileSaver.saveAs(blob, fileName);
        this.toastr.success(`Puppeteer ${pdfType === 'detailed' ? 'Advance Detailed' : 'Saar'} PDF generated successfully`);
      },
      error: (err: any) => {
        clearInterval(progressInterval);
        this.isPdfExporting = false;
        this.pdfProgressStatus = '';
        console.error(err);
        this.toastr.error('Failed to generate Puppeteer PDF');
      }
    });
  }
}
