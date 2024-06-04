import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-report-store-stock',
  templateUrl: './report-store-stock.component.html',
  styleUrls: ['./report-store-stock.component.scss']
})
export class ReportStoreStockComponent {
  isLoader: any = false;
  loadingStatus: any = 'मैं आत्मा शांत स्वरूप हूँ ।';
  reportHeading: any = '';
  term: any;
  filterBody: any = {}
  months: any = [];
  monthsSel: any = [];
  stores: any = [];
  mms: any = [];
  conditions: any = [];
  categories: any = [];

  reportData: any = [];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService) {
    this.isLoader = true
  }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.categories = result.category ? result.category : [];

      this.stores = this.mms.filter((m: { dept_id: any; }) => m.dept_id == 6);
      this.filterBody.condition = this.conditions.map((c: { list_name_eng: any; }) => c.list_name_eng)
      this.filterBody.mm_id = this.stores.map((s: { _id: any; }) => s._id)
      this.isLoader = false;
      this.searchReports();
    });


  }

  setHeading() {
    this.reportHeading = ''
    for (let mm of this.stores.filter((s: { _id: any; }) => this.filterBody.mm_id.includes(s._id))) {
      this.reportHeading += mm.mm_hin + ",";
    }
    this.reportHeading += ' का हाल का स्टॉक';
  }

  searchReports() {
    if (this.filterBody.condition.length > 0 || this.filterBody.mm_id.length > 0) {

      this.loadingStatus = 'Generating Report....'
      this.isLoader = true;
      this.http.put(this.api.getUrl('REPORT_STR_STK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
        if (data.success) {
          this.reportData = data.result;
          this.setHeading();
          for (let i in this.reportData) {
            this.reportData[i].categories_hin = '';
            this.reportData[i].categories_eng = '';
            if (this.reportData[i].arr_subitem_categories && this.reportData[i].arr_subitem_categories.length > 0) {
              for (let j in this.categories) {
                if (this.reportData[i].arr_subitem_categories.includes(this.categories[j]._id)) {
                  this.reportData[i].categories_hin += this.categories[j].category_hin + ', ';
                  this.reportData[i].categories_eng += this.categories[j].category_eng + ', ';
                }
              }
            } else {
              for (let j in this.categories) {
                if (this.reportData[i].arr_item_categories.includes(this.categories[j]._id)) {
                  this.reportData[i].categories_hin += this.categories[j].category_hin + ', ';
                  this.reportData[i].categories_eng += this.categories[j].category_eng + ', ';
                }
              }
            }
          }
          this.isLoader = false;
        }
      }, (err) => {
        console.log(err);
        this.isLoader = false;
        this.toastr.error(err.message)

      });
    } else {
      this.toastr.error('कम से कम एक MM और एक कन्डिशन को चुनना अनिवार्य है। ')
    }
  }

  exportToPDF() {
    let doc: any = new jsPDF();

    // add the font to jsPDF
    // doc.addFileToVFS("MangalFont.ttf", this.gs.aksharFont);
    doc.addFont("MangalFont.ttf", "MangalFont", "normal");
    doc.setFont("MangalFont");

    doc.setProperties({
      textEncoding: 'utf-8'
    });

    console.log(doc.getFontList());

    let data: any = [];
    for (let i in this.reportData) {
      let row: any = {
        sr_no: i,
        dept_code: this.reportData[i].dept_code,
        categories_eng: this.reportData[i].categories_eng,
        item_eng: this.reportData[i].item_eng,
        subitem_eng: this.reportData[i].subitem_eng,
        unit_short: this.reportData[i].unit_short,
      };
      for (let cn of this.filterBody.condition) {
        row[cn] = this.reportData[i][cn];
      }
      data.push(row)
    }
    let columns = [
      { header: 'Sr No', dataKey: 'sr_no' },
      { header: 'Dept', dataKey: 'dept_code' },
      { header: 'Category', dataKey: 'categories_eng' },
      { header: 'Item', dataKey: 'item_eng' },
      { header: 'Subitem', dataKey: 'subitem_eng' },
      { header: 'Unit', dataKey: 'unit_short' },
    ];
    for (let cn of this.filterBody.condition) {
      columns.push({ header: cn, dataKey: cn });
    }
    console.log(data);

    autoTable(doc, {
      // columnStyles: { europe: { halign: 'center' } }, // European countries centered
      body: data,
      columns: columns,
    })

    doc.save(this.auth.webUser.dept_code + "_" + this.reportHeading + '.pdf');
  }

  exportToExcelHin() {
    let data: any = []
    for (let i in this.reportData) {
      let row: any = {
        // sr_no: i,
        "डिपार्टमेंट": this.reportData[i].dept_hin,
        "केटेगरी": this.reportData[i].categories_hin,
        "आइटम": this.reportData[i].item_hin,
        "सबआइटम": this.reportData[i].subitem_hin,
        "यूनिट": this.reportData[i].unit_short,
      };
      for (let cn of this.filterBody.condition) {
        let cn_hin = this.conditions.find((c: { list_name_eng: any; }) => c.list_name_eng == cn).list_name_hin;
        row[cn_hin ? cn_hin : cn] = this.reportData[i][cn];
      }
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_code + "_" + this.reportHeading);
  }

  exportToExcelEng() {
    let data: any = []
    for (let i in this.reportData) {
      let row: any = {
        // sr_no: i,
        Department: this.reportData[i].dept_eng,
        Category: this.reportData[i].categories_eng,
        Item: this.reportData[i].item_eng,
        Subitem: this.reportData[i].subitem_eng,
        Unit: this.reportData[i].unit_short,
      };
      for (let cn of this.filterBody.condition) {
        row[cn] = this.reportData[i][cn];
      }
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_eng + "_" + this.reportHeading);
  }
}
