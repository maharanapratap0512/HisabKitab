import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs/internal/Subject';
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
  department: any = [];
  departmentAll: any = [];
  termDept: any;
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
  dataZip: JSZip = new JSZip();
  pbkPageNo: any = 2;
  getPbk$ = new Subject();
  pbkTotal: any;
  getItem$ = new Subject();
  itemTotal: any;

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
      nimitt:{
        visible:false,
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
        nimitt_id: false,
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
        nimitt_id: false,
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
        isbill:false,
        jawak: {
          visible: false,
          jawak_mm_id: true,
          nimitt_id: true,
          qty: true
        }
      },
      jawak: {
        visible: false,
        pkt_num: false,
        date: true,
        jawak_mm_id: true,
        nimitt_id: false,
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
        used: true,
        stock: true,
        repairing: false,
        new: false,
        old: false,
        defective: false,
        scrap: false
      },
      category: {
        visible: false
      },
      item: {
        visible: false
      },
      mm: {
        visible: false
      },
      city: {
        visible: false
      },
      department: {
        visible: false
      },
      point: {
        visible: false
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
          this.loadPBK();
          if (this.dept_id > 2) {
            this.loadMM();
            this.loadCategory();
            // this.loadItems();
            this.loadItemMix();
            // this.loadSubitems();
            this.loadAJTypes();
            this.loadDepartment();

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

  importZip = async (ev: any) => {
    this.isLoader = true;

    if (ev.target.files[0]) {

      const fileReader: any = new FileReader();
      fileReader.readAsArrayBuffer(ev.target.files[0]); //reading 1st file only

      fileReader.onload = () => {

        this.dataZip = new JSZip();
        //loading zip file content
        this.dataZip.loadAsync(fileReader.result).then((zip: any) => {

          //checking zip data found or not
          if (zip) {
            // getting name of all exists files in zip in array.
            let fileNames = Object.keys(zip.files);

            // loop through all files
            for (let i in fileNames) {

              //accept only files that listed below, other ignore.
              switch (fileNames[i]) {
                case 'settings.json':

                  zip.file(fileNames[i]).async("string").then((data: any) => {

                    if (data) {
                      let setting = JSON.parse(data);
                      let body = {
                        query: {
                          _id: (setting._id ? setting._id : null),
                          dept_id: setting.dept_id,
                          config_key: setting.config_key,
                        },
                        set: {
                          config_key: setting.config_key,
                          config_value: setting.config_value,
                          active: setting.active,
                          created_at: setting.created_at,
                          updated_at: setting.updated_at,
                        }
                      }

                      this.http.put(this.api.getUrl('DEPTCONFIG'), body).subscribe((resdata: any) => {
                        if(resdata.result.length > 0){
                          let setting = JSON.parse(resdata.result[0].config_value);
                          if (resdata.result[0].dept_id == this.auth.webUser.dept_id) {
                            this.auth.updateSettings(setting);
                          }
                          this.toastr.success("settings import successfully");
                        }
                      });
                    }
                    else {
                      this.toastr.error('can not read settings file from zip')
                    }
                  });
                  break;

                case 'category.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let category = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("category", category);

                    }
                    else {
                      this.toastr.error('can not read category file from zip');
                    }
                  });
                  break;

                case 'city.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let city = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("city", city);

                    }
                    else {
                      this.toastr.error('can not read city file from zip');
                    }
                  });
                  break;

                case 'country.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let country = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("country", country);

                    }
                    else {
                      this.toastr.error('can not read country file from zip');
                    }
                  });
                  break;

                case 'item.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let item = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("item", item);

                    }
                    else {
                      this.toastr.error('can not read item file from zip');
                    }
                  });
                  break;

                case 'mm.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let mm = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("mm", mm);

                    }
                    else {
                      this.toastr.error('can not read mm file from zip');
                    }
                  });
                  break;

                case 'pbk.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let pbk = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("pbk", pbk);

                    }
                    else {
                      this.toastr.error('can not read pbk file from zip');
                    }
                  });
                  break;

                case 'product.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let product = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("product", product);

                    }
                    else {
                      this.toastr.error('can not read product file from zip');
                    }
                  });
                  break;

                case 'state.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let state = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("state", state);

                    }
                    else {
                      this.toastr.error('can not read state file from zip');
                    }
                  });
                  break;

                case 'subitem.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let subitem = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("subitem", subitem);

                    }
                    else {
                      this.toastr.error('can not read subitem file from zip');
                    }
                  });
                  break;

                case 'subitem_list.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let subitem_list = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("subitem_list", subitem_list);

                    }
                    else {
                      this.toastr.error('can not read subitem_list file from zip');
                    }
                  });
                  break;

                case 'support_list.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let support_list = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("support_list", support_list);

                    }
                    else {
                      this.toastr.error('can not read support_list file from zip');
                    }
                  });
                  break;

                case 'unit.json':
                  zip.file(fileNames[i]).async("string").then((data: any) => {
                    if (data) {
                      let unit = JSON.parse(data).filter((c: { active: number; }) => c.active == 0);
                      console.log("unit", unit);

                    }
                    else {
                      this.toastr.error('can not read unit file from zip');
                    }
                  });
                  break;
              }
            }
          }

        });

      }

    }
    this.isLoader = false;
    ev = null;
  }

  applySettings(configValue: any) {
    configValue.aawak && configValue.aawak.nimmit_id ? delete configValue.aawak.nimmit_id : console.log('');
    configValue.jawak && configValue.jawak.nimmit_id ? delete configValue.jawak.nimmit_id : console.log('');
    configValue.product && configValue.product.nimmit_id ? delete configValue.product.nimmit_id : console.log('');
    configValue.aawak && configValue.aawak.jawak && configValue.aawak.jawak.nimmit_id ? delete configValue.aawak.jawak.nimmit_id : console.log('');

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
      });

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
      this.items = this.itemsAll;
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
      this.subitems = this.subitemsAll;
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
      this.subitems = this.subitemsAll;
      this.selSubitem = true;
    }
  }

  loadMM() {
    this.http.get(this.api.getUrl('MM') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        console.log('get result', data['result']);

        if (this.deptConf.mm && this.deptConf.mm.idArr) {
          console.log("arrr in if", this.deptConf.mm.idArr);

          for (let i in data['result']) {
            if (this.deptConf.mm.idArr.includes(data['result'][i]._id.toString())) {
              data['result'][i].chk = true;
            }
          }
        }
        this.mms = data['result'];
        this.mmsAll = data['result'];
        // console.log("dept", this.dept_id, "conf", this.mms);
      }
    });
  }

  loadPBK() {
    // this.http.get(this.api.getUrl('PBK') + "forConfig/" + this.dept_id).subscribe((data) => {
    //   if (data['result'] && data['success']) {
    //     this.pbks = data['result'];
    //     this.pbksAll = data['result'];
    //   }
    // });
    this.http.put(this.api.getUrl('PBK') + 1, {}).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.pbkTotal = data['total_count']
        if (this.deptConf.pbk && this.deptConf.pbk.idArr) {
          for (let i in data['result']) {
            if (this.deptConf.pbk.idArr.includes(data['result'][i]._id.toString())) {
              data['result'][i].chk = true;
            }
          }
        }
        this.pbks = data['result'];
        this.pbksAll = data['result'];

        if (this.pbkTotal > this.pbksAll.length) {
          this.getMorePbk();
        }
      }
    });

    this.getPbk$.subscribe((result: any) => {
      for (let i in result) {
        if (this.deptConf.pbk.idArr.includes(result[i]._id.toString())) {
          result[i].chk = true;
        }
      }
      this.pbksAll.push(...result);
      if (this.pbkTotal > this.pbksAll.length) {
        this.getMorePbk();
      }
    });
  }
  getMorePbk() {
    this.http.put(this.api.getUrl('PBK') + 1, { pageNo: this.pbkPageNo }).subscribe((data: any) => {
      if (data['result'] && data["result"].length > 0) {
        if (data["pageNo"]) {
          this.pbkPageNo = data["pageNo"] + 1;
        }
        this.getPbk$.next(data['result']);
        // this.isLoader = false;
      }
      // this.isLoader = false;
    });
  }
  loadDepartment() {
    this.http.get(this.api.getUrl('DEPT') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        if (this.deptConf.department && this.deptConf.department.idArr) {
          for (let i in data['result']) {
            if (this.deptConf.department.idArr.includes(data['result'][i]._id.toString())) {
              data['result'][i].chk = true;
            }
          }
        }
        this.department = data['result'];
        this.departmentAll = data['result'];
      }
    });
  }
  loadCategory() {
    this.http.get(this.api.getUrl('CATEGORY') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        if (this.deptConf.category && this.deptConf.category.idArr) {
          for (let i in data['result']) {
            if (this.deptConf.category.idArr.includes(data['result'][i]._id.toString())) {
              data['result'][i].chk = true;
            }
          }
        }
        this.categories = data['result'];
      }
    });
  }
  loadItemMix() {
    // console.log("condition", this.itemMixCondition);
    this.itemMixCondition.pageNo = 1;
    this.http.put(this.api.getUrl('ITEMMIX') + 1, this.itemMixCondition).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.itemTotal = data['item_count']
        this.itemMixCondition.pageNo = (data["pageNo"] ? data["pageNo"] : 0) + 1;
        if (this.deptConf.item && this.deptConf.item.idArr) {
          for (let i in data['result']) {
            if (this.deptConf.item.idArr.includes(data['result'][i]._id.toString())) {
              data['result'][i].chk = true;
              for (let j in data['result'][i].subitems) {
                if (this.deptConf.subitem.idArr.includes(data['result'][i].subitems[j]._id.toString())) {
                  data['result'][i].subitems[j].chk = true;
                }
              }
            }
          }
        }
        this.itemmix = data['result'];
        if (this.itemTotal > this.itemmix.length) {
          this.getMoreItemMix();
        }

        this.getItem$.subscribe((result: any) => {
          if (this.deptConf.item && this.deptConf.item.idArr) {
            for (let i in result) {
              if (this.deptConf.item.idArr.includes(result[i]._id.toString())) {
                result[i].chk = true;
                for (let j in result[i].subitems) {
                  if (this.deptConf.subitem.idArr.includes(result[i].subitems[j]._id.toString())) {
                    result[i].subitems[j].chk = true;
                  }
                }
              }
            }
          }
          this.itemmix.push(...result);
          if (this.itemTotal > this.itemmix.length) {
            this.getMoreItemMix();
          }
        });
      }
    });
  }

  getMoreItemMix() {

    this.http.put(this.api.getUrl('ITEMMIX') + 1, this.itemMixCondition).subscribe((data: any) => {
      if (data['result'] && data["result"].length > 0) {
        if (data["pageNo"]) {
          this.itemMixCondition.pageNo = data["pageNo"] + 1;
        }
        this.getItem$.next(data['result']);
      }
    });
  }
  // loadItems() {
  //   this.http.get(this.api.getUrl('ITEM') + 1).subscribe((data) => {
  //     if (data['result'] && data['success']) {

  //       this.items = data['result'];
  //       this.itemsAll = data['result'];
  //     }
  //   });
  // }
  // loadSubitems() {
  //   this.http.get(this.api.getUrl('SUBITEM') + 1).subscribe((data) => {
  //     if (data['result'] && data['success']) {

  //       this.subitems = data['result'];
  //       this.subitemsAll = data['result'];
  //     }
  //   });
  // }
  loadAJTypes() {
    this.http.get(this.api.getUrl('AJTYPE') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        if (this.deptConf.aj_type && this.deptConf.aj_type.idArr) {
          for (let i in data['result']) {
            if (this.deptConf.aj_type.idArr.includes(data['result'][i]._id.toString())) {
              data['result'][i].chk = true;
            }
          }
        }
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
  departmentRowClicked(i: any, chk: boolean, id: any) {
    if (this.termDept) {
      i = this.department.findIndex((i: { _id: any; }) => i._id == id);
    }
    if (chk) {
      this.deptConf.department.idArr.splice(this.deptConf.department.idArr.indexOf(this.department[i]._id.toString()), 1);
      this.department[i].chk = false;
    }
    else {
      this.deptConf.department.idArr.push(this.department[i]._id.toString());
      this.department[i].chk = true;
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

  exportDeptSettings = async () => {
    this.isLoader = true;
    this.dataZip = new JSZip();
    this.dataZip.file("settings.json", JSON.stringify(this.deptConf.settings));
    let date = new Date();
    let dept = this.departments.find((d: { _id: any; }) => d._id == this.dept_id);

    this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
      FileSaver.saveAs(content, dept.dept_eng + "_update_" + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + ".zip");
    });
    this.toastr.success("Updated Settings downloaded for '" + dept.dept_eng + "'");
    this.isLoader = false;
  }

  saveDeptSettings() {
    this.deptConf.mm.config_value = this.deptConf.mm.idArr.join(',') + ',';
    this.deptConf.pbk.config_value = this.deptConf.pbk.idArr.join(',') + ',';
    this.deptConf.department.config_value = this.deptConf.department.idArr.join(',') + ',';
    this.deptConf.category.config_value = this.deptConf.category.idArr.join(',') + ',';
    this.deptConf.item.config_value = this.deptConf.item.idArr.join(',') + ',';
    this.deptConf.subitem.config_value = this.deptConf.subitem.idArr.join(',') + ',';
    this.deptConf.aj_type.config_value = this.deptConf.aj_type.idArr.join(',') + ',';
    this.deptConf.settings.config_value = this.settingsAll;

    this.http.put(this.api.getUrl('DEPTCONFSAVE'), this.deptConf).subscribe((data: any) => {
      if (data && data['success']) {
        // console.log("data", data);
        // this.deptSelected(this.dept_id);
        this.isLoader = false;
        this.toastr.success('Department Updated Successfully.');
        if (this.dept_id == this.auth.webUser.dept_id) {
          this.auth.updateSettings(this.settingsAll);
        }
        this.deptSelected(this.dept_id);
      }
    }, err => {
      this.toastr.error(err['error']);
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
      case 'department':
        this.department.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk) {
            this.deptConf.department.idArr.push(i._id.toString());
            i.chk = true;
          }
        });
        break;

    }
  }
}
