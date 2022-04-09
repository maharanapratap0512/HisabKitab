import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { FilterpipePipe } from '../pipe/filterpipe.pipe';
import { AuthService } from '../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-aawak',
  templateUrl: './aawak.component.html',
  styleUrls: ['./aawak.component.scss']
})
export class AawakComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  aawakData: any = [];
  aawakAll: any = [];
  total_count: any;
  conditionObj: any = {
    mm_id: null
  };
  mms: any = [];
  viewData: any = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getaawakData();
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
    });
  }

  mmSelected(ev: any) {
    if (ev) {
      this.conditionObj.mm_id = ev
      // const filterPipe = new FilterpipePipe();
      // this.aawakData = filterPipe.transform(this.aawakAll, this.conditionObj);
      // console.log("q",this.aawakData );

    } else {
      this.conditionObj.mm_id = null
      // const filterPipe = new FilterpipePipe();
      // this.aawakData = filterPipe.transform(this.aawakAll, this.conditionObj);
      // console.log("q",this.aawakData );
    }
  }

  getaawakData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.aawakData = data['result'];
        this.aawakAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  stateSelected(ev: any) {
    if (ev)
      this.aawakData = this.aawakAll.filter((aawak: { state_id: any; }) => aawak.state_id == ev);
    else
      this.aawakData = this.aawakAll;
  }

  aawakDeptSelected(ev: any) {

    if (ev) {
      this.aawakData = this.aawakAll.filter((aawak: { dept_id: any; }) => aawak.dept_id == ev);
    }
    else {
      this.aawakData = this.aawakAll;
    }
  }

  addAawakResponse(ev: any) {
    if (ev._id) {
      console.log("if res", ev);

      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.aawakData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  editAawakResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.aawakData.splice(this.aawakData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Aawak'
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
        this.http.delete(this.api.getUrl('AAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.aawakData.splice(i, 1);
            this.gs.Lists.aawak.splice(this.gs.Lists.aawak.indexOf((i: { _id: any; }) => i._id == id), 1);
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

  filter() {
    this.aawakData = this.aawakAll;
    for (let [key, value] of Object.entries(this.conditionObj)) {
      if (value)
        this.aawakData = this.aawakData.filter((b: any) => b[key] == value);
    }
  }

  addJawak(data: any) {
    this.editData = {
      date: data.date,
      mm_id: data.mm_id,
      item_id: data.item_id,
      subitem_id: data.subitem_id,
      product_id: data.product_id,
      item_detail: data.item_detail,
      condition_id: data.condition_id,
      qty: data.remaining_qty,
      unit_id: data.unit_id,
      aawak_ref_id: data._id,
      dept_id: data.dept_id,
      unit_short: data.unit_short
    }
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  showJawak(id: any) {
    if (id) {
      this.http.get(this.api.getUrl('JAWAKBYAWK') + id).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.viewData = data['result'];
          this.openModal('Show Jawak');
        }
      });
    }
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    if (ev.aawak_ref_id) {
      let i = this.aawakData.findIndex((b: any) => b._id == ev.aawak_ref_id);
      this.aawakData[i].remaining_qty = (this.aawakData[i].remaining_qty ? this.aawakData[i].remaining_qty : 0) - ev.qty;
      $('#showModal').modal('hide');
      this.showModal = '';
      // this.isLoader = false;
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

}
