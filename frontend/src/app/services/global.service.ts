import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import { ApiService } from 'src/app/services/api.service';
import { Observable, observable, Subject } from 'rxjs';
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
  importPending:any = false;
  // getList$ = new Subject();
  date = new Date();
  years: any = [];
  months: any = [
    { m: 1, name: 'January' },
    { m: 2, name: 'February' },
    { m: 3, name: 'March' },
    { m: 4, name: 'April' },
    { m: 5, name: 'May' },
    { m: 6, name: 'June' },
    { m: 7, name: 'July' },
    { m: 8, name: 'August' },
    { m: 9, name: 'September' },
    { m: 10, name: 'October' },
    { m: 11, name: 'November' },
    { m: 12, name: 'December' },
  ];

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

  // validationFireOnSubmit(fg: FormGroup) {
  // Object.keys(fg.controls).forEach(key => {
  //   const control = fg.get(key);
  //   const controlErrors: ValidationErrors = fg.get(key).errors;
  //   if (controlErrors != null) {
  //     Object.keys(controlErrors).forEach(keyError => {
  //       control.markAsDirty({ onlySelf: true });
  //       control.markAsTouched({ onlySelf: true });
  //     });
  //   }
  // });
  // }

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

}
