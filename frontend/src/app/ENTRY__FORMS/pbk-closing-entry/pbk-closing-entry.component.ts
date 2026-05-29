import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FormService } from 'src/app/services/form.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { debounceTime } from 'rxjs';
declare var $: any;

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
  showModal: string = ''
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
        this.fMain.statusChanges?.pipe(debounceTime(100)).subscribe(() => {
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

  pbkSelected(ev: any) {
    if (ev) {
      this.isLoader = true;
      this.http.put(this.api.getUrl('PBKBACHAT') + 'bypbk/' + this.auth.webUser.dept_id, { pbk_id: ev })
        .subscribe((data: any) => {
          if (data.success) {

            this.populateForm(data.result);
          }
          this.isLoader = false;
        }, err => {
          this.isLoader = false;
          this.toastr.error(err.error || 'Error fetching bachat');
        });
    } else {
      this.fs.resetPbkClosing();
    }
  }

  populateForm(bachatList: any[]) {
    this.fs.pbkClosingFormMain.pbk_closings = [];

    for (let i in bachatList) {
      bachatList[i].pbk_bachat_id = bachatList[i]._id || null;
      bachatList[i].sw_bachat = bachatList[i].qty;
      bachatList[i].difference = bachatList[i].qty - bachatList[i].sw_bachat;
      delete bachatList[i]._id;
    }

    this.fs.pbkClosingFormMain.pbk_closings = [...bachatList];
    this.fs.pbkClosingFormStatusChanges()
  }

  qtyChanged(index: number) {
    let row = this.fs.pbkClosingFormMain.pbk_closings[index];
    row.difference = (row.sw_bachat || 0) - (row.qty || 0);
  }

  submit() {
    if (this.fs.validPbkClosing()) {
      this.isLoader = true;

      this.http.post(this.api.getUrl('PBKCLOSING') + 'bunch/' + this.auth.webUser.dept_id, this.fs.pbkClosingFormMain)
        .subscribe((data: any) => {
          if (data.success) {
            this.toastr.success('PBK Closing Added Successfully');
            this.fs.resetPbkClosing();
            this.response.emit(data.result);
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
    const row = this.fs.pbkClosingFormMain.pbk_closings[i];
    if (ev) {
      const item_id = ev.item_id || row.item_id;
      const subitem_id = ev.subitem_id || row.subitem_id;
      
      let item: any = this.items.find((it: { _id: any; }) => it._id == item_id);
      if (item) {
        let subitem: any = item.subitems?.find((s: { _id: any; }) => s._id == subitem_id);
        row.item_id = item_id;
        row.subitem_id = subitem_id;
        if (!this.isEdit) {
          row.unit_id = subitem ? subitem.unit_id : item.unit_id;
        }
      }
    } else {
      row.item_id = null;
      row.subitem_id = null;
      row.unit_id = null;
    }
  }


  pbkAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      this.fs.pbkClosingFormMain.pbk_id = ev._id;
      this.isLoader = false;
    }
    else {
      this.fs.pbkClosingFormMain.pbk_id = null;
      this.isLoader = false;
      console.log("err", ev);
    }
    this.pbkSelected(ev);
  }

  openModal(type: string) {
    this.showModal = type;
    $('#bunchPbkClosingComponent > #showModal').modal('show');
  }

  closeModal() {
    this.showModal = '';
    $('#bunchPbkClosingComponent > #showModal').modal('hide');
  }

}
