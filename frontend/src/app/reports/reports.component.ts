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
import 'tslib';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  providers: []
})
export class ReportsComponent implements OnInit {

  isLoader: any = false;
  reportLoader: any = false;
  showModal: String = '';
  settings: any = {};
  term: any;
  page: any = 1;
  itemsPerPage: any = 100;
  total_count: any = 0;
  filterBody: any = {}
  months: any = [];

  departments: any = [];

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
      this.departments = result.department ? result.department : [];
    });
    this.settings = this.auth.webUser.settings;
    // this.reportLoader = true; 

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

  searchReports() {

  }
}
