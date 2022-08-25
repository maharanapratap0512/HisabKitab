import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-mm',
  templateUrl: './mm.component.html',
  styleUrls: ['./mm.component.scss']
})
export class MmComponent implements OnInit {

  page = 1;
  itemsPerPage = 50;
  // currentPage: any;
  // totalItems: any;

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  mmData: any = [];
  mmAll: any = [];
  total_count: any = 0;;
  departments: any = [];
  states: any = [];
  temp: any = {};
  settings:any = {};
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getmmData();
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.departments = result.department ? result.department : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  getmmData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('MM') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.mmData = data['result'];
        this.mmAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  stateSelected(ev: any) {
    if (ev)
      this.mmData = this.mmAll.filter((mm: { state_id: any; }) => mm.state_id == ev);
    else
      this.mmData = this.mmAll;
  }

  mmDeptSelected(ev: any) {

    if (ev) {
      this.mmData = this.mmAll.filter((mm: { dept_id: any; }) => mm.dept_id == ev);
    }
    else {
      this.mmData = this.mmAll;
    }
  }

  addMMResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.mmData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  editMMResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.mmData.splice(this.mmData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit MM'
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
        this.http.delete(this.api.getUrl('MM') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.mmData.splice(i, 1);
            this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any; }) => i._id == id), 1);
            this.total_count -= 1;
            this.toastr.success('Deleted Successfully');
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
    this.http.put(this.api.getUrl('MM'), body).subscribe((data: any) => {
        console.log("data", data);      
        this.mmData.splice(this.mmData.findIndex((i: { _id: any; }) => i._id == id), 1, data['result']);    
        this.isLoader = false;  
        if(data['result'].active){
          this.toastr.success("Protetion Shield Activated");
        }      
        else{          
          this.toastr.success("Protetion Shield Deactivated");
        }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }
}
