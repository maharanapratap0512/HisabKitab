import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GlobalService } from '../services/global.service';
import { ApiService } from '../services/api.service';
import { HttpService } from '../services/http.service';

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
  term: any;
  loadingStatus: any = "मैं आत्मा शांत स्वरूप हूँ ।";
  itemsPerPage = 100;
  page_excel: any = 1;
  page_combined: any = 1;
  page_awk: any = 1;
  page_jwk: any = 1;

  combinedBachat: any = [];
  combinedBachatAll: any = [];
  newInsertedJwk: any = [];
  newInsertedAwk: any = [];

  filterObj: any = {}

  constructor(
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) {
    this.gs.observeList().subscribe(result => {
      // this.itemAll = result.itemmix ? result.itemmix : [];
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
        this.combinedBachat = data.result;
        this.combinedBachatAll = data.result;
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
        if (value && item[key] == 0) {
          return false;
        }
      }
      return true;
    });
  }
}
