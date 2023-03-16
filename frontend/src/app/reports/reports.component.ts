import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
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
import { FilterService, GridComponent, PageSettingsModel, SortService, VirtualScrollService } from '@syncfusion/ej2-angular-grids';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [SortService, FilterService, VirtualScrollService]
})
export class ReportsComponent implements OnInit {

  isLoader: any = false;
  reportLoader: any = false;
  showModal: String = '';
  settings: any = {};
  term: any;
  total_count: any = 0;
  reportData: any = [];
  // pageSettings: PageSettingsModel;
  filterBody: any = {}
  years: any = [];
  months: any = [];
  mms: any = [];
  states: any = [];
  pbks: any = [];
  pbksAll: any = [];
  public initialSort: Object;
  public pageSettings: Object;
  public dReady: boolean = false;
  public dtTime: boolean = false;
  public isDataBound: boolean = false;
  public isDataChanged: boolean = true;
  public intervalFun: any;
  public clrIntervalFun: any;
  public clrIntervalFun1: any;
  public clrIntervalFun2: any;
  public dropSlectedIndex: number = 0;
  public stTime: any;
  public filter: Object;
  public filterSettings: Object;
  public selectionSettings: Object;
  public height: string = '240px';

  public fields: Object = { text: 'text', value: 'value' };
  public item: number[] = [1, 2, 3, 4, 5];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService) {
    this.pageSettings = { pageSize: 5 }
    this.years = gs.years;
    this.months = gs.months;
    this.filterSettings = { type: "Menu" };
    this.filter = { type: "CheckBox" };
    this.stTime = performance.now();
    this.selectionSettings = { persistSelection: true, type: "Multiple", checkboxOnly: true };
    // sourceFiles.files = ['reports.component.scss'];
    this.initialSort = {
      columns: [{ field: 'roll_no', direction: 'Ascending' }]
    };
    this.pageSettings = { pageCount: 5 }

  }

  ngOnInit(): void {
    this.spinner.show();

    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.states = result.state ? result.state : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.pbksAll = result.pbk ? result.pbk : [];
    });
    this.settings = this.auth.webUser.settings;
    // this.reportLoader = true;
    this.http.put(this.api.getUrl('REPORT') + 'pbk/', {}).subscribe((data: any) => {
      this.reportData = data;


    })
  }

  yearChanged(ev: any) {
    if (ev && ev == this.gs.date.getFullYear()) {
      this.months = this.gs.months.filter((i: { m: number; }) => i.m <= this.gs.date.getMonth())
    }
    else {
      this.months = this.gs.months;
    }
  }

  stateSelected(ev: any) {
    if (ev)
      this.pbks = this.pbks.filter((pbk: { state_id: any; }) => pbk.state_id == ev);
    else
      this.pbks = this.pbksAll;
  }

  searchReport() {
    console.log("submited");

    this.reportLoader = true;
    this.http.put(this.api.getUrl('REPORTPBK'), this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        console.log(data);

      }
    });
    this.reportLoader = false;

  }

  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  // valueChange(args: any): void {
  //   this.listObj.hidePopup();
  //   this.gridInstance.showSpinner();
  //   this.dropSlectedIndex = 0;
  //   let index: number = this.listObj.value as number;
  //   clearTimeout(this.clrIntervalFun2);
  //   this.clrIntervalFun2 = setTimeout(() => {
  //     this.isDataChanged = true;
  //     this.stTime = null;
  //     let contentElement: Element = this.gridInstance.contentModule.getPanel().firstChild as Element;
  //     contentElement.scrollLeft = 0;
  //     contentElement.scrollTop = 0;
  //     this.gridInstance.pageSettings.currentPage = 1;
  //     this.stTime = performance.now();
  //     this.gridInstance.dataSource = this.reportData;
  //     this.gridInstance.hideSpinner();
  //   }, 100);
  // }

}
