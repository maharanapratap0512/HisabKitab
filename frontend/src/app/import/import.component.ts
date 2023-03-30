import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as e from 'express';
import { forEach } from 'jszip';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  isLoader: boolean = false;
  @Input() importData: any;
  @Input() updateData: any;
  @Output() response = new EventEmitter();
  page = 1;
  itemsPerPage = 100;
  currentPage: any;
  total_count: any;
  importForm: FormGroup;
  term: any;
  items: any = [];
  products: any = [];
  productsAll: any = [];
  itemAll: any = [];
  subitems: any = [];
  units: any = [];
  states: any = [];
  mms: any = [];
  conditions: any = [];
  categories: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  nimitts: any = [];
  settings: any = [];
  unmatchedData: any = [];
  um_items: any = [];
  um_mms: any = [];
  um_units: any = [];
  um_pbks: any = [];
  cat: any = null;
  updateLists: any = [];
  uData: any = {};
  years: any = [];
  months: any = [];
  failImport: any = [];
  loaderStatus: string = 'मैं आत्मा शांत स्वरूप हूँ ।';
  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
  ) {
    this.years = gs.years;
    this.months = gs.months;
    this.gs.observeList().subscribe(result => {
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      // this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
    this.settings = this.auth.webUser.settings;

    this.importForm = this.fb.group({
      mm_id: [null, Validators.required],
      month: [null, Validators.required],
      year: [null, Validators.required],
      dept_id: [this.auth.webUser.dept_id],
      autoUpdate: [false]
    });

  }

  ngOnInit(): void {

    this.getImportData();
    this.getUnmatchedList();
    this.getProductData();
  }

  yearChanged(ev: any) {
    if (ev && ev == this.gs.date.getFullYear()) {
      this.months = this.gs.months.filter((i: { m: number; }) => i.m <= this.gs.date.getMonth())
    }
    else {
      this.months = this.gs.months;
    }
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

  getImportData() {
    this.http.get(this.api.getUrl('IMPORTEXPORT')).subscribe((data: any) => {
      if (data.success) {
        this.importData = data.result;
        this.total_count = data.total_count;
        for (let i in this.importData) {

          if (this.importData[i].date && this.importData[i].mm_id && (this.importData[i].aj_mm_id || this.importData[i].pbk_id) && this.importData[i].item_id && this.importData[i].qty && this.importData[i].unit_id && this.importData[i].aj_type_id) {
            this.importData[i].valid = true;
          } else {
            this.importData[i].valid = false;
          }
          for (let j in this.importData[i].jawak_detail) {
            if (this.importData[i].jawak_detail[j].aj_mm_id && this.importData[i].jawak_detail[j].qty && this.importData[i].jawak_detail[j].aj_type_id) {
              this.importData[i].jawak_detail[j].valid = true;
            } else {
              this.importData[i].jawak_detail[j].valid = false;
            }
            if (this.importData[i].jawak_detail[j].aj_mm_id && !this.importData[i].jawak_detail[j].aj_mm_hin) {
              let getmm = this.mms.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].aj_mm_id);
              if (getmm) {
                this.importData[i].jawak_detail[j].aj_mm_hin = getmm.mm_hin;
                this.importData[i].jawak_detail[j].aj_mm_code = getmm.mm_code;
              }
            }
            if (this.importData[i].jawak_detail[j].nimitt_id && !this.importData[i].jawak_detail[j].nimmit_hin) {
              let getnimitt = this.nimitts.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].nimitt_id);
              if (getnimitt) {
                this.importData[i].jawak_detail[j].nimitt_hin = getnimitt.nimitt_hin;
                this.importData[i].jawak_detail[j].nimitt_state_hin = getnimitt.state_hin;
              }
            }
            if (this.importData[i].jawak_detail[j].aj_type_id && !this.importData[i].jawak_detail[j].aj_type_hin) {
              let getaj_type = this.jawak_types.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].aj_type_id);
              if (getaj_type) {
                this.importData[i].jawak_detail[j].aj_type_hin = getaj_type.list_name_hin;
              }
            }
            if (this.importData[i].jawak_detail[j].unit_id && !this.importData[i].jawak_detail[j].unit_short) {
              let getunit = this.units.find((m: { _id: any; }) => m._id == this.importData[i].jawak_detail[j].unit_id);
              if (getunit) {
                this.importData[i].jawak_detail[j].unit_short = getunit.unit_short;
              }
            }
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.importData && changes.importData.currentValue) {
      this.importData = changes.importData.currentValue;
    }
    if (changes.updateData && changes.updateData.currentValue) {
      this.uData = changes.updateData.currentValue;
      console.log("this.uData", this.uData);
      setTimeout(() => {
        console.log("this.uData", this.uData.category);
        setTimeout(() => {
          console.log("this.uData", Object.keys(this.uData.category));
        }, 6000);
      }, 5000);
      // this.updateLists = ;      
    }
  }

  getUnmatchedList() {
    this.http.get(this.api.getUrl('IMPORTEXPORT') + 'correction').subscribe((data: any) => {
      if (data.result) {
        this.unmatchedData = data.result;
      }
    });
  }

  catSelected(ev: any, type: any) {
    if (ev && type != "category") {
      this.cat = ev;
      this.items = this.itemAll.filter((i: { categories: any }) => i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.itemAll;
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      // let category_ids = this.categories.map((c: { _id: any; }) => c._id);
      if (this.cat) {
        this.subitems = item.subitems.filter((s: { categories: any; }) => s.categories.includes(this.cat));
      }
      else {
        this.subitems = item.subitems;
      }
    }
    else {
      this.subitems = [];
    }
  }

  applyCorrection() {

    this.http.put(this.api.getUrl('IMPORTEXPORT') + 'correction', this.unmatchedData).subscribe((data: any) => {
      // this.unmatchedData = data;
      this.getUnmatchedList();
      this.getImportData();
    });

  }

  ignoreCorrection(data: any, i: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "इस फील्ड का डाटा मिटा दिया जाएगा और डिस्क्रिप्शन मे ट्रांसफर किया जाएगा, इसे वापस undo नहीं कर सकते है।",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'हाँ, जी। '
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put(this.api.getUrl('IMPORTEXPORT') + 'ignore', data).subscribe((data: any) => {
          if (data.success) {
            this.unmatchedData[i].ignore = true;
          }
          else {
            this.toastr.error("error occur");
          }
        });
      }
    });

  }

  async importFinal() {
    this.isLoader = true;
    if (this.importForm.valid) {
      let valid = this.importData.filter((i: { valid: boolean, jawak_detail: any[]; }) => i.valid == false && i.jawak_detail.filter((j: { valid: Boolean; }) => j.valid == false).length == 0);

      if (valid == 0) {
        this.failImport = [];
        for (let i in this.importData) {
          this.loaderStatus = 'Importing ' + i + ' out of ' + this.importData.length;
          await this.http.put(this.api.getUrl('IMPORTEXPORT') + 'process', { data: this.importData[i], autoUpdate: this.importForm.value.autoUpdate }).subscribe((data: any) => {
            if (data['success'] && data['data']) {

              let errJwk = [];
              for (let jwk of data['data'].jawak_detail) {
                if (jwk.error) {
                  errJwk.push(jwk)
                }
              }
              if (errJwk.length > 0) {
                this.failImport.push({ ...data['data'], jawak_detail: errJwk });
              }
            }
            else {
              this.failImport.push(this.importData[i]);
              this.toastr.error('Something went wrong');
            }

          }, (err) => {
            this.failImport.push(this.importData[i]);
            this.toastr.error(err['error'])
          });
        }

        this.loaderStatus = 'Setup History and Cleaning Import Data';
        this.http.put(this.api.getUrl('IMPORTEXPORT') + 'finish', { history: this.importForm.value }).subscribe((data: any) => {
          if (this.failImport.length > 0) {
            this.loaderStatus = 'Exporting Failed in Excel File.';
            console.log(this.failImport);
            let failExcelData: any = [];
            for (let i = 0; i < this.failImport.length; i++) {
              let jawakArray = [];
              for (let jwk of this.failImport[i].jawak_detail) {
                jawakArray.push({
                  'Date': jwk.date ? jwk.date : '-',
                  'Pkt No': jwk.pkt_num ? jwk.pkt_num : '-',
                  'Jawak MM': jwk.aj_mm ? jwk.aj_mm : '-',
                  'Jawak Detail': jwk.description ? jwk.description : '-',
                  'Kisko Diya': jwk.nimitt ? jwk.nimitt : '-',
                  'Jawak Type': jwk.aj_type ? jwk.aj_type : '-',
                  'Qty': jwk.qty ? jwk.qty : '-',
                  'Unit': jwk.unit ? jwk.unit : '-',
                  'Error': jwk.error['error']
                });
              }
              let awkObj: any = {
                '_id': this.failImport[i].awk_id ? this.failImport[i].awk_id : '',
                'No': i + 1,
                'Date': this.failImport[i].date ? this.failImport[i].date : '-',
                'Pkt No': this.failImport[i].pkt_num ? this.failImport[i].pkt_num : '-',
                'MM': this.failImport[i].mm ? this.failImport[i].mm : '-',
                'Aawak MM': this.failImport[i].aj_mm ? this.failImport[i].aj_mm : '-',
              };
              if (this.settings.aawak.pbk_id) {
                awkObj['Roll No'] = this.failImport[i].roll_no ? this.failImport[i].roll_no : '-';
                awkObj.Pbk = this.failImport[i].pbk.name ? this.failImport[i].pbk.name : '-';
                awkObj.Relation = this.failImport[i].pbk.relation ? this.failImport[i].pbk.relation : '-';
                awkObj.Relative = this.failImport[i].pbk.relative ? this.failImport[i].pbk.relative : '-';
              }

              awkObj = {
                ...awkObj,
                'Item': this.failImport[i].item ? this.failImport[i].item : '-',
                'Subitem': this.failImport[i].subitem ? this.failImport[i].subitem : '-',
                'Product Code': this.failImport[i].product ? this.failImport[i].product : '-',
                'Company': this.failImport[i].company_name ? this.failImport[i].company_name : '-',
                'Condition': this.failImport[i].condition ? this.failImport[i].condition : '-',
                'Bill': this.failImport[i].isbill ? 'है' : '-',
                'Qty': this.failImport[i].qty ? this.failImport[i].qty : '-',
                'Unit': this.failImport[i].unit ? this.failImport[i].unit : '-',
                'Price': this.failImport[i].rate ? this.failImport[i].rate : '-',
                'Amount': this.failImport[i].actual_amt ? this.failImport[i].actual_amt : '-',
                'Aawak Type': this.failImport[i].aj_type ? this.failImport[i].aj_type : '-',
                'Item Detail': this.failImport[i].item_detail ? this.failImport[i].item_detail : '-',
                'Description': this.failImport[i].description ? this.failImport[i].description : '-',
                'Error': this.failImport[i].error ? this.failImport[i].error['error'] : '-',
                'Jawak Detail': jawakArray,
              };
              failExcelData.push(awkObj);
            }
            let date = new Date();
            let filename = "FAIL_AJ_Import_";
            // console.log(filename);

            this.excelExportService.generateExcel(failExcelData, filename + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
          }

          this.response.emit(1);
        }, (err) => {
          this.toastr.error(err['error']);
        });

        // this.http.put(this.api.getUrl('IMPORTEXPORT') + 'final', { data: this.importData, history: this.importForm.value }).subscribe((data: any) => {
        //   if (data['success'] && data['data']) {
        //     this.failImport = [];
        //     for (let row of data['data']) {
        //       let errJwk = [];
        //       for (let i in row.jawak_detail) {
        //         if (row.jawak_detail[i].error) {
        //           errJwk.push(row.jawak_detail[i])
        //         }
        //       }
        //       if (row.error) {
        //         this.failImport.push(row);
        //       } else if (errJwk.length > 0) {
        //         this.failImport.push({ ...row, jawak_detail: errJwk });
        //       }
        //     }

        //     if (this.failImport.length > 0) {
        //       console.log(this.failImport);
        //       let failExcelData: any = [];
        //       for (let i = 0; i < this.failImport.length; i++) {
        //         let jawakArray = [];
        //         for (let jwk of this.failImport[i].jawak_detail) {
        //           jawakArray.push({
        //             'Date': jwk.date ? jwk.date : '-',
        //             'Pkt No': jwk.pkt_num ? jwk.pkt_num : '-',
        //             'Jawak MM': jwk.aj_mm ? jwk.aj_mm : '-',
        //             'Jawak Detail': jwk.description ? jwk.description : '-',
        //             'Kisko Diya': jwk.nimitt ? jwk.nimitt : '-',
        //             'Jawak Type': jwk.aj_type ? jwk.aj_type : '-',
        //             'Qty': jwk.qty ? jwk.qty : '-',
        //             'Unit': jwk.unit ? jwk.unit : '-',
        //             // 'Bachat': bachat
        //           });
        //         }
        //         let awkObj: any = {
        //           '_id': this.failImport[i].awk_id ? this.failImport[i].awk_id : '',
        //           'No': i + 1,
        //           'Date': this.failImport[i].date ? this.failImport[i].date : '-',
        //           'Pkt No': this.failImport[i].pkt_num ? this.failImport[i].pkt_num : '-',
        //           'MM': this.failImport[i].mm ? this.failImport[i].mm : '-',
        //           'Aawak MM': this.failImport[i].aj_mm ? this.failImport[i].aj_mm : '-',
        //         };
        //         if (this.settings.aawak.pbk_id) {
        //           awkObj['Roll No'] = this.failImport[i].roll_no ? this.failImport[i].roll_no : '-';
        //           awkObj.Pbk = this.failImport[i].pbk.name ? this.failImport[i].pbk.name : '-';
        //           awkObj.Relation = this.failImport[i].pbk.relation ? this.failImport[i].pbk.relation : '-';
        //           awkObj.Relative = this.failImport[i].pbk.relative ? this.failImport[i].pbk.relative : '-';
        //         }

        //         awkObj = {
        //           ...awkObj,
        //           'Item': this.failImport[i].item ? this.failImport[i].item : '-',
        //           'Subitem': this.failImport[i].subitem ? this.failImport[i].subitem : '-',
        //           'Product Code': this.failImport[i].product ? this.failImport[i].product : '-',
        //           'Company': this.failImport[i].company_name ? this.failImport[i].company_name : '-',
        //           'Condition': this.failImport[i].condition ? this.failImport[i].condition : '-',
        //           'Bill': this.failImport[i].isbill ? 'है' : '-',
        //           'Qty': this.failImport[i].qty ? this.failImport[i].qty : '-',
        //           'Unit': this.failImport[i].unit ? this.failImport[i].unit : '-',
        //           'Price': this.failImport[i].rate ? this.failImport[i].rate : '-',
        //           'Amount': this.failImport[i].actual_amt ? this.failImport[i].actual_amt : '-',
        //           'Aawak Type': this.failImport[i].aj_type ? this.failImport[i].aj_type : '-',
        //           'Item Detail': this.failImport[i].item_detail ? this.failImport[i].item_detail : '-',
        //           'Description': this.failImport[i].description ? this.failImport[i].description : '-',
        //           'Jawak Detail': jawakArray,
        //         };
        //         failExcelData.push(awkObj);
        //       }
        //       let date = new Date();
        //       let filename = "FAIL_AJ_Import_";              
        //       // console.log(filename);

        //       this.excelExportService.generateExcel(failExcelData, filename + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
        //     }

        //     this.response.emit(1);
        //   }
        //   else {
        //     this.toastr.error('Something went wrong');
        //   }

        // });
      } else {
        Swal.fire({
          title: 'Error!',
          text: "Some invalid row exists",
          icon: 'error',
          showCancelButton: false,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    }
    else {
      this.gs.validationFireOnSubmit(this.importForm);
    }
    this.loaderStatus = 'मैं आत्मा शांत स्वरूप हूँ ।';
    this.isLoader = false;
  }


  clearTempImport() {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('IMPORTEXPORT') + 'all').subscribe((data: any) => {
          this.response.emit(1);
        });
      }
    });
  }

}
