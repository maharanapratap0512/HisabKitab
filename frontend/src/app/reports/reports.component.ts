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
import { FilterService, FilterSettingsModel, GridComponent, IFilter, PageSettingsModel, SortService, ToolbarItems, VirtualScrollService } from '@syncfusion/ej2-angular-grids';
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
  reportData: any = [{ id: 1, value: 'om' }, { id: 2, value: 'mehul' }, { id: 3, value: 'raghul' },];
  filterBody: any = {}

  months: any = [];
  mms: any = [];
  states: any = [];
  pbks: any = [];
  pbksAll: any = [];


  // syncfusion support 
  @ViewChild('filterItemTemplate')
  public filterItemTemplate: any;
  public filterOption!: FilterSettingsModel;
  public toolbarOptions!: ToolbarItems[];

  // public fields: object = { text: 'Id', value: 'id' };
  public filter!: IFilter;
  public height = '220px';
  public childGrid: any;

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
      this.pbks = result.pbk ? result.pbk : [];
      this.pbksAll = result.pbk ? result.pbk : [];
    });
    this.settings = this.auth.webUser.settings;
    // this.reportLoader = true; 
    this.filterOption = { type: 'CheckBox' }
    this.filter = {
      type: 'CheckBox'
    };
    this.toolbarOptions = ['Search'];
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
    this.http.put(this.api.getUrl('REPORTAJ') + this.auth.webUser.dept_id, this.filterBody).subscribe((result: any) => {

      if (result.success && result.data) {
        this.reportData = result.data;

        this.childGrid = {
          dataSource: result.data.aj,
          queryString: '_id',
          allowPaging: true,
          pageSettings: { pageSize: 10, pageCount: 5 },
          columns: [
            { field: 'aawak_type_eng', headerText: 'Aawak Type', textAlign: 'Left', width: 120 },
            { field: 'awk_qty', headerText: 'Qty', width: 80 },
            { field: 'jawak_type_eng', headerText: 'Jawak Type', width: 120 },
            { field: 'jwk_qty', headerText: 'Qty', width: 80 }
          ],
        };
      }
    });

  }
}
