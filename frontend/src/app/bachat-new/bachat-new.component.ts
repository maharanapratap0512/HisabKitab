import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;


@Component({
  selector: 'app-bachat-new',
  templateUrl: './bachat-new.component.html',
  styleUrls: ['./bachat-new.component.scss']
})
export class BachatNewComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  bachatData: any = [];
  bachatAll: any = [];

  // Pagination
  page: number = 1;
  itemsPerPage: number = 100;

  total_count: any = 0;;
  states: any = [];
  mms: any = [];
  conditions: any = [];
  categories: any = [];
  items: any = [];
  subitems: any = [];
  // conditionObj: any = {};
  filterBody: any = {
    mm_id: null,
    state_id: null,
    category_id: null,
    item_id: null,
    subitem_id: null,
    from_year: null,
    from_month: null,
    to_year: null,
    to_month: null,
  };

  settings: any = {};
  selectedItem: any;
  selectedSubitem: any;
  monthsFrom: any = [];
  monthsTo: any = [];
  monthsSel: any = []
  clickOperation: any = 1;
  operationList: any = [
    { key: 'condition_wise', name: 'Condition Wise' },
    { key: 'awk_type_wise', name: 'A/J Type Wise' },
  ]
  subBachatData: any = []
  excelFile: any = null
  ignoreDummy: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
    private domSanitizer: DomSanitizer
  ) {
    this.settings = this.auth.webUser.settings.bachat;
    // this.months = gs.months;
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getbachatData();
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.categories = result.category ? result.category : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.conditions = result.condition ? result.condition : [];
    });
    this.filterBody.mm_id = this.auth.webUser.settings.defaultMM ? [this.auth.webUser.settings.defaultMM] : [];
    // this.filterBody.year = 2024;
    // this.gs.yearChangedGetMonth(2024);
    // this.filterBody.months = [3, 1];
    // this.filter();
  }



  getbachatData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('BACHATNEW') + this.auth.webUser.dept_id).subscribe(async (data) => {
      if (data['result'] && data['success']) {

        this.bachatAll = data['result'];
        this.bachatData = this.bachatAll;
        this.applyClientSideFilter();
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }



  // openImage(data: any) {
  //   var image = new Image(1000, 700);
  //   image.src = data;

  //   window.open("")?.document.write(image.outerHTML);
  // }

  setImages(data: any) {
    if (data.subitem_id) {
      this.selectedSubitem = {
        _id: data.subitem_id,
        subitem_hin: data.subitem_hin,
        subitem_eng: data.subitem_eng,
        document: data.sdocument
      };
      this.selectedItem = null;
    } else {
      this.selectedItem = {
        _id: data.item_id,
        item_hin: data.item_hin,
        item_eng: data.item_eng,
        document: data.idocument
      };
      this.selectedSubitem = null;
    }
    this.showModal = 'View Product';
    $('#showModal').modal('show');
  }

  stateSelected(ev: any) {
    if (ev) {
      this.mms = this.gs.Lists.mm.filter((b: { state_id: any; }) => b.state_id == ev);
    }
    else {
      this.mms = this.gs.Lists.mm;
    }

    this.filter();
  }

  catSelected(ev: any) {
    if (ev) {
      this.items = this.gs.Lists.itemmix.filter((i: { categories: any[]; }) => i.categories.some(c => c._id == ev));
    }
    else {
      this.items = this.gs.Lists.itemmix;
    }
    this.onHeaderFilterChange();
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);

      if (this.filterBody.category_id && item) {
        this.subitems = item.subitems.filter((s: { categories: any[]; }) => s.categories.some(c => c.this.filterBody.category_id));
      } else {
        this.subitems = item.subitems ? item.subitems : [];
      }
    } else {
      this.subitems = [];
    }
    this.onHeaderFilterChange();
  }

  addJawak(data: any) {
    data._id = null;
    this.editData = data;
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;

    let i = this.bachatData.findIndex((b: any) => b.dept_id == ev.dept_id && b.item_id == ev.item_id && (b.subitem_id == ev.subitem_id || !ev.subitem_id) && b.mm_id == ev.mm_id);

    if (i >= 0) {
      if (ev.jawak_type_eng == "Used") {
        this.bachatData[i].Used = (this.bachatData[i].Used ? this.bachatData[i].Used : 0) + ev.qty;
      }
      this.bachatData[i].Stock = (this.bachatData[i].Stock ? this.bachatData[i].Stock : 0) - ev.qty;

      if (this.bachatData[i].Used == 0 && this.bachatData.Stock == 0) {
        this.bachatData.splice(i, 1);
      }
    }

    $('#showModal').modal('hide');
    this.showModal = '';

    // this.isLoader = false;
  }

  getCategoryString(row: any, lang: 'hin' | 'eng' = 'hin') {
    if (!row) return '';
    const categories = (row.arr_scategories && row.arr_scategories.length > 0)
      ? row.arr_scategories
      : row.arr_icategories;
    if (categories && Array.isArray(categories)) {
      if (lang === 'eng') {
        return categories.map((c: any) => c.category_eng || '').filter(Boolean).join(', ');
      }
      return categories.map((c: any) => c.category_hin || c.category_eng || c).join(', ');
    }
    return '';
  }

  isDummyRow(row: any): boolean {
    if (!this.ignoreDummy) return false;
    const totalAawak = row.total_aawak_all || 0;
    const totalJawak = row.total_jawak_all || 0;
    const totalBachat = row.total_bachat_all || 0;
    const totalUsed = row.total_used_all || 0;
    const pastBachat = row.past_bachat || 0;

    const hasAawak = totalAawak !== 0 || (row.arr_sum_aawak && row.arr_sum_aawak.some((v: any) => v !== 0));
    const hasJawak = totalJawak !== 0 || (row.arr_sum_jawak && row.arr_sum_jawak.some((v: any) => v !== 0));
    const hasUsed = totalUsed !== 0 || (row.arr_sum_used && row.arr_sum_used.some((v: any) => v !== 0));
    const hasBachat = totalBachat !== 0 || pastBachat !== 0 || (row.arr_sum_bachat && row.arr_sum_bachat.some((v: any) => v !== 0));

    return !hasAawak && !hasJawak && !hasUsed && !hasBachat;
  }

  excelExportBachatOnly() {
    this.isLoader = true;
    let bchtData: any = [];
    let conditionTotals: any = {}; // Object to store condition totals
    let uniqueMM = new Set();
    let uniqueUnit = new Set();
    let wholeTotal = 0;
    let idx = 1;

    for (let i = 0; i < this.bachatData.length; i++) {
      if (this.isDummyRow(this.bachatData[i])) continue;
      uniqueMM.add(this.bachatData[i].mm_id);
      uniqueUnit.add(this.bachatData[i].unit_id);

      let bachatRow: any = {
        'No.': idx++,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.getCategoryString(this.bachatData[i], 'hin'),
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-',
      }

      for (let j in this.conditions) {
        let qty = '0';
        for (let k in this.bachatData[i].arr_condition_id) {
          if (this.conditions[j]._id == this.bachatData[i].arr_condition_id[k]) {
            qty = this.bachatData[i].arr_sum_bachat[k] ? this.bachatData[i].arr_sum_bachat[k] : 0;
            conditionTotals[this.conditions[j].list_name_hin] = (conditionTotals[this.conditions[j].list_name_hin] || 0) + parseFloat(qty); // Update or initialize condition total
          }
        }
        bachatRow[this.conditions[j].list_name_hin] = qty;
      }
      bachatRow['टोटल बचत'] = this.bachatData[i].total_bachat_all ? this.bachatData[i].total_bachat_all : 0;
      wholeTotal += bachatRow['टोटल बचत'];
      bchtData.push(bachatRow);
    }

    // Add a footer row with condition totals
    const footerRow: any = {};
    footerRow['No.'] = '*';
    footerRow['State'] = 'Total'
    footerRow['MM'] = uniqueMM.size + ' MMs'
    footerRow['Unit'] = uniqueUnit.size + ' Units'
    footerRow['टोटल बचत'] = wholeTotal;
    for (const condition in this.conditions) {
      footerRow[this.conditions[condition].list_name_hin] = conditionTotals[this.conditions[condition].list_name_hin] || 0;
    }
    bchtData.push(footerRow);


    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Bachat_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  excelExportFull() {
    this.isLoader = true;
    let bchtData: any = [];
    let idx = 1;
    for (let i = 0; i < this.bachatData.length; i++) {
      if (this.isDummyRow(this.bachatData[i])) continue;

      let bachatRow: any = {
        'No.': idx++,
        'टोटल बचत': this.bachatData[i].total_bachat_all ? this.bachatData[i].total_bachat_all : 0,
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-',
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.getCategoryString(this.bachatData[i], 'hin'),
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
      }
      for (let j in this.conditions) {
        let aawak = 0, jawak = 0, used = 0, bachat = 0;
        for (let k in this.bachatData[i].arr_condition_id) {
          if (this.conditions[j]._id == this.bachatData[i].arr_condition_id[k]) {
            aawak = this.bachatData[i].arr_sum_aawak[k] ? this.bachatData[i].arr_sum_aawak[k] : 0;
            jawak = this.bachatData[i].arr_sum_jawak[k] ? this.bachatData[i].arr_sum_jawak[k] : 0;
            used = this.bachatData[i].arr_sum_used[k] ? this.bachatData[i].arr_sum_used[k] : 0;
            bachat = this.bachatData[i].arr_sum_bachat[k] ? this.bachatData[i].arr_sum_bachat[k] : 0;
          }
        }
        bachatRow[this.conditions[j].list_name_hin + "_आवक"] = aawak;
        bachatRow[this.conditions[j].list_name_hin + "_यूज"] = used;
        bachatRow[this.conditions[j].list_name_hin + "_जावक"] = jawak;
        bachatRow[this.conditions[j].list_name_hin + "_बचत"] = bachat;
      }
      bachatRow['यूनिट'] = this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-';
      bchtData.push(bachatRow);
    }
    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Bachat_Full_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  excelExportSaar() {
    this.isLoader = true;
    let bchtData: any = [];
    let footerRow: any = {
      'No.': '*',
      'State': 'Total',
      'टोटल आवक': 0,
      'घर मे यूज': 0,
      'टोटल जावक': 0,
      'बचत': 0,
    }; // Object to store totals for footer
    let uniqueMM = new Set();
    let uniqueUnit = new Set();
    let idx = 1;

    for (let i = 0; i < this.bachatData.length; i++) {
      if (this.isDummyRow(this.bachatData[i])) continue;
      uniqueMM.add(this.bachatData[i].mm_id);
      uniqueUnit.add(this.bachatData[i].unit_id);

      let bachatRow: any = {
        'No.': idx++,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.getCategoryString(this.bachatData[i], 'hin'),
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'टोटल आवक': this.bachatData[i].total_aawak_all ? this.bachatData[i].total_aawak_all : 0,
        'घर मे यूज': this.bachatData[i].total_used_all ? this.bachatData[i].total_used_all : 0,
        'टोटल जावक': this.bachatData[i].total_jawak_all ? this.bachatData[i].total_jawak_all : 0,
        'बचत': this.bachatData[i].total_bachat_all ? this.bachatData[i].total_bachat_all : 0,
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-',
      }

      footerRow['टोटल आवक'] += bachatRow['टोटल आवक'];
      footerRow['घर मे यूज'] += bachatRow['घर मे यूज'];
      footerRow['टोटल जावक'] += bachatRow['टोटल जावक'];
      footerRow['बचत'] += bachatRow['बचत'];

      bchtData.push(bachatRow);
    }

    // Add a footer row with condition totals
    footerRow['MM'] = uniqueMM.size + ' MMs'
    footerRow['Unit'] = uniqueUnit.size + ' Units'
    bchtData.push(footerRow);


    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Bachat_Full_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  excelExportMonthlyMain() {
    this.isLoader = true;
    let bchtData: any = [];
    let idx = 1;
    for (let i = 0; i < this.bachatData.length; i++) {
      if (this.isDummyRow(this.bachatData[i])) continue;

      let bachatRow: any = {
        'No.': idx++,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.getCategoryString(this.bachatData[i], 'eng'),
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'Condition': this.bachatData[i].condition_id ? this.bachatData[i].condition_hin : '-',
        'unit': this.bachatData[i].unit_short,
        'पिछला बचत': this.bachatData[i].past_bachat ? this.bachatData[i].past_bachat : 0,
        'arr_sum_aawak': this.bachatData[i].arr_sum_aawak ? this.bachatData[i].arr_sum_aawak : [],
        'arr_sum_used': this.bachatData[i].arr_sum_used ? this.bachatData[i].arr_sum_used : [],
        'arr_sum_jawak': this.bachatData[i].arr_sum_jawak ? this.bachatData[i].arr_sum_jawak : [],
        'arr_sum_bachat': this.bachatData[i].arr_sum_bachat ? this.bachatData[i].arr_sum_bachat : [],
        'arr_difference_bachat': this.bachatData[i].arr_difference_bachat ? this.bachatData[i].arr_difference_bachat : [],
        'arr_comment': this.bachatData[i].arr_comment ? this.bachatData[i].arr_comment : [],
      }
      bchtData.push(bachatRow);
    }
    let option: any = {};
    option.months = this.monthsSel;
    option.year = this.filterBody.year;

    let mm: any = null;
    if (this.filterBody.mm_id) {
      mm = this.mms.find((m: { _id: any; }) => m._id == this.filterBody.mm_id)
    }
    this.excelExportService.generateReportExcel(bchtData, (mm ? mm.mm_hin : null), option);
    this.isLoader = false;
  }

  async excelExportMonthlyConditionWise() {
    this.isLoader = true;
    
    // Group this.bachatData by unique key: mm_id-item_id-subitem_id-unit_id
    const groupedMap = new Map<string, any>();
    
    this.bachatData.forEach((row: any) => {
      if (this.isDummyRow(row)) return;
      const key = `${row.mm_id}-${row.item_id}-${row.subitem_id || 0}-${row.unit_id}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          mm_id: row.mm_id,
          item_id: row.item_id,
          subitem_id: row.subitem_id,
          unit_id: row.unit_id,
          dept_hin: row.dept_hin,
          state_hin: row.state_hin,
          mm_hin: row.mm_hin,
          category_hin: row.category_hin,
          categories_hin: row.categories_hin,
          categories_eng: row.categories_eng,
          arr_scategories: row.arr_scategories,
          arr_icategories: row.arr_icategories,
          item_hin: row.item_hin,
          subitem_hin: row.subitem_hin,
          unit_short: row.unit_short,
          past_bachat: 0,
          arr_sum_bachat: null,
          conditionsList: []
        });
      }
      
      const group = groupedMap.get(key);
      group.conditionsList.push(row);
    });
    
    const bchtData: any = [];
    let idx = 1;
    
    for (const [key, group] of groupedMap.entries()) {
      const monthCount = this.monthsSel.length;
      const totalBachatPerMonth = new Array(monthCount).fill(0);
      let totalPastBachat = 0;
      
      group.conditionsList.forEach((condRow: any) => {
        totalPastBachat += condRow.past_bachat || 0;
        for (let m = 0; m < monthCount; m++) {
          totalBachatPerMonth[m] += condRow.arr_sum_bachat[m] || 0;
        }
      });
      
      let bachatRow: any = {
        'No.': idx++,
        'Department': group.dept_hin ? group.dept_hin : '-',
        'State': group.state_hin ? group.state_hin : '-',
        'MM': group.mm_hin,
        'Category': this.getCategoryString(group, 'eng'),
        'Item': group.item_hin,
        'Subitem': group.subitem_id ? group.subitem_hin : '-',
        'unit': group.unit_short,
        'पिछला बचत': totalPastBachat,
        'arr_sum_bachat': totalBachatPerMonth,
        'arr_conditionReport': group.conditionsList
      };
      
      bchtData.push(bachatRow);
    }
    
    let option: any = {};
    option.months = this.monthsSel;
    option.year = this.filterBody.year;

    let mm: any = null;
    if (this.filterBody.mm_id) {
      mm = this.mms.find((m: { _id: any; }) => m._id == this.filterBody.mm_id)
    }

    console.log("bachat", bchtData);

    this.excelExportService.generateConditionWiseReport(bchtData, this.conditions, (mm ? mm.mm_hin : "report"), option);
    this.isLoader = false;
  }


  filter() {
    this.isLoader = true;
    this.page = 1;
    if (this.filterBody.from_year_month) {
      this.filterBody.from_year = this.filterBody.from_year_month.split('-')[0];
      this.filterBody.from_month = this.filterBody.from_year_month.split('-')[1];
    } else {
      this.filterBody.from_year = null;
      this.filterBody.from_month = null;
    }

    if (this.filterBody.to_year_month) {
      this.filterBody.to_year = this.filterBody.to_year_month.split('-')[0];
      this.filterBody.to_month = this.filterBody.to_year_month.split('-')[1];
    } else {
      this.filterBody.to_year = null;
      this.filterBody.to_month = null;
    }

    if (this.filterBody.from_year && !this.filterBody.to_year) {
      this.filterBody.to_year_month = this.filterBody.from_year_month;
      this.filterBody.to_year = this.filterBody.from_year;
      this.filterBody.to_month = this.filterBody.from_month;
    } else if (!this.filterBody.from_year && this.filterBody.to_year) {
      this.filterBody.from_year_month = this.filterBody.to_year_month;
      this.filterBody.from_year = this.filterBody.to_year;
      this.filterBody.from_month = this.filterBody.to_month;
    }

    if (!this.filterBody.to_year_month && !this.filterBody.to_year_month) {
      this.getbachatData();
    } else {
      this.http.put(this.api.getUrl('BACHATNEW') + 'filter/' + this.auth.webUser.dept_id, this.filterBody).subscribe(async (data: any) => {
        if (data['result'] && data['success']) {

          this.bachatAll = data['result'];

          if (data['headers'] && data['headers'].length > 0) {
            this.monthsSel = data['headers'].map((h: any) => {
              const mObj = this.gs.months.find((m: any) => m.m == h.month);
              return {
                m: h.month,
                year: h.year,
                name: mObj ? mObj.name : h.month
              };
            });
          }
          else {
            this.monthsSel = []
          }

          for (let i in this.bachatAll) {
            this.bachatAll[i].showTooltip = {};
          }
          this.bachatData = this.bachatAll;
          // this.onHeaderFilterChange();
          this.isLoader = false;
        }
        this.isLoader = false;
      }, (err) => {
        this.toastr.error('some error occures');
        this.isLoader = false;
      });
    }
  }

  getYearTo() {
    return this.filterBody.from_year ? this.gs.years.filter((x: number) => x >= this.filterBody.from_year) : this.gs.years;
  }

  onHeaderFilterChange() {
    this.page = 1;
    this.applyClientSideFilter();
  }

  applyClientSideFilter() {
    let filtered = [...this.bachatAll];

    if (this.filterBody.mm_id && this.filterBody.mm_id.length > 0) {
      filtered = filtered.filter(row => this.filterBody.mm_id.includes(row.mm_id));
    }

    if (this.filterBody.category_id) {
      filtered = filtered.filter(row => {
        const categories = (row.arr_scategories && row.arr_scategories.length > 0)
          ? row.arr_scategories
          : row.arr_icategories;
        return categories && categories.some((c: { _id: any; }) => c._id == this.filterBody.category_id);
      });
    }

    if (this.filterBody.item_id && this.filterBody.item_id.length > 0) {
      filtered = filtered.filter(row => this.filterBody.item_id.includes(row.item_id));
    }

    this.bachatData = filtered;
    this.total_count = this.bachatData.length;
  }

  filterFormSubmit(formdata: any) {
    if (formdata) {

    }
    else {
      this.toastr.error('All Fields are Empty.');
    }
  }

  hideBachatZero(ev: any) {
    if (ev.checked) {
      this.bachatData = this.bachatData.filter((b: { total_bachat_all: any; }) => b.total_bachat_all)
    } else {
      this.applyClientSideFilter();
    }
  }

  hideDifferenceZero(ev: any) {
    if (ev.checked) {
      this.bachatData = this.bachatData.filter((b: { total_difference_all: any; }) => b.total_difference_all)
    } else {
      this.applyClientSideFilter();
    }
  }

  openModal(type: string) {
    this.showModal = type;
    $('#showModal').modal('show')
  }

  closeModal() {
    this.showModal = '';
    $('#showModal').modal('hide');
  }

  excelImport(ev: any) {
    if (ev) {
      this.excelFile = ev;
      this.openModal('import');
    }
    ev = null;
  }

  importResponse(ev: any) {

  }


  rowClicked(row: any) {
    row.months = this.filterBody.months;
    this.http.put(this.api.getUrl('BACHATNEW') + 'condition/' + this.auth.webUser.dept_id, row).subscribe(async (data: any) => {
      if (data['result'] && data['success']) {
        row.condition_wise = data['result'];
        row.awk_type_wise = data['awk'];

        if (row.condition_wise.length > 0 || row.awk_type_wise.length > 0) {
          row.subReport = true;
          row.currentReport = 'condition_wise';
        } else {
          row.subReport = false;
        }
      }
    });
  }

  operationClick(row: any, key: any) {
    if (row[key] && row[key].length > 0) {
      row.currentReport = key;
    }
  }

  editComment(month: any, data: any, row_type: any, parentRow: any = null) {

    Swal.fire({
      title: 'Enter Comment',
      input: 'textarea',
      inputPlaceholder: 'comment',
      showCancelButton: true,
      confirmButtonText: 'Save',
      showDenyButton: true,
      denyButtonText: 'Delete',
      inputValue: data.arr_comment[month] || ''
    }).then((result) => {
      if (result.isConfirmed) {

        if (data.arr_comment_id[month]) {
          let body = {
            _id: data.arr_comment_id[month],
            comment: result.value
          }
          this.http.put(this.api.getUrl('COMMENT') + data.arr_comment_id[month], body).subscribe(async (res: any) => {
            if (res.success) {
              this.toastr.success("comment Updated.")
              data.arr_comment[month] = result.value;
            }
            else
              this.toastr.error("something went wrong");
          });

        } else {
          let postData = { ...data };
          postData.comment = result.value;
          postData.month = this.monthsSel[month].m;
          postData.year = this.monthsSel[month].year;
          postData.report_type = 'full_saar';
          postData.row_type = row_type;

          if (parentRow) {
            if (parentRow.currentReport == 'awk_type_wise') {
              postData.type_id = data.aawak_type_id;
            } else if (parentRow.currentReport == 'condition_wise') {
              postData.type_id = data.condition_id;
            }
          } else {
            postData.type_id = null;
          }

          this.http.post(this.api.getUrl('COMMENT') + this.auth.webUser.dept_id, postData).subscribe(async (res: any) => {
            if (res.success) {
              this.toastr.success("comment added : " + res.result.comment);
              data.arr_comment[month] = res.result.comment;
              data.arr_comment_id[month] = res.result._id;
            }
          });
        }
      } else if (result.isDenied) {
        if (data.arr_comment_id[month]) {
          this.http.delete(this.api.getUrl('COMMENT') + data.arr_comment_id[month]).subscribe(async (res: any) => {
            if (res.success) {
              this.toastr.success("comment Deleted.");
              data.arr_comment[month] = '';
              data.arr_comment_id[month] = null;
            }
          });
        }
      }
    });

  }

  toggleEditMode(i: number, m: number): void {
    this.bachatData[i].editMode = this.bachatData[i].editMode ? this.bachatData[i].editMode : [];
    this.bachatData[i].editMode[m] = !this.bachatData[i].editMode[m];
  }

  // Function to handle changes in the textarea input
  handleInputChange(i: number, m: number): void {
    this.bachatData[i].commentChanged = this.bachatData[i].commentChanged ? this.bachatData[i].commentChanged : [];
    this.bachatData[i].commentChanged[m] = true;
  }

}

