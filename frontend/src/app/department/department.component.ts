import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as e from 'express';
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
  termSpList: any = null;
  selMM: any = true;
  selPbk: any = true;
  selCat: any = true;
  selItem: any = true;
  selItemmix: any = true;
  selSubitem: any = true;
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
  cities: any = [];
  itemmix: any = [];
  itemsAll: any = [];
  subitems: any = [];
  countries: any = [];
  subitemsAll: any = [];
  splists: any = [];
  support_lists: any = [];
  subitem_lists: any = [];
  viewData: any = [];
  states: any = [];
  units: any = [];
  genders: any = [];
  statuses: any = [];
  itemMixCondition: any = {};
  settingsAll: any = [];
  settingsUI: any = {};
  // deptSettings: any = {};
  dataZip: JSZip = new JSZip();
  pbkPageNo: any = 2;
  getPbk$ = new Subject();
  pbkTotal: any;
  getItem$ = new Subject();
  itemTotal: any;
  settings: any = {}
  importData: any = {};
  editData: any = {};
  isEdit: boolean = false;
  iZip: any;
  iFilenames: any = [];
  filterBlank: boolean = false;
  page = 1;
  pi = 0;


  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.settings = this.auth.webUser.settings
  }

  ngOnInit(): void {

    this.spinner.show();
    this.getDepartments();
    this.getSupportList();
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.units = result.unit ? result.unit : [];
      this.mms = result.mm ? result.mm : [];
      // this.support_lists = result.support_list ? result.support_list : [];
      this.subitem_lists = result.subitem_list ? result.subitem_list : [];
      this.genders = result.gender ? result.gender : [];
      this.statuses = result.status ? result.status : [];
      this.cities = result.city ? result.city : [];
      this.countries = result.country ? result.country : [];
    });

    this.settingsUI = this.auth.settingsUI;

    this.settingsAll = {
      pbk: {
      },
      nimitt: {
      },
      product: {
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
        company_name: false,
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
        isbill: false,
        document: false,
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
      vehicle: {
        visible: false,
        add: false,
      },
      category: {
        visible: false,
        add: false,
      },
      item: {
        visible: false,
        add: false,
      },
      mm: {
        visible: false,
        add: false,
      },
      city: {
        visible: false,
        add: false,
      },
      department: {
        visible: false,
        add: false,
        settings: false,
        manage: false,
      },
      point: {
        visible: false
      },
      report: {
        visible: true,
        report_at: false,
        report_jt: false,
        report_str_stk: false,
        report_kh: false
      }
    }

    this.deptSelected(null);

    this.applySettings(this.auth.webUser.settings);


  }

  getDepartments() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('DEPT') + this.auth.webUser.dept_id).subscribe(async (data) => {
      if (data['result'] && data['success']) {
        // this.departments = data['result'].filter((i: { _id: number; }) => i._id > 1);
        this.departments = data['result'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  getSupportList() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('SUPPORTLIST')).subscribe((data) => {
      if (data['result'] && data['success']) {
        // this.departments = data['result'].filter((i: { _id: number; }) => i._id > 1);
        this.support_lists = data['result'].data;
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  async deptSelected(ev: any) {
    this.isLoader = true;
    this.deptConf = {};
    if (!ev) {
      ev = this.auth.webUser.dept_id;
    }
    let getdept = await this.departments.find((d: { _id: any; }) => d._id == ev);

    if (getdept && getdept.settings) {
      this.applySettings(getdept.settings);
    }

    this.http.get(this.api.getUrl('DEPTCONFIG') + ev).subscribe((data) => {
      if (data['result'] && data['success']) {
        for (let i of data['result']) {
          this.deptConf[i.config_key] = i;
        }
        this.loadPBK();
        this.loadSpLists();
        this.loadDepartment();
        this.loadMM();
        this.loadCategory();
        this.loadItemMix();
        this.loadSubitems();
        this.loadCondition();
        // console.log(this.deptConf);

        this.isLoader = false;
      }
      this.isLoader = false;
    });

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
            this.iZip = zip;
            this.iFilenames = [{ name: 'country' }, { name: 'state' }, { name: 'city' }, { name: 'support_list' }, { name: 'mm' }, { name: 'unit' }, { name: 'subitem_list' }, { name: 'item' }, { name: 'subitem' }];
            this.loadImportData();
          }

        });

      }

    }
    this.isLoader = false;
    ev = null;
  }

  loadImportData() {
    let files = Object.keys(this.iZip.files);

    for (let i in this.iFilenames) {
      if (!this.iFilenames[i].finish && files.includes(this.iFilenames[i].name + '.json')) {
        this.iZip.file(this.iFilenames[i].name + '.json').async("string").then((data: any) => {
          if (data) {
            let iData: any = JSON.parse(data);
            this.importData = { type: this.iFilenames[i].name, count: iData.length }

            switch (this.iFilenames[i].name) {
              case 'country': this.matchCountry(iData, i);
                break;
              case 'state': this.matchState(iData, i);
                break;
              case 'city': this.matchCity(iData, i);
                break;
              case 'support_list': this.matchSupportList(iData, i);
                break;
              case 'mm': this.matchMM(iData, i);
                break;
              case 'unit': this.matchUnit(iData, i);
                break;
              case 'subitem_list': this.matchSubitemList(iData, i);
                break;
              case 'item': this.matchItem(iData, i);
                break;
              case 'subitem': this.matchSubitem(iData, i);
                break;

            }

          }
        });
        break;
      } else {
        this.iFilenames[i].finish = true;
      }
    }

    $('#importModal').modal('show');
  }

  finishMatching(data: any, index: any) {
    let pendingCount = data.filter((c: { update: any; alt_found: any; insert: any; }) => c.update || c.alt_found || c.insert).length;
    if (pendingCount > 0) {
      this.importData.columns = Object.keys(data[0]);
      this.importData.pendingCount = pendingCount;
      this.importData.data = data

    } else {
      if (this.iFilenames[index].name == 'item') {
        this.iFilenames[index].result = data.filter((d: { new_id: any; }) => d.new_id).map((d: { _id: any, new_id: any, new_subitem_id: any }) => ({ _id: d._id, new_id: d.new_id, subitem_id: d.new_subitem_id }));
      } else {
        this.iFilenames[index].result = data.filter((d: { new_id: any; }) => d.new_id).map((d: { _id: any, new_id: any }) => ({ _id: d._id, new_id: d.new_id }));
      }
      this.iFilenames[index].finish = true;
      console.log(this.iFilenames);

      this.loadImportData();
    }

  }

  matchCountry(countryData: any, index: any) {

    for (let i in countryData) {
      // matching through list of categories
      for (let cnt of this.countries) {
        if (cnt._id == countryData[i]._id && cnt.created_at == countryData[i].created_at) {
          if (cnt.country_hin == countryData[i].country_hin && cnt.country_eng == countryData[i].country_eng) {
            countryData[i].found = true;
          }
          else {
            countryData[i].update = true;
          }
          break;
        }
        else {
          if (cnt.country_hin == countryData[i].country_hin || cnt.country_eng == countryData[i].country_eng) {
            countryData[i].alt_found = true;
            countryData[i].new_id = cnt._id
          }
        }
      }
      countryData[i].insert = (countryData[i].found || countryData[i].update || countryData[i].alt_found) ? false : true;
    }
    if (countryData.filter((c: { update: any; alt_found: any; insert: any; }) => c.update || c.alt_found || c.insert).length > 0) {
      this.importData.columns = Object.keys(countryData[0]);
      this.importData.data = countryData
    } else {
      this.iFilenames[index].result = countryData.filter((d: { new_id: any; }) => d.new_id).map((d: { _id: any, new_id: any }) => ({ _id: d._id, new_id: d.new_id }));
      this.iFilenames[index].finish = true;
      this.loadImportData();
    }

  }

  matchState(stateData: any, index: any) {
    for (let i in stateData) {

      // replacing old id of country with new one if found
      let country = this.iFilenames.find((f: { name: any }) => f.name == "country");
      if (country && country.result && country.result.length > 0) {
        for (let j in country.result) {
          if (country.result[j]._id == stateData[i].country_id) {
            stateData[i].country_id = country.result[j].new_id;
            break;
          }
        }
      }

      // matching through list of categories
      for (let st of this.states) {
        if (st._id == stateData[i]._id && st.created_at == stateData[i].created_at) {
          if (st.state_hin == stateData[i].state_hin && st.state_eng == stateData[i].state_eng && st.country_id == stateData[i].country_id) {
            stateData[i].found = true;
          }
          else {
            stateData[i].update = true;
          }
          break;
        }
        else {
          if ((st.state_hin == stateData[i].state_hin || st.state_eng == stateData[i].state_eng) && st.country_id == stateData[i].country_id) {
            stateData[i].alt_found = true;
            stateData[i].new_id = st._id
          }
        }
      }
      stateData[i].insert = (stateData[i].found || stateData[i].update || stateData[i].alt_found) ? false : true;
    }
    if (stateData.filter((c: { update: any; alt_found: any; insert: any; }) => c.update || c.alt_found || c.insert).length > 0) {
      this.importData.columns = Object.keys(stateData[0]);
      this.importData.data = stateData
    } else {
      this.iFilenames[index].result = stateData.filter((d: { new_id: any; }) => d.new_id).map((d: { _id: any, new_id: any }) => ({ _id: d._id, new_id: d.new_id }));
      this.iFilenames[index].finish = true;
      this.loadImportData();
    }

  }

  matchMM(mmData: any, index: any) {
    for (let i in mmData) {

      let state = this.iFilenames.find((f: { name: any }) => f.name == "state");
      if (state && state.result && state.result.length > 0) {
        for (let j in state.result) {
          if (state.result[j]._id == mmData[i].state_id) {
            mmData[i].state_id = state.result[j].new_id;
            break;
          }
        }
      }

      // matching through list of mms
      for (let mm of this.mms) {
        if (mm._id == mmData[i]._id && mm.created_at == mmData[i].created_at) {
          if (mm.mm_hin == mmData[i].mm_hin && mm.mm_eng == mmData[i].mm_eng && mm.state_id == mmData[i].state_id) {
            mmData[i].found = true;
          }
          else {
            mmData[i].update = true;
          }
          break;
        }
        else {
          if ((mm.mm_hin == mmData[i].mm_hin || mm.mm_eng == mmData[i].mm_eng) && mm.state_id == mmData[i].state_id) {
            mmData[i].alt_found = true;
            mmData[i].new_id = mm._id
          }
        }
      }
      mmData[i].insert = (mmData[i].found || mmData[i].update || mmData[i].alt_found) ? false : true;
    }
    this.finishMatching(mmData, index);
  }

  matchCity(cityData: any, index: any) {
    for (let i in cityData) {
      //replacing old ids of state to new_id      
      let state = this.iFilenames.find((f: { name: any }) => f.name == "state");
      if (state && state.result && state.result.length > 0) {
        for (let j in state.result) {
          if (state.result[j]._id == cityData[i].state_id) {
            cityData[i].state_id = state.result[j].new_id;
            break;
          }
        }
      }

      // matching through list of categories
      for (let ct of this.cities) {
        if (ct._id == cityData[i]._id && ct.created_at == cityData[i].created_at) {
          if (ct.city_hin == cityData[i].city_hin && ct.city_eng == cityData[i].city_eng && ct.state_id == cityData[i].state_id) {
            cityData[i].found = true;
          }
          else {
            cityData[i].update = true;
          }
          break;
        }
        else {
          if ((ct.city_hin == cityData[i].city_hin || ct.city_eng == cityData[i].city_eng) && ct.state_id == cityData[i].state_id) {
            cityData[i].alt_found = true;
            cityData[i].new_id = ct._id
          }
        }
      }
      cityData[i].insert = (cityData[i].found || cityData[i].update || cityData[i].alt_found) ? false : true;
    }
    this.finishMatching(cityData, index);
  }

  matchSupportList(splistData: any, index: any) {
    for (let i in splistData) {
      // matching through list of categories
      for (let sl of this.support_lists) {
        if (sl._id == splistData[i]._id && sl.created_at == splistData[i].created_at) {
          if (sl.list_type == splistData[i].list_type && sl.list_name_hin == splistData[i].list_name_hin && sl.list_name_eng == splistData[i].list_name_eng) {
            splistData[i].found = true;
          }
          else {
            splistData[i].update = true;
          }
          break;
        }
        else {
          if (sl.list_type == splistData[i].list_type && (sl.list_name_hin == splistData[i].list_name_hin || sl.list_name_eng == splistData[i].list_name_eng)) {
            splistData[i].alt_found = true;
            splistData[i].new_id = sl._id
          }
        }
      }
      splistData[i].insert = (splistData[i].found || splistData[i].update || splistData[i].alt_found) ? false : true;
    }
    this.finishMatching(splistData, index);
  }

  matchUnit(unitData: any, index: any) {

    for (let i in unitData) {
      // matching through list of categories
      for (let ut of this.units) {
        if (ut._id == unitData[i]._id && ut.created_at == unitData[i].created_at) {
          if (ut.unit_short == unitData[i].unit_short && ut.unit_full == unitData[i].unit_full) {
            unitData[i].found = true;
          }
          else {
            unitData[i].update = true;
          }
          break;
        }
        else {
          if (ut.unit_full == unitData[i].unit_full || ut.unit_short == unitData[i].unit_short) {
            unitData[i].alt_found = true;
            unitData[i].new_id = ut._id
          }
        }
      }
      unitData[i].insert = (unitData[i].found || unitData[i].update || unitData[i].alt_found) ? false : true;
    }
    this.finishMatching(unitData, index);
  }

  matchSubitemList(siListData: any, index: any) {
    for (let i in siListData) {
      // matching through list of subitem_lists
      for (let si of this.subitem_lists) {
        if (si._id == siListData[i]._id && si.created_at == siListData[i].created_at) {
          console.log(si, siListData[i]);
          if (si.subitem_hin == siListData[i].subitem_hin && (!si.subitem_eng || si.subitem_eng == siListData[i].subitem_eng)) {
            siListData[i].found = true;
          }
          else {
            siListData[i].update = true;
          }
          break;
        }
        else {
          if (si.subitem_hin == siListData[i].subitem_hin || (si.subitem_eng && si.subitem_eng == siListData[i].subitem_eng)) {
            siListData[i].alt_found = true;
            siListData[i].new_id = si._id
            break;
          }
          else if ((siListData[i].subitem_eng && si.subitem_hin.replace(/\s/g, "") == siListData[i].subitem_eng.replace(/\s/g, "")) || (si.subitem_eng && si.subitem_eng.replace(/\s/g, "") == siListData[i].subitem_hin.replace(/\s/g, ""))) {
            siListData[i].alt_found = true;
            siListData[i].new_id = si._id
            break;
          }
        }
      }
      siListData[i].insert = (siListData[i].found || siListData[i].update || siListData[i].alt_found) ? false : true;
    }
    this.finishMatching(siListData, index);
  }

  matchItem(itemData: any, index: any) {

    for (let i in itemData) {
      //replacing old id of unit with new one    
      let unit = this.iFilenames.find((f: { name: any }) => f.name == "unit");
      if (unit && unit.result && unit.result.length > 0) {
        for (let j in unit.result) {
          if (unit.result[j]._id == itemData[i].unit_id) {
            itemData[i].unit_id = unit.result[j].new_id;
            break;
          }
        }
      }
      if (typeof itemData[i].categories == 'string') {
        itemData[i].categories = JSON.parse(itemData[i].categories);
      }
      //replacing old id of category with new one    
      let category = this.iFilenames.find((f: { name: any }) => f.name == "category");
      if (category && category.result && category.result.length > 0) {
        for (let j in category.result) {
          for (let k in itemData[i].categories) {
            if (category.result[j]._id == itemData[i].categories[k]) {
              itemData[i].categories[k] = category.result[j].new_id;
              break;
            }
          }
        }
      }

      for (let it of this.itemmix) {
        if (it._id == itemData[i]._id && it.created_at == itemData[i].created_at) {
          if (it.item_hin == itemData[i].item_hin && it.item_eng == itemData[i].item_eng && it.item_code == itemData[i].item_code && it.categories == itemData[i].categories && it.unit_id == itemData[i].unit_id && it.extra_note == itemData[i].extra_note) {
            itemData[i].found = true;
          }
          else {
            itemData[i].update = true;
          }
          itemData[i].new_item = it;
          itemData[i].new_id = it._id;
          break;
        }
        else {
          if (it.item_hin == itemData[i].item_hin || it.item_eng == itemData[i].item_eng) {
            itemData[i].new_item = it;
            itemData[i].new_id = it._id;
            break;
          } else if ((itemData[i].item_eng && it.item_hin.replace(/\s/g, "") == itemData[i].item_eng.replace(/\s/g, "")) || (it.item_eng && it.item_eng.replace(/\s/g, "") == itemData[i].item_hin.replace(/\s/g, ""))) {
            itemData[i].new_item = it;
            itemData[i].new_id = it._id;
            break;
          }
        }
      }
      itemData[i].insert = (itemData[i].found || itemData[i].update || itemData[i].alt_found) ? false : true;
    }
    this.finishMatching(itemData, index);
  }

  matchSubitem(subitemData: any, index: any) {
    let item = this.iFilenames.find((f: { name: any }) => f.name == "item");
    console.log("item", item);

    // let ite  mData: any;
    for (let i in subitemData) {

      //replacing old id of unit with new one    
      let unit = this.iFilenames.find((f: { name: any }) => f.name == "unit");
      if (unit && unit.result && unit.result.length > 0) {
        for (let j in unit.result) {
          if (unit.result[j]._id == subitemData[i].unit_id) {
            subitemData[i].unit_id = unit.result[j].new_id;
            break;
          }
        }
      }
      //replacing old subitem_list_id with new one.
      let subitem_list = this.iFilenames.find((f: { name: any }) => f.name == "subitem_list");
      if (subitem_list && subitem_list.result && subitem_list.result.length > 0) {
        for (let j in subitem_list.result) {
          if (subitem_list.result[j]._id == subitemData[i].subitem_list_id) {
            subitemData[i].subitem_list_id = subitem_list.result[j].new_id;
            break;
          }
        }
      }

      if (typeof subitemData[i].categories == 'string') {
        subitemData[i].categories = JSON.parse(subitemData[i].categories).filter((c: any) => c);
      }
      //replacing old id of category with new one    
      let category = this.iFilenames.find((f: { name: any }) => f.name == "category");
      if (category && category.result && category.result.length > 0) {
        for (let j in category.result) {
          for (let k in subitemData[i].categories) {
            if (category.result[j]._id == subitemData[i].categories[k]) {
              subitemData[i].categories[k] = category.result[j].new_id;
              break;
            }
          }
        }
      }

      let subitem = this.subitem_lists.find((s: { _id: any; }) => s._id == subitemData[i].subitem_list_id);
      if (subitem) {
        subitemData[i].subitem_hin = subitem.subitem_hin;
        subitemData[i].subitem_eng = subitem.subitem_eng;
      }

      subitemData[i].item_hin = null;
      subitemData[i].item_eng = null;


      //replacing old item_id with new one.      
      if (item && item.result && item.result.length > 0) {
        for (let j in item.result) {
          if (item.result[j]._id == subitemData[i].item_id) {
            subitemData[i].item_id = item.result[j].new_id;
            subitemData[i].new_subitem_id = item.result[j].new_subtiem_id
            break;
          }
        }
      }

      let itemData = this.itemmix.find((it: { _id: any; }) => it._id == subitemData[i].item_id);

      if (itemData) {
        subitemData[i].new_item = itemData;
        subitemData[i].new_id = itemData._id;
        subitemData[i].item_hin = itemData.item_hin;
        subitemData[i].item_eng = itemData.item_eng;
        for (let sit of itemData.subitems) {
          if (sit._id == subitemData[i]._id) {
            subitemData[i].new_subitem_id = sit._id;
            if (sit.subitem_list_id == subitemData[i].subitem_list_id && JSON.stringify(sit.categories) == JSON.stringify(subitemData[i].categories) && sit.unit_id == subitemData[i].unit_id && sit.extra_note == subitemData[i].extra_note) {
              subitemData[i].found = true;
            }
            else {
              subitemData[i].update = true;
            }
            break;
          }
          else if (sit.subitem_list_id == subitemData[i].subitem_list_id) {
            subitemData[i].new_subitem_id = sit._id;
            if (JSON.stringify(sit.categories) == JSON.stringify(subitemData[i].categories) && sit.unit_id == subitemData[i].unit_id && sit.extra_note == subitemData[i].extra_note) {
              subitemData[i].found = true;
            } else {
              subitemData[i].update = true;
            }
          }
        }
        if (!subitemData[i].found && !subitemData[i].update) {
          subitemData[i].insert = true;
        }
      }
    }
    this.finishMatching(subitemData, index);
  }

  importItemSelected(ev: any, index: any) {
    this.importData.data[index].new_id = ev ? ev._id : null;
  }

  combinedItemSubitem() {
    let itemData = this.importData.item.data;
    let subitemData = this.importData.subitem.data;
    for (let i in itemData) {
      itemData[i].subitems = subitemData.filter((s: { item_id: any; }) => s.item_id == itemData[i]._id);
    }
    console.log(itemData);

  }

  submitImportData() {
    if (this.importData.data.find((i: { found: any; new_id: any; }) => !i.found && !i.new_id)) {
      this.importData.error = true;
      this.importData.msg = 'some correction may be pending';
    } else {
      for (let i in this.iFilenames) {
        if (this.iFilenames[i].name == this.importData.type) {
          if (this.importData.type == 'item') {
            this.iFilenames[i].result = this.importData.data.filter((d: { _id: any, new_id: any; }) => d.new_id && d.new_id != d._id).map((d: { _id: any, new_id: any, new_subitem_id: any }) => ({ _id: d._id, new_id: d.new_id, subitem_id: d.new_subitem_id }));
          } else {
            this.iFilenames[i].result = this.importData.data.filter((d: { new_id: any; }) => d.new_id).map((d: { _id: any, new_id: any }) => ({ _id: d._id, new_id: d.new_id }));
          }
          this.iFilenames[i].finish = true;
          break;
        }
      }
      this.loadImportData();
    }

  }

  bulkImportSubitem() {
    console.log("clicked");

    this.isLoader = true;
    for (let index in this.importData.data) {
      if (!this.importData.data[index].found && this.importData.data[index].new_id) {
        this.http.post(this.api.getUrl('SUBITEM') + this.auth.webUser.dept_id, this.importData.data[index]).subscribe((data: any) => {
          if (data['result'] && data['success']) {
            // this.gs.Lists.subitem.unshift(data['result'])
            let i = this.gs.Lists.itemmix.findIndex((i: { _id: any; }) => i._id == data['result'].item_id);
            this.gs.Lists.itemmix[i].subitems.push(data['result']);
            this.itemmix[this.itemmix.findIndex((it: { _id: any; }) => it._id == data['result'].item_id)].subitems.push(data['result']);
            this.importData.data[index].new_subitem_id = data['result']._id;
            this.toastr.success('SUBITEM added successfully.')
          } else {
            this.toastr.error(data['message']);
          }
        }, err => {
          this.toastr.error(err['error']);
        });
      }
      else {
        console.log(this.importData.data[index]);

      }
    }
    this.isLoader = false;
  }

  insertImportData(index: any) {

    if (this.importData.type == 'subitem') {
      this.isLoader = true;
      this.http.post(this.api.getUrl('SUBITEM') + this.auth.webUser.dept_id, this.importData.data[index]).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          // this.gs.Lists.subitem.unshift(data['result'])
          let i = this.gs.Lists.itemmix.findIndex((i: { _id: any; }) => i._id == data['result'].item_id);
          this.gs.Lists.itemmix[i].subitems.push(data['result']);
          this.itemmix[this.itemmix.findIndex((it: { _id: any; }) => it._id == data['result'].item_id)].subitems.push(data['result']);
          this.importData.data[index].new_subitem_id = data['result']._id;
          this.isLoader = false;
          this.toastr.success('SUBITEM added successfully.')
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    } else {
      this.showModal = this.importData.type;
      this.editData = this.importData.data[index];
      console.log(this.showModal, this.editData);
      $('#showModal').modal('show');
    }
  }

  importListAddResponse(ev: any) {
    if (ev && ev._id) {
      for (let i in this.importData.data) {
        if (this.importData.data[i]._id == this.editData._id) {
          if (this.importData.type == 'item') {
            this.itemmix.push(ev);
            this.importData.data[i].new_item = ev;
            this.importData.data[i].new_id = ev._id;
          } else if (this.importData.type == 'subitem') {
            this.itemmix[this.itemmix.findIndex((it: { _id: any; }) => it._id == ev.item_id)].subitems.push(ev);
            this.importData.data[i].new_subitem_id = ev._id;
          } else {
            this.importData.data[i].new_id = ev._id;
          }
        }
      }
      this.showModal = '';
      $('#showModal').modal('hide')
    }
  }

  deleteData(i: any) {
    if (i) {
      this.importData.data.splice(i, 1);
    }
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
    this.deptSelected(this.dept_id ? this.dept_id : this.auth.webUser.dept_id);
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
      this.itemMixCondition.categories = ev;
    } else {
      this.itemMixCondition.categories = null;
    }
    this.loadItemMix();
  }

  subitemCatSelected(ev: any) {
    if (ev) {
      this.subitems = this.subitemsAll.filter((i: { categoryies: any; }) => i.categoryies.includes(ev));
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

        if (this.deptConf.mm && this.deptConf.mm.config_value) {
          for (let i in data['result']) {
            // data['result'][i].chk = false;
            if (this.deptConf.mm.config_value.includes(data['result'][i]._id)) {
              data['result'][i].chk = true;
            }
          }
        }
        this.mmsAll = data['result'];
        this.mms = this.mmsAll;
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
        if (this.deptConf.pbk && this.deptConf.pbk.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.pbk.config_value.includes(data['result'][i]._id)) {
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
        if (this.deptConf.pbk.config_value.includes(result[i]._id)) {
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
        if (this.deptConf.department && this.deptConf.department.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.department.config_value.includes(data['result'][i]._id)) {
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
        if (this.deptConf.category && this.deptConf.category.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.category.config_value.includes(data['result'][i]._id)) {
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
        if (this.deptConf.item && this.deptConf.item.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.item.config_value.includes(data['result'][i]._id)) {
              data['result'][i].chk = true;
              for (let j in data['result'][i].subitems) {
                if (this.deptConf.subitem.config_value.includes(data['result'][i].subitems[j]._id)) {
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
        else {
          this.itemsAll = this.itemmix;
        }

        this.getItem$.subscribe((result: any) => {
          if (this.deptConf.item && this.deptConf.item.config_value) {
            for (let i in result) {
              if (this.deptConf.item.config_value.includes(result[i]._id)) {
                result[i].chk = true;
                for (let j in result[i].subitems) {
                  if (this.deptConf.subitem.config_value.includes(result[i].subitems[j]._id)) {
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
          else {
            this.itemsAll = this.itemmix;
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

  itemMixSelected(ev: any) {
    if (ev) {
      this.itemmix = this.itemsAll.filter((it: { _id: any; }) => it._id == ev);
    }
    else {
      this.itemmix = this.itemsAll;
    }
  }
  // loadItems() {
  //   this.http.get(this.api.getUrl('ITEM') + 1).subscribe((data) => {
  //     if (data['result'] && data['success']) {

  //       this.items = data['result'];
  //       this.itemsAll = data['result'];
  //     }
  //   });
  // }
  loadSubitems() {
    this.http.get(this.api.getUrl('SUBITEM') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        if (this.deptConf.subitem && this.deptConf.subitem.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.subitem.config_value.includes(data['result'][i]._id)) {
              data['result'][i].chk = true;
            }
          }
        }
        this.subitems = data['result'];
        this.subitemsAll = data['result'];
      }
    });
  }

  loadSpLists() {
    this.http.get(this.api.getUrl('SPLIST') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        if (this.deptConf.support_list && this.deptConf.support_list.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.support_list.config_value.includes(data['result'][i]._id)) {
              data['result'][i].chk = true;
            }
          }
        }
        this.splists = data['result'];
      }
    });
  }
  loadCondition() {
    this.http.get(this.api.getUrl('SPLIST') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        if (this.deptConf.support_list && this.deptConf.support_list.config_value) {
          for (let i in data['result']) {
            if (this.deptConf.support_list.config_value.includes(data['result'][i]._id)) {
              data['result'][i].chk = true;
            }
          }
        }
        this.splists = data['result'];
      }
    });
  }

  async mmRowClicked(i: any, chk: boolean, id: any) {
    if (this.termMM) {
      i = this.mms.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add mm in deptConf if it not exists.
    this.setConfigObject('mm');
    if (chk) {
      this.deptConf.mm.config_value.splice(this.deptConf.mm.config_value.indexOf(this.mms[i]._id), 1);
      this.mms[i].chk = false;
    }
    else {
      this.deptConf.mm.config_value.push(this.mms[i]._id);
      this.mms[i].chk = true;
    }

  }

  pbkRowClicked(i: any, chk: boolean, id: any) {
    if (this.termPbk) {
      i = this.pbks.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add 'pbk' in deptConf if it not exists.
    this.setConfigObject('pbk');
    if (chk) {
      this.deptConf.pbk.config_value.splice(this.deptConf.pbk.config_value.indexOf(this.pbks[i]._id), 1);
      this.pbks[i].chk = false;
    }
    else {
      this.deptConf.pbk.config_value.push(this.pbks[i]._id);
      this.pbks[i].chk = true;
    }
  }
  departmentRowClicked(i: any, chk: boolean, id: any) {
    if (this.termDept) {
      i = this.department.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add 'department' in deptConf if it not exists.
    this.setConfigObject('department');
    if (chk) {
      this.deptConf.department.config_value.splice(this.deptConf.department.config_value.indexOf(this.department[i]._id), 1);
      this.department[i].chk = false;
    }
    else {
      this.deptConf.department.config_value.push(this.department[i]._id);
      this.department[i].chk = true;
    }
  }
  categoryRowClicked(i: any, chk: boolean, id: any) {
    if (this.termCat) {
      i = this.categories.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add 'category' in deptConf if it not exists.
    this.setConfigObject('category');
    if (chk) {
      this.deptConf.category.config_value.splice(this.deptConf.category.config_value.indexOf(this.categories[i]._id), 1);
      this.categories[i].chk = false;
    }
    else {
      this.deptConf.category.config_value.push(this.categories[i]._id);
      this.categories[i].chk = true;
    }
  }
  itemRowClicked(i: any, chk: boolean, id: any) {

    if (this.termItem) {
      i = this.items.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add 'item' in deptConf if it not exists.
    this.setConfigObject('item');
    if (chk) {
      this.deptConf.item.config_value.splice(this.deptConf.item.config_value.indexOf(this.items[i]._id), 1);
      this.items[i].chk = false;
    }
    else {
      this.deptConf.item.config_value.push(this.items[i]._id);
      this.items[i].chk = true;
    }
  }

  itemmixRowClicked(i: any, chk: boolean, id: any, recall: boolean = false) {

    if (this.termItemmix || recall) {
      i = this.itemmix.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add 'item' in deptConf if it not exists.
    this.setConfigObject('item');
    if (chk) {
      this.deptConf.item.config_value.splice(this.deptConf.item.config_value.indexOf(this.itemmix[i]._id), 1);
      this.itemmix[i].chk = false;
      for (let j in this.itemmix[i].subitems) {
        if (this.itemmix[i].subitems[j].chk) {
          // this.itemmix[i].subitems[j].chk = false;
          // this.deptConf.subitem.config_value.splice(this.deptConf.subitem.config_value.indexOf(this.itemmix[i].subitems[j]._id), 1)
          this.subitemmixRowClicked(i, j, chk, id, this.itemmix[i].subitems[j]._id);
        }
      }
    }
    else {
      this.deptConf.item.config_value.push(this.itemmix[i]._id);
      this.itemmix[i].chk = true;
    }
  }

  subitemmixRowClicked(itemIndex: any, subitemIndex: any, chk: boolean, itemId: any, subitemId: any, recall: boolean = false) {

    if (this.termItemmix || recall) {
      itemIndex = this.itemmix.findIndex((i: { _id: any; }) => i._id == itemId);
      subitemIndex = this.itemmix[itemIndex].subitems.findIndex((s: { _id: any; }) => s._id == subitemId);

    }
    // this add 'subitem' in deptConf if it not exists.
    this.setConfigObject('subitem');
    if (chk) {
      this.deptConf.subitem.config_value.splice(this.deptConf.subitem.config_value.indexOf(this.itemmix[itemIndex].subitems[subitemIndex]._id), 1);
      this.itemmix[itemIndex].subitems[subitemIndex].chk = false;
    }
    else {
      this.deptConf.subitem.config_value.push(this.itemmix[itemIndex].subitems[subitemIndex]._id)
      this.itemmix[itemIndex].subitems[subitemIndex].chk = true;
      if (!this.itemmix[itemIndex].chk) {
        this.itemmix[itemIndex].chk = true;
        this.deptConf.item.config_value.push(this.itemmix[itemIndex]._id)
      }
    }
    this.subitems[this.subitems.findIndex((i: { _id: any; }) => i._id == subitemId)].chk = !chk;
  }

  subitemRowClicked(i: any, chk: boolean, id: any) {
    if (this.termSubitem) {
      i = this.subitems.findIndex((i: { _id: any; }) => i._id == id);
    }
    this.subitems[i].chk = !chk;
    this.subitemmixRowClicked(0, 0, chk, this.subitems[i].item_id, id, true);

  }

  splistRowClicked(i: any, chk: boolean, id: any) {
    if (this.termSpList) {
      i = this.splists.findIndex((i: { _id: any; }) => i._id == id);
    }
    // this add 'support_list' in deptConf if it not exists.
    this.setConfigObject('support_list');
    if (chk) {
      this.deptConf.support_list.config_value.splice(this.deptConf.support_list.config_value.indexOf(this.splists[i]._id), 1);
      this.splists[i].chk = false;
    }
    else {
      this.deptConf.support_list.config_value.push(this.splists[i]._id);
      this.splists[i].chk = true;
    }
  }

  exportDeptSettings = async () => {
    this.isLoader = true;
    let date = new Date();
    if (!this.dept_id)
      this.dept_id = this.auth.webUser.dept_id

    this.http.get(this.api.getUrl('DEPT') + "by_id/" + this.dept_id).subscribe(async (data) => {
      if (data['result'] && data['success']) {
        this.dataZip = new JSZip();
        this.dataZip.file("settings.json", JSON.stringify(data.result));
        this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
          FileSaver.saveAs(content, data.result.dept_eng + "_settings_update_" + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + ".zip");
        });
        this.toastr.success("Updated Settings downloaded for '" + data.result.dept_eng + "'");
        this.isLoader = false;
      } else {
        this.toastr.error("Something Went Wrong.");
        this.isLoader = false;
      }
    }, (err) => {
      this.toastr.error("Something Went Wrong.");
      this.isLoader = false;
    });
  }

  exportLists = async () => {
    this.isLoader = true;
    this.dataZip = new JSZip();

    this.http.get(this.api.getUrl('IMPORTEXPORT') + 'update_lists/' + this.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        for (let key of Object.keys(data['result'])) {
          this.dataZip.file(key + ".json", JSON.stringify(data['result'][key].data ? data['result'][key].data : data['result'][key]));
        }
        let date = new Date();
        let dept = this.departments.find((d: { _id: any; }) => d._id == this.dept_id);

        this.dataZip.generateAsync({ type: "blob" }).then(function (content: Blob) {
          FileSaver.saveAs(content, dept.dept_eng + "_updated_lists_" + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + ".zip");
        });
        this.toastr.success("Updated Lists downloaded for '" + dept.dept_eng + "'");
        this.isLoader = false;
      }
      else {
        this.toastr.warning("Lists not found");
      }
    }, err => {
      this.toastr.error(err['error']);
      this.isLoader = false;
    });
  }

  saveDeptSettings() {

    let dept_id = this.dept_id || this.auth.webUser.dept_id;

    if (this.settings.department.settings) {
      if (![1, 5].includes(dept_id)) {
        this.settingsAll.department.settings = false;
        this.settingsAll.department.add = false;
      } else {
        this.settingsAll.department.settings = true;
        this.settingsAll.department.add = true;
      }

      // this.deptConf.settings.config_value = this.settingsAll;
      let body = {
        query: { _id: dept_id },
        set: { settings: this.settingsAll }
      }
      this.http.put(this.api.getUrl('DEPT_SETTINGS'), body).subscribe((data: any) => {
        if (data && data['success']) {
          if (dept_id == this.auth.webUser.dept_id) {
            this.auth.webUser.settings = this.settingsAll;
            this.auth.setWebUser(this.auth.webUser);
          }
          for (let i in this.gs.Lists.department) {
            if (this.gs.Lists.department[i]._id == dept_id) {
              this.gs.Lists.department[i].settings = this.settingsAll;
            }
          }
          this.toastr.success('Department Settings Updated Successfully.');
        }
      });
    }
    this.http.put(this.api.getUrl('DEPTCONFSAVE'), this.deptConf).subscribe((data: any) => {
      if (data && data['success']) {
        // this.isLoader = false;
        this.deptSelected(dept_id);
      }
    }, err => {
      this.toastr.error(err['error']);
      // this.isLoader = false;
    });

  }

  setConfigObject(type: string) {
    // Check if the type exists in deptConf
    if (!this.deptConf[type]) {
      // If it doesn't exist, create it and initialize config_value as an empty array
      this.deptConf[type] = { config_value: [], dept_id: this.dept_id };
    }
    if(!this.deptConf[type].config_value){
      this.deptConf[type].config_value = []
    }
  }

  selection(type: any, _id: any) {
    // this add type in deptConf if it not exists.
    this.setConfigObject(type);
    // Now push the _id into the config_value array
    this.deptConf[type].config_value.push(_id);
    return;
  }

  deSelection(type: any, _id: any) {
    for (let i in this.deptConf[type].config_value) {
      if (this.deptConf[type].config_value[i] == _id) {
        this.deptConf[type].config_value.splice(i, 1);
        break;
      }
    }
    return;
  }

  toggleSelectionAll(type: any, chk: boolean) {
    switch (type) {
      case 'mm':
        this.mms.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;
      case 'pbk':
        this.pbks.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;
      case 'category':
        this.categories.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;
      case 'item':
        this.items.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;
      case 'itemmix':
        this.itemmix.map((i: { _id: any, chk: boolean, subitems: any; }) => {
          if (!i.chk && chk) {
            this.selection('item', i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection('item', i._id);
            i.chk = false;
          }
          i.subitems.map((j: { _id: any, chk: boolean }) => {
            if (!j.chk && chk) {
              this.selection('subitem', j._id);
              j.chk = true;
            }
            if (!chk && j.chk) {
              this.deSelection('subitem', j._id);
              j.chk = false;
            }
          });
        });
        break;
      case 'subitem':
        this.subitems.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;
      case 'support_list':
        this.splists.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;
      case 'department':
        this.department.map((i: { _id: any, chk: boolean; }) => {
          if (!i.chk && chk) {
            this.selection(type, i._id);
            i.chk = true;
          }
          if (!chk && i.chk) {
            this.deSelection(type, i._id);
            i.chk = false;
          }
        });
        break;

    }
  }

}
