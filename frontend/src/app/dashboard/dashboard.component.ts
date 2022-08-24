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

  isLoader:any = false;
  termAawak: any;
  term: any;
  termBachat: any;
  pendingAawakData: any = [];
  pendingAawakDataAll: any = [];
  bachatData: any = [];
  bachatDataAll: any = [];
  editData: any = {};
  awkDraft: any = {};
  mms: any = [];
  categories: any = [];
  showModal: String = '';
  items: any = [];
  fields: any;
  viewData: any = [];
  mmAwk: any;
  settings: any = {};
  filterObj: any = {
    mm_id: null,
    items: []
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
    this.getBachat();
    // this.getPendingAawak();
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

  getBachat() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('BACHATHOME') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.bachatDataAll = data['result'];
        this.bachatData = this.bachatDataAll;
        // console.log("bachat", this.bachatData);

        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  filterBachat() {
    
    if (this.filterObj.mm_id && this.filterObj.items.length > 0) {
      this.bachatData = this.bachatDataAll.filter((b: { mm_id: any, item_id: any; }) => b.mm_id == this.filterObj.mm_id && this.filterObj.items.includes(b.item_id));
    }
    else if (this.filterObj.mm_id) {
      this.bachatData = this.bachatDataAll.filter((b: { mm_id: any; }) => b.mm_id == this.filterObj.mm_id);
    }
    else if (this.filterObj.items.length > 0) {
      this.bachatData = this.bachatDataAll.filter((b: { item_id: any; }) => this.filterObj.items.includes(b.item_id));
    }
    else {
      this.bachatData = this.bachatDataAll;
    }

  }

  itemSelected(ev: any) {
    this.filterObj.items = ev;
    this.filterBachat();    
  }

  mmSelected(ev: any) {
    this.filterObj.mm_id = ev;
    this.filterBachat();
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
      this.awkDraft = ev;
      this.toastr.info("Aawak saved in Draft.")
    }
  }

  addJawak(awk: any, bachat: any) {

    this.editData = {
      bachat_id: bachat._id,
      mm_id: bachat.mm_id,
      mm_hin: bachat.mm_hin,
      item_id: bachat.item_id,
      item_hin: bachat.item_hin,
      subitem_id: bachat.subitem_id,
      subitem_hin: bachat.subitem_hin,
      unit_id: bachat.unit_id,
      unit_short: bachat.unit_short,
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
      let bindex = this.bachatData.findIndex((b: { _id: any; }) => b._id == this.editData.bachat_id);
      console.log("bachat index", bindex);
      console.log("bachat", this.editData);
      console.log("bachatAll", this.bachatData);

      // if(bindex && this.bachatData[bindex].aawaks){
      //   let index = this.bachatData[bindex].aawaks.indexOf((a: { _id: any; })=>a._id == ev.aawak_ref_id);
      //   if(index){
      //     this.bachatData[bindex].aawaks[index].remaining_qty -= ev.qty;
      //   }
      // }
    }
    $('#showModal').modal('hide');
    this.showModal = '';
    // this.isLoader = false;
  }

}
