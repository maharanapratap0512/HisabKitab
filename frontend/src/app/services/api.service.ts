import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { Location } from '@angular/common';

// const base_url = 'http://192.168.43.63:1976/api';
// const base_url = 'http://localhost:2018/api/';
// const base_url = '/api';

const host = window.location.host;
const base_port = getPortFromHost(host) - 1000;
const base_url = `http://localhost:${base_port}/api/`;

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(
    private location: Location
  ) { }

  URLS: any = {
    BASE: base_url,
    LISTALL: base_url + 'dropdown/all',
    LIST: base_url + 'dropdown/',
    IMAGE: base_url + 'upload/image',
    IMAGE64: base_url + 'upload/base64',

    POINT: base_url + 'points/',
    MM: base_url + 'mms/',
    AAWAK: base_url + 'aawak/',
    PENDING_AWK: base_url + 'aawak/pending/',
    JAWAK: base_url + 'jawak/',
    JAWAKBYAWK: base_url + 'jawak/byaawak/',
    BACHAT: base_url + 'bachat/',
    BACHATNEW: base_url + 'bachat_new/',
    BACHATNEW_OPTIMIZED: base_url + 'bachat_new_optimized/',
    BACHATHOME: base_url + 'bachat/home/',
    PBK: base_url + 'pbks/',
    PBKBACHAT: base_url + 'pbk_bachat/',
    PBKCLOSING: base_url + 'pbk_closing/',
    HMP: base_url + 'hmp/',
    COUNTRY: base_url + 'countries/',
    STATE: base_url + 'states/',
    ZONE: base_url + 'zones/',
    DISTRICT: base_url + 'districts/',
    CITY: base_url + 'cities/',
    PRODUCT: base_url + 'products/',
    PRDCT_TRNSFR: base_url + 'product_tracking/',
    ITEM: base_url + 'items/',
    ITEMMIX: base_url + 'items/itemmix/',
    SUBITEM: base_url + 'subitems/',
    SUBITEMLIST: base_url + 'subitemlists/',
    CATEGORY: base_url + 'categories/',
    UNIT: base_url + 'units/',
    SUPPORTLIST: base_url + 'supportlists/',
    SPLIST: base_url + 'supportlists/splists/',
    DEPT: base_url + 'departments/',
    DEPT_SETTINGS: base_url + 'departments/settings/',
    EXPORTFULL: base_url + 'departments/dbfull/',
    IMPORTEXPORT: base_url + 'importexport/',
    EXPORTUPDATES: base_url + 'importexport/updates/',
    IMPORTUPDATE: base_url + 'importexport/import/',
    APPLYUPDATE: base_url + 'importexport/update_apply/',
    EXCELIMPORT: base_url + 'excelimport/',
    DEPTCONFIG: base_url + 'department_config/',
    DEPTCONFSAVE: base_url + 'department_config/save',
    LOGIN: base_url + 'departments/login',
    NIMITT: base_url + 'nimitt/',
    DICT: base_url + 'dictionary/',
    REPORT: base_url + 'reports/',
    REPORT_AT: base_url + 'reports/awk_type_saar/',
    REPORT_AJ_CH: base_url + 'reports/awk_jwk_check/',
    REPORT_JT: base_url + 'reports/jwk_type_saar/',
    REPORT_STR_STK: base_url + 'reports/report_store_stock/',
    REPORT_KH: base_url + 'reports/report_khet_saar/',
    REPORT_KH_IW: base_url + 'reports/report_khet_itemwise/',
    REPORT_KH_AJS: base_url + 'reports/report_khet_ajsaar/',
    REPORTAJ: base_url + 'reports/aj/',
    IMPORTHISTORY: base_url + 'import_history/',
    VEHICLE: base_url + 'vehicle/',
    COMMENT: base_url + 'comment/'

  };

  getUrl(key: string): string {
    return this.URLS[key];
  }

}

function getPortFromHost(host: string): number {
  const match = host.match(/:(\d+)/);
  return match ? +match[1] : 1000;
}
