import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { LoginComponent } from '../login/login.component';
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
  termItemmix: any = null;
  termSubitem: any = null;
  termAJType: any = null;
  selMM: any = true;
  selPbk: any = true;
  selCat: any = true;
  selItem: any = true;
  selItemmix: any = true;
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
  itemmix: any = [];
  itemsAll: any = [];
  subitems: any = [];
  subitemsAll: any = [];
  ajtypes: any = [];
  viewData: any = [];
  states: any = [];
  genders: any = [];
  statuses: any = [];
  itemMixCondition: any = {};
  settingsAll: any = [];


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
    // this.settingsAll.push({
    //   name: "Aawak",
    //   detail: "",
    //   visible: false,
    //   fields:[{
    //     name:"date",
    //     visible:false
    //   }]
    // });
    this.spinner.show();
    this.getDepartments();
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.genders = result.gender ? result.gender : [];
      this.statuses = result.status ? result.status : [];
    });
    this.settingsAll = {
      pbk: {
        visible: false,
        roll_no: false,
        pbk_hin: true,
        pbk_eng: false,
        gender: true,
        state_id: true,
        relation: false,
        relative_name: false,
        birth_date: false,
        age: false,
        address: false,
        townarea: false,
        city_id: false,
        mo_no: false,
        alt_mo_no: false,
        class_mm_id: false,
        bhatti_date: false,
        doccument: false
      },
      product: {
        visible: false,
        purchase_date: false,
        mm_id: true,
        purchased_by: false,
        purchase_from: false,
        filter_dept: false,
        filter_category: true,
        item_id: true,
        subitem_id: true,
        company_name: false,
        model_name: false,
        sr_num: true,
        product_code: true,
        condition_id: true,
        warranty_period: false,
        warranty_from: false,
        accessories: false,
        price: false,
        nimmit_id: false,
        product_detail: false,
        document: false
      },
      aawak: {
        visible: false,
        date: true,
        pkt_num: false,
        mm_id: true,
        filter_by_state: false,
        pbk_id: false,
        aawak_mm_id: true,
        nimmit_id: false,
        item_id: true,
        subitem_id: true,
        filter_by_dept: false,
        filter_by_cat: false,
        product_id: false,
        condition_id: false,
        qty: true,
        unit_id: true,
        rate: true,
        actual_amt: true,
        aawak_type_id: true,
        item_detail: false,
        description: false,
        jawak: {
          visible: false,
          jawak_mm_id: true,
          nimmit_id: true,
          qty: true
        }
      },
      jawak: {
        visible: false,
        pkt_num: false,
        date: true,
        jawak_mm_id: true,
        nimmit_id: false,
        filter_by_state: false,
        pbk_id: false,
        product_id: false,
        condition_id: false,
        qty: true,
        jawak_type_id: true,
        item_detail: false,
        description: false
      },
      bachat: {
        visible: false,
        used:true,
        stock:true,
        new:false,
        old:false,
        defective:false,
        scrap:false
      },
      category:{
        visible:false
      },
      item:{
        visible:false
      },
      mm:{
        visible:false
      },
      city:{
        visible:false
      },
      department:{
        visible:false
      },
      point:{
        visible:false
      }
    }
    
  }

  getDepartments() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('DEPT') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        // this.departments = data['result'].filter((i: { _id: number; }) => i._id > 1);
        this.departments = data['result'];
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
            // this.loadItems();
            this.loadItemMix();
            // this.loadSubitems();
            this.loadAJTypes();
          }
          for (let i of data['result']) {
            if (i.config_key == "settings") {
              this.deptConf[i.config_key] = i;
              this.applySettings(i.config_value);
            }
            else {
              this.deptConf[i.config_key] = { idArr: (i.config_value && i.config_value != '' ? i.config_value.split(',') : ['']), ...i };
              if (this.deptConf[i.config_key].idArr.length > 1) {
                this.deptConf[i.config_key].idArr.pop();
              }
            }
          }
          // console.log(this.deptConf);

          this.isLoader = false;
        }
        this.isLoader = false;
      });
    }
    else {
      this.deptConf = {};
    }
  }

  applySettings(configValue: any) {

    for (let key of Object.keys(configValue)) {
      this.settingsAll[key] = configValue[key];
    }
    

  }

  cancel() {
    this.deptSelected(this.dept_id);
  }

  downloadDB() {
    this.http.get(this.api.getUrl('EXPORTFULL') + this.dept_id).subscribe((data) => {
      Swal.fire({
        title: 'Database Generated',
        text: "FullPath : " + data['result'].path,
        icon: 'success',
        // showCancelButton: true,
        confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: 'Ok, Got it.'
      }).then((result) => {
        if (result.isConfirmed) {

        }
      })

    });
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
        // console.log("dept", this.dept_id, "conf", this.mms);
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

  catItemSelected(ev: any) {
    if (ev) {
      this.itemMixCondition.category_id = ev;
    } else {
      this.itemMixCondition.category_id = null;
    }
    this.loadItemMix();
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
  loadItemMix() {
    // console.log("condition", this.itemMixCondition);

    this.http.put(this.api.getUrl('ITEM') + "forConfig/" + this.dept_id, this.itemMixCondition).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.itemmix = data['result'];
        // this.itemsAll = data['result'];
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
      i = this.mms.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.mm.idArr.splice(this.deptConf.mm.idArr.indexOf(this.mms[i]._id.toString()), 1);
      this.mms[i].chk = false;
    }
    else {
      this.deptConf.mm.idArr.push(this.mms[i]._id.toString());
      this.mms[i].chk = true;
    }

  }

  pbkRowClicked(i: any, chk: boolean, id: any) {
    if (this.termPbk) {
      i = this.pbks.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.pbk.idArr.splice(this.deptConf.pbk.idArr.indexOf(this.pbks[i]._id.toString()), 1);
      this.pbks[i].chk = false;
    }
    else {
      this.deptConf.pbk.idArr.push(this.pbks[i]._id.toString());
      this.pbks[i].chk = true;
    }
  }
  categoryRowClicked(i: any, chk: boolean, id: any) {
    if (this.termCat) {
      i = this.categories.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.category.idArr.splice(this.deptConf.category.idArr.indexOf(this.categories[i]._id.toString()), 1);
      this.categories[i].chk = false;
    }
    else {
      this.deptConf.category.idArr.push(this.categories[i]._id.toString());
      this.categories[i].chk = true;
    }
  }
  itemRowClicked(i: any, chk: boolean, id: any) {

    if (this.termItem) {
      i = this.items.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.item.idArr.splice(this.deptConf.item.idArr.indexOf(this.items[i]._id.toString()), 1);
      this.items[i].chk = false;
    }
    else {
      this.deptConf.item.idArr.push(this.items[i]._id.toString());
      this.items[i].chk = true;
    }
  }

  itemmixRowClicked(i: any, chk: boolean, id: any) {

    if (this.termItemmix) {
      i = this.itemmix.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.item.idArr.splice(this.deptConf.item.idArr.indexOf(this.itemmix[i]._id.toString()), 1);
      this.itemmix[i].chk = false;
      for (let j in this.itemmix[i].subitems) {
        if (this.itemmix[i].subitems[j].chk) {
          this.itemmix[i].subitems[j].chk = false;
          this.deptConf.subitem.idArr.splice(this.deptConf.subitem.idArr.indexOf(this.itemmix[i].subitems[j]._id.toString()), 1)
        }
      }
    }
    else {
      this.deptConf.item.idArr.push(this.itemmix[i]._id.toString());
      this.itemmix[i].chk = true;
    }
  }

  subitemmixRowClicked(itemIndex: any, subitemIndex: any, chk: boolean, itemId: any, subitemId: any,) {

    if (this.termItemmix) {
      itemIndex = this.itemmix.findIndex((i: { _id: any; }) => i._id == itemId);
      subitemIndex = this.itemmix[itemIndex].subitems.findIndex((s: { _id: any; }) => s._id == subitemId);

    }
    if (chk) {
      this.deptConf.subitem.idArr.splice(this.deptConf.subitem.idArr.indexOf(this.itemmix[itemIndex].subitems[subitemIndex]._id.toString()), 1);
      this.itemmix[itemIndex].subitems[subitemIndex].chk = false;
    }
    else {
      this.deptConf.subitem.idArr.push(this.itemmix[itemIndex].subitems[subitemIndex]._id.toString())
      this.itemmix[itemIndex].subitems[subitemIndex].chk = true;
      if (!this.itemmix[itemIndex].chk) {
        this.itemmix[itemIndex].chk = true;
        this.deptConf.item.idArr.push(this.itemmix[itemIndex]._id.toString())
      }

    }
  }

  subitemRowClicked(i: any, chk: boolean, id: any) {
    if (this.termSubitem) {
      i = this.subitems.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.subitem.idArr.splice(this.deptConf.subitem.idArr.indexOf(this.subitems[i]._id.toString()), 1);
      this.subitems[i].chk = false;
    }
    else {
      this.deptConf.subitem.idArr.push(this.subitems[i]._id.toString());
      this.subitems[i].chk = true;
    }
  }

  ajtypeRowClicked(i: any, chk: boolean, id: any) {
    if (this.termAJType) {
      i = this.ajtypes.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.aj_type.idArr.splice(this.deptConf.aj_type.idArr.indexOf(this.ajtypes[i]._id.toString()), 1);
      this.ajtypes[i].chk = false;
    }
    else {
      this.deptConf.aj_type.idArr.push(this.ajtypes[i]._id.toString());
      this.ajtypes[i].chk = true;
    }
  }

  saveDeptSettings() {
    this.deptConf.mm.config_value = this.deptConf.mm.idArr.join(',') + ',';
    this.deptConf.pbk.config_value = this.deptConf.pbk.idArr.join(',') + ',';
    this.deptConf.category.config_value = this.deptConf.category.idArr.join(',') + ',';
    this.deptConf.item.config_value = this.deptConf.item.idArr.join(',') + ',';
    this.deptConf.subitem.config_value = this.deptConf.subitem.idArr.join(',') + ',';
    this.deptConf.aj_type.config_value = this.deptConf.aj_type.idArr.join(',') + ',';
    this.deptConf.settings.config_value = this.settingsAll;
    // for (let i = 0; i < this.mmsAll.length; i++) {
    //   if (this.mmsAll[i].chk == true) {

    //   }
    // }
    // this.deptConf.mm.config_value = this.deptConf.mm.idArr.join(',');
    // for (let i = 0; i < this.pbks.length; i++) {
    //   if (this.pbks[i].chk == true) {
    //     this.deptConf.pbk.config_value += this.pbks[i]._id + ',';
    //   }
    // }
    // for (let i = 0; i < this.categories.length; i++) {
    //   if (this.categories[i].chk == true) {
    //     this.deptConf.category.config_value += this.categories[i]._id + ',';
    //   }
    // }
    // for (let i = 0; i < this.items.length; i++) {
    //   if (this.items[i].chk == true) {
    //     this.deptConf.item.config_value += this.items[i]._id + ',';
    //   }
    // }
    // for (let i = 0; i < this.subitems.length; i++) {
    //   if (this.subitems[i].chk == true) {
    //     this.deptConf.subitem.config_value += this.subitems[i]._id + ',';
    //   }
    // }
    // for (let i = 0; i < this.ajtypes.length; i++) {
    //   if (this.ajtypes[i].chk == true) {
    //     this.deptConf.aj_type.config_value += this.ajtypes[i]._id + ',';
    //   }
    // }

    this.http.put(this.api.getUrl('DEPTCONFSAVE'), this.deptConf).subscribe((data: any) => {
      if (data && data['success']) {
        // console.log("data", data);
        // this.deptSelected(this.dept_id);
        this.isLoader = false;
        this.toastr.success('Department Updated Successfully.');
        if(this.dept_id == this.auth.webUser.dept_id){
          this.auth.webUser.settings = this.settingsAll;
        }
        this.deptSelected(this.dept_id);
      }
    }, err => {
      this.toastr.error(err['error'].message);
      this.isLoader = false;
    });

  }


  selectAll(type: any) {
    switch (type) {
      case 'mm':
        this.mms.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.mm.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;
      case 'pbk':
        this.pbks.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.pbk.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;
      case 'category':
        this.categories.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.category.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;
      case 'item':
        this.items.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.item.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;
      case 'itemmix':
        this.itemmix.map((i: { _id: any, chk: boolean, subitems: any; }) => {
          if (!i.chk) {
            this.deptConf.item.idArr.push(i._id.toString());
            i.chk = true;
          }
          i.subitems.map((j: { _id: any, chk: boolean }) => {
            if (!j.chk) {
              this.deptConf.subitem.idArr.push(j._id.toString());
              j.chk = true;
            }
          });
        });
        break;
      case 'subitem':
        this.subitems.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.subitem.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;
      case 'ajtype':
        this.ajtypes.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.aj_type.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;

    }
  }
}
