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
  pendingAawakDataAll: any = [];
  bachatData: any = [];
  bachatDataAll: any = [];
  editData: any = {};
  mms: any = [];
  categories: any = [];
  showModal: String = '';
  sitems: any = [];
  fields: any;
  viewData: any = [];
  mmAwk: any;
  settings: any = {};

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
    // this.getPendingAawak();
    this.gs.observeList().subscribe(result => {
      // console.log("dashboard", result);

      this.mms = result.mm ? result.mm : [];
      this.sitems = result.sitem ? result.sitem : [];
      this.categories = result.category ? result.category : [];
    });
    this.settings = this.auth.webUser.settings;
  }


  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  getBachat() {
    // this.isLoader = true;
    this.http.get(this.api.getUrl('BACHATHOME') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.bachatDataAll = data['result'];
        this.bachatData = this.bachatDataAll;
        // console.log("bachat", this.bachatData);

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
        this.pendingAawakDataAll = data['result'];
        this.pendingAawakData = data['result'];
      }
    });
  }

  catForAwkSelected(ev: any) {
    if (ev) {
      this.pendingAawakData = this.pendingAawakDataAll.filter((a: { item_categories: any[], subitem_categories: any[] }) => a.item_categories.includes(ev) || a.subitem_categories.includes(ev))
    } else {
      this.pendingAawakData = this.pendingAawakDataAll;
    }

  }

  mmForAwkSelected(ev: any) {
    let body: any = {};
    body.dept_id = this.auth.webUser.dept_id;
    if (ev) {
      body.mm_id = ev;
    }
    this.http.put(this.api.getUrl('PENDING_AWK') + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pendingAawakDataAll = data['result'];
        this.pendingAawakData = data['result'];
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

  addJawak(awk: any, bachat: any) {

    this.editData = {
      mm_id: bachat.mm_id,
      mm_hin: bachat.mm_hin,
      item_id: bachat.item_id,
      item_hin: bachat.item_hin,
      subitem_id: bachat.subitem_id,
      subitem_hin: bachat.subitem_hin,
      unit_id: bachat.unit_id,
      dept_id: bachat.dept_id,
      ...awk
    };
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  showJawak(id: any) {
    if (id) {
      this.http.get(this.api.getUrl('JAWAKBYAWK') + id).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          if (data['result'].length > 0) {
            this.viewData = data['result'];
            this.openModal('Show Jawak');
          }
          else {
            this.toastr.warning("No any jawak Found")
          }
        }
      });
    }
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    console.log(ev);

    if (ev.aawak_ref_id) {
    }
    $('#showModal').modal('hide');
    this.showModal = '';
    // this.isLoader = false;
  }

}
