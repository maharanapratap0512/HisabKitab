import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { resourceLimits } from 'worker_threads';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {


  termAawak: any;
  term: any;
  termBachat: any;
  pendingAawakData: any = [];
  bachatData: any = [];
  bachatDataAll: any = [];
  editData: any = {};
  mms: any = [];
  showModal: String = '';
  sitems: any = [];
  fields: any;
  viewData: any = [];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getBachat();
    this.getPendingAawak();
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.sitems = result.sitem ? result.sitem : [];
    });
  }


  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  getBachat() {
    // this.isLoader = true;
    this.http.get(this.api.getUrl('BACHAT') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.bachatDataAll = data['result'].filter((b: { qty: number; }) => b.qty != 0);
        this.bachatData = this.bachatDataAll;
        console.log("bachat", this.bachatData);

        // this.isLoader = false;
      }
      // this.isLoader = false;
    });
  }

  sitemSelected(ev: any) {
    console.log(ev);

  }

  getPendingAawak() {
    this.http.get(this.api.getUrl('PENDING_AWK') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pendingAawakData = data['result'];
        // this.bachatDataAll = data['result'];
        console.log("aawak", this.pendingAawakData);
      }
    });
  }

  mmSelected(ev: any) {
    if (ev) {
      this.bachatData = this.bachatDataAll.filter((b: { mm_id: any; }) => b.mm_id == ev);
    }
    else {
      this.bachatData = this.bachatDataAll;
    }
  }

  addAawakResponse(ev: any) {
    if (ev._id) {
      // this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.pendingAawakData.unshift(ev);
      this.getBachat();
      // this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
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
      this.getPendingAawak();
      this.getBachat();
    }
    $('#showModal').modal('hide');
    this.showModal = '';
    // this.isLoader = false;
  }

}
