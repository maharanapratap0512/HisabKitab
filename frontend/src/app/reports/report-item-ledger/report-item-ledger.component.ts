import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
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
export class ReportItemLedgerComponent implements OnInit {

  isLoader: any = false;
  loadingStatus: any = 'Loading...';
  filterBody: any = {
    from: null,
    to: null,
    mm_id: null,
    category_id: null,
    item_subitem_ids: []
  };

  monthYearOptions: any[] = [];
  mms: any = [];
  categories: any = [];
  items: any = [];

  reportData: any = [];
  groupedReportData: any = [];
  activeCategoryIndex: number = 0;
  activeReportIndex: number = 0;

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
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.categories = result.category ? result.category : [];
      this.items = result.itemmix ? result.itemmix : [];

      this.buildMonthYearOptions();

      this.filterBody.mm_id = this.auth.webUser.defaultMM;

      this.isLoader = false;
    });
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

  getCategoryItems(categoryId: any): string[] {
    let matchingIds: string[] = [];
    for (let item of this.items) {
      let itemMatches = item.categories && item.categories.some((c: any) => c._id === categoryId);
      if (item.subitems && item.subitems.length > 0) {
        for (let sub of item.subitems) {
          let subMatches = sub.categories && sub.categories.some((c: any) => c._id === categoryId);
          if (itemMatches || subMatches) {
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
          let catId = 'uncategorized';
          if (itemObj) {
            let subObj = itemObj.subitems && r.subitem_id ? itemObj.subitems.find((s: any) => s._id === r.subitem_id) : null;
            if (subObj && subObj.categories && subObj.categories.length > 0) {
              catId = subObj.categories[0]._id;
            } else if (itemObj.categories && itemObj.categories.length > 0) {
              catId = itemObj.categories[0]._id;
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
    for (let report of reportsToExport) {
      let itemName = report.item_hin + (report.subitem_hin ? ' (' + report.subitem_hin + ')' : '');
      let safeSheetName = itemName.substring(0, 30).replace(/[\\*?:\[\]/]/g, '');
      const worksheet = workbook.addWorksheet(safeSheetName);

      // Big Heading
      worksheet.mergeCells('A1:I1');
      let titleCell = worksheet.getCell('A1');
      titleCell.value = `${this.filterBody.from.name_hin} से ${this.filterBody.to.name_hin} तक, ${mmName} के ${itemName} का सार`;
      titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4E73DF' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 30;

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

    const buffer = await workbook.xlsx.writeBuffer();
    let title = 'Item_Ledger_' + this.filterBody.from.name.replace(' ', '') + '_to_' + this.filterBody.to.name.replace(' ', '');
    if (categoryObj) {
      let catName = categoryObj.category_eng || categoryObj.category_hin || '';
      if (catName) title += '_' + catName.replace(/ /g, '_');
    }
    return { buffer: buffer, title: title };
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

}
