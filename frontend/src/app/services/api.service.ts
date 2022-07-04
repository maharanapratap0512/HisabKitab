import { Injectable } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';

// const base_url = 'http://192.168.43.63:1976/api';
const base_url = 'http://localhost:2018/api/';
// const base_url = '/api';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor() { }

  URLS: any = {
    BASE: base_url,
    LISTALL: base_url + 'dropdown/all',
    LIST: base_url + 'dropdown/',
    IMAGE: base_url + 'upload/image',
    PBKIMAGE: base_url + 'upload/image/pbk',
    PRODUCTIMAGE: base_url + 'upload/image/product',
    DBUPLOAD: base_url + 'upload/db',

    POINT: base_url + 'points/',
    MM: base_url + 'mms/',
    AAWAK: base_url + 'aawak/',
    PENDING_AWK: base_url + 'aawak/pending/',
    JAWAK: base_url + 'jawak/',
    JAWAKBYAWK: base_url + 'jawak/byaawak/',
    BACHAT: base_url + 'bachat/',
    BACHATHOME: base_url + 'bachat/home/',
    PBK: base_url + 'pbks/',
    COUNTRY: base_url + 'countries/',
    STATE: base_url + 'states/',
    CITY: base_url + 'cities/',
    PRODUCT: base_url + 'products/',
    ITEM: base_url + 'items/',
    ITEMMIX: base_url + 'items/itemmix/',
    SUBITEM: base_url + 'subitems/',
    SUBITEMLIST: base_url + 'subitemlists/',
    CATEGORY: base_url + 'categories/',
    UNIT: base_url + 'units/',
    SUPPORTLIST: base_url + 'supportlists/',
    AJTYPE: base_url + 'supportlists/ajtypes/',
    DEPT: base_url + 'departments/',
    EXPORTFULL: base_url + 'departments/dbfull/',
    IMPORTEXPORT: base_url + 'importexport/',
    EXPORTUPDATES: base_url + 'importexport/updates/',
    IMPORTUPDATE: base_url + 'importexport/import/',
    DEPTCONFIG: base_url + 'department_config/',
    DEPTCONFSAVE: base_url + 'department_config/save',
    LOGIN: base_url + 'departments/login',
    NIMITT: base_url + 'nimitt/'
  };

  getUrl(key: string): string {
    return this.URLS[key];
  }

}
