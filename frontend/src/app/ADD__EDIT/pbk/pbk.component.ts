import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx';
import { AuthService } from 'src/app/services/auth.service';
import { observable, Observable, Subject } from 'rxjs';
import { ExcelExportService } from 'src/app/services/excel-export.service';
declare var $: any;

@Component({
  selector: 'app-pbk',
  templateUrl: './pbk.component.html',
  styleUrls: ['./pbk.component.scss']
})
export class PbkComponent implements OnInit {
  @ViewChild('TABLE') el!: ElementRef<HTMLInputElement>;

  page = 1;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any;
  modalName: any = "Add";
  pbkData: any = [];
  total_count: any = 0;;
  showAge: any;
  baseurl: any;
  showFilter: boolean = false
  filterBody: any = {
    bhatti_year: null,
    city_id: [],
    class_mm_id: [],
    gender: [],
    roll_no: null,
    state_id: [],
  };
  pageNo: any = 1;
  states: any = [];
  cities: any = [];
  mms: any = [];
  genders: any = [];
  statuses: any = [];
  relations: any = [];
  getPbk$ = new Subject();
  settings: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService
  ) {
    this.settings = this.auth.webUser.settings.pbk;
  }

  ngOnInit(): void {
    this.spinner.show();
    this.gs.observeList().subscribe((Lists: any) => {
      this.states = Lists.state ? Lists.state : [];
      this.cities = Lists.city ? Lists.city : []
      this.mms = Lists.mm ? Lists.mm : [];
      this.genders = Lists.gender ? Lists.gender : [];
      this.relations = Lists.relation ? Lists.relation : [];
      this.statuses = Lists.status ? Lists.status : [];
    })
    this.getPbkData(1);
    this.baseurl = this.api.getUrl('BASE');
  }

  getPbkData(pageNo: any) {
    this.isLoader = true;
    this.filterBody.pageNo = pageNo;
    this.http.put(this.api.getUrl('PBK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pbkData = data['result'];
        this.total_count = data['total_count'];
        for (let i in this.pbkData) {
          if (this.pbkData[i].birth_date) {
            let bdate = new Date(this.pbkData[i].birth_date);
            const timeDiff = Math.abs(Date.now() - bdate.getTime());
            this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
            this.pbkData[i].age = this.showAge;
          }
        }
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  // getPbkData() {
  //   this.isLoader = true;
  //   this.http.put(this.api.getUrl('PBK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
  //     if (data['result'] && data['success']) {
  //       this.pbkData = data['result'];
  //       // this.total_count = data['total'];
  //       this.total_count = data['total_count'];
  //       for (let i in this.pbkData) {
  //         if (this.pbkData[i].birth_date) {
  //           let bdate = new Date(this.pbkData[i].birth_date);
  //           const timeDiff = Math.abs(Date.now() - bdate.getTime());
  //           this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
  //           this.pbkData[i].age = this.showAge;
  //         }
  //       }
  //       if (data["result"].length < data["total_count"]) {
  //         this.getMorePbk();
  //       }
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   });

  //   this.getPbk$.subscribe((result: any) => {    
  //     for (let i in result) {
  //       if (result[i].birth_date) {
  //         let bdate = new Date(result[i].birth_date);
  //         const timeDiff = Math.abs(Date.now() - bdate.getTime());
  //         this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
  //         result[i].age = this.showAge;
  //       }
  //       this.pbkData.push(result[i]);
  //     }
  //     console.log("result", result.length);
  //     console.log("this.pbkData", this.pbkData.length);
  //     if(this.total_count > this.pbkData.length){
  //       this.getMorePbk();
  //     }
  //   });
  // }

  // getMorePbk() {
  //   this.filterBody.pageNo = this.pageNo + 1;
  //   this.http.put(this.api.getUrl('PBK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
  //     if (data['result'] && data["result"].length > 0) {
  //       if (data["pageNo"]) {
  //         this.pageNo = data["pageNo"];
  //       }
  //       this.getPbk$.next(data['result']);
  //       // this.isLoader = false;
  //     }
  //     // this.isLoader = false;
  //   });
  // }


  export() {
    // this.excelExportService.exportAsExcelFile(this.el.nativeElement, 'PBKs');
  }

  addPbkResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.pbkData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  editPbkResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.pbkData.splice(this.pbkData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit PBK'
    $('#showModal').modal('show');
  }

  delete(i: any, id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('PBK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.pbkData.splice(i, 1);
            this.total_count -= 1;
            this.toastr.success(data['message']);
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        });
      }
    })
  }

  protectionToggle(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('PBK'), body).subscribe((data: any) => {
      this.pbkData.splice(this.pbkData.findIndex((i: { _id: any; }) => i._id == id), 1, data['result']);
      this.isLoader = false;
      if (data['result'].active) {
        this.toastr.success("Protetion Shield Activated");
      }
      else {
        this.toastr.success("Protetion Shield Deactivated");
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

  filterFormSubmit(formdata: any) {
    if (formdata.city || formdata.class_mm || formdata.gender || formdata.bhatti_year || formdata.state || formdata.roll_no) {
      console.log("formdata", formdata);
    }
    else {
      this.toastr.error('All Fields are Empty.');
    }
  }
}
