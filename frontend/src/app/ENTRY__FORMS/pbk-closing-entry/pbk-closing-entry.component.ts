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
      bachatList[i].sw_bachat = bachatList[i].qty;
      bachatList[i].item_subitem_id = bachatList[i].subitem_id ? bachatList[i].item_id + ":" + bachatList[i].subitem_id : bachatList[i].item_id;
    }

    this.fs.pbkClosingFormMain.pbk_closings = [...bachatList];
    this.fs.pbkClosingFormStatusChanges()
  }

  qtyChanged(index: number) {
    let row = this.fs.pbkClosingFormMain.pbk_closings[index];
    row.difference = (row.sw_bachat || 0) - (row.qty || 0);
  }

  submit() {
    this.fs.submit = true;
    if (this.fs.pbkClosingFormMain.pbk_id && this.fs.pbkClosingFormMain.date && this.fs.pbkClosingFormMain.pbk_closings.length > 0) {
      this.isLoader = true;
      console.log(this.fs.pbkClosingFormMain);

      // this.http.post(this.api.getUrl('PBK_CLOSING') + 'bunch/' + this.auth.webUser.dept_id, this.fs.pbkClosingFormMain)
      //   .subscribe((data: any) => {
      //     if (data.success) {
      //       this.toastr.success('Closing Added Successfully');
      //       this.fs.resetPbkClosing();
      //     } else {
      //       this.toastr.error(data.message);
      //     }
      //     this.isLoader = false;
      //   }, err => {
      //     this.isLoader = false;
      //     this.toastr.error(err.error || 'Error saving closing');
      //   });
    } else {
      this.toastr.error('Please fill required fields (Date, PBK) or ensure items exist.');
    }
  }

  itemSubitemSelected(ev: any, i: any) {
    if (ev) {
      let item_id: any = null, subitem_id: any = null;
      if (typeof ev == 'number') {
        item_id = ev;
        subitem_id = null;
      } else {
        item_id = parseInt(ev.split(':')[0]);
        subitem_id = parseInt(ev.split(':')[1]) || null;
      }

      this.fs.pbkClosingFormMain.pbk_closings[i].item_id = item_id;
      this.fs.pbkClosingFormMain.pbk_closings[i].subitem_id = subitem_id;

      let item: any = this.items.find((i: { _id: any; }) => i._id == item_id);
      let subitem: any = item.subitems.find((i: { _id: any; }) => i._id == subitem_id);

      if (!this.isEdit && subitem)
        this.fs.pbkClosingFormMain.pbk_closings[i].unit_id = subitem.unit_id;
      else if (!this.isEdit)
        this.fs.pbkClosingFormMain.pbk_closings[i].unit_id = item.unit_id;
    } else {
      this.fs.pbkClosingFormMain.pbk_closings[i].item_id = null;
      this.fs.pbkClosingFormMain.pbk_closings[i].subitem_id = null;
      this.fs.pbkClosingFormMain.pbk_closings[i].unit_id = null;
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
