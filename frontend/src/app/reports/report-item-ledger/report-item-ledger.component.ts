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
    if(!this.filterBody.from || !this.filterBody.to) {
      this.toastr.error('Please select From and To Date');
      return;
    }

    // Auto-select items if category is chosen but item list is cleared
    if ((!this.filterBody.item_subitem_ids || this.filterBody.item_subitem_ids.length === 0) && this.filterBody.category_id) {
      this.filterBody.item_subitem_ids = this.getCategoryItems(this.filterBody.category_id);
    }

    if(!this.filterBody.item_subitem_ids || this.filterBody.item_subitem_ids.length === 0) {
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
      let subitem_hin = '';
      if (itemObj && s_id) {
         let subObj = itemObj.subitems.find((s: any) => s._id === s_id);
         if (subObj) subitem_hin = subObj.subitem_hin;
      }

      return {
        item_id: i_id,
        subitem_id: s_id,
        item_hin: item_hin,
        subitem_hin: subitem_hin
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

        if (this.reportData.length === 0) {
            this.toastr.info('No activity (Aawak/Jawak/Bachat) found for the selected items in this date range.');
        }

        this.activeReportIndex = 0;
        this.isLoader = false;
      }
    }, (err: any) => {
      console.log(err);
      this.isLoader = false;
      this.toastr.error(err.message);
    });
  }

  async exportToExcel() {
    if (!this.reportData || this.reportData.length === 0) {
      this.toastr.error('No data to export');
      return;
    }

    const workbook = new Workbook();
    
    let mmObj = this.mms.find((m:any) => m._id === this.filterBody.mm_id);
    let mmName = mmObj ? mmObj.mm_hin : 'All MMs';

    // Process each item to create a separate sheet
    for (let report of this.reportData) {
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

      // Summary View (Software Style: 3 Boxes)
      worksheet.mergeCells('A3:C3');
      worksheet.mergeCells('A4:C4');
      worksheet.mergeCells('D3:F3');
      worksheet.mergeCells('D4:F4');
      worksheet.mergeCells('G3:I3');
      worksheet.mergeCells('G4:I4');

      worksheet.getCell('A3').value = 'Total Aawak (कुल आवक)';
      worksheet.getCell('A4').value = `${report.overview.total_aawak} ${report.unit_short}`;
      
      worksheet.getCell('D3').value = 'Total Jawak (कुल जावक)';
      worksheet.getCell('D4').value = `${report.overview.total_jawak} ${report.unit_short}`;
      
      worksheet.getCell('G3').value = 'Current Bachat (वर्तमान बचत)';
      worksheet.getCell('G4').value = `${report.overview.current_bachat} ${report.unit_short}`;

      // Styling Summary Boxes
      let boxHeaders = ['A3', 'D3', 'G3'];
      let boxValues = ['A4', 'D4', 'G4'];
      
      boxHeaders.forEach(c => {
          let cell = worksheet.getCell(c);
          cell.font = { bold: true, size: 11 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });
      boxValues.forEach(c => {
          let cell = worksheet.getCell(c);
          cell.font = { bold: true, size: 14 };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });

      // Aawak Box Color
      worksheet.getCell('A3').fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD4EDDA'} };
      worksheet.getCell('A4').fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD4EDDA'} };
      worksheet.getCell('A3').font = { bold: true, color: { argb: 'FF0F5132' } };
      worksheet.getCell('A4').font = { bold: true, size: 14, color: { argb: 'FF0F5132' } };

      // Jawak Box Color
      worksheet.getCell('D3').fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFF8D7DA'} };
      worksheet.getCell('D4').fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFF8D7DA'} };
      worksheet.getCell('D3').font = { bold: true, color: { argb: 'FF842029' } };
      worksheet.getCell('D4').font = { bold: true, size: 14, color: { argb: 'FF842029' } };

      // Bachat Box Color
      worksheet.getCell('G3').fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD1ECF1'} };
      worksheet.getCell('G4').fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD1ECF1'} };
      worksheet.getCell('G3').font = { bold: true, color: { argb: 'FF055160' } };
      worksheet.getCell('G4').font = { bold: true, size: 14, color: { argb: 'FF055160' } };

      worksheet.getRow(3).height = 25;
      worksheet.getRow(4).height = 30;

      // Aawak Table
      let currentRow = 6;
      worksheet.getCell(`A${currentRow}`).value = '--- AAWAK ENTRIES (आवक) ---';
      worksheet.getCell(`A${currentRow}`).font = { bold: true, color: { argb: 'FF0F5132' } };
      currentRow++;
      
      const aawakHeaders = ['तारीख', 'लॉट नं.', 'कहाँ से आया', 'किसने दिया', 'कन्डिशन', 'क्वानटिटी', 'यूनिट', 'आवक टाइप', 'डिस्क्रिप्शन'];
      worksheet.getRow(currentRow).values = aawakHeaders;
      worksheet.getRow(currentRow).font = { bold: true, color: { argb: 'FF0F5132' } };
      worksheet.getRow(currentRow).eachCell(c => c.fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFD4EDDA'} });
      currentRow++;
      
      if (report.aawaks && report.aawaks.length > 0) {
          for (let a of report.aawaks) {
              worksheet.getRow(currentRow).values = [
                  a.date, a.lot_no, a.aawak_mm_hin, (a.roll_no ? a.roll_no + ' ' : '') + (a.pbk_hin ? a.pbk_hin : ''),
                  a.condition_hin, a.qty, a.unit_short, a.aawak_type_hin, a.description
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
      
      const jawakHeaders = ['तारीख', 'लॉट नं.', 'कहाँ भेजा', 'किसको दिया', 'कन्डिशन', 'क्वानटिटी', 'यूनिट', 'जावक टाइप', 'डिस्क्रिप्शन'];
      worksheet.getRow(currentRow).values = jawakHeaders;
      worksheet.getRow(currentRow).font = { bold: true, color: { argb: 'FF842029' } };
      worksheet.getRow(currentRow).eachCell(c => c.fill = { type: 'pattern', pattern:'solid', fgColor:{argb:'FFF8D7DA'} });
      currentRow++;
      
      if (report.jawaks && report.jawaks.length > 0) {
          for (let j of report.jawaks) {
              worksheet.getRow(currentRow).values = [
                  j.date, j.lot_no, j.jawak_mm_hin, (j.roll_no ? j.roll_no + ' ' : '') + (j.pbk_hin ? j.pbk_hin : ''),
                  j.condition_hin, j.qty, j.unit_short, j.jawak_type_hin, j.description
              ];
              currentRow++;
          }
      } else {
          worksheet.getCell(`A${currentRow}`).value = 'No Jawak entries';
          currentRow++;
      }
      
      // Set column widths
      worksheet.columns.forEach((col, i) => {
          col.width = i === 0 ? 15 : (i === 8 ? 40 : 18);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let title = 'Item_Ledger_' + this.filterBody.from.name.replace(' ', '') + '_to_' + this.filterBody.to.name.replace(' ', '');
    FileSaver.saveAs(data, title + '.xlsx');
  }

  setActiveReport(index: number) {
    this.activeReportIndex = index;
  }

}
