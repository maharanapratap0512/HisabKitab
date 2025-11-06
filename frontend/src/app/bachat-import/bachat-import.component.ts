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
  selectAll: boolean = false;


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
      this.excelArrObj = changes.excelArrObj.currentValue.filter((ex: { date: any; mm_id: any; item_id: any; subitem_id: any, subitem: any, unit_id: any; qty: any; }) => ex.date && ex.mm_id && ex.item_id && ex.unit_id && ex.qty && ((ex.subitem && ex.subitem_id) || !ex.subitem));
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

  hideZero(key: any, ev: any) {
    if (ev.checked) {
      this.filterObj[key] = true;
    } else {
      this.filterObj[key] = false;
    }
    this.filterZeros();
  }

  filterZeros() {
    this.combinedBachat = this.combinedBachatAll.filter((item: any) => {
      for (let [key, value] of Object.entries(this.filterObj)) {
        if (['qty', 'bachat', 'difference'].includes(key) && value && item[key] == 0) {
          return false;
        }
      }
      return true;
    });
    this.filter('combinedBachat');
  }

  toggleSelectAll() {
    for (let i in this.DBOnlyBachat) {
      this.DBOnlyBachat[i].selected = !this.selectAll;
    }
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
    }
  }

  async processSync(i: number = 0) {

    this.http.put(this.api.getUrl('EXCELIMPORT') + 'final_bachat/' + this.auth.webUser.dept_id, this.combinedBachat[i]).subscribe((res: any) => {
      this.import$.next(res);
    }, (err: any) => {
      this.rejected.push(this.combinedBachat[i]);
      this.rejectedStyle = "width:" + (this.rejected.length * 100) / this.combinedBachat.length + "%;";
      this.import$.next(0);
    });

  }


  async syncBachat() {
    this.processedCount = 0;
    this.processing = true;
    this.combinedBachat = this.combinedBachat.filter((c: { difference: number }) => c.difference != 0);

    this.import$.subscribe((res: any) => {

      if (res && res.success) {

        switch (res.status) {
          case 'aawak': this.newInsertedAwk.push(...res.result)
            this.insertAwkStyle = "width:" + (this.newInsertedAwk.length * 100) / this.combinedBachat.length + "%;";
            break;
          case 'jawak': this.newInsertedJwk.push(...res.result)
            this.insertJwkStyle = "width:" + ((this.processedCount - this.newInsertedAwk.length - this.rejected.length + 1) * 100) / this.combinedBachat.length + "%;";
            break;
          default: this.rejected.push(this.combinedBachat[this.processedCount]);
            this.rejectedStyle = "width:" + (this.rejected.length * 100) / this.combinedBachat.length + "%;";
        }
      }
      this.processedCount++;
      if (this.combinedBachat.length > this.processedCount) {
        this.processSync(this.processedCount);
      } else {
        this.import$.complete();
        this.getLatestBachatData();
        this.toastr.success("Synchronyzation complete. test your result");
      }

    });

    await this.processSync();
  }

  async processReset(i: number = 0) {

    this.http.put(this.api.getUrl('EXCELIMPORT') + 'final_bachat/' + this.auth.webUser.dept_id, this.DBOnlyBachat[i]).subscribe((res: any) => {
      this.importReset$.next(res);
    }, (err: any) => {
      this.rejected.push(this.DBOnlyBachat[i]);
      this.rejectedStyle = "width:" + (this.rejected.length * 100) / this.DBOnlyBachat.length + "%;";
      this.importReset$.next(0);
    });

  }


  async resetBachat() {
    // this.DBOnlyBachat = this.DBOnlyBachatAll.filter((c: { selected: any }) => c.selected);

    if (this.DBOnlyBachat.length > 0) {

      Swal.fire({
        title: 'Select a Date For Aawak Jawak Entry.',
        input: 'date',   //  shows date picker
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

          this.importReset$.subscribe((res: any) => {

            if (res && res.success) {
              switch (res.status) {
                case 'jawak':
                case 'aawak': this.resetSucceed.push(...res.result)
                  this.succeedStyle = "width:" + (this.resetSucceed.length * 100) / this.DBOnlyBachat.length + "%;";
                  break;
                default: this.rejectedReset.push(this.DBOnlyBachat[this.processedCount]);
                  this.rejectedResetStyle = "width:" + (this.rejectedReset.length * 100) / this.DBOnlyBachat.length + "%;";
              }
            }
            this.processedCount++;
            if (this.DBOnlyBachat.length > this.processedCount) {
              this.processReset(this.processedCount);
            } else {
              this.importReset$.complete();
              this.getLatestBachatData();
              this.toastr.success("Synchronyzation complete. test your result");
            }

          });
          for (let i in this.DBOnlyBachat) {
            this.DBOnlyBachat[i].date = result.value;
          }
          await this.processReset();
        }
      });

    } else {
      this.toastr.error("Please Select minimum 1 row.");

    }
  }

  exportRejected() {
    let date = new Date();
    this.excelExportService.exportAsExcelFile(this.rejected, 'Bachat_import_rejected_data_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
  }

}
