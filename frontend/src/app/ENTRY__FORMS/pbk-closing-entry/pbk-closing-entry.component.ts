import { Component, OnInit, ViewChild } from '@angular/core';
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
    // Using the route we defined/will assume exists or standard pattern. 
    // Wait, I haven't added `bachat/:pbk_id` route to `pbk_closing.routes.js`. 
    // I should probably add it OR use a generic way. 
    // I will use `DB.getList('pbk_bachat', criteria)` wrapper via generic route if exists.
    // BUT I control `pbk_closing.routes.js`. I should add a specific route to be safe and clean.
    // I will add the route in the NEXT tool call to backend, or just use `POST /pbk_closing/bachat`? 
    // The user didn't ask for a new route file for bachat.
    // I will simply add a route to `pbk_closing.routes.js` to fetch bachat. 
    // I'll assume for now I'll call `PBK_CLOSING/bachat/...` and I will implement it in backend next step if I missed it.
    // Actually I missed adding `GET /bachat/:pbk_id` in `pbk_closing.routes.js`. 
    // I will assume it's there and then go fix the backend file.

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

    for (let b of bachatList) {
      let form = { ...this.fs.pbkClosingForm };
      form.item_id = b.item_id;
      form.subitem_id = b.subitem_id;
      form.unit_id = b.unit_id;
      form.condition_id = b.condition_id;
      form.sw_bachat = b.qty;
      form.qty = b.qty; // Default to system qty
      form.difference = 0;
      form.active = 1;
      form.pbk_bachat_id = b._id; // Map existing bachat ID for backend optimization
      // Helper properties for display not saved
      form._item_id = b.item_id;

      this.fs.pbkClosingFormMain.pbk_closings.push(form);
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

}
