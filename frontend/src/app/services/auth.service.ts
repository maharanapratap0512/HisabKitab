import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs';
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
  public settingsUpdated$ = new Subject<any>();

  get isVariantMode(): boolean {
    return this.webUser?.settings?.item?.item_mode === 'variant';
  }
  // settings: any = {};
  settingsUI = {
    pageList: [
      { key: 'department', title: 'Department', detail: '', add: true, edit: true, delete: true },
      { key: 'aawak', title: 'Aawak', detail: '', add: true, edit: true, delete: true },
      { key: 'jawak', title: 'Jawak', detail: '', add: true, edit: true, delete: true },
      { key: 'hmp', title: 'HMP', detail: 'Home Made Products', add: true, edit: true, delete: true },
      { key: 'prastav', title: 'Prastav', detail: 'Material Proposal', add: true, edit: true, delete: true },
      { key: 'bachat', title: 'Bachat', detail: '' },
      { key: 'pbk_closing', title: 'PBK Closing', detail: '', add: true, edit: true, delete: true },
      { key: 'pbk_bachat', title: 'PBK Bachat', detail: '' },
      { key: 'vehicle', title: 'Vehicle', detail: 'Vehicle Fleet & Docs', add: true, edit: true, delete: true },
      { key: 'report', title: 'Report', detail: '' },
      { key: 'product', title: 'Product', detail: 'Can be traced between All MM', add: true, edit: true, delete: true },
      { key: 'repairing', title: 'Repairing', detail: '', add: true, edit: true, delete: true },
      { key: 'mm', title: 'MM', detail: '', add: true, edit: true, delete: true },
      { key: 'category', title: 'Category', detail: '', add: true, edit: true, delete: true },
      { key: 'item', title: 'Item & Subitem', detail: '', add: true, edit: true, delete: true },
      { key: 'subitem_list', title: 'Subitem List', detail: '', add: true, edit: true, delete: true },
      { key: 'nimitt', title: 'Nimitt', detail: '', add: true, edit: true, delete: true },
      { key: 'pbk', title: 'PBK / Sewadhari', detail: '', add: true, edit: true, delete: true },
      { key: 'country', title: 'Country', detail: '', add: true, edit: true, delete: true },
      { key: 'zone', title: 'Zone', detail: '', add: true, edit: true, delete: true },
      { key: 'state', title: 'State', detail: '', add: true, edit: true, delete: true },
      { key: 'district', title: 'District', detail: '', add: true, edit: true, delete: true },
      { key: 'city', title: 'City', detail: '', add: true, edit: true, delete: true },
      { key: 'unit', title: 'Unit', detail: '', add: true, edit: true, delete: true },
      { key: 'point', title: 'Point', detail: '', add: true, edit: true, delete: true },
      { key: 'support_list', title: 'Small Lists', detail: 'Aawak Type, Jawak Type, Aawak Source, Condition, Usage_list, MM Type, Gender, Relation etc...', add: true, edit: true, delete: true },
      { key: 'integrity_checkup', title: 'Integrity Checkup', detail: '' }
    ],
    vehicle: [
      { colName: 'gadi_name', title: 'Vehicle Name / Model' },
      { colName: 'vehicle_type', title: 'Vehicle Type' },
      { colName: 'fuel_type', title: 'Fuel Type' },
      { colName: 'seating_capacity', title: 'Seating Capacity' },
      { colName: 'engine_num', title: 'Engine No.' },
      { colName: 'chasis_num', title: 'Chassis No.' },
      { colName: 'owner_name', title: 'Owner Name' },
      { colName: 'nominee', title: 'Nominee' },
      { colName: 'aawak_type', title: 'Aawak Type' },
      { colName: 'rc_amount', title: 'RC Fees' },
      { colName: 'insurance_company', title: 'Insurance Provider' },
      { colName: 'insurance_amount', title: 'Insurance Premium' },
      { colName: 'puc_amount', title: 'PUC Fee' },
      { colName: 'note', title: 'Notes / Remarks' }
    ],
    pbk: [
      { colName: 'roll_no', title: 'Roll No' },
      { colName: 'pbk_eng', title: 'PBK Name (Eng)' },
      { colName: 'relation', title: 'Relation' },
      { colName: 'relative_name', title: 'Relative Name' },
      { colName: 'birth_date', title: 'Birth Date' },
      { colName: 'age', title: 'Age' },
      { colName: 'status', title: 'Status' },
      { colName: 'address', title: 'Address' },
      { colName: 'townarea', title: 'Townarea' },
      { colName: 'district_id', title: 'District' },
      { colName: 'city_id', title: 'City' },
      { colName: 'mo_no', title: 'Mobile No.' },
      { colName: 'alt_mo_no', title: 'Alt. Mo. No.' },
      { colName: 'class_mm_id', title: 'Class MM' },
      { colName: 'bhatti_date', title: 'Bhatti Date' },
      { colName: 'document', title: 'Image' }
    ],
    district: [
      { colName: 'district_eng', title: 'Name (Eng)' },
      { colName: 'district_roman', title: 'Name (Roman)' },
      { colName: 'district_code', title: 'District Code' },
      { colName: 'state_id', title: 'State' }
    ],
    city: [
      { colName: 'city_eng', title: 'Name (Eng)' },
      { colName: 'city_roman', title: 'Name (Roman)' },
      { colName: 'city_code', title: 'City Code' },
      { colName: 'district_id', title: 'District' },
      { colName: 'state_id', title: 'State' },
      { colName: 'zone_id', title: 'Zone' }
    ],
    country: [
      { colName: 'country_eng', title: 'Name (Eng)' },
      { colName: 'country_roman', title: 'Name (Roman)' },
      { colName: 'country_code', title: 'Country Code' },
      { colName: 'dial_code', title: 'Dial Code' }
    ],
    zone: [
      { colName: 'zone_eng', title: 'Name (Eng)' },
      { colName: 'zone_roman', title: 'Name (Roman)' },
      { colName: 'zone_code', title: 'Zone Code' }
    ],
    state: [
      { colName: 'state_eng', title: 'Name (Eng)' },
      { colName: 'state_roman', title: 'Name (Roman)' },
      { colName: 'state_code', title: 'State Code' },
      { colName: 'zone_id', title: 'Zone' },
      { colName: 'country_id', title: 'Country' }
    ],
    unit: [
      { colName: 'unit_short', title: 'Short Name' },
      { colName: 'unit_full', title: 'Full Name' },
      { colName: 'unit_roman', title: 'Name (Roman)' }
    ],
    subitem_list: [
      { colName: 'subitem_list_eng', title: 'Name (Eng)' },
      { colName: 'subitem_list_roman', title: 'Name (Roman)' },
      { colName: 'subitem_code', title: 'Code' }
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
      { colName: 'reg_pg_no', title: 'Reg. Page No' },
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
      { colName: 'enz', title: 'Enzyme Container Columns.' },
      { colName: 'jawak', title: 'Jawak Section' }
    ],
    jawak: [
      { colName: 'date_sent', title: 'Date Sent' },
      { colName: 'pkt_num', title: 'Pkt Num' },
      { colName: 'reg_pg_no', title: 'Reg. Page No' },
      { colName: 'Lot_no', title: 'Lot No' },
      { colName: 'nimitt_id', title: 'Nimitt' },
      { colName: 'pbk_id', title: 'PBK / Sewadhari' },
      { colName: 'product_id', title: 'Product' },
      { colName: 'company_name', title: 'Company' },
      { colName: 'condition_id', title: 'Condition' },
      { colName: 'aawak_source_id', title: 'Aawak Source' },
      { colName: 'usage_list_id', title: 'Usage List' },
      { colName: 'is_process', title: 'For Process' },
      { colName: 'item_detail', title: 'Item Detail' },
      { colName: 'description', title: 'Description' },
      { colName: 'aawak_ref_id', title: 'Referece Aawak Search' },
      { colName: 'auto_awk', title: 'Automatic Aawak' },
      { colName: 'auto_reawk', title: 'Automatic Re-aawak' },
      { colName: 'enz', title: 'Enzyme Container Columns.' },
      { colName: 'usage_report', title: 'Review About Item Usage.' },
    ],
    hmp: [
      { colName: 'condition_id', title: 'Condition' },
      { colName: 'aawak_source_id', title: 'Aawak Source (Input)' },
      { colName: 'auto_awk_jwk', title: 'Auto Jawk / Awk' },
      { colName: 'aawak_ref_id', title: 'Ref. Aawak (Input)' },
      { colName: 'recipe_id', title: 'Recipe' },
      { colName: 'batch_no', title: 'Batch No' },
      { colName: 'lot_no', title: 'Lot No' },
      { colName: 'rate', title: 'Rate' },
      { colName: 'amount', title: 'Amount' },
      { colName: 'notes', title: 'Notes' },
      { colName: 'hmp_type', title: 'HMP Type' }
    ],
    prastav: [
      { colName: 'nimitt_id', title: 'Nimitt' },
      { colName: 'prastav_type', title: 'Prastav Type' },
      { colName: 'bachat_qty', title: 'Current Stock (Bachat)' },
      { colName: 'monthly_uses', title: 'Monthly Uses' },
      { colName: 'qty_needs', title: 'Qty Needs' },
      { colName: 'rate', title: 'Rate' },
      { colName: 'amount', title: 'Amount' },
      { colName: 'is_noted', title: 'Noted' },
      { colName: 'note_details', title: 'Note Details' },
      { colName: 'description', title: 'Description' }
    ],
    repairing: [
      { colName: 'jwk_date', title: 'Jawak Date' },
      { colName: 'mm_id', title: 'MM' },
      { colName: 'jwk_mm_id', title: 'Jawak MM' },
      { colName: 'product_code', title: 'Product' },
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
      { colName: 'aliases', title: 'Aliases' },
      { colName: 'price_range', title: 'Price Range' },
      { colName: 'sku', title: 'SKU' },
      { colName: 'extra_note', title: 'Extra Note' },
      { colName: 'document', title: 'Images' },
      { colName: 'subitem_eng', title: 'Subitem (Eng)' },
      { colName: 'subitem_roman', title: 'Subitem (Roman)' },
      { colName: 'attribute_name_eng', title: 'Attribute Name (Eng)' },
      { colName: 'attribute_name_roman', title: 'Attribute Name (Roman)' },
      { colName: 'attribute_val_eng', title: 'Attribute Value (Eng)' },
      { colName: 'attribute_val_roman', title: 'Attribute Value (Roman)' },
    ],
    ui_settings: {
      item: [
        {
          key: 'item_mode',
          title: 'Item Structure Mode',
          options: [
            { label: 'Subitem Mode', value: 'subitem' },
            { label: 'Variant Mode', value: 'variant' }
          ]
        }
      ],
      jawak: [
        {
          key: 'viewMode',
          title: 'View Mode',
          options: [
            { label: 'Voucher View', value: 'voucher' },
            { label: 'Individual View', value: 'individual' }
          ]
        },
        {
          key: 'samePageEntryForm',
          title: 'Entry Placement',
          options: [
            { label: 'Modal Entry', value: 'false' },
            { label: 'Same Page Form', value: 'true' }
          ]
        }
      ],
      hmp: [
        {
          key: 'viewMode',
          title: 'View Mode',
          options: [
            { label: 'Voucher View', value: 'voucher' },
            { label: 'Individual View', value: 'individual' }
          ]
        }
      ],
      prastav: [
        {
          key: 'viewMode',
          title: 'View Mode',
          options: [
            { label: 'Voucher View', value: 'voucher' },
            { label: 'Individual View', value: 'individual' }
          ]
        },
        {
          key: 'samePageEntryForm',
          title: 'Entry Placement',
          options: [
            { label: 'Modal Entry', value: 'false' },
            { label: 'Same Page Form', value: 'true' }
          ]
        }
      ],
      pbk_closing: [
        {
          key: 'samePageEntryForm',
          title: 'Entry Placement',
          options: [
            { label: 'Modal Entry', value: 'false' },
            { label: 'Same Page Form', value: 'true' }
          ]
        }
      ]
    },
    bachat: [
      { colName: 'used', title: 'Used (उपयोग में)' },
      { colName: 'stock', title: 'Stock (स्टॉक)' },
      { colName: 'new', title: 'New (नया)' },
      { colName: 'old', title: 'Old (पुराना)' },
      { colName: 'defective', title: 'Defective (खराब)' },
      { colName: 'scrap', title: 'Scrap (कबाड़)' },
      { colName: 'repairing', title: 'Repairing (मरम्मत)' }
    ],
    pbk_closing: [
      { colName: 'condition_id', title: 'Condition' },
      { colName: 'difference', title: 'Difference' },
      { colName: 'sw_bachat', title: 'Software Bachat' },
      { colName: 'hl', title: 'Highlight' }
    ],
    pbk_bachat: [
      { colName: 'condition_id', title: 'Condition' },
      { colName: 'qty', title: 'Quantity' },
      { colName: 'unit_id', title: 'Unit' }
    ],
    category: [
      { colName: 'category_eng', title: 'Name (Eng)' },
      { colName: 'category_roman', title: 'Name (Roman)' },
    ],
    support_list: [
      { colName: 'list_name_hin', title: 'Name (Hin)' },
      { colName: 'list_name_eng', title: 'Name (Eng)' },
      { colName: 'list_name_roman', title: 'Name (Roman)' },
    ],
    report: [
      { colName: 'report_aj_check', title: 'Aawak Jawak Check' },
      { colName: 'report_at', title: 'Aawak Type Saar' },
      { colName: 'report_jt', title: 'Jawak Type Saar' },
      { colName: 'report_str_stk', title: 'Store Stock' },
      { colName: 'report_kh', title: 'Khet Saar' },
      { colName: 'report_universal', title: 'Generate Reports (Universal)' },
      { colName: 'report_item_ledger', title: 'Item Ledger' },
    ],
    point: [
      { colName: 'point_eng', title: 'Point (Eng)' },
      { colName: 'point_roman', title: 'Point (Roman)' },
      { colName: 'point_code', title: 'Point Code' }
    ]

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
    this.settingsUpdated$.next(this.webUser?.settings);
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