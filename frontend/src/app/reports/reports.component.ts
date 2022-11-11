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
import { PageSettingsModel } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  isLoader: any = false;
  showModal: String = '';
  settings: any = {};
  term: any;
  total_count: any = 0;
  reportData: any = [];
  pageSettings: PageSettingsModel;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService) {
    this.pageSettings = { pageSize: 5 }
  }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      // console.log("dashboard", result);
    });
    this.settings = this.auth.webUser.settings;
    this.http.put(this.api.getUrl('REPORT')+'pbk/', {}).subscribe((data:any)=>{
      this.reportData = data;
      
    })
  }


  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

}
