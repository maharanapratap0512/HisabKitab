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
  itemPerPage: any = 100;
  pageAwk: any = 1;
  pageJwk: any = 1;
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
  settings: any = [];

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

    this.settings = this.auth.webUser.settings;

    this.filterBody = {
      mm_id: this.auth.webUser.defaultMM
    }
    this.searchReports();

  }

  categorySelected(ev: any) {
    // Left empty: Items will be resolved automatically when Generate Report is clicked and items list is empty.
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
    this.isLoader = true;
    let body = { ...this.filterBody };

    // Auto-select items if category is chosen but item list is empty
    if ((!body.item_subitem_ids || body.item_subitem_ids.length === 0) && body.category_id) {
      body.item_subitem_ids = this.getCategoryItems(body.category_id);
    }

    this.http.put(this.api.getUrl('REPORT_AJ_CH'), body).subscribe((data: any) => {
      if (data.success) {
        this.aawaks = data.aawaks;
        this.jawaks = data.jawaks;

        const parseCategories = (row: any) => {
          row.categories_hin = '';
          row.categories_eng = '';
          let itemCatIds = [];
          if (row.scategories) {
            try {
              let sc = typeof row.scategories === 'string' ? JSON.parse(row.scategories) : row.scategories;
              itemCatIds = sc.map((c: any) => typeof c === 'object' ? c._id : c);
            } catch(e){}
          }
          if ((!itemCatIds || itemCatIds.length === 0) && row.icategories) {
            try {
              let ic = typeof row.icategories === 'string' ? JSON.parse(row.icategories) : row.icategories;
              itemCatIds = ic.map((c: any) => typeof c === 'object' ? c._id : c);
            } catch(e){}
          }
          if (itemCatIds && itemCatIds.length > 0) {
            let hinArr = [];
            let engArr = [];
            for (let id of itemCatIds) {
              let cat = this.categories.find((c: any) => c._id == id);
              if (cat) {
                hinArr.push(cat.category_hin);
                engArr.push(cat.category_eng);
              }
            }
            row.categories_hin = hinArr.join(', ');
            row.categories_eng = engArr.join(', ');
          }
        };

        for (let row of this.aawaks) {
          parseCategories(row);
        }
        for (let row of this.jawaks) {
          parseCategories(row);
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

  exportToPDF(aj: string) {
    let doc: any = new jsPDF();

    doc.setProperties({
      textEncoding: 'utf-8'
    });

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

  exportAawakToExcel() {
    let data: any = []
    for (let i in this.aawaks) {
      let row: any = {
        "तारीख": this.aawaks[i].date,
        "लॉट नं.": this.aawaks[i].lot_no,
        "पैकेट नं.": this.aawaks[i].pkt_num,
        "कहाँ से आया": this.aawaks[i].aawak_mm_hin,
        "किसने दिया": (this.aawaks[i].roll_no ? this.aawaks[i].roll_no + ' ' : '') + (this.aawaks[i].pbk_hin ? this.aawaks[i].pbk_hin : ''),
        "आइटम - सबआइटम": this.aawaks[i].item_hin + (this.aawaks[i].subitem_hin ? '(' + this.aawaks[i].subitem_hin + ')' : ''),
        "कन्डिशन": this.aawaks[i].condition_hin,
        "क्वानटिटी": this.aawaks[i].qty,
        "यूनिट": this.aawaks[i].unit_short,
        "रेट": this.aawaks[i].rate,
        "अमाउन्ट": this.aawaks[i].actual_amt,
        "आवक सोर्स": this.aawaks[i].aawak_source_hin,
        "आवक टाइप": this.aawaks[i].aawak_type_hin,
        "उसेज": this.aawaks[i].usage_list_hin,
        "आइटम डीटेल": this.aawaks[i].item_detail,
        "डिस्क्रिप्शन": this.aawaks[i].description,
      };
      data.push(row)
    }
    this.excelExportService.addSheet(data, 'आवक');
  }

  exportJawakToExcel() {
    let data: any = []
    for (let i in this.jawaks) {
      let row: any = {
        "तारीख": this.jawaks[i].date,
        "लॉट नं.": this.jawaks[i].lot_no,
        "पैकेट नं.": this.jawaks[i].pkt_num,
        "कहाँ भेजा": this.jawaks[i].jawak_mm_hin,
        "किसको दिया": (this.jawaks[i].roll_no ? this.jawaks[i].roll_no + ' ' : '') + (this.jawaks[i].pbk_hin ? this.jawaks[i].pbk_hin : ''),
        "आइटम - सबआइटम": this.jawaks[i].item_hin + (this.jawaks[i].subitem_hin ? '(' + this.jawaks[i].subitem_hin + ')' : ''),
        "कन्डिशन": this.jawaks[i].condition_hin,
        "क्वानटिटी": this.jawaks[i].qty,
        "यूनिट": this.jawaks[i].unit_short,
        "रेट": this.jawaks[i].rate,
        "अमाउन्ट": this.jawaks[i].actual_amt,
        "आवक सोर्स": this.jawaks[i].aawak_source_hin,
        "जावक टाइप": this.jawaks[i].jawak_type_hin,
        "उसेज": this.jawaks[i].usage_list_hin,
        "आइटम डीटेल": this.jawaks[i].item_detail,
        "डिस्क्रिप्शन": this.jawaks[i].description,
      };
      data.push(row)
    }
    this.excelExportService.addSheet(data, 'जावक');
  }

  /**
    * Export AJ check to exccel
    * @params aj - indicate aawak, jawak, both.
    */
  async exportToExcel(aj: string = 'both') {
    let title = this.auth.webUser.dept_code || '' + '_आवक_जावक_चेक_';
    if (this.filterBody.date_from) {
      title += 'तारीख_' + this.filterBody.date_from + '_से_';
    }
    if (this.filterBody.date_to) {
      title += this.filterBody.date_to + '_तक_का';
    }
    switch (aj) {
      case 'aawak': await this.exportAawakToExcel();
        title += '_आवक';
        break;
      case 'jawak': await this.exportJawakToExcel();
        title += '_जावक';
        break;
      default:
        await this.exportAawakToExcel();
        await this.exportJawakToExcel();
        title += '_आवक_जावक';
    }

    this.excelExportService.saveAsExcel(title);


  }
  exportToExcelHin(aj: string) {
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

  exportToExcelEng(aj: string) {
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
