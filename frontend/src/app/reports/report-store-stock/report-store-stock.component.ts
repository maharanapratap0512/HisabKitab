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
  mms: any = [];
  selectedMms: any = [];
  categories: any = [];
  items: any = [];
  mm_types: any = [];

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
      this.categories = result.category ? result.category : [];
      this.mm_types = result.mm_type ? result.mm_type : [];
      this.items = result.itemmix ? result.itemmix : [];

      this.isLoader = false;
      // this.searchReports();
    });


  }

  mmTypeSelected(ev: any) {

    this.mms = this.gs.Lists.mm.filter((m: { mm_type: any; }) => m.mm_type == ev);
    if (['store', 'khet', 'stock'].includes(ev.toLowerCase())) {
      this.filterBody.mm_id = this.mms.map((m: { _id: any; }) => m._id);
    } else {
      this.filterBody.mm_id = [];
    }
  }

  setHeading() {
    this.reportHeading = ''
    for (let mm of this.mms.filter((s: { _id: any; }) => this.filterBody.mm_id.includes(s._id))) {
      this.reportHeading += mm.mm_hin + ",";
    }
    this.reportHeading += ' का हाल का स्टॉक';
  }

  searchReports() {
    if (this.filterBody.mm_id && this.filterBody.mm_id.length > 0) {

      this.loadingStatus = 'Generating Report....'
      this.isLoader = true;
      this.http.put(this.api.getUrl('REPORT_STR_STK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
        if (data.success) {
          this.reportData = data.result;
          this.selectedMms = this.mms.filter((m: { _id: any; }) => this.filterBody.mm_id.includes(m._id));
          this.setHeading();
          for (let i in this.reportData) {
            this.reportData[i].categories_hin = '';
            this.reportData[i].categories_eng = '';

            let arr_mm_id = typeof this.reportData[i].arr_mm_id === 'string' ? JSON.parse(this.reportData[i].arr_mm_id) : this.reportData[i].arr_mm_id;
            let arr_mm_stock = typeof this.reportData[i].arr_mm_stock === 'string' ? JSON.parse(this.reportData[i].arr_mm_stock) : this.reportData[i].arr_mm_stock;

            for (let mm of this.selectedMms) {
              let idx = arr_mm_id.indexOf(mm._id);
              this.reportData[i]['mm_' + mm._id] = idx !== -1 ? arr_mm_stock[idx] : 0;
            }

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
      }, (err: any) => {
        console.log(err);
        this.isLoader = false;
        this.toastr.error(err.message)

      });
    } else {
      this.toastr.error('कम से कम एक MM को चुनना अनिवार्य है। ')
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
      for (let mm of this.selectedMms) {
        row['mm_' + mm._id] = this.reportData[i]['mm_' + mm._id];
      }
      row['total'] = this.reportData[i].Stock;
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
    for (let mm of this.selectedMms) {
      columns.push({ header: mm.mm_eng || mm.mm_hin, dataKey: 'mm_' + mm._id });
    }
    columns.push({ header: 'Total Qty', dataKey: 'total' });
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
      for (let mm of this.selectedMms) {
        row[mm.mm_hin] = this.reportData[i]['mm_' + mm._id];
      }
      row['कुल मात्रा'] = this.reportData[i].Stock;
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
      for (let mm of this.selectedMms) {
        row[mm.mm_eng || mm.mm_hin] = this.reportData[i]['mm_' + mm._id];
      }
      row['Total Qty'] = this.reportData[i].Stock;
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_eng + "_" + this.reportHeading);
  }
}
