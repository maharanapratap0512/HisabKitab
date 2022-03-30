import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {

  isLoader: boolean = false;
  termMM: any = null;
  termPbk: any = null;
  termCat: any = null;
  termItem: any = null;
  termSubitem: any = null;
  termAJType: any = null;
  selMM: any = true;
  selPbk: any = true;
  selCat: any = true;
  selItem: any = true;
  selSubitem: any = true;
  selAJType: any = true;
  showModal: string = '';
  departments: any = [];
  deptConf: any = {};
  dept_id: any;
  mmsAll: any = [];
  mms: any = [];
  pbks: any = [];
  pbksAll: any = [];
  categories: any = [];
  items: any = [];
  itemsAll: any = [];
  subitems: any = [];
  subitemsAll: any = [];
  ajtypes: any = [];
  viewData: any = [];
  states: any = [];
  genders: any = [];
  statuses: any = [];


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
    this.getDepartments();
    this.states = this.gs.Lists.state;
    this.genders = this.gs.Lists.gender;
    this.statuses = this.gs.Lists.status;
  }

  getDepartments() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('DEPT') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.departments = data['result'].filter((i: { _id: number; }) => i._id > 1);
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  deptSelected(ev: any) {
    if (ev) {
      this.isLoader = true;
      this.http.get(this.api.getUrl('DEPTCONFIG') + ev).subscribe((data) => {
        if (data['result'] && data['success']) {
          this.loadPBK();
          if (this.dept_id > 2) {
            this.loadMM();
            this.loadCategory();
            this.loadItems();
            this.loadSubitems();
            this.loadAJTypes();
          }
          for (let i of data['result']) {
            this.deptConf[i.config_key] = { count: (i.config_value != '' ? i.config_value.split(',').length - 2 : 0), ...i };
          }
          console.log(this.deptConf);

          this.isLoader = false;
        }
        this.isLoader = false;
      });
    }
    else {
      this.deptConf = {};
    }
  }

  cancel() {
    this.deptSelected(this.dept_id);
  }

  setView(type: string) {
    this.showModal = type;
    switch (type) {
      case 'View Department':
        this.viewData = this.departments;
        $('#showModal').modal('show');
        break;
    }
  }

  addDeptResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.departments.unshift(ev);
      this.dept_id = ev._id;
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  loadMM() {
    this.http.get(this.api.getUrl('MM') + "forConfig/" + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.mms = data['result'];
        this.mmsAll = data['result'];
        console.log("dept", this.dept_id, "conf", this.mms);
      }
    });
  }

  stateSelected(ev: any) {
    if (ev) {
      this.mms = this.mmsAll.filter((i: { state_id: any; }) => i.state_id == ev);
      this.selMM = false;
      // console.log("all",this.mmsAll);
      // console.log("mm",this.mms);

    } else {
      this.mms = this.mmsAll;
      this.selMM = true;
    }
  }

  pbkStateSelected(ev: any) {
    if (ev) {
      this.pbks = this.pbksAll.filter((i: { state_id: any; }) => i.state_id == ev);
      this.selPbk = false;
      // console.log("all",this.pbksAll);
      // console.log("mm",this.pbks);

    } else {
      this.pbks = this.pbksAll;
      this.selPbk = true;
    }
  }

  pbkStatusSelected(ev: any) {
    if (ev) {
      this.pbks = this.pbksAll.filter((i: { status: any; }) => i.status == ev);
      this.selPbk = false;
      // console.log("all",this.pbksAll);
      // console.log("mm",this.pbks);

    } else {
      this.pbks = this.pbksAll;
      this.selPbk = true;
    }
  }

  pbkGenderSelected(ev: any) {
    if (ev) {
      this.pbks = this.pbksAll.filter((i: { gender: any; }) => i.gender == ev);
      this.selPbk = false;
      // console.log("all",this.pbksAll);
      // console.log("mm",this.pbks);

    } else {
      this.pbks = this.pbksAll;
      this.selPbk = true;
    }
  }

  catSelected(ev: any) {
    if (ev) {
      this.items = this.itemsAll.filter((i: { category_id: any; }) => i.category_id == ev);
      this.selItem = false;
      // console.log("all",this.itemsAll);
      // console.log("mm",this.items);

    } else {
      this.items = this.pbksAll;
      this.selItem = true;
    }
  }

  subitemCatSelected(ev: any) {
    if (ev) {
      this.subitems = this.subitemsAll.filter((i: { category_id: any; }) => i.category_id == ev);
      this.selSubitem = false;
      // console.log("all",this.subitemsAll);
      // console.log("mm",this.subitems);

    } else {
      this.subitems = this.pbksAll;
      this.selSubitem = true;
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      this.subitems = this.subitemsAll.filter((i: { item_id: any; }) => i.item_id == ev);
      this.selSubitem = false;
      // console.log("all",this.subitemsAll);
      // console.log("mm",this.subitems);

    } else {
      this.subitems = this.pbksAll;
      this.selSubitem = true;
    }
  }

  loadPBK() {
    this.http.get(this.api.getUrl('PBK') + "forConfig/" + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.pbks = data['result'];
        this.pbksAll = data['result'];
      }
    });
  }
  loadCategory() {
    this.http.get(this.api.getUrl('CATEGORY') + "forConfig/" + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.categories = data['result'];
      }
    });
  }
  loadItems() {
    this.http.get(this.api.getUrl('ITEM') + "forConfig/" + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.items = data['result'];
        this.itemsAll = data['result'];
      }
    });
  }
  loadSubitems() {
    this.http.get(this.api.getUrl('SUBITEM') + "forConfig/" + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.subitems = data['result'];
        this.subitemsAll = data['result'];
      }
    });
  }
  loadAJTypes() {
    this.http.get(this.api.getUrl('AJTYPE') + "forConfig/" + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.ajtypes = data['result'];
      }
    });
  }

  async mmRowClicked(i: any, chk: boolean, id: any) {
    if (this.termMM) {
      console.log("hello");

      if (chk) {
        this.deptConf.mm.count--;
        this.mms[this.mms.findIndex((i: { _id: any; }) => i._id == id)].chk = false;
      }
      else {
        this.deptConf.mm.count++;
        this.mms[this.mms.findIndex((i: { _id: any; }) => i._id == id)].chk = true;
      }

    } else {
      if (chk) {
        this.deptConf.mm.count--;
        this.mms[i].chk = false;
      }
      else {
        this.deptConf.mm.count++;
        this.mms[i].chk = true;
      }
    }
  }

  pbkRowClicked(i: any, chk: boolean, id: any) {
    if (this.termPbk) {
      if (chk) {
        this.deptConf.pbk.count--;
        this.pbks[this.pbks.findIndex((i: { _id: any; }) => i._id == id)].chk = false;
      }
      else {
        this.deptConf.pbk.count++;
        this.pbks[this.pbks.findIndex((i: { _id: any; }) => i._id == id)].chk = true;
      }

    } else {
      if (chk) {
        this.deptConf.pbk.count--;
        this.pbks[i].chk = false;
      }
      else {
        this.deptConf.pbk.count++;
        this.pbks[i].chk = true;
      }
    }
  }
  categoryRowClicked(i: any, chk: boolean, id: any) {
    if (this.termCat) {
      if (chk) {
        this.deptConf.category.count--;
        this.categories[this.categories.findIndex((i: { _id: any; }) => i._id == id)].chk = false;
      }
      else {
        this.deptConf.category.count++;
        this.categories[this.categories.findIndex((i: { _id: any; }) => i._id == id)].chk = true;
      }

    } else {
      if (chk) {
        this.deptConf.category.count--;
        this.categories[i].chk = false;
      }
      else {
        this.deptConf.category.count++;
        this.categories[i].chk = true;
      }
    }
  }
  itemRowClicked(i: any, chk: boolean, id: any) {

    if (this.termItem) {
      if (chk) {
        this.deptConf.item.count--;
        this.items[this.items.findIndex((i: { _id: any; }) => i._id == id)].chk = false;
      }
      else {
        this.deptConf.item.count++;
        this.items[this.items.findIndex((i: { _id: any; }) => i._id == id)].chk = true;
      }

    } else {
      if (chk) {
        this.deptConf.item.count--;
        this.items[i].chk = false;
      }
      else {
        this.deptConf.item.count++;
        this.items[i].chk = true;
      }
    }
  }
  subitemRowClicked(i: any, chk: boolean, id: any) {
    if (this.termSubitem) {
      if (chk) {
        this.deptConf.subitem.count--;
        this.subitems[this.subitems.findIndex((i: { _id: any; }) => i._id == id)].chk = false;
      }
      else {
        this.deptConf.subitem.count++;
        this.subitems[this.subitems.findIndex((i: { _id: any; }) => i._id == id)].chk = true;
      }

    } else {
      if (chk) {
        this.deptConf.subitem.count--;
        this.subitems[i].chk = false;
      }
      else {
        this.deptConf.subitem.count++;
        this.subitems[i].chk = true;
      }
    }
  }

  ajtypeRowClicked(i: any, chk: boolean, id: any) {
    if (this.termAJType) {
      if (chk) {
        this.deptConf.aj_type.count--;
        this.ajtypes[this.ajtypes.findIndex((i: { _id: any; }) => i._id == id)].chk = false;
      }
      else {
        this.deptConf.aj_type.count++;
        this.ajtypes[this.ajtypes.findIndex((i: { _id: any; }) => i._id == id)].chk = true;
      }

    } else {
      if (chk) {
        this.deptConf.aj_type.count--;
        this.ajtypes[i].chk = false;
      }
      else {
        this.deptConf.aj_type.count++;
        this.ajtypes[i].chk = true;
      }
    }
  }

  saveDeptSettings() {
    this.deptConf.mm.config_value = ',';
    this.deptConf.pbk.config_value = ',';
    this.deptConf.category.config_value = ',';
    this.deptConf.item.config_value = ',';
    this.deptConf.subitem.config_value = ',';
    this.deptConf.aj_type.config_value = ',';
    for (let i = 0; i < this.mmsAll.length; i++) {
      if (this.mmsAll[i].chk == true) {
        this.deptConf.mm.config_value += this.mmsAll[i]._id + ',';
      }
    }
    for (let i = 0; i < this.pbks.length; i++) {
      if (this.pbks[i].chk == true) {
        this.deptConf.pbk.config_value += this.pbks[i]._id + ',';
      }
    }
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].chk == true) {
        this.deptConf.category.config_value += this.categories[i]._id + ',';
      }
    }
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].chk == true) {
        this.deptConf.item.config_value += this.items[i]._id + ',';
      }
    }
    for (let i = 0; i < this.subitems.length; i++) {
      if (this.subitems[i].chk == true) {
        this.deptConf.subitem.config_value += this.subitems[i]._id + ',';
      }
    }
    for (let i = 0; i < this.ajtypes.length; i++) {
      if (this.ajtypes[i].chk == true) {
        this.deptConf.aj_type.config_value += this.ajtypes[i]._id + ',';
      }
    }

    this.http.put(this.api.getUrl('DEPTCONFSAVE'), this.deptConf).subscribe((data: any) => {
      if (data && data['success']) {
        console.log("data", data);
        // this.deptSelected(this.dept_id);
        this.isLoader = false;
        this.toastr.success('Department Updated Successfully.');
      }
    }, err => {
      this.toastr.error(err['error'].message);
      this.isLoader = false;
    });

  }


  selectAll(type: any) {
    switch (type) {
      case 'mm':
        this.mmsAll.map((i: { chk: boolean; }) => i.chk = true);
        this.deptConf.mm.count = this.mmsAll.length;
        this.mms = this.mmsAll;
        break;
      case 'pbk':
        this.pbksAll.map((i: { chk: boolean; }) => i.chk = true);
        this.deptConf.pbk.count = this.pbksAll.length;
        this.pbks = this.pbksAll;
        break;
      case 'category':
        this.categories.map((i: { chk: boolean; }) => i.chk = true);
        this.deptConf.pbk.count = this.categories.length;
        break;
      case 'item':
        this.itemsAll.map((i: { chk: boolean; }) => i.chk = true);
        this.deptConf.item.count = this.itemsAll.length;
        this.items = this.itemsAll;
        break;
      case 'subitem':
        this.subitemsAll.map((i: { chk: boolean; }) => i.chk = true);
        this.deptConf.subitem.count = this.subitemsAll.length;
        this.subitems = this.subitemsAll;
        break;
      case 'ajtype':
        this.ajtypes.map((i: { chk: boolean; }) => i.chk = true);
        this.deptConf.ajtype.count = this.ajtypes.length;
        break;

    }
  }
}
