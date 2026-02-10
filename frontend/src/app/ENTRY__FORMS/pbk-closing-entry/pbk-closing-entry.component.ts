import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormService } from 'src/app/services/form.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-pbk-closing-entry',
  templateUrl: './pbk-closing-entry.component.html',
  styleUrls: ['./pbk-closing-entry.component.scss']
})
export class PbkClosingEntryComponent implements OnInit {

  @ViewChild('fMain') fMain!: NgForm;
  @Input() isEdit: any;
  @Input() getData: any;
  @Output() response = new EventEmitter();
  states: any = [];
  pbks: any = [];
  items: any = [];
  subitems: any = [];
  units: any = [];
  conditions: any = [];

  isLoader: boolean = false;

  constructor(
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    public auth: AuthService,
    public fs: FormService
  ) {
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.conditions = result.condition ? result.condition : [];
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      if (this.fMain) {
        this.fMain.statusChanges?.pipe(debounceTime(200)).subscribe(() => {
          this.fs.pbkClosingFormStatusChanges();
        });
      }
    }, 500);
  }

  stateSelected(ev: any) {
    if (ev) {
      this.pbks = this.gs.Lists.pbk.filter((p: { state_id: any; }) => p.state_id == ev);
    } else {
      this.pbks = this.gs.Lists.pbk;
    }
  }

  pbkSelected() {
    if (this.fs.pbkClosingFormMain.pbk_id) {
      this.loadPbkBachat();
    }
  }

  loadPbkBachat() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('PBK_CLOSING') + 'bachat/' + this.fs.pbkClosingFormMain.pbk_id + '?dept_id=' + this.auth.webUser.dept_id)
      .subscribe((data: any) => {
        if (data.success) {
          this.populateForm(data.result);
        }
        this.isLoader = false;
      }, err => {
        this.isLoader = false;
        this.toastr.error(err.error || 'Error fetching bachat');
      });
  }

  populateForm(bachatList: any[]) {
    this.fs.pbkClosingFormMain.pbk_closings = [];

    for (let i = 0; i < bachatList.length; i++) {
      let b = bachatList[i];
      let form = { ...this.fs.pbkClosingForm };
      this.fs.pbkClosingFormMain.pbk_closings.push(form);
      this.itemSubitemSelected(b.item_id + ':' + b.subitem_id, i);
      this.fs.pbkClosingFormMain.pbk_closing[i].unit_id = b.unit_id;
      this.fs.pbkClosingFormMain.pbk_closing[i].condition_id = b.condition_id;
      this.fs.pbkClosingFormMain.pbk_closing[i].sw_bachat = b.qty;
      this.fs.pbkClosingFormMain.pbk_closing[i].qty = b.qty;
      this.fs.pbkClosingFormMain.pbk_closing[i].difference = 0;
      this.fs.pbkClosingFormMain.pbk_closing[i].active = 1;
      this.fs.pbkClosingFormMain.pbk_closing[i].pbk_bachat_id = b._id;
      this.fs.pbkClosingFormMain.pbk_closing[i]._item_id = b.item_id;


    }


    if (this.fs.pbkClosingFormMain.pbk_closings.length === 0) {
      this.fs.pbkClosingFormMain.pbk_closings.push(JSON.parse(JSON.stringify(this.fs.pbkClosingForm)));
    }
  }

  qtyChanged(index: number) {
    let row = this.fs.pbkClosingFormMain.pbk_closings[index];
    row.difference = (row.qty || 0) - (row.sw_bachat || 0);
  }

  submit() {
    this.fs.submit = true;
    if (this.fs.pbkClosingFormMain.pbk_id && this.fs.pbkClosingFormMain.date && this.fs.pbkClosingFormMain.pbk_closings.length > 0) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('PBK_CLOSING') + 'bunch/' + this.auth.webUser.dept_id, this.fs.pbkClosingFormMain)
        .subscribe((data: any) => {
          if (data.success) {
            this.toastr.success('Closing Added Successfully');
            this.fs.resetPbkClosing();
          } else {
            this.toastr.error(data.message);
          }
          this.isLoader = false;
        }, err => {
          this.isLoader = false;
          this.toastr.error(err.error || 'Error saving closing');
        });
    } else {
      this.toastr.error('Please fill required fields (Date, PBK) or ensure items exist.');
    }
  }

  itemSubitemSelected(ev: any, i: any) {
    if (ev) {
      this.fs.pbkClosingFormMain.pbk_closings[i].item_subitem_id = ev;
      let item_id = Number.parseInt(ev.split(':')[0]);
      let subitem_id = ev.split(':')[1] ? Number.parseInt(ev.split(':')[1]) : null;
      this.fs.pbkClosingFormMain.pbk_closings[i].item_id = item_id;
      this.fs.pbkClosingFormMain.pbk_closings[i].subitem_id = subitem_id;

      let item: any = this.items.find((i: { _id: any; }) => i._id == item_id);
      let subitem: any = item.subitems.find((i: { _id: any; }) => i._id == subitem_id);
      // this.lotNos = this.lotNoAll.filter((l: { item_id: any; subitem_id: any; }) => l.item_id == item_id && l.subitem_id == subitem_id);

      if (!this.isEdit && subitem)
        this.fs.pbkClosingFormMain.pbk_closings[i].unit_id = subitem.unit_id;
      else if (!this.isEdit)
        this.fs.pbkClosingFormMain.pbk_closings[i].unit_id = item.unit_id;
    } else {
      this.fs.pbkClosingFormMain.pbk_closings[i].item_id = null;
      this.fs.pbkClosingFormMain.pbk_closings[i].subitem_id = null;
    }
  }

}
