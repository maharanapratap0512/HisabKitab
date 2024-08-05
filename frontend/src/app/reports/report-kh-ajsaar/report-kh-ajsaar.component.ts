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
  selector: 'app-report-kh-ajsaar',
  templateUrl: './report-kh-ajsaar.component.html',
  styleUrls: ['./report-kh-ajsaar.component.scss']
})
export class ReportKhAjsaarComponent {

  isLoader: any = false;
  loadingStatus: any = 'मैं आत्मा शांत स्वरूप हूँ ।';
  reportHeading: any = '';
  term: any;
  filterBody: any = {}
  months: any = [];
  monthsSel: any = [];
  khets: any = [];
  items: any = [];
  subitems: any = [];
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
      this.items = result.itemmix ? result.itemmix : [];
      this.conditions = result.condition ? result.condition : [];
      this.categories = result.category ? result.category : [];

      this.khets = this.mms.filter((m: { dept_id: any; }) => m.dept_id == 4);
      // this.filterBody.condition = this.conditions.map((c: { list_name_eng: any; }) => c.list_name_eng)
      // this.filterBody.mm_id = this.khets.map((s: { _id: any; }) => s._id)
      this.isLoader = false;
      this.searchReports();
    });


  }

  setHeading() {
    this.reportHeading = ''
    let khet = this.khets.find((k: { _id: any; }) => k._id == this.filterBody.mm_id);
    this.reportHeading = khet.mm_hin;
    if (this.filterBody.year && this.filterBody.month) {
      this.reportHeading += ' का ' + this.filterBody.year + '-' + this.months[this.filterBody.month - 1].name_hin + " का आवक जावक सार"
    } else if (this.filterBody.year) {
      this.reportHeading += ' का ' + this.filterBody.year + " का आवक जावक सार"
    } else {
      this.reportHeading += ' का अब तक का आवक जावक सार';
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      if (item) {
        this.subitems = item.subitems;
      }
    } else {
      this.subitems = [];
      this.filterBody.subitem_id = null;
    }
  }

  searchReports() {
    if (this.filterBody.mm_id) {

      this.loadingStatus = 'Generating Report....'
      this.isLoader = true;
      this.http.put(this.api.getUrl('REPORT_KH_AJS') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
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
      this.toastr.error('कम से कम एक खेत को चुनना अनिवार्य है। ')
    }
  }

  exportToPDF() {
    let doc: any = new jsPDF();

    doc.setProperties({
      textEncoding: 'utf-8'
    });

    let data: any = [];
    let count = 1;
    for (let i in this.reportData) {
      for (let q in this.reportData[i].arr_sum_qty) {
        data.push({
          sr_no: count++,
          dept_code: this.reportData[i].dept_code,
          categories_eng: this.reportData[i].categories_eng,
          item_eng: this.reportData[i].item_eng,
          subitem_eng: this.reportData[i].subitem_eng,
          state: '',
          khet_name: '',
          sum_qty: this.reportData[i].arr_sum_qty[q],
          unit_short: this.reportData[i].arr_unit_short[q]
        });
      }
      for (let j in this.reportData[i].jawakData) {
        let row: any = {
          sr_no: '#',
          dept_code: '',
          categories_eng: '',
          item_eng: '',
          subitem_eng: '',
          state: this.reportData[i].jawakData[j].state_eng,
          khet_name: this.reportData[i].jawakData[j].mm_eng,
          sum_qty: this.reportData[i].jawakData[j].sum_qty,
          unit_short: this.reportData[i].jawakData[j].unit_short,
        };
        data.push(row)
      }
      let row: any = {
        sr_no: '###',
        dept_code: '-----',
        categories_eng: '--------',
        item_eng: '--------',
        subitem_eng: '-----',
        state: '-----',
        khet_name: '--------',
        sum_qty: '-----',
        unit_short: '###',
      };
      data.push(row)
    }
    let columns = [
      { header: 'Sr No', dataKey: 'sr_no' },
      { header: 'Dept', dataKey: 'dept_code' },
      { header: 'Category', dataKey: 'categories_eng' },
      { header: 'Item', dataKey: 'item_eng' },
      { header: 'Subitem', dataKey: 'subitem_eng' },
      { header: 'State', dataKey: 'state' },
      { header: 'Khet Name', dataKey: 'khet_name' },
      { header: 'Qty', dataKey: 'sum_qty' },
      { header: 'Unit', dataKey: 'unit_short' },
    ];
    console.log(data);

    autoTable(doc, {
      // columnStyles: { europe: { halign: 'center' } }, // European countries centered
      body: data,
      columns: columns,
    })

    doc.save(this.auth.webUser.dept_code + "_" + this.reportHeading + '.pdf');
  }

  exportToExcelHin() {
    let data: any = [];
    let count = 1;
    for (let i in this.reportData) {
      for (let q in this.reportData[i].arr_sum_qty) {
        data.push({
          sr_no: count++,
          dept_code: this.reportData[i].dept_code,
          categories_hin: this.reportData[i].categories_hin,
          item_hin: this.reportData[i].item_hin,
          subitem_hin: this.reportData[i].subitem_hin,
          state: '',
          khet_name: '',
          sum_qty: this.reportData[i].arr_sum_qty[q],
          unit_short: this.reportData[i].arr_unit_short[q]
        });
      }
      for (let j in this.reportData[i].jawakData) {
        let row: any = {
          sr_no: '#',
          dept_code: '',
          categories_hin: '',
          item_hin: '',
          subitem_hin: '',
          state: this.reportData[i].jawakData[j].state_hin,
          khet_name: this.reportData[i].jawakData[j].mm_hin,
          sum_qty: this.reportData[i].jawakData[j].sum_qty,
          unit_short: this.reportData[i].jawakData[j].unit_short,
        };
        data.push(row)
      }
      let row: any = {
        sr_no: '###',
        dept_code: '-----',
        categories_hin: '--------',
        item_hin: '--------',
        subitem_hin: '-----',
        state: '-----',
        khet_name: '--------',
        sum_qty: '-----',
        unit_short: '###',
      };
      data.push(row)

    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_code + "_" + this.reportHeading);
  }

  exportToExcelEng() {
    let data: any = [];
    let count = 1;
    for (let i in this.reportData) {
      for (let q in this.reportData[i].arr_sum_qty) {
        data.push({
          sr_no: count++,
          dept_code: this.reportData[i].dept_code,
          categories_eng: this.reportData[i].categories_eng,
          item_eng: this.reportData[i].item_eng,
          subitem_eng: this.reportData[i].subitem_eng,
          state: '',
          khet_name: '',
          sum_qty: this.reportData[i].arr_sum_qty[q],
          unit_short: this.reportData[i].arr_unit_short[q]
        });
      }
      for (let j in this.reportData[i].jawakData) {
        let row: any = {
          sr_no: '#',
          dept_code: '',
          categories_eng: '',
          item_eng: '',
          subitem_eng: '',
          state: this.reportData[i].jawakData[j].state_eng,
          khet_name: this.reportData[i].jawakData[j].mm_eng,
          sum_qty: this.reportData[i].jawakData[j].sum_qty,
          unit_short: this.reportData[i].jawakData[j].unit_short,
        };
        data.push(row)
      }
      let row: any = {
        sr_no: '###',
        dept_code: '-----',
        categories_eng: '--------',
        item_eng: '--------',
        subitem_eng: '-----',
        state: '-----',
        khet_name: '--------',
        sum_qty: '-----',
        unit_short: '###',
      };
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_code + "_" + this.reportHeading);
  }
}
