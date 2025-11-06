import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import { ApiService } from 'src/app/services/api.service';
import { Observable, observable, of, Subject } from 'rxjs';
import { async } from '@angular/core/testing';
import { getLocaleMonthNames } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  Lists: any = null;
  Config: any = {};
  importPending: any = false;
  exceptionDept: any = [1, 5];
  menuCriteria: any = {};
  // getList$ = new Subject();
  date = new Date();
  dateString = this.date.getFullYear() + '-' + (this.date.getMonth() + 1).toString().padStart(2, "0") + '-' + this.date.getDate().toString().padStart(2, "0")
  years: any = [];
  months: any = [
    { m: 1, name: 'January', name_hin: 'जनवरी' },
    { m: 2, name: 'February', name_hin: 'फरवरी' },
    { m: 3, name: 'March', name_hin: 'मार्च' },
    { m: 4, name: 'April', name_hin: 'अप्रैल' },
    { m: 5, name: 'May', name_hin: 'मई' },
    { m: 6, name: 'June', name_hin: 'जून' },
    { m: 7, name: 'July', name_hin: 'जुलाई' },
    { m: 8, name: 'August', name_hin: 'ऑगस्ट' },
    { m: 9, name: 'September', name_hin: 'सप्टेम्बर' },
    { m: 10, name: 'October', name_hin: 'अक्टूबर' },
    { m: 11, name: 'November', name_hin: 'नवम्बर' },
    { m: 12, name: 'December', name_hin: 'दिसंबर' },
  ];

  formConfig: any = {
    item: {}
  }

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    let date = new Date();
    for (let yr = date.getFullYear(); yr >= 2021; yr--) {
      this.years.push(yr);
    }

    // this.getList();
  }

  validationFireOnSubmit(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validationFireOnSubmit(control);
      }
    });
  }

  observeList(): Observable<any> {
    let data = new Observable<any>(observer => {
      if (!this.Lists) {
        this.Lists = {}
        this.http.get(this.api.URLS['LISTALL'] + '/' + this.auth.webUser.dept_id).subscribe((data) => {
          if (data['success'] && data['result']) {
            for (let key of Object.keys(data['result'])) {
              // console.log('key',data['result'][]);

              this.Lists[key] = data['result'][key].data;
            }
          }
          observer.next(this.Lists);
        });
      }
      else {
        observer.next(this.Lists);
      }
    });
    return data;
  }

  formatDisplayDate(d: any) {
    var date = new Date(d)
    var year = date.getFullYear()
    var month = '' + (date.getMonth() + 1);
    var day = '' + date.getDate()
    // if (month.length < 2) month = '0' + month;
    // if (day.length < 2) day = '0' + day;
    var formatted = day.padStart(2, "0") + "-" + month.padStart(2, "0") + "-" + year;
    return (formatted)
  }

  async getDeptConfig() {
    return new Promise((resolve) => {
      this.http.get(this.api.getUrl('DEPTCONFIG') + this.auth.webUser.dept_id).subscribe((data) => {
        if (data['result'] && data['success']) {
          console.log(data['result']);
          resolve(1);
        }
      }, (err) => {
        this.toastr.error(err['error']);
      });
    });
  }

  checkTempImport() {
    this.http.get(this.api.getUrl('IMPORTEXPORT')).subscribe((data: any) => {
      if (data.total_count > 0) {
        this.importPending = true;
      }
      else {
        this.importPending = false;
      }
    })
  }

  yearChangedGetMonth(year: any) {
    if (year) {
      if (year == this.date.getFullYear()) {
        return this.months.filter((i: { m: number; }) => i.m <= this.date.getMonth() + 1)
      } else {
        return this.months;
      }
    } else {
      return []
    }
  }

  stringCompare(a: string, b: string): boolean {
    const clean = (str: string): string => {
      return (str || "")
        .trim()
        .normalize("NFC")          // normalize Unicode
        .replace(/\u200B/g, "")    // remove zero-width space
        .replace(/\u00A0/g, " ")   // remove non-breaking space
        .replace(/\s+/g, " ")      // collapse multiple spaces
        .toLowerCase();            // case-insensitive for English
    };

    return clean(a) === clean(b);
  }

}
