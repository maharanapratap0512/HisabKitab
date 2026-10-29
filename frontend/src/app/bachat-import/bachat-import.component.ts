import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../services/global.service';
import { ApiService } from '../services/api.service';
import { HttpService } from '../services/http.service';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { ExcelExportService } from '../services/excel-export.service';

@Component({
  selector: 'app-bachat-import',
  templateUrl: './bachat-import.component.html',
  styleUrls: ['./bachat-import.component.scss']
})
export class BachatImportComponent {
  @Input() excelArrObj: any;
  @Output() response = new EventEmitter();
  settings: any;
  isLoader: boolean = false;
  term_excel: any;
  term_combined: any;
  term_db_only: any;
  loadingStatus: any = "मैं आत्मा शांत स्वरूप हूँ ।";
  itemsPerPage = 100;
  page_excel: any = 1;
  page_combined: any = 1;
  page_db_only: any = 1;
  page_awk: any = 1;
  page_jwk: any = 1;
  page_rejected: any = 1;
  items: any = [];
  mms: any = [];

  combinedBachat: any = [];
  combinedBachatAll: any = [];
  DBOnlyBachat: any = [];
  DBOnlyBachatAll: any = [];
  newInsertedJwk: any = [];
  newInsertedAwk: any = [];
  rejected: any = [];
  rejectedReset: any = [];
  resetSucceed: any = [];
  insertAwkStyle: string = "width: 0%";
  insertJwkStyle: string = "width: 0%";
  rejectedStyle: string = "width: 0%";
  rejectedResetStyle: string = "width: 0%";
  succeedStyle: string = "width: 0%";
  import$ = new Subject();
  importReset$ = new Subject();
  selectAll: any = {};


  processedCount: any = 0;
  processing: any = false;
  processingReset: any = false;
  filterObj: any = {}

  constructor(
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public excelExportService: ExcelExportService,
    public auth: AuthService,
  ) {
    this.gs.observeList().subscribe(result => {
      this.items = result.itemmix ? result.itemmix : [];
      this.mms = result.mm ? result.mm : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.excelArrObj && changes.excelArrObj.currentValue) {
      this.excelArrObj = changes.excelArrObj.currentValue.filter((ex: { date: any; mm_id: any; item_id: any; subitem_id: any, subitem: any, subitem_corrected: any, unit_id: any; qty: any; }) => ex.date && ex.mm_id && ex.item_id && ex.unit_id && ex.qty != null && ((ex.subitem && ex.subitem_id) || !ex.subitem || ex.subitem_corrected));
    }

    this.getLatestBachatData();
  }

  async getLatestBachatData() {
    this.loadingStatus = "...बचत से इक्सेल डाटा को जोड़ा जा रहा है।"
    this.isLoader = true;
    this.http.post(this.api.getUrl('EXCELIMPORT') + 'match_bachat/' + this.auth.webUser.dept_id, this.excelArrObj).subscribe((data: any) => {
      if (data.success) {
        this.combinedBachatAll = data.resultED;
        this.combinedBachat = this.combinedBachatAll;
        this.DBOnlyBachatAll = data.resultDB;
        this.DBOnlyBachat = this.DBOnlyBachatAll;
        this.isLoader = false;
      }
      this.isLoader = false;
    }, (err) => {
      this.isLoader = false;
      this.toastr.error("No corrected Data found, please resolve correction first.");
    });
  }

  get hasSwQty(): boolean {
    return Array.isArray(this.excelArrObj) && this.excelArrObj.some((x: any) => x.sw_qty != null && x.sw_qty !== '');
  }

  hideZero(key: any, ev: any) {
    if (ev.checked) {
      this.filterObj[key] = true;
    } else {
      this.filterObj[key] = false;
    }
    this.filter('combinedBachat');
  }

  // filterZeros() {
  //   this.combinedBachat = this.combinedBachatAll.filter((item: any) => {
  //     for (let [key, value] of Object.entries(this.filterObj)) {
  //       if (['qty', 'bachat', 'difference'].includes(key) && value && item[key] == 0) {
  //         return false;
  //       }
  //     }
  //     return true;
  //   });
  //   this.filter('combinedBachat');
  // }

  toggleSelectAll(arr: string) {
    if (["combinedBachat", "DBOnlyBachat"].includes(arr)) {
      for (let i in (this as any)[arr]) {
        (this as any)[arr][i].selected = !this.selectAll[arr];
      }
    }
  }

  resetFilter(arr: string) {
    this.filterObj = {}
    this.filter(arr);
  }

  filter(arr: string) {
    if (["combinedBachat", "DBOnlyBachat"].includes(arr)) {
      (this as any)[arr] = (this as any)[arr + 'All'];
      if (this.filterObj.mm_id && this.filterObj.mm_id.length > 0) {
        (this as any)[arr] = (this as any)[arr + 'All'].filter((row: { mm_id: any; }) => this.filterObj.mm_id.includes(row.mm_id));
      }
      if (this.filterObj.item_id && this.filterObj.item_id.length > 0) {
        (this as any)[arr] = (this as any)[arr + 'All'].filter((row: { item_id: any; }) => this.filterObj.item_id.includes(row.item_id));
      }

      if (arr == 'combinedBachat') {
        this.combinedBachat = this.combinedBachat.filter((item: any) => {
          for (let [key, value] of Object.entries(this.filterObj)) {
            if (['qty', 'bachat', 'difference'].includes(key) && value && item[key] == 0) {
              return false;
            }
          }
          return true;
        });
      }
    }
  }

  async syncBachat() {
    this.combinedBachat = this.combinedBachat.filter((c: { selected: any, difference: number }) => c.selected && c.difference != 0);

    if (this.combinedBachat.length === 0) {
      this.toastr.info('No data with difference was selected.');
      return;
    }

    this.processedCount = 0;
    this.processing = true;
    this.newInsertedAwk = [];
    this.newInsertedJwk = [];
    this.rejected = [];

    for (let i = 0; i < this.combinedBachat.length; i++) {
      const item = this.combinedBachat[i];
      try {
        const res: any = await this.http.put(this.api.getUrl('EXCELIMPORT') + 'final_bachat/' + this.auth.webUser.dept_id, item).toPromise();
        if (res && res.success) {
          if (res.status === 'aawak' && res.result) {
            this.newInsertedAwk.push(...res.result);
          } else if (res.status === 'jawak' && res.result) {
            this.newInsertedJwk.push(...res.result);
          } else {
            this.rejected.push(item);
          }
        } else {
          this.rejected.push(item);
        }
      } catch (err) {
        this.rejected.push(item);
      }
      this.processedCount = i + 1;
      this.insertAwkStyle = "width:" + (this.newInsertedAwk.length * 100) / this.combinedBachat.length + "%;";
      this.insertJwkStyle = "width:" + (this.newInsertedJwk.length * 100) / this.combinedBachat.length + "%;";
      this.rejectedStyle = "width:" + (this.rejected.length * 100) / this.combinedBachat.length + "%;";
    }

    this.processing = false;
    this.getLatestBachatData();
    this.toastr.success("Synchronization complete. Test your result.");
  }

  async resetBachat() {
    const selected = this.DBOnlyBachat.filter((c: { selected: any }) => c.selected);

    if (selected.length === 0) {
      this.toastr.error("Please select at least 1 row.");
      return;
    }

    Swal.fire({
      title: 'Select a Date For Aawak Jawak Entry.',
      input: 'date',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      preConfirm: (selectedDate) => {
        if (!selectedDate) {
          Swal.showValidationMessage('Please select a date');
        }
        return selectedDate;
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.processedCount = 0;
        this.processingReset = true;
        this.resetSucceed = [];
        this.rejectedReset = [];

        for (let i = 0; i < selected.length; i++) {
          const item = { ...selected[i], date: result.value };
          try {
            const res: any = await this.http.put(this.api.getUrl('EXCELIMPORT') + 'final_bachat/' + this.auth.webUser.dept_id, item).toPromise();
            if (res && res.success && res.result) {
              this.resetSucceed.push(...res.result);
            } else {
              this.rejectedReset.push(item);
            }
          } catch (err) {
            this.rejectedReset.push(item);
          }
          this.processedCount = i + 1;
          this.succeedStyle = "width:" + (this.resetSucceed.length * 100) / selected.length + "%;";
          this.rejectedResetStyle = "width:" + (this.rejectedReset.length * 100) / selected.length + "%;";
        }

        this.processingReset = false;
        this.getLatestBachatData();
        this.toastr.success("Reset synchronization complete. Test your result.");
      }
    });
  }

  exportRejected() {
    let date = new Date();
    this.excelExportService.exportAsExcelFile(this.rejected, 'Bachat_import_rejected_data_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
  }

  exportCombinedData() {
    let date = new Date();
    let exportData = []
    for (let i in this.combinedBachat) {
      exportData.push({
        "Sn No": this.combinedBachat[i].sn,
        "Date": this.combinedBachat[i].date,
        "MM": this.combinedBachat[i].mm_hin,
        "Item": this.combinedBachat[i].item_hin,
        "Subitem": this.combinedBachat[i].subitem_hin || '',
        "Condition": this.combinedBachat[i].condition_hin || '',
        "Item Detail": this.combinedBachat[i].item_detail || '',
        "Description": this.combinedBachat[i].description || '',
        "Unit": this.combinedBachat[i].unit_short,
        "Excel Qty": this.combinedBachat[i].qty,
        "SW Bachat": this.combinedBachat[i].bachat,
        "Difference": this.combinedBachat[i].difference,
      });
    }
    this.excelExportService.exportAsExcelFile(exportData, 'Bachat_import_combined_bachat_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
  }

  exportDBOnlyData() {
    let date = new Date();
    let exportData = []
    for (let i in this.DBOnlyBachat) {
      exportData.push({
        "MM": this.DBOnlyBachat[i].mm_hin,
        "Item": this.DBOnlyBachat[i].item_hin,
        "Subitem": this.DBOnlyBachat[i].subitem_hin || '',
        "Condition": this.DBOnlyBachat[i].condition_hin || '',
        "Unit": this.DBOnlyBachat[i].unit_short,
        "Excel Qty": this.DBOnlyBachat[i].qty,
        "SW Bachat": this.DBOnlyBachat[i].bachat,
        "Difference": this.DBOnlyBachat[i].difference,
      });
    }
    this.excelExportService.exportAsExcelFile(exportData, 'Bachat_import_db_only_bachat_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
  }

}
