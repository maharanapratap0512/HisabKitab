
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { observable, Observable, of, Subject } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-aawak-new',
  templateUrl: './aawak-new.component.html',
  styleUrls: ['./aawak-new.component.scss']
})
export class AawakNewComponent implements OnInit {


  @ViewChild('TABLE') el!: ElementRef<HTMLInputElement>;
  page = 1;
  pageNo: any = 0;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;

  isLoader: boolean = false;
  term: any;
  bunch_entry: any = false;
  showModal: string = '';
  editData: any = {};
  aawakDraft: any = {};
  aawakData: any = [];
  aawakAll: any = [];
  total_count: any = 0;
  export_total_count: any = 0;
  allAJData: any = [];
  awkCount: any = 0;
  mms: any = [];
  viewData: any = [];
  items: any = [];
  nimitts: any = [];
  units: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  products: any = [];
  categories: any = [];
  usage_lists: any = [];
  isCondition: any = false;
  productsAll: any = [];
  states: any = [];
  baseurl: any;
  departments: any = [];
  filterBody: any = {
    type: 'aawak',
    pbk_id: [],
    month: null,
    year: null,
    date: null,
    mm_id: [],
    aj_mm_id: [],
    aawak_type_id: [],
    jawak_type_id: [],
    product_id: [],
    item_id: [],
    subitem_id: [],
    condition_id: [],
    pkt_num: null,
    nimitt_id: [],
    remaining_qty: false
  };
  cat: any;
  settings: any = {};
  exportAJdata$ = new Subject();
  currentYear: any;
  importForm: any = {
    type: null,
    date: null,
    pkt_num: null,
    item_detail: null,
    qty: null,
    rate: null,
    actual_amt: null,
    company_name: null,
    description: null,
    isbill: null,
    document: null,
    mm: null,
    mm_id: null,
    pbk: {},
    pbk_id: null,
    aj_mm: null,
    aj_mm_id: null,
    item: null,
    item_id: null,
    subitem: null,
    subitem_id: null,
    product: null,
    product_id: null,
    condition: null,
    condition_id: null,
    unit: null,
    unit_id: null,
    aj_type: null,
    aj_type_id: null,
    nimmit: null,
    nimmit_id: null,
    dept: null,
    dept_id: null,
    ref_id: null,
    jawak_detail: []
  }
  // importPending: any = false;
  dictionary: any = [];
  loadingStatus: any = "मैं आत्मा शांत स्वरूप हूँ ।";
  // months: any = [{no:1, name:'January'}]
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
  ) {
    this.settings = this.auth.webUser.settings;
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
    this.spinner.show();

    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.usage_lists = result.usage_list ? result.usage_list : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.products = result.product ? result.product : [];
      this.categories = result.category ? result.category : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });

    this.getaawakData();
    this.getProductData();
    this.gs.checkTempImport();
    this.getDictionary();
    this.baseurl = this.api.getUrl('BASE');
  }

  getProductData() {
    this.isLoader = true
    this.http.put(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id, {}).subscribe((data: any) => {
      if (data['result']) {
        this.products = data['result'];
        this.productsAll = data['result'];
        this.isLoader = false;
      }
    });
    this.isLoader = false;
  }

  getaawakData(pageNo: any = null) {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.http.put(this.api.getUrl('AAWAK') + "voucher/" + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.aawakAll = data['result'];
        for (let i in this.aawakAll) {
          for (let j in this.aawakAll[i].aawaks) {
            this.aawakAll[i].aawaks[j].categories_hin = '';
            this.aawakAll[i].aawaks[j].categories_eng = '';
            if (this.aawakAll[i].aawaks[j].scategories && this.aawakAll[i].aawaks[j].scategories.length > 0) {

              for (let k in this.categories) {
                if (this.aawakAll[i].aawaks[j].scategories.includes(this.categories[k]._id)) {
                  this.aawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.aawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            } else {
              for (let k in this.categories) {
                if (this.aawakAll[i].aawaks[j].icategories.includes(this.categories[k]._id)) {
                  this.aawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.aawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            }
          }
        }
        this.aawakData = this.aawakAll;
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getDictionary() {
    this.http.get(this.api.getUrl('DICT')).subscribe((data: any) => {
      this.dictionary = data['result'] || [];
    });
  }

  yearClick(year: any) {
    this.filterBody.year = year;
    this.pageNo = 0;
    this.getFilteredData();
  }

  getAawakPage(page: any = null) {
    if (page) {
      this.pageNo = page;
      this.getFilteredData();
    }
  }

  getFilteredData(pageNo: any = null) {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.filterBody.pageNo = this.pageNo;
    // AUTO select all mm if mm not selected and state selected for mm.
    if (!this.filterBody.mm_id.length && this.filterBody.mm_states) {
      this.filterBody.mm_id = this.mms.filter((m: { state_id: any; }) => this.filterBody.mm_states.includes(m.state_id)).map((mm: { _id: any; }) => mm._id);
    }
    // AUTO select all aawak mm if aawak mm not selected and aawak state selected for aawak mm.
    if (!this.filterBody.aj_mm_id.length && this.filterBody.awk_mm_states) {
      this.filterBody.aj_mm_id = this.mms.filter((m: { state_id: any; }) => this.filterBody.awk_mm_states.includes(m.state_id)).map((mm: { _id: any; }) => mm._id);
    }
    this.http.put(this.api.getUrl('AAWAK') + 'voucher/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.aawakAll = data['result'];
        for (let i in this.aawakAll) {
          for (let j in this.aawakAll[i].aawaks) {
            this.aawakAll[i].aawaks[j].categories_hin = '';
            this.aawakAll[i].aawaks[j].categories_eng = '';
            if (this.aawakAll[i].aawaks[j].scategories && this.aawakAll[i].aawaks[j].scategories.length > 0) {

              for (let k in this.categories) {
                if (this.aawakAll[i].aawaks[j].scategories.includes(this.categories[k]._id)) {
                  this.aawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.aawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            } else {
              for (let k in this.categories) {
                if (this.aawakAll[i].aawaks[j].icategories.includes(this.categories[k]._id)) {
                  this.aawakAll[i].aawaks[j].categories_hin += this.categories[k].category_hin + ', ';
                  this.aawakAll[i].aawaks[j].categories_eng += this.categories[k].category_eng + ', ';
                }
              }
            }
          }
        }
        this.aawakData = this.aawakAll;
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }


  getFilteredAawakData() {
    this.filterBody.type = 'aawak';
    this.pageNo = 0;
    this.getFilteredData();
  }

  getFilteredJawakData() {
    this.filterBody.type = 'jawak';
    this.pageNo = 0;
    this.getFilteredData();
  }

  async getJawakObj(awk: any) {
    let jawakArray: any = []
    // let bachat = res.qty;

    return jawakArray;
  }

  getCategoryString(obj: any): string {
    if (obj.categories && Array.isArray(obj.categories)) {
      return obj.categories.map((c: any) => c.category_hin).join(', ');
    } else if (obj.categories_hin && Array.isArray(obj.categories_hin)) {
      return obj.categories_hin.join(', ');
    }
    return '';
  }

  exportAJData() {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.pageNo = 0;
    this.allAJData = [];
    this.exportAJdata$ = new Subject();

    this.getMoreAJ();

    this.exportAJdata$.subscribe(async (result: any) => {
      // console.log("exportAJdata", result);
      for (let i = 0; i < result.length; i++) {
        let jawakArray = [];
        let jwkFooter: any = {
          'Qty': 0,
          'Amount': 0
        };
        for (let j in result[i].jawak_detail) {
          jawakArray.push({
            'Date': result[i].jawak_detail[j].date ? this.gs.formatDisplayDate(result[i].jawak_detail[j].date) : '-',
            'Pkt No': result[i].jawak_detail[j].pkt_num ? result[i].jawak_detail[j].pkt_num : '-',
            'Jawak MM': result[i].jawak_detail[j].jawak_mm_id ? result[i].jawak_detail[j].jawak_mm_hin : '-',
            'Usage List': result[i].jawak_detail[j].usage_list_id ? result[i].jawak_detail[j].usage_list_hin : '-',
            'Jawak Detail': result[i].jawak_detail[j].description ? result[i].jawak_detail[j].description : '-',
            'Kisko Diya': result[i].jawak_detail[j].nimitt_id ? result[i].jawak_detail[j].nimitt_hin + '(' + result[i].jawak_detail[j].nimitt_state_hin + ')' : '-',
            'Jawak Type': result[i].jawak_detail[j].jawak_type_id ? result[i].jawak_detail[j].jawak_type_hin : '-',
            'Qty': result[i].jawak_detail[j].qty ? result[i].jawak_detail[j].qty : '-',
            'Unit': result[i].jawak_detail[j].unit_id ? result[i].jawak_detail[j].unit_short : '-',
            'Rate': result[i].jawak_detail[j].rate ? result[i].jawak_detail[j].rate : '-',
            'Amount': result[i].jawak_detail[j].actual_amt ? result[i].jawak_detail[j].actual_amt : '-',
            'Kaha Repaired/Becha': result[i].jawak_detail[j].sell_repair_place ? result[i].jawak_detail[j].sell_repair_place : '-',
            'Parchi Kaha': result[i].jawak_detail[j].parchi_place ? result[i].jawak_detail[j].parchi_place : '-',
            // 'Bachat': bachat
          });
          // jwkFooter['Qty'] += result[i].jawak_detail[j].qty ? result[i].jawak_detail[j].qty : 0;
          jwkFooter['Amount'] += result[i].jawak_detail[j].actual_amt ? result[i].jawak_detail[j].actual_amt : 0;
        }
        jawakArray.push({
          'Date': '',
          'Pkt No': '',
          'Jawak MM': '',
          'Usage List': '',
          'Jawak Detail': '',
          'Kisko Diya': 'बचत =>',
          'Jawak Type': '',
          'Qty': result[i].remaining_qty ? result[i].remaining_qty : 0,
          'Unit': result[i].unit_id ? result[i].unit_short : '',
          'Rate': 'Total',
          'Amount': jwkFooter['Amount'],
          'Kaha Repaired/Becha': '',
          'Parchi Kaha': '',
        });
        let awkObj: any = {
          'No': i + 1,
          'Date': result[i].date ? this.gs.formatDisplayDate(result[i].date) : '-',
          'Pkt No': result[i].pkt_num ? result[i].pkt_num : '-',
          'MM': result[i].mm_hin,
          'Aawak MM': result[i].aawak_mm_id ? result[i].aawak_mm_hin : '-',
        };
        if (this.settings.aawak.pbk_id) {
          awkObj['Roll No'] = result[i].roll_no ? result[i].roll_no : '-';
          awkObj.Pbk = result[i].pbk_hin ? result[i].pbk_hin : '-';
          awkObj.Relation = result[i].relation ? result[i].relation : '-';
          awkObj.Relative = result[i].relative_name ? result[i].relative_name : '-';
        }

        let item = this.gs.Lists.itemmix.find((it: { _id: any; }) => it._id == result[i].item_id);
        let cat = item ? this.getCategoryString(item) : '';
        if (item && result[i].subitem_id) {
          let subitem = item.subitems.find((s: { _id: any; }) => s._id == result[i].subitem_id);
          if (subitem) {
            cat = this.getCategoryString(subitem);
          }
        }
        awkObj = {
          ...awkObj,
          'Category': cat,
          'Item': result[i].item_id ? result[i].item_hin : '-',
          'Subitem': result[i].subitem_id ? result[i].subitem_hin : '-',
          'Product Code': result[i].product_code ? result[i].product_code : '-',
          'Sr No': result[i].sr_num ? result[i].sr_num : '-',
          'Company': result[i].company_name ? result[i].company_name : '-',
          'Condition': result[i].condition_id ? result[i].condition_hin : '-',
          'Bill': result[i].isbill ? 'है' : '-',
          'Qty': result[i].qty ? result[i].qty : '-',
          'Unit': result[i].unit_id ? result[i].unit_short : '-',
          'Amount': result[i].actual_amt ? result[i].actual_amt : '-',
          'Aawak Type': result[i].aawak_type_id ? result[i].aawak_type_hin : '-',
          'Item Detail': result[i].item_detail ? result[i].item_detail : '-',
          'Description': result[i].description ? result[i].description : '-',
          // 'बचत':result[i].remaining_qty ? result[i].remaining_qty : 0,       
          'Jawak Detail': jawakArray,
        };
        this.allAJData.push(awkObj);
      }

      this.loadingStatus = `डाटा प्रोसेस हो रहा है... (${this.allAJData.length} / ${this.total_count})`;
      if (this.allAJData.length < this.total_count) {
        this.getMoreAJ();
      }
      else {
        // console.log(this.allAJData);

        this.export(this.allAJData);
        this.isLoader = false;
      }
    });
  }

  exportPendingData() {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.pageNo = 0;
    this.allAJData = [];
    this.exportAJdata$ = new Subject();

    this.filterBody.remaining_qty = true;
    this.getMoreAJ();

    this.exportAJdata$.subscribe(async (result: any) => {

      for (let i = 0; i < result.length; i++) {
        let jawakArray = [];
        jawakArray.push({
          'Date': '',
          'Pkt No': '',
          'Jawak MM': '',
          'Usage List': '',
          'Jawak Detail': '',
          'Kisko Diya': 'बचत =>',
          'Jawak Type': '',
          'Qty': result[i].remaining_qty ? result[i].remaining_qty : 0,
          'Unit': result[i].unit_id ? result[i].unit_short : '',
        });
        let awkObj: any = {
          '_id': result[i]._id,
          'No': i + 1,
          'Date': result[i].date ? this.gs.formatDisplayDate(result[i].date) : '-',
          'Pkt No': result[i].pkt_num ? result[i].pkt_num : '-',
          'MM': result[i].mm_hin,
          'Aawak MM': result[i].aawak_mm_id ? result[i].aawak_mm_hin : '-',
        };
        if (this.settings.aawak.pbk_id) {
          awkObj['Roll No'] = result[i].roll_no ? result[i].roll_no : '-';
          awkObj.Pbk = result[i].pbk_hin ? result[i].pbk_hin : '-';
          awkObj.Relation = result[i].relation ? result[i].relation : '-';
          awkObj.Relative = result[i].relative_name ? result[i].relative_name : '-';
        }

        let cat = '';
        let item = this.gs.Lists.itemmix.find((it: { _id: any; }) => it._id == result[i].item_id);
        if (item) {
          if (result[i].subitem_id) {
            let subitem = item.subitems.find((s: { _id: any; }) => s._id == result[i].subitem_id);
            if (subitem) {
              cat = this.getCategoryString(subitem);
            } else {
              cat = this.getCategoryString(item);
            }
          }
          else {
            cat = this.getCategoryString(item);
          }
        }
        awkObj = {
          ...awkObj,
          'Category': cat,
          'Item': result[i].item_id ? result[i].item_hin : '-',
          'Subitem': result[i].subitem_id ? result[i].subitem_hin : '-',
          'Product Code': result[i].product_code ? result[i].product_code : '-',
          'Sr No': result[i].sr_num ? result[i].sr_num : '-',
          'Company': result[i].company_name ? result[i].company_name : '-',
          'Condition': result[i].condition_id ? result[i].condition_hin : '-',
          'Bill': result[i].isbill ? 'है' : '-',
          'Qty': result[i].qty ? result[i].qty : '-',
          'Unit': result[i].unit_id ? result[i].unit_short : '-',
          'Amount': result[i].actual_amt ? result[i].actual_amt : '-',
          'Aawak Type': result[i].aawak_type_id ? result[i].aawak_type_hin : '-',
          'Item Detail': result[i].item_detail ? result[i].item_detail : '-',
          'Description': result[i].description ? result[i].description : '-',
          // 'बचत':result[i].remaining_qty ? result[i].remaining_qty : 0,       
          'Jawak Detail': jawakArray,
        };
        this.allAJData.push(awkObj);
      }

      this.loadingStatus = `डाटा प्रोसेस हो रहा है... (${this.allAJData.length} / ${this.export_total_count || this.total_count})`;
      if (this.allAJData.length < this.export_total_count) {
        this.getMoreAJ();
      }
      else {
        this.export(this.allAJData);
        this.isLoader = false;
      }
    });
  }

  exportAawakData() {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.pageNo = 0;
    this.allAJData = [];
    this.exportAJdata$ = new Subject();
    let footerRow: any = {
      'No.': '*',
      'Pkt No': 'Total',
      'Aawak MM': 0,
      'Qty': 0,
      'Amount': 0,
    }; // Object to store totals for footer
    let uniqueMM = new Set();
    let uniqueAawakMM = new Set();
    let uniqueUnit = new Set();

    this.getMoreAJ();

    this.exportAJdata$.subscribe(async (result: any) => {
      // console.log("exportAJdata", result);
      for (let i = 0; i < result.length; i++) {
        uniqueMM.add(result[i].mm_id);
        uniqueAawakMM.add(result[i].aawak_mm_id);
        uniqueUnit.add(result[i].unit_id);

        let awkObj: any = {
          'No': i + 1,
          'Date': result[i].date ? this.gs.formatDisplayDate(result[i].date) : '-',
          'Pkt No': result[i].pkt_num ? result[i].pkt_num : '-',
          'MM': result[i].mm_hin,
          'Aawak MM': result[i].aawak_mm_id ? result[i].aawak_mm_hin : '-',
        };
        if (this.settings.aawak.pbk_id) {
          awkObj['Roll No'] = result[i].roll_no ? result[i].roll_no : '-';
          awkObj.Pbk = result[i].pbk_hin ? result[i].pbk_hin : '-';
          awkObj.Relation = result[i].relation ? result[i].relation : '-';
          awkObj.Relative = result[i].relative_name ? result[i].relative_name : '-';
        }

        let cat = '';
        let item = this.gs.Lists.itemmix.find((it: { _id: any; }) => it._id == result[i].item_id);
        if (item) {
          if (result[i].subitem_id) {
            let subitem = item.subitems.find((s: { _id: any; }) => s._id == result[i].subitem_id);
            if (subitem) {
              cat = this.getCategoryString(subitem);
            } else {
              cat = this.getCategoryString(item);
            }
          }
          else {
            cat = this.getCategoryString(item);
          }
        }
        awkObj = {
          ...awkObj,
          'Category': cat,
          'Item': result[i].item_id ? result[i].item_hin : '-',
          'Subitem': result[i].subitem_id ? result[i].subitem_hin : '-',
          'Product Code': result[i].product_code ? result[i].product_code : '-',
          'Sr No': result[i].sr_num ? result[i].sr_num : '-',
          'Company': result[i].company_name ? result[i].company_name : '-',
          'Condition': result[i].condition_id ? result[i].condition_hin : '-',
          'Bill': result[i].isbill ? 'है' : '-',
          'Qty': result[i].qty ? result[i].qty : '-',
          'Unit': result[i].unit_id ? result[i].unit_short : '-',
          'Amount': result[i].actual_amt ? result[i].actual_amt : '-',
          'Aawak Type': result[i].aawak_type_id ? result[i].aawak_type_hin : '-',
          'Item Detail': result[i].item_detail ? result[i].item_detail : '-',
          'Description': result[i].description ? result[i].description : '-',
          // 'बचत':result[i].remaining_qty ? result[i].remaining_qty : 0,      
        };

        footerRow['Qty'] += result[i].qty ? result[i].qty : 0;
        footerRow['Amount'] += result[i].actual_amt ? result[i].actual_amt : 0;

        this.allAJData.push(awkObj);
      }

      this.loadingStatus = `डाटा प्रोसेस हो रहा है... (${this.allAJData.length} / ${this.total_count})`;
      if (this.allAJData.length < this.total_count) {
        this.getMoreAJ();
      }
      else {

        footerRow['MM'] = uniqueMM.size + 'MMs';
        footerRow['Aawak MM'] = uniqueAawakMM.size + 'MMs';
        footerRow['Unit'] = uniqueUnit.size + 'Units';
        this.allAJData.push(footerRow);

        let date = new Date();;
        this.excelExportService.exportAsExcelFile(this.allAJData, "Aawak_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
        this.isLoader = false;
      }
    });
  }
  exportJawakData() {
    this.isLoader = true;
    this.loadingStatus = "मैं आत्मा शांत स्वरूप हूँ ।";
    this.pageNo = 0;
    this.awkCount = 0;
    this.allAJData = [];
    this.exportAJdata$ = new Subject();
    let footerRow: any = {
      'No.': '*',
      'Pkt No': 'Total',
      'Aawak MM': 0,
      'Qty': 0,
      'Amount': 0,
    }; // Object to store totals for footer
    let uniqueMM = new Set();
    let uniqueJawakMM = new Set();
    let uniqueUnit = new Set();

    this.getMoreAJ();

    this.exportAJdata$.subscribe(async (result: any) => {
      for (let i = 0; i < result.length; i++) {
        uniqueMM.add(result[i].mm_id);

        let awkObj = {
          'MM': result[i].mm_hin,
          'Item': result[i].item_id ? result[i].item_hin : '-',
          'Subitem': result[i].subitem_id ? result[i].subitem_hin : '-',
          'Company': result[i].company_name ? result[i].company_name : '-',
        };

        for (let j in result[i].jawak_detail) {
          uniqueJawakMM.add(result[i].jawak_detail[j].jawak_mm_id);
          uniqueUnit.add(result[i].jawak_detail[j].unit_id);

          this.allAJData.push({
            'Date': result[i].jawak_detail[j].date ? this.gs.formatDisplayDate(result[i].jawak_detail[j].date) : '-',
            'Pkt No': result[i].jawak_detail[j].pkt_num ? result[i].jawak_detail[j].pkt_num : '-',
            ...awkObj,
            'Jawak MM': result[i].jawak_detail[j].jawak_mm_id ? result[i].jawak_detail[j].jawak_mm_hin : '-',
            'Usage List': result[i].jawak_detail[j].usage_list_id ? result[i].jawak_detail[j].usage_list_hin : '-',
            'Kisko Diya': result[i].jawak_detail[j].nimitt_id ? result[i].jawak_detail[j].nimitt_hin + '(' + result[i].jawak_detail[j].nimitt_state_hin + ')' : '-',
            'Jawak Type': result[i].jawak_detail[j].jawak_type_id ? result[i].jawak_detail[j].jawak_type_hin : '-',
            'Qty': result[i].jawak_detail[j].qty ? result[i].jawak_detail[j].qty : '-',
            'Unit': result[i].jawak_detail[j].unit_id ? result[i].jawak_detail[j].unit_short : '-',
            'Rate': result[i].jawak_detail[j].rate ? result[i].jawak_detail[j].rate : '-',
            'Amount': result[i].jawak_detail[j].actual_amt ? result[i].jawak_detail[j].actual_amt : '-',
            'Kaha Repaired/Becha': result[i].jawak_detail[j].sell_repair_place ? result[i].jawak_detail[j].sell_repair_place : '-',
            'Parchi Kaha': result[i].jawak_detail[j].parchi_place ? result[i].jawak_detail[j].parchi_place : '-',
            'Jawak Detail': result[i].jawak_detail[j].description ? result[i].jawak_detail[j].description : '-',
          });
          footerRow['Qty'] += result[i].jawak_detail[j].qty ? result[i].jawak_detail[j].qty : 0;
          footerRow['Amount'] += result[i].jawak_detail[j].actual_amt ? result[i].jawak_detail[j].actual_amt : 0;
        }
      }
      this.awkCount += result.length;
      this.loadingStatus = `डाटा प्रोसेस हो रहा है... (${this.awkCount} / ${this.total_count})`;

      if (this.awkCount < this.total_count) {
        this.getMoreAJ();
      }
      else {
        footerRow['MM'] = uniqueMM.size + ' MMs';
        footerRow['Unit'] = uniqueUnit.size + ' Units';
        footerRow['Jawak MM'] = uniqueJawakMM.size + ' Mms';
        this.allAJData.push(footerRow)
        let date = new Date();
        this.excelExportService.exportAsExcelFile(this.allAJData, "Jawak_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
        this.isLoader = false;
      }
    });
  }


  getMoreAJ() {
    // this.isLoader = true;
    this.filterBody.pageNo = this.pageNo + 1;
    this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data["result"].length) {
        if (data["pageNo"]) {
          this.pageNo = data["pageNo"];
          this.export_total_count = data['total_count'];
        }
        this.loadingStatus = `डाटा डाउनलोड हो रहा है... (API: ${this.pageNo})`;
        this.exportAJdata$.next(data['result']);
        // this.isLoader = false;
      }
      // this.isLoader = false;
    });
  }


  export(json: any) {
    // console.log("json", json);

    let date = new Date();
    let filename = "AJ_";
    if (this.filterBody.mm_id) {
      let mm = this.mms.find((m: { _id: any; }) => m._id == this.filterBody.mm_id);
      if (mm && mm.mm_hin) {
        filename += mm.mm_hin + "_";
      }
    }
    // console.log(this.auth.webUser.path + `\\` + filename + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());

    this.excelExportService.generateExcel(json, filename + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
    // this.excelExportService.exportAsExcelFile(json, 'AawakJawak');
    // this.excelExportService.exportAsExcelFile(this.el.nativeElement, 'AawakJawak');
  }


  aawakDeptSelected(ev: any) {
    if (ev) {
      this.aawakData = this.aawakAll.filter((aawak: { dept_id: any; }) => aawak.dept_id == ev);
    }
    else {
      this.aawakData = this.aawakAll;
    }
  }

  addAawakResponse(ev: any) {
    if (ev.length > 0 && ev[0]._id) {
      this.isLoader = true;
      // $('#showModal').modal('hide');
      // this.showModal = '';
      this.aawakData.unshift(ev[0]);
      this.isLoader = false;
    }
    else {
      // console.log(ev);

      this.aawakDraft = ev[0];
      this.toastr.info("Saved in Draft.");
    }
  }

  addAawakBunchResponse(ev: any) {

    if (ev.length > 0 && ev[0].voucher_no) {
      this.isLoader = true;
      this.aawakData.unshift(ev[0]);

      this.closeModal();
      this.isLoader = false;
    }
    else {
      // this.aawakDraft = ev[0];
      this.toastr.info("Saved in Draft.");
    }
  }

  editAawakResponse(ev: any) {
    if (ev.length > 0) {
      this.isLoader = true;
      this.closeModal();
      this.aawakData.splice(this.aawakData.indexOf(this.editData), 1, ev[0]);
      this.isLoader = false;
    }
    else {
      // this.toastr.error("Something went Wrong.")
      // console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.openModal('Edit Aawak');
  }

  delete(i: any, voucher_no: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "All aawaks in Bunch will be deleted, You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        let ids = await this.aawakData[i].aawaks.map((a: { _id: any; }) => a._id);
        console.log(ids);

        if (ids && ids.length > 0) {
          this.http.delete(this.api.getUrl('AAWAK') + '/voucher/' + JSON.stringify(ids)).subscribe((data: any) => {
            if (data['success']) {
              this.isLoader = false;
              this.aawakData.splice(i, 1);
              this.total_count -= 1;
              this.toastr.success('Deleted Successfully');
            }
            else {
              this.toastr.error(data['message']);
              this.isLoader = false;
            }
          });
        } else {
          this.toastr.error('Something went wrong.');
        }
      }
    })
  }

  deleteOne(i: any, j: any, id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {

        this.http.delete(this.api.getUrl('AAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.aawakData[i].aawaks.splice(j, 1);
            this.toastr.success('Deleted Successfully');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        });

      }
    })
  }

  // filter() {
  //   this.aawakData = this.aawakAll;
  //   for (let [key, value] of Object.entries(this.conditionObj)) {
  //     if (value)
  //       this.aawakData = this.aawakData.filter((b: any) => b[key] == value);
  //   }
  // }

  hlChanged(awk: any) {
    let body = { query: {}, set: {} };
    body.query = { _id: awk._id };
    body.set = { ...awk };
    this.http.put(this.api.getUrl('AAWAK') + 'new/', body).subscribe((data: any) => {
      if (data.success) {
        this.aawakData.splice(this.aawakData.indexOf((a: { _id: any; }) => a._id == data.result[0]._id), data.result[0])
      }
    });
  }

  hlFilter(ev: any) {
    if (ev.checked) {
      this.aawakData = this.aawakData.filter((a: { hl: boolean; }) => a.hl == true)
    } else {
      this.aawakData = this.aawakAll;
    }

  }

  addJawak(data: any) {
    this.editData = data;
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  getJawakQty(awk: any) {
    let qty = 0;
    if (awk.jawak_detail) {
      awk.jawak_detail.forEach((j: any) => {
        qty += j.qty;
      });
    }
    return qty;
  }

  showJawak(data: any) {
    if (typeof data == 'string') {
      this.http.get(this.api.getUrl('JAWAKBYAWK') + data).subscribe((res: any) => {
        if (res['result'] && res['success']) {
          this.viewData = res['result'];
          this.openModal('Show Jawak');
        }
      });
    } else {
      this.viewData = data.jawak_detail || [];
      this.openModal('Show Jawak');
    }
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    if (ev.aawak_ref_id) {
      let i = this.aawakData.findIndex((b: any) => b._id == ev.aawak_ref_id);
      this.aawakData[i].remaining_qty = (this.aawakData[i].remaining_qty ? this.aawakData[i].remaining_qty : 0) - ev.qty;
      this.aawakData[i].jawak_detail.push(ev);
      $('#showModal').modal('hide');
      this.showModal = '';
      // this.isLoader = false;
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');

  }

  closeModal() {
    this.showModal = "";
    $('#showModal').modal('hide');
  }

  stateSelected(ev: any) {
    if (ev)
      this.aawakData = this.aawakAll.filter((aawak: { state_id: any; }) => aawak.state_id == ev);
    else
      this.aawakData = this.aawakAll;
  }

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.gs.Lists.itemmix.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.gs.Lists.itemmix;
    }
  }

  itemSelected(ev: any) {
    if (ev) {

      let items = this.items.filter((i: { _id: any; }) => ev.includes(i._id));
      this.products = this.productsAll.filter((p: { item_id: any; }) => ev.includes(p.item_id));
      this.subitems = [];
      // console.log(items);

      if (this.cat) {
        for (let i in items) {
          this.subitems.push(...items[i].subitems.filter((s: { category_id: any; }) => s.category_id == this.cat));
        }
      }
      else {
        for (let i in items) {
          this.subitems.push(...items[i].subitems);
        }
      }
    }
    else {
      this.subitems = [];
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
    }
    else {
      this.products = this.productsAll;
    }
  }

  productSelected(ev: any) {
    this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
  }

  excelImport(ev: any) {
    let workBooks: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      this.isLoader = true;
      this.loadingStatus = "फाइल लोड की जा रही है ।";
      const data = reader.result;
      workBooks = XLSX.read(data, { type: 'binary' });
      jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBooks.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return initial;
      }, {});

      this.loadingStatus = "फाइल का अध्ययन किया जा रहा है।";
      // const dataString = JSON.stringify(jsonData);      
      let sheetdata = jsonData[workBooks.SheetNames[0]];
      let filterdata = sheetdata.filter((i: any) => (!i.includes("बचत =>")));
      let exceldata = filterdata.filter((i: any) => (i.length));
      let awakStart: any = 0, jawakStart: any = 0, startRow: any = 0;

      // let awkFail = false;
      for (let i = 0; i < exceldata.length; i++) {
        if (exceldata[i][0] && ['awk detail', 'awak detail', 'aawak detail', 'aawak', 'आवक'].includes(exceldata[i][0].toString().toLowerCase().trim())) {
          startRow = i;
          for (let k in exceldata[i]) {
            if (exceldata[i][k] && ['jwk detail', 'jawak detail', 'jawak', 'जावक'].includes(exceldata[i][k].toString().toLowerCase().trim())) {
              jawakStart = k;
              break;
            }
          }
          break;
        }
      }
      console.log("startRow", startRow);
      console.log("awakStart", awakStart);
      console.log("jawakStart", jawakStart);
      let finalJson: any = [];
      let columns = exceldata[startRow + 1].map((r: any) => (typeof r == "string" ? r.toLowerCase().trim() : r));

      console.log("columns", columns);
      // console.log("exceldata", exceldata);

      this.loadingStatus = "डाटा पढ़ा एवं सॉफ्टवेयर के डाटा से जोड़ा जा रहा है।";
      for (let i = startRow + 2; i < exceldata.length; i++) {

        // console.log("err", exceldata[i]);

        //aawak form
        var obj: any = {
          awk_id: null,
          type: null,
          date: null,
          pkt_num: null,
          item_detail: null,
          qty: null,
          rate: null,
          actual_amt: null,
          company_name: null,
          description: null,
          isbill: null,
          document: null,
          mm: null,
          mm_id: null,
          pbk: {},
          pbk_id: null,
          aj_mm: null,
          aj_mm_id: null,
          item: null,
          item_id: null,
          subitem: null,
          subitem_id: null,
          usage_list: null,
          usage_list_id: null,
          product: null,
          product_id: null,
          condition: null,
          condition_id: null,
          unit: null,
          unit_id: null,
          aj_type: null,
          aj_type_id: null,
          nimitt: null,
          nimitt_id: null,
          hl: null,
          dept: this.auth.webUser.dept_eng,
          dept_id: this.auth.webUser.dept_id,
          jawak_detail: []
        };
        //jawak form - reset every row, pbk is null until data is present
        let jwkobj: any = { pbk: null };

        //loop through element of row and separating to aawak and jawak form
        for (let j = 0; j < columns.length; j++) {
          //trim data if type string
          if (typeof exceldata[i][j] == "string") {
            exceldata[i][j] = exceldata[i][j].trim();
          }
          // set null if data id '', '-', or empty/undefine
          if (['', '-', undefined].includes(exceldata[i][j])) {
            exceldata[i][j] = null;
          }

          //for aawak value (0 to jawak start)
          if (j < jawakStart) {
            switch (columns[j]) {
              case "_id":
              case "awk_id":
                obj.awk_id = exceldata[i][j];
                break;
              case "mm": obj.mm = exceldata[i][j];

                let getmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(obj.mm));
                if (getmm) {
                  obj.mm_id = getmm._id;
                } else {
                  let dictmm = this.dictionary.find((d: any) => d.type == "mm" && d.name == obj.mm);
                  obj.mm_id = dictmm ? dictmm.id : null;
                }
                break;
              case "date": obj.date = exceldata[i][j];
                break;
              case "pkt no":
              case "pkt num":
              case "pkt_num":
              case "pkt": obj.pkt_num = exceldata[i][j] ? exceldata[i][j].toString() : exceldata[i][j];
                break;
              case "roll no":
              case "roll_no":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.roll_no = exceldata[i][j];
                  if (obj.pbk.roll_no) {
                    let getpbk = this.pbks.find((p: any) => p.roll_no == obj.pbk.roll_no);
                    obj.pbk_id = getpbk ? getpbk._id : null;
                  }
                }
                break;
              case "pbk":
              case "sewadhari":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.name = exceldata[i][j];
                }
                break;
              case "relation":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.relation = exceldata[i][j];
                }
                break;
              case "relative":
              case "relative_name":
              case "relative name":
                if (this.settings.aawak.pbk_id && exceldata[i][j]) {
                  obj.pbk.relative = exceldata[i][j];
                }
                break;
              case "item": obj.item = exceldata[i][j];
                let getitem = this.items.find((i: any) => [i.item_hin.trim(), i.item_eng, i.item_code].includes(obj.item));
                if (getitem) {
                  obj.item_id = getitem._id;
                } else {
                  let dictitem = this.dictionary.find((d: any) => d.type == "item" && d.name == obj.item && !d.extra_note)
                  obj.item_id = dictitem ? dictitem.id : null;
                }
                break;
              case "subitem": obj.subitem = exceldata[i][j];
                if (obj.item_id) {
                  let getitem = this.items.find((i: any) => i._id == obj.item_id);
                  let getsubitem = getitem.subitems.find((m: any) => [m.subitem_hin.trim(), m.subitem_eng, m.subitem_code].includes(obj.subitem));
                  obj.subitem_id = getsubitem ? getsubitem._id : null;
                }
                break;
              case "product":
              case "product_code":
              case "product code":
              case "serial no":
              case "sr no":
                if (this.settings.aawak.product_id) {
                  if (!obj.product) {
                    obj.product = exceldata[i][j];
                  }
                  if (!obj.product_id) {

                    let getproduct = this.productsAll.find((p: any) => [p.sr_no, p.product_code].includes(exceldata[i][j]));
                    obj.product_id = getproduct ? getproduct._id : null;
                  }
                }
                break;
              case "company":
              case "company name":
              case "company_name": obj.company_name = exceldata[i][j];
                break;
              case "condition":
                if (this.settings.aawak.condition_id) {
                  obj.condition = exceldata[i][j];
                  let getcondition = this.conditions.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(obj.condition));
                  if (getcondition) {
                    obj.condition_id = getcondition._id;
                  } else {
                    let dictcondition = this.dictionary.find((d: any) => d.type == "condition" && d.name == obj.condition)
                    obj.condition_id = dictcondition ? dictcondition.id : null;
                  }
                }
                break;
              case "aawak mm":
              case "aawak_mm":
              case "awk_mm":
              case "awk mm": obj.aj_mm = exceldata[i][j];
                let getawkmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(obj.aj_mm));
                if (getawkmm) {
                  obj.aj_mm_id = getawkmm._id;
                } else {
                  let dictaj_mm = this.dictionary.find((d: any) => d.type == "aj_mm" && d.name == obj.aj_mm)
                  obj.aj_mm_id = dictaj_mm ? dictaj_mm.id : null;
                }
                break;
              case "aawak type":
              case "awk type":
              case "awk_type":
              case "aawak_type": obj.aj_type = exceldata[i][j];
                let getaawak_type = this.aawak_types.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(obj.aj_type));
                if (getaawak_type) {
                  obj.aj_type_id = getaawak_type._id;
                } else {
                  let dictaj_type = this.dictionary.find((d: any) => d.type == "awk_type" && d.name == obj.aj_type)
                  obj.aj_type_id = dictaj_type ? dictaj_type.id : null;
                }
                break;
              case "qty":
              case "quantity": obj.qty = exceldata[i][j];
                break;
              case "price":
              case "rate": obj.rate = exceldata[i][j];
                break;
              case "amt":
              case "amount":
              case "actual amt":
              case "actual_amt": obj.actual_amt = exceldata[i][j];
                break;
              case "unit": obj.unit = exceldata[i][j] ? exceldata[i][j].toLowerCase() : exceldata[i][j];
                let getunit = this.units.find((u: any) => [u.unit_short, u.unit_full.toLowerCase()].includes(obj.unit));
                if (getunit) {
                  obj.unit_id = getunit._id;
                } else {
                  let dictunit = this.dictionary.find((d: any) => d.type == "unit" && d.name == obj.unit)
                  obj.unit_id = dictunit ? dictunit.id : null;
                }
                break;
              case "bill":
                if (this.settings.aawak.isbill) {
                  if ([true, 'true', 'yes', 1, 'है', 'हाँ', 'hai', 'ha'].includes((typeof exceldata[i][j] == "string" ? exceldata[i][j].trim().toLowerCase() : exceldata[i][j]))) {
                    obj.isbill = 1;
                  }
                  else {
                    obj.isbill = 0;
                  }
                }
                break;
              case "nimitt":
                if (this.settings.aawak.nimitt_id) {
                  obj.nimitt = exceldata[i][j];
                  let getnimitt = this.nimitts.find((n: any) => [n.nimitt_hin, n.nimitt_eng, n.roll_no].includes(obj.nimitt));
                  if (getnimitt) {
                    obj.nimitt_id = getnimitt._id;
                  } else {
                    let dictnimitt = this.dictionary.find((d: any) => d.type == "nimitt" && d.name == obj.nimitt)
                    obj.nimitt_id = dictnimitt ? dictnimitt.id : null;
                  }
                }
                break;
              case "item_detail":
              case "item detail":
                obj.item_detail = exceldata[i][j];
                break;
              case "description":
              case "desc":
                obj.description = exceldata[i][j];
                break;
              case "hl":
              case "highlight":
                if ([true, 'true', 'yes', 1, 'हाँ', 'ha'].includes((typeof exceldata[i][j] == "string" ? exceldata[i][j].trim().toLowerCase() : exceldata[i][j]))) {
                  obj.hl = 1;
                }
                else {
                  obj.hl = 0;
                }
                break;
              case "dept":
                // case "department": obj.dept = exceldata[i][j];
                //   let getdept = this.departments.find((d: any) => [d.dept_hin, d.dept_eng, d.dept_code].includes(obj.dept));                
                break;
              default: obj[columns[j]] = exceldata[i][j];
            }

          }
          //for jawak value (jawak start to end)
          else {

            //jwk switch
            switch (columns[j]) {
              case "date": jwkobj.date = exceldata[i][j];
                break;
              case "jwk mm":
              case "jwk_mm":
              case "jawak_mm":
              case "jawak mm": jwkobj.aj_mm = exceldata[i][j];
                let getmm = this.mms.find((m: any) => [m.mm_hin, m.mm_eng, m.mm_code].includes(jwkobj.aj_mm));
                if (getmm) {
                  jwkobj.aj_mm_id = getmm._id;
                  jwkobj.aj_mm_hin = getmm.mm_hin;
                  jwkobj.aj_mm_code = getmm.mm_code;
                } else {
                  let dictaj_mm = this.dictionary.find((d: any) => d.type == "aj_mm" && d.name == jwkobj.aj_mm)
                  jwkobj.aj_mm_id = dictaj_mm ? dictaj_mm.id : null;
                }

                break;
              case "kisko diya":
              case "person":
              case "kisko_diya":
                if (exceldata[i][j]) {
                  // Create fresh pbk object only when data exists
                  jwkobj.pbk = { name: exceldata[i][j] };
                  let getpbk = this.pbks.find((n: any) => [n.pbk_hin, n.pbk_eng, n.roll_no].includes(jwkobj.pbk.name));
                  if (getpbk) {
                    jwkobj.pbk_id = getpbk._id;
                    jwkobj.pbk_hin = getpbk.pbk_hin;
                  } else {
                    let dictpbk = this.dictionary.find((d: any) => d.type == "pbk" && d.name == jwkobj.pbk.name);
                    jwkobj.pbk_id = dictpbk ? dictpbk.id : null;
                  }
                }
                break;
              case "usage list":
              case "usage_list":
                jwkobj.usage_list = exceldata[i][j];
                let getusage_list = this.usage_lists.find((c: { usage_list_hin: any; usage_list_eng: any; }) => [c.usage_list_hin, c.usage_list_eng].includes(exceldata[i][j]));
                if (getusage_list) {
                  jwkobj.usage_list_id = getusage_list._id;
                  jwkobj.usage_list_hin = getusage_list.usage_list_hin;
                } else {
                  let dictusage_list = this.dictionary.find((d: any) => d.type == "usage_list" && d.name == exceldata[i][j])
                  jwkobj.usage_list_id = dictusage_list ? dictusage_list.id : null;
                }
                break;
              case "jwk_type":
              case "jwk type":
              case "jawak_type":
              case "jawak type": jwkobj.aj_type = exceldata[i][j];
                let getjawak_type = this.jawak_types.find((c: any) => [c.list_name_hin, c.list_name_eng].includes(jwkobj.aj_type));
                if (getjawak_type) {
                  jwkobj.aj_type_id = getjawak_type._id;
                  jwkobj.aj_type_hin = getjawak_type.list_name_hin;
                } else {
                  let dictaj_type = this.dictionary.find((d: any) => d.type == "jwk_type" && d.name == jwkobj.aj_type)
                  jwkobj.aj_type_id = dictaj_type ? dictaj_type.id : null;
                }
                break;
              case "qty":
              case "quantity": jwkobj.qty = exceldata[i][j];
                break;
              case "price":
              case "rate": jwkobj.rate = exceldata[i][j];
                break;
              case "amt":
              case "amount":
              case "actual amt":
              case "actual_amt": jwkobj.actual_amt = exceldata[i][j];
                break;
              case "parchi place":
              case "parchi_place":
              case "parchi kaha shown":
              case "parchi_kaha_shown": jwkobj.parchi_place = exceldata[i][j];
                break;
              case "repair_place":
              case "repair place":
              case "sell_place":
              case "sell place":
              case "kaha repair karaya":
              case "kaha repair":
              case "kaha becha": jwkobj.sell_repair_place = exceldata[i][j];
                break;
              case "pkt no":
              case "pkt num":
              case "pkt_num":
              case "pkt": jwkobj.pkt_num = exceldata[i][j];
                break;
              case "description":
              case "jawak_detail":
              case "jawak detail":
              case "jawak description": jwkobj.description = exceldata[i][j];
                break;
              default:
                jwkobj[columns[j]] = exceldata[i][j];
            }

          }

          //old code 
          // j < jawakStart ? (exceldata[i][j] != undefined ? aawak_values.push(exceldata[i][j]) : aawak_values.push(null)) :
          //   (exceldata[i][j] != undefined ? jawak_values.push(exceldata[i][j]) : jawak_values.push(null));
        }

        if (obj.subitem && !obj.subitem_id) {
          let dictitem = this.dictionary.find((d: any) => d.type == "item" && d.name == obj.item && d.extra_note == obj.subitem)
          obj.item_id = dictitem ? dictitem.id : null;
          obj.subitem_id = dictitem ? dictitem.id2 : null;
        }
        // console.log(obj);

        // auto calculate rate and amount based on coresponding values for aawak.
        if (obj.qty && obj.rate && !obj.actual_amt) {
          obj.actual_amt = (obj.qty * obj.rate).toFixed(2);
        } else if (obj.qty && obj.actual_amt && !obj.rate) {
          obj.rate = (obj.actual_amt / obj.qty).toFixed(2);
        }

        // finalJson.push(obj);
        // check for required Fields in aawak object
        if (obj.date && obj.mm && (obj.aj_mm || obj.pbk) && obj.item && obj.qty && obj.unit && obj.aj_type) {
          finalJson.push(obj);
          // awkPush = true;
        }
        else {
          // awkPush = false;
        }
        // check for required Fields in jawak object
        // finalJson[finalJson.length - 1].jawak_detail.push(jwkobj);
        if (jwkobj.qty && (jwkobj.aj_mm || jwkobj.pbk?.name)) {

          // auto calculate rate and amount based on coresponding values for jawak.
          if (jwkobj.qty && jwkobj.rate && !jwkobj.actual_amt) {
            jwkobj.actual_amt = (jwkobj.qty * jwkobj.rate).toFixed(2);
          } else if (jwkobj.qty && jwkobj.actual_amt && !jwkobj.rate) {
            jwkobj.rate = (jwkobj.actual_amt / jwkobj.qty).toFixed(2);
          }
          finalJson[finalJson.length - 1].jawak_detail.push(jwkobj);
        }
        else {
          // console.log("err", finalJson[finalJson.length - 1]);
        }

      }


      this.loadingStatus = "डाटा को अपलोड किया जा रहा है।";
      //send data to backend
      this.http.post(this.api.getUrl('IMPORTEXPORT'), finalJson).subscribe((data: any) => {
        if (data.total_count) {
          this.openModal("import");
          this.gs.importPending = true;
        }
        this.isLoader = false;
      });
    }


    reader.readAsBinaryString(file);
    ev = '';

  }

  importResponse(ev: any) {
    // console.log("respose", ev);

    if (ev) {
      this.closeModal();
      this.gs.checkTempImport();
      this.getaawakData();
    }
  }

  showImages(data: any) {
    this.editData = data;
    this.openModal('Show Images');
  }
}

