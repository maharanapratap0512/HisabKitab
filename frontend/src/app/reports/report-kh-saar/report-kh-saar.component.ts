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
  selector: 'app-report-kh-saar',
  templateUrl: './report-kh-saar.component.html',
  styleUrls: ['./report-kh-saar.component.scss']
})
export class ReportKhSaarComponent {
  isLoader: any = false;
  loadingStatus: any = 'मैं आत्मा शांत स्वरूप हूँ ।';
  reportHeading: any = '';
  term: any;
  filterBody: any = {}
  months: any = [];
  monthsSel: any = [];
  khets: any = [];
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

      this.khets = this.mms.filter((m: { dept_id: any; }) => m.dept_id == 4);
      // this.filterBody.condition = this.conditions.map((c: { list_name_eng: any; }) => c.list_name_eng)
      this.filterBody.mm_id = this.khets.map((s: { _id: any; }) => s._id)
      this.isLoader = false;
      this.searchReports();
    });


  }

  setHeading() {
    this.reportHeading = ''
    for (let mm of this.reportData) {
      this.reportHeading += mm.mm_hin + ",";
    }
    if (this.filterBody.year && this.filterBody.month) {
      this.reportHeading += ' का ' + this.filterBody.year + '-' + this.months[this.filterBody.month - 1].name_hin + " का आवक"
    } else if (this.filterBody.year) {
      this.reportHeading += ' का ' + this.filterBody.year + " का आवक"
    } else {
      this.reportHeading += ' का अब तक का आवक';
    }
  }

  searchReports() {
    if (this.filterBody.mm_id.length > 0) {

      this.loadingStatus = 'Generating Report....'
      this.isLoader = true;
      this.http.put(this.api.getUrl('REPORT_KH') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
        if (data.success) {
          this.reportData = data.result;
          this.setHeading();
          for (let i in this.reportData) {
            for (let k in this.reportData[i].itemData) {
              this.reportData[i].itemData[k].categories_hin = '';
              this.reportData[i].itemData[k].categories_eng = '';
              if (this.reportData[i].itemData[k].arr_subitem_categories && this.reportData[i].itemData[k].arr_subitem_categories.length > 0) {
                for (let j in this.categories) {
                  if (this.reportData[i].itemData[k].arr_subitem_categories.includes(this.categories[j]._id)) {
                    this.reportData[i].itemData[k].categories_hin += this.categories[j].category_hin + ', ';
                    this.reportData[i].itemData[k].categories_eng += this.categories[j].category_eng + ', ';
                  }
                }
              } else {
                for (let j in this.categories) {

                  if (this.reportData[i].itemData[k].arr_item_categories.includes(this.categories[j]._id)) {
                    this.reportData[i].itemData[k].categories_hin += this.categories[j].category_hin + ', ';
                    this.reportData[i].itemData[k].categories_eng += this.categories[j].category_eng + ', ';
                  }
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

    // add the font to jsPDF
    doc.addFileToVFS("MangalFont.ttf", this.gs.aksharFont);
    doc.addFont("MangalFont.ttf", "MangalFont", "normal");
    doc.setFont("MangalFont");

    doc.setProperties({
      textEncoding: 'utf-8'
    });

    console.log(doc.getFontList());

    let data: any = [];
    let count = 1;
    for (let i in this.reportData) {
      for (let j in this.reportData[i].itemData) {
        let row: any = {
          sr_no: count++,
          dept_code: this.reportData[i].itemData[j].dept_code,
          khet_name: this.reportData[i].mm_eng,
          categories_eng: this.reportData[i].itemData[j].categories_eng,
          item_eng: this.reportData[i].itemData[j].item_eng,
          subitem_eng: this.reportData[i].itemData[j].subitem_eng,
          unit_short: this.reportData[i].itemData[j].unit_short,
          sum_qty: this.reportData[i].itemData[j].sum_qty,
          sum_amt: this.reportData[i].itemData[j].sum_amt,
        };
        data.push(row)
      }
      let row: any = {
        sr_no: '#',
        dept_code: '---',
        khet_name: this.reportData[i].mm_eng,
        categories_eng: '-----',
        item_eng: '-----',
        subitem_eng: '--TOTAL--',
        unit_short: '-----',
        sum_qty: '-----',
        sum_amt: (this.reportData[i].total_amt ? this.reportData[i].total_amt : 0) + ' INR',
      };
      data.push(row)
    }
    let columns = [
      { header: 'Sr No', dataKey: 'sr_no' },
      { header: 'Dept', dataKey: 'dept_code' },
      { header: 'Khet Name', dataKey: 'khet_name' },
      { header: 'Category', dataKey: 'categories_eng' },
      { header: 'Item', dataKey: 'item_eng' },
      { header: 'Subitem', dataKey: 'subitem_eng' },
      { header: 'Unit', dataKey: 'unit_short' },
      { header: 'Qty', dataKey: 'sum_qty' },
      { header: 'Amount', dataKey: 'sum_amt' },
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
      for (let j in this.reportData[i].itemData) {
        let row: any = {
          sr_no: count++,
          dept_code: this.reportData[i].itemData[j].dept_code,
          khet_name: this.reportData[i].mm_hin,
          categories_hin: this.reportData[i].itemData[j].categories_hin,
          item_hin: this.reportData[i].itemData[j].item_hin,
          subitem_hin: this.reportData[i].itemData[j].subitem_hin,
          unit_short: this.reportData[i].itemData[j].unit_short,
          sum_qty: this.reportData[i].itemData[j].sum_qty,
          sum_amt: this.reportData[i].itemData[j].sum_amt,
        };
        data.push(row)
      }
      let row: any = {
        sr_no: '#',
        dept_code: '---',
        khet_name: this.reportData[i].mm_hin,
        categories_hin: '-----',
        item_hin: '-----',
        subitem_hin: '--TOTAL--',
        unit_short: '-----',
        sum_qty: '-----',
        sum_amt: (this.reportData[i].total_amt ? this.reportData[i].total_amt : 0) + ' INR',
      };
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_code + "_" + this.reportHeading);
  }

  exportToExcelEng() {
    let data: any = [];
    let count = 1;
    for (let i in this.reportData) {
      for (let j in this.reportData[i].itemData) {
        let row: any = {
          sr_no: count++,
          dept_code: this.reportData[i].itemData[j].dept_code,
          khet_name: this.reportData[i].mm_eng,
          categories_eng: this.reportData[i].itemData[j].categories_eng,
          item_eng: this.reportData[i].itemData[j].item_eng,
          subitem_eng: this.reportData[i].itemData[j].subitem_eng,
          unit_short: this.reportData[i].itemData[j].unit_short,
          sum_qty: this.reportData[i].itemData[j].sum_qty,
          sum_amt: this.reportData[i].itemData[j].sum_amt,
        };
        data.push(row)
      }
      let row: any = {
        sr_no: '#',
        dept_code: '---',
        khet_name: this.reportData[i].mm_eng,
        categories_eng: '-----',
        item_eng: '-----',
        subitem_eng: '--TOTAL--',
        unit_short: '-----',
        sum_qty: '-----',
        sum_amt: (this.reportData[i].total_amt ? this.reportData[i].total_amt : 0) + ' INR',
      };
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_eng + "_" + this.reportHeading);
  }
}
