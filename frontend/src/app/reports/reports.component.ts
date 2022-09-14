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
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  isLoader: any = false;
  editData: any = {};
  mms: any = [];
  categories: any = [];
  items: any = [];
  showModal: String = '';
  viewData: any = [];
  settings: any = {};
  term: any;
  total_count: any = 0;
  jsonDataAll: any = [];
  jsonData: any = [];
  total = {
    cost: 0,
    pm: 0,
    total_cost: 0,
    final: 0
  }

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      // console.log("dashboard", result);

      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
    });
    this.settings = this.auth.webUser.settings;
  }


  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  excelImport(ev: any) {
    let workBooks: any = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      this.isLoader = true;
      const data = reader.result;
      workBooks = XLSX.read(data, { type: 'binary' });
      console.log(workBooks);

      
      this.jsonData = XLSX.utils.sheet_to_json(workBooks.Sheets[workBooks.SheetNames[0]]);
      // this.jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
      //   const sheet = workBooks.Sheets[name];
      //   initial[name] = XLSX.utils.sheet_to_json(sheet);
      //   return initial;
      // }, {});

      console.log("this.jsonData", this.jsonData);
      let total_cost:number = 0;
      for (let i in this.jsonData) {
        this.total.cost += this.jsonData[i].cost;
        this.total.pm += this.jsonData[i].pm;
        this.total.total_cost += this.jsonData[i].total_cost;
        this.total.final += this.jsonData[i].final;
        if(this.jsonData[i].final == 0){          
          total_cost += this.jsonData[i].total_cost;

        }else{
          total_cost += this.jsonData[i].total_cost;
          if(total_cost != 0 && total_cost != this.jsonData[i].final){
            console.log(this.jsonData[i]);
            
            
            this.jsonData[i].error = true;
            this.jsonData[i].correct = total_cost;
          }
          total_cost = 0;
        }
        
      }

      this.jsonDataAll = this.jsonData;
      
    }


    reader.readAsBinaryString(file);
    ev = '';

  }

  filterError(){
    let errorData = this.jsonDataAll.filter((j: { error: any; })=>j.error)
    let parchi_num = errorData.map((e: { parchi_no: any; })=>e.parchi_no);
    let date = errorData.map((e: { date: any; })=>e.date);

    this.jsonData = this.jsonDataAll.filter((j: { parchi_no: any; date: any; })=>parchi_num.includes(j.parchi_no) && date.includes(j.date));
    
    
    
  }

}
