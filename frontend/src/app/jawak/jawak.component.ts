import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $:any;

@Component({
  selector: 'app-jawak',
  templateUrl: './jawak.component.html',
  styleUrls: ['./jawak.component.scss']
})
export class JawakComponent implements OnInit {
  isLoader:boolean = false;
  term:any;
  showModal:String = '';
  total_count: any;
  jawakData:any = [];
  editData: any = {};



  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public gs: GlobalService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.getAawakData();
  }

  openModal(type:String){
    this.showModal = type;
    $('#showModal').modal('show');
  }


  getAawakData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('JAWAK') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.jawakData = data['result'];
        this.total_count = data['result'].length;
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addJawakResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.jawakData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev)
      this.isLoader = false;
    }
  }

  editJawakResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.jawakData.splice(this.jawakData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Jawak'
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
        this.isLoader = true;
        this.http.delete(this.api.getUrl('JAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.jawakData.splice(i, 1);
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
}
