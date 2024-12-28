import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
// import mangalFont from '../../../assets/MANGAL-normal.js'

@Component({
  selector: 'app-report-aj-check',
  templateUrl: './report-aj-check.component.html',
  styleUrls: ['./report-aj-check.component.scss']
})
export class ReportAjCheckComponent {

  isLoader: any = false;
  term: any;
  termAawak: any;
  termJawak: any;
  filterBody: any = {}
  months: any = [];
  monthsSel: any = [];
  departments: any = [];
  categories: any = [];
  mms: any = [];
  items: any = [];
  subitems: any = [];
  aawak_sources: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  usage_lists: any = [];
  conditions: any = [];


  reportData: any = [];
  aawaks: any = [];
  jawaks: any = [];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService) {

  }

  ngOnInit(): void {
    this.spinner.show();

    this.gs.observeList().subscribe(result => {
      this.departments = result.department ? result.department : [];
      this.categories = result.category ? result.category : [];
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.aawak_sources = result.aawak_source ? result.aawak_source : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.aawak_types = result.jawak_type ? result.jawak_type : [];
      this.usage_lists = result.usage_list ? result.usage_list : [];
      this.conditions = result.condition ? result.condition : [];
    });

    // this.filterBody = {
    //   months: [12],
    //   year: 2022
    // }
    // this.searchReports();

  }

  searchReports() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('REPORT_AJ_CH'), this.filterBody).subscribe((data: any) => {
      if (data.success) {
        this.reportData = data.result;

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
        aawak_type_eng: this.reportData[i].aawak_type_eng,
        unit_short: this.reportData[i].unit_short,
      };
      for (let j in this.monthsSel) {
        row[this.monthsSel[j].name] = this.reportData[i].arr_sum_qty[j];
      }
      data.push(row)
    }
    let columns = [
      { header: 'Sr No', dataKey: 'sr_no' },
      { header: 'Dept', dataKey: 'dept_code' },
      { header: 'Category', dataKey: 'categories_eng' },
      { header: 'Item', dataKey: 'item_eng' },
      { header: 'Subitem', dataKey: 'subitem_eng' },
      { header: 'Aawak Type', dataKey: 'aawak_type_eng' },
      { header: 'Unit', dataKey: 'unit_short' },
    ];
    for (let mn of this.monthsSel) {
      columns.push({ header: mn.name + '-' + this.filterBody.year, dataKey: mn.name });
    }
    console.log(data);

    autoTable(doc, {
      columnStyles: { europe: { halign: 'center' } }, // European countries centered
      body: data,
      columns: columns,
    })

    doc.save(this.auth.webUser.dept_code + '_आवक_टाइप_सार_' + this.monthsSel[0].name_hin + " से " + this.monthsSel[this.monthsSel.length - 1].name_hin + '-' + this.filterBody.year + '.pdf');
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
        "आवक टाइप": this.reportData[i].aawak_type_hin,
        "यूनिट": this.reportData[i].unit_short,
      };
      for (let j in this.monthsSel) {
        row[this.monthsSel[j].name_hin + '-' + this.filterBody.year] = this.reportData[i].arr_sum_qty[j];
      }
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_code + '_आवक_टाइप_सार_' + this.monthsSel[0].name_hin + " से " + this.monthsSel[this.monthsSel.length - 1].name_hin + '-' + this.filterBody.year);
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
        "Aawak Type": this.reportData[i].aawak_type_eng,
        Unit: this.reportData[i].unit_short,
      };
      for (let j in this.monthsSel) {
        row[this.monthsSel[j].name + '-' + this.filterBody.year] = this.reportData[i].arr_sum_qty[j];
      }
      data.push(row)
    }
    this.excelExportService.exportAsExcelFile(data, this.auth.webUser.dept_eng + '_Aawak_Type_Saar_' + this.monthsSel[0].name + " to " + this.monthsSel[this.monthsSel.length - 1].name + '-' + this.filterBody.year);
  }
}
