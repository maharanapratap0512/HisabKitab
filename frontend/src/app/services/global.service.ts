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
  // getList$ = new Subject();

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
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
            for(let key of Object.keys(data['result'])){
              // console.log('key',data['result'][]);
              
              this.Lists[key] = data['result'][key].data;
            }
            console.log(this.Lists);
            
            // this.Lists.country = data['result'].country;
            // this.Lists.city = data['result'].city;
            // this.Lists.mm = data['result'].mm;
            // this.Lists.state = data['result'].state;
            // this.Lists.pbk = data['result'].pbk;
            // this.Lists.nimmit = data['result'].nimmit;
            // this.Lists.gender = data['result'].gender;
            // this.Lists.relation = data['result'].relation;
            // this.Lists.status = data['result'].status;
            // this.Lists.condition = data['result'].condition;
            // this.Lists.aawak_type = data['result'].aj_type.filter((aj: { list_type: string; }) => aj.list_type == 'aawak_type');
            // this.Lists.jawak_type = data['result'].aj_type.filter((aj: { list_type: string; }) => aj.list_type == 'jawak_type');
            // this.Lists.category = data['result'].category;
            // this.Lists.unit = data['result'].unit;
            // // this.Lists.item = data['result'].item;
            // this.Lists.itemmix = data['result'].itemmix;
            // this.Lists.subitem_list = data['result'].subitem_list;
            // // this.Lists.subitem = data['result'].subitem;
            // this.Lists.department = data['result'].department;
            // this.Lists.sitem = data['result'].sitem;
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


  // async getList() {
  //   this.http.get(this.api.URLS['LISTALL'] + '/' + this.auth.webUser.dept_id).subscribe((data) => {
  //     if (data['success'] && data['result']) {
  //       this.Lists.country = data['result'].country;
  //       this.Lists.city = data['result'].city;
  //       this.Lists.mm = data['result'].mm;
  //       this.Lists.state = data['result'].state;
  //       this.Lists.pbk = data['result'].pbk;
  //       this.Lists.gender = data['result'].gender;
  //       this.Lists.relation = data['result'].relation;
  //       this.Lists.status = data['result'].status;
  //       this.Lists.condition = data['result'].condition;
  //       this.Lists.aawak_type = data['result'].aj_type.filter((aj: { list_type: string; }) => aj.list_type == 'aawak_type');
  //       this.Lists.jawak_type = data['result'].aj_type.filter((aj: { list_type: string; }) => aj.list_type == 'jawak_type');
  //       this.Lists.category = data['result'].category;
  //       this.Lists.unit = data['result'].unit;
  //       this.Lists.item = data['result'].item;
  //       this.Lists.itemmix = data['result'].itemmix;
  //       this.Lists.subitem_list = data['result'].subitem_list;
  //       this.Lists.subitem = data['result'].subitem;
  //       this.Lists.department = data['result'].department;
  //       this.Lists.sitem = data['result'].sitem;
  //     }
  //     this.getList$.next(this.Lists);
  //   });
  // }

  // getList() {
  //   return new Promise((resolve) => {
  //     this.http.get(this.api.URLS['LISTALL'] + '/' + this.auth.webUser.dept_id).subscribe((data) => {
  //       if (data['success'] && data['result']) {
  //         this.Lists.country = data['result'].country;
  //         this.Lists.city = data['result'].city;
  //         this.Lists.mm = data['result'].mm;
  //         this.Lists.state = data['result'].state;
  //         this.Lists.pbk = data['result'].pbk;
  //         this.Lists.gender = data['result'].gender;
  //         this.Lists.relation = data['result'].relation;
  //         this.Lists.status = data['result'].status;
  //         this.Lists.condition = data['result'].condition;
  //         this.Lists.aawak_type = data['result'].aj_type.filter((aj: { list_type: string; })=>aj.list_type == 'aawak_type');
  //         this.Lists.jawak_type = data['result'].aj_type.filter((aj: { list_type: string; })=>aj.list_type == 'jawak_type');
  //         this.Lists.category = data['result'].category;
  //         this.Lists.unit = data['result'].unit;
  //         this.Lists.item = data['result'].item;
  //         this.Lists.itemmix = data['result'].itemmix;
  //         this.Lists.subitem_list = data['result'].subitem_list;
  //         this.Lists.subitem = data['result'].subitem;
  //         this.Lists.department = data['result'].department;
  //         this.Lists.sitem = data['result'].sitem;
  //       }
  //       return resolve(1);
  //     });
  //   });
  // }


  async getDeptConfig() {
    return new Promise((resolve) => {
      this.http.get(this.api.getUrl('DEPTCONFIG') + this.auth.webUser.dept_id).subscribe((data) => {
        if (data['result'] && data['success']) {
          console.log(data['result']);
          resolve(1);
        }
      }, (err) => {
        this.toastr.error(err['error'].message);
      });
    });
  }


}
