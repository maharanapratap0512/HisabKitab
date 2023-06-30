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
import { FilterService, FilterSettingsModel, GridComponent, IFilter, PageSettingsModel, SortService, ToolbarItems, VirtualScrollService, DetailRowService, RowDataBoundEventArgs } from '@syncfusion/ej2-angular-grids';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: [SortService, FilterService, VirtualScrollService, DetailRowService]
})
export class ReportsComponent implements OnInit {

  isLoader: any = false;
  reportLoader: any = false;
  showModal: String = '';
  settings: any = {};
  term: any;
  page:any = 1;
  itemsPerPage:any = 100;
  total_count: any = 0;
  reportData: any = [];
  childGridData: any = [];
  ajData: any = []
  filterBody: any = {}

  months: any = [];
  mms: any = [];
  states: any = [];
  conditions: any = []
  pbks: any = [];
  pbksAll: any = [];
  categories: any = []
  countries:any = [
    { name: 'Australia', code: 'AU' },
    { name: 'Brazil', code: 'BR' },
    { name: 'China', code: 'CN' },
    { name: 'Egypt', code: 'EG' },
    { name: 'France', code: 'FR' },
    { name: 'Germany', code: 'DE' },
    { name: 'India', code: 'IN' },
    { name: 'Japan', code: 'JP' },
    { name: 'Spain', code: 'ES' },
    { name: 'United States', code: 'US' }
];

  // syncfusion support 
  @ViewChild('Grid') grid!: GridComponent
  // @ViewChild('ChildGrid') childGrid!: GridComponent
  public filterOption!: FilterSettingsModel;
  public toolbarOptions!: ToolbarItems[];

  // public fields: object = { text: 'Id', value: 'id' };
  public filter!: IFilter;
  public qtyFilter!: IFilter;
  public height = '220px';
  public childGrid: any;
  public pageSettings: any;

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
      this.mms = result.mm ? result.mm : [];
      this.states = result.state ? result.state : [];
      this.conditions = result.condition ? result.condition : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.pbksAll = result.pbk ? result.pbk : [];
      this.categories = result.category ? result.category : [];
    });
    this.settings = this.auth.webUser.settings;
    // this.reportLoader = true; 
    this.filterOption = { type: 'CheckBox' }
    this.pageSettings = { pageSize: 50 };
    this.filter = {
      type: 'CheckBox'
    };
    this.qtyFilter = {
      type: 'Menu'
    };
    this.toolbarOptions = ['Search'];

    // this.filterBody = {
    //   month: 11,
    //   year: 2022
    // }
    // this.searchReport();
    
  }

  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
  }

  searchReport() {
    this.reportLoader = true;
    this.http.put(this.api.getUrl('REPORTAJ') + this.auth.webUser.dept_id, this.filterBody).subscribe((result: any) => {

      if (result.success && result.data) {
        const dataLength = result.data.length;
        const conditionLength = this.conditions.length;

        for (let i = 0; i < dataLength; i++) {
          let dataItem = result.data[i];
          for (let j = 0; j < conditionLength; j++) {
            result.data[i][this.conditions[j].list_name_eng] = 0;
          }

          for (let j = 0; j < result.data[i].condition_eng.length; j++) {
            result.data[i][result.data[i].condition_eng[j]] = result.data[i].bachats[j];
          }

          result.data[i].categories_hin = '';
          result.data[i].categories_eng = '';

          if (result.data[i].arr_subitem_categories && result.data[i].arr_subitem_categories.length > 0) {

            for (let j in this.categories) {
              if (result.data[i].arr_subitem_categories.includes(this.categories[j]._id)) {
                result.data[i].categories_hin += this.categories[j].category_hin + ', ';
                result.data[i].categories_eng += (this.categories[j].category_eng ? this.categories[j].category_eng : ' ') + ', ';
              }
            }
          } else {

            for (let j in this.categories) {
              if (result.data[i].arr_item_categories.includes(this.categories[j]._id)) {
                result.data[i].categories_hin += this.categories[j].category_hin + ', '; 
                result.data[i].categories_eng += (this.categories[j].category_eng ? this.categories[j].category_eng : ' ') + ', ';
              }
            }
          }

        }
        this.reportData = result.data;
        // this.childGridData = result.ajData;
        // this.childGrid = {
        //   dataSource: result.ajData,
        //   queryString: '_id',
        //   columns: [
        //     // { field: '_id', headerText: 'ID', textAlign: 'Left', width: 80 },
        //     { headerText: 'Sr.No', textAlign: 'Left', width: 80 },
        //     { field: 'aawak_type_eng', headerText: 'Aawak Type', textAlign: 'Left', width: 120 },
        //     { field: 'awk_qty', headerText: 'Qty', width: 80, format: 'N2' },
        //     { field: 'jawak_type_eng', headerText: 'Jawak Type', width: 120 },
        //     { field: 'jwk_qty', headerText: 'Qty', width: 80, format: 'N2' }
        //   ],
        //   aggregates: [
        //     {
        //       columns: [{
        //         type: 'Sum',
        //         field: 'awk_qty',
        //         footerTemplate: 'Total: ${Sum}',
        //       }, {
        //         type: 'Sum',
        //         field: 'jwk_qty',
        //         footerTemplate: 'Total: ${Sum}',
        //       }]
        //     }
        //   ]
        // };
        // this.grid.refresh()
        this.reportLoader = false;
        console.log(this.reportData);

      }
    });

  }

  rowDataBound(args: RowDataBoundEventArgs) {

    let rowIndexAttr = args.row?.getAttribute('aria-rowIndex');
    let rowIndex = rowIndexAttr ? parseInt(rowIndexAttr) : 0;
    let currentPageNumber: any = this.grid.pageSettings.currentPage;
    let pageSize: any = this.grid.pageSettings.pageSize;
    let startIndex = (currentPageNumber - 1) * pageSize;
    let cell = args.row?.querySelector('.e-rowcell');

    if (cell) {
      cell.innerHTML = (startIndex + rowIndex).toString();
    }
  }

  public onChildRowRendering(args: RowDataBoundEventArgs): void {
    let rowIndexAttr = args.row?.getAttribute('aria-rowIndex');
    let rowIndex = rowIndexAttr ? parseInt(rowIndexAttr) : 0;
    let cell = args.row?.querySelector('.e-rowcell');

    if (cell) {
      cell.innerHTML = (rowIndex).toString();
    }
  }

}
