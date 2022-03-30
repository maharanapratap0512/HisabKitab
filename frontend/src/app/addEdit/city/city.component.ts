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
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  cityData: any = [];
  cityAll: any = [];
  total_count: any;
  citytypes: any = [];
  states: any = [];

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
    this.getcityData();
    console.log("city component", this.gs.Lists);
    this.states = this.gs.Lists.state ? this.gs.Lists.state : [];
  }

  getcityData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('CITY') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.cityData = data['result'];
        this.cityAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addCITYResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.cityData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  editCITYResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.cityData.splice(this.cityData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit City'
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
        this.http.delete(this.api.getUrl('CITY') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.cityData.splice(i, 1);
            this.gs.Lists.city.splice(this.gs.Lists.city.indexOf((i: { _id: any; }) => i._id == id), 1);
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
}
