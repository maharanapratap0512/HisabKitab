import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-pbk-bachat',
  templateUrl: './pbk-bachat.component.html',
  styleUrls: ['./pbk-bachat.component.scss']
})
export class PbkBachatComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  pbkBachatData: any = [];
  total_count: any = 0;

  // Dropdown lists
  states: any = [];
  pbks: any = [];
  categories: any = [];
  items: any = [];

  // Filter object
  filterBody: any = {
    pbk_id: null,
    item_id: null,
    category_id: null,
    state_id: null
  };

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      this.states = result.state || [];
      this.pbks = result.pbk || [];
      this.categories = result.category || [];
      this.items = result.itemmix || [];
    });
    this.getPbkBachatData();
  }

  getPbkBachatData() {
    this.isLoader = true;
    const url = this.api.getUrl('PBK_CLOSING') + 'bachat/filter/' + this.auth.webUser.dept_id;

    this.http.post(url, this.filterBody).subscribe((data: any) => {
      if (data.success) {
        this.pbkBachatData = data.result || [];
        this.total_count = data.total_count || 0;
      } else {
        this.pbkBachatData = [];
      }
      this.isLoader = false;
      this.spinner.hide();
    }, (err) => {
      this.isLoader = false;
      this.spinner.hide();
      this.toastr.error('Failed to load data');
    });
  }

  // Filter change handlers
  filterChange() {
    this.getPbkBachatData();
  }

  clearFilters() {
    this.filterBody = {
      pbk_id: null,
      item_id: null,
      category_id: null,
      state_id: null
    };
    this.getPbkBachatData();
  }

  excelExport() {
    this.isLoader = true;
    let exportData: any = [];

    this.pbkBachatData.forEach((row: any, index: number) => {
      exportData.push({
        'No.': index + 1,
        'PBK Name (Hin)': row.pbk_hin,
        'PBK Name (Eng)': row.pbk_eng,
        'Roll No': row.roll_no,
        'State': row.state_hin,
        'Item (Hin)': row.item_hin,
        'Item (Eng)': row.item_eng,
        'Condition': row.condition_hin || row.condition_eng,
        'Qty': row.qty,
        'Unit': row.unit_short
      });
    });

    let date = new Date();
    this.excelExportService.exportAsExcelFile(exportData, "pbk_bachat_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }
}
