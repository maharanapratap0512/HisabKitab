import { Injectable, Inject } from '@angular/core';
// import { LOCAL_STORAGE, WINDOW } from '@ng-toolkit/universal';
import { settings } from 'cluster';
import { ApiService } from './api.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  user: any;
  webUser: any = {};
  // settings: any = {};
  settingsUI = {
    pageList: [
      { key: 'department', title: 'Department', detail: '', add: true, edit: true, delete: true },
      { key: 'aawak', title: 'Aawak', detail: '' },
      { key: 'jawak', title: 'Jawak', detail: '' },
      { key: 'bachat', title: 'Bachat', detail: '' },
      { key: 'vehicle', title: 'Vehicle', detail: '', add: true, edit: true, delete: true },
      { key: 'report', title: 'Report', detail: '', },
      { key: 'product', title: 'Product', detail: 'Can be tranced between All MM', add: true, edit: true, delete: true },
      { key: 'repairing', title: 'Repairing', detail: '', add: true, edit: true, delete: true },
      { key: 'mm', title: 'MM', detail: '', add: true, edit: true, delete: true },
      { key: 'category', title: 'Category', detail: '', add: true, edit: true, delete: true },
      { key: 'item', title: 'Item & Subitem', detail: '', add: true, edit: true, delete: true },
      { key: 'nimitt', title: 'Nimitt', detail: '', add: true, edit: true, delete: true },
      { key: 'pbk', title: 'PBK / Sewadhari', detail: '', add: true, edit: true, delete: true },
      { key: 'city', title: 'City', detail: '', add: true, edit: true, delete: true },
      { key: 'point', title: 'Point', detail: '', },
      { key: 'support_list', title: 'Small Lists', detail: 'Aawak Type, Jawak Type, Aawak Source, Condition, Usage_list, MM Type, Gender, Relation etc...', add: true, edit: true, delete: true },
      // { key: 'department', title: 'Department', detail: '' },
    ],
    pbk: [
      { colName: 'roll_no', title: 'Roll No' },
      { colName: 'pbk_eng', title: 'PBK Name (Eng)' },
      { colName: 'relation', title: 'Relation' },
      { colName: 'relative_name', title: 'Relative Name' },
      { colName: 'birth_date', title: 'Birth Date' },
      { colName: 'age', title: 'Age' },
      { colName: 'address', title: 'Address' },
      { colName: 'townarea', title: 'Townarea' },
      { colName: 'city_id', title: 'City' },
      { colName: 'mo_no', title: 'Mobile No.' },
      { colName: 'alt_mo_no', title: 'Alt. Mo. No.' },
      { colName: 'class_mm_id', title: 'Class MM' },
      { colName: 'bhatti_date', title: 'Bhatti Date' },
      { colName: 'document', title: 'Image' }
    ],
    product: [
      { colName: 'purchase_date', title: 'Purchase Date' },
      { colName: 'purchased_by', title: 'Purchase By' },
      { colName: 'purchase_from', title: 'Purchase From' },
      { colName: 'filter_dept', title: 'Filter By Dept' },
      { colName: 'filter_category', title: 'Filter By Category' },
      { colName: 'company_name', title: 'Company' },
      { colName: 'model_name', title: 'Model' },
      { colName: 'warranty_period', title: 'Warranty Period' },
      { colName: 'warranty_from', title: 'Warranty From' },
      { colName: 'accessories', title: 'Accessories' },
      { colName: 'price', title: 'Price' },
      { colName: 'nimitt_id', title: 'Nimitt' },
      { colName: 'product_detail', title: 'Product Detail' },
      { colName: 'document', title: 'Images' },
    ],
    department: [
      { colName: 'manage', title: 'DB Generate' },
      { colName: 'settings', title: 'Software Settings' },
    ],
    aawak: [
      { colName: 'pkt_num', title: 'Pkt Num' },
      { colName: 'lot_no', title: 'Lot No' },
      { colName: 'filter_by_state', title: 'Filter PBK' },
      { colName: 'pbk_id', title: 'PBK / Sewadhari' },
      { colName: 'nimitt_id', title: 'Nimitt' },
      { colName: 'company_name', title: 'Company' },
      { colName: 'filter_by_dept', title: 'Filter By Dept' },
      { colName: 'filter_by_cat', title: 'Filter By Category' },
      { colName: 'product_id', title: 'Product' },
      { colName: 'condition_id', title: 'Condition' },
      { colName: 'rate', title: 'Rate / Price' },
      { colName: 'actual_amt', title: 'Act. Amount' },
      { colName: 'aawak_source_id', title: 'Aawak Source' },
      { colName: 'usage_list_id', title: 'Usage List' },
      { colName: 'item_detail', title: 'Item Detail' },
      { colName: 'description', title: 'Description' },
      { colName: 'isbill', title: 'बिल है?' },
      { colName: 'is_variable_qty', title: 'Variable Qty' },
      { colName: 'is_process', title: 'Processed Aawak' },
      { colName: 'document', title: 'Image' },
      { colName: 'jawak', title: 'Jawak Section' }
    ],
    jawak: [
      { colName: 'pkt_num', title: 'Pkt Num' },
      { colName: 'Lot_no', title: 'Lot No' },
      { colName: 'date_sent', title: 'Date Sent' },
      { colName: 'nimitt_id', title: 'Nimitt' },
      { colName: 'filter_by_state', title: 'Filter PBK' },
      { colName: 'pbk_id', title: 'PBK / Sewadhari' },
      { colName: 'product_id', title: 'Product' },
      { colName: 'company_name', title: 'Company' },
      { colName: 'condition_id', title: 'Condition' },
      { colName: 'aawak_source_id', title: 'Aawak Source' },
      { colName: 'usage_list_id', title: 'Usage List' },
      { colName: 'is_process', title: 'For Process' },
      { colName: 'item_detail', title: 'Item Detail' },
      { colName: 'description', title: 'Description' },
      { colName: 'ref_aawak_select', title: 'Referece Aawak Search' },
      { colName: 'auto_awk', title: 'Automatic Aawak' },
      
    ],
    repairing: [
      { colName: 'jwk_date', title: 'Jawak Date' },
      { colName: 'mm_id', title: 'MM' },
      { colName: 'jwk_mm_id', title: 'Jawak MM' },
      { colName: 'product_code', title: 'Product' },
      { colName: 'srv_code', title: 'srv Code' },
      { colName: 'srv_code', title: 'srv Code' },
      { colName: 'repair_from', title: 'Repair From' },
      { colName: 'repairer_info', title: 'Repairer Info' },
      { colName: 'problem_detail', title: 'Problem Detail' },
      { colName: 'solution_detail', title: 'Solution Detail' },
      { colName: 'used_parts', title: 'Used Parts' },
      { colName: 'parts_cost', title: 'Parts Cost' },
      { colName: 'repairing_cost', title: 'Repairing Cost' },
      { colName: 'actual_spent_amt', title: 'Actual Amount Spent' },
      { colName: 'warranty_info', title: 'Warranty Info' },
      { colName: 'document', title: 'document' },
      { colName: 'awk_ref_id', title: 'Aawak' },
      { colName: 'jwk_ref_id', title: 'Jawak' },
      
    ],
    nimitt: [
      { colName: 'roll_no', title: 'Roll No' },
      { colName: 'nimitt_eng', title: 'Name (Eng)' },
      { colName: 'relative_name', title: 'Father Name' },
      { colName: 'townarea', title: 'Townarea' },
    ],
    mm: [
      { colName: 'parent_mm_id', title: 'Parent MM' },
      { colName: 'mm_eng', title: 'Name (Eng)' },
      { colName: 'mm_roman', title: 'Name (Roman)' },
      { colName: 'mm_code', title: 'MM Code' },
      { colName: 'opening_date', title: 'Openning Date' },
      { colName: 'nimitt_id', title: 'Nimitt' },
      { colName: 'closing_date', title: 'Closing Date' },
    ],
    item: [
      { colName: 'item_eng', title: 'Name (Eng)' },
      { colName: 'item_roman', title: 'Name (Roman)' },
      { colName: 'item_code', title: 'Item Code' },
      { colName: 'price_range', title: 'Price Range' },
      { colName: 'extra_note', title: 'Extra Note' },
      { colName: 'document', title: 'Images' },
      { colName: 'subitem_eng', title: 'Subitem (Eng)' },
      { colName: 'subitem_roman', title: 'Subitem (Roman)' },
    ],
    bachat: [],
    category: [
      { colName: 'category_eng', title: 'Name (Eng)' },
      { colName: 'category_roman', title: 'Name (Roman)' },
    ],
    support_list: [
      { colName: 'list_name_hin', title: 'Name (Eng)' },
      { colName: 'list_name_roman', title: 'Name (Roman)' },
    ],
    report: [
      { colName: 'report_at', title: 'Aawak Type Saar' },
      { colName: 'report_jt', title: 'Jawak Type Saar' },
      { colName: 'report_str_stk', title: 'Store Stock' },
      { colName: 'report_kh', title: 'Khet Saar' },
    ],
    point: []

  }

  constructor(
    private api: ApiService,
    private http: HttpService
  ) {
    this.webUser = this.getWebUser();

  }

  // getToken() {
  //   return this.localStorage.getItem('Authorization');
  // }

  // setToken(loggedInUser: any) {
  //   this.localStorage.setItem('Authorization', loggedInUser);
  // }

  loggedIn() {
    // return !!this.localStorage.getItem('WebUser');
    return !!window.sessionStorage.getItem('WebUser');
    // return false;
  }

  // For WebUser
  async setWebUser(user: any) {
    // this.localStorage.setItem('WebUser', JSON.stringify(user));
    window.sessionStorage.setItem('WebUser', JSON.stringify(user));
    this.webUser = user;
  }

  // async updateMainSettings(setting: any) {

  //   this.webUser.settings = setting;
  //   window.sessionStorage.setItem('WebUser', JSON.stringify(this.webUser));
  // }

  async updateSettings() {

    let body = {
      query: { _id: this.webUser.dept_id },
      set: { settings: this.webUser.settings }
    }
    this.http.put(this.api.getUrl('DEPT_SETTINGS'), body).subscribe((data: any) => {
      if (data && data['success']) {
        this.webUser.settings = data.result.settings;
        this.setWebUser(this.webUser)
      }
    });

  }

  getWebUser() {
    // return JSON.parse(this.localStorage.getItem('WebUser') || '{}');
    return JSON.parse(window.sessionStorage.getItem('WebUser') || '{}');
    // return ''
  }

  removewebUser() {
    // this.localStorage.removeItem('WebUser');
    window.sessionStorage.removeItem('WebUser');
    // this.localStorage.removeItem('Authorization');
    // return '';
  }
}