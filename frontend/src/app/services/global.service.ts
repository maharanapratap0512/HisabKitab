import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { HttpService } from 'src/app/services/http.service';
import { ApiService } from 'src/app/services/api.service';
import { Observable, observable } from 'rxjs';
import { async } from '@angular/core/testing';
import { getLocaleMonthNames } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {


  Lists: any = {};
  Config: any = {};

  constructor(
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {
    // this.initialiseLists();
    // this.Config.dept_id = window.localStorage.getItem('dept_id');
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

  getList() {
    return new Promise((resolve) => {

      this.http.get(this.api.URLS['LISTALL'] + '/' + this.auth.webUser.dept_id).subscribe((data) => {

        if (data['success'] && data['result']) {
          this.Lists.country = data['result'].country;
          this.Lists.city = data['result'].city;
          this.Lists.mm = data['result'].mm;
          this.Lists.state = data['result'].state;
          this.Lists.pbk = data['result'].pbk;
          this.Lists.gender = data['result'].gender;
          this.Lists.relation = data['result'].relation;
          this.Lists.status = data['result'].status;
          this.Lists.condition = data['result'].condition;
          this.Lists.aawak_type = data['result'].aawak_type;
          this.Lists.jawak_type = data['result'].jawak_type;
          this.Lists.category = data['result'].category;
          this.Lists.unit = data['result'].unit;
          this.Lists.item = data['result'].item;
          this.Lists.subitem_list = data['result'].subitem_list;
          this.Lists.subitem = data['result'].subitem;
          this.Lists.department = data['result'].department;

        }
        return resolve(1);
      });
    });
  }

  initialiseLists = async () => {
    // console.log("Config",this.Config);

    // if (!this.Lists) {
    //   await this.getList().then((res) => {
    //     this.Lists = res;
    //   });
    // }
  }

  async initialiseListByDept() {
    // this.Config.dept_id = window.localStorage.getItem('dept_id');
    return new Promise(async (resolve) => {
      await this.getList().then((resolve) => { });
      resolve(1);
    });

  }

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



  // // Create an Observable that will start listening to geolocation updates
  // // when a consumer subscribes.
  // const locations = new Observable((observer) => {
  //   let watchId: number;

  //   // Simple geolocation API check provides values to publish
  //   if ('geolocation' in navigator) {
  //     watchId = navigator.geolocation.watchPosition((position: GeolocationPosition) => {
  //       observer.next(position);
  //     }, (error: GeolocationPositionError) => {
  //       observer.error(error);
  //     });
  //   } else {
  //     observer.error('Geolocation not available');
  //   }

  //   // When the consumer unsubscribes, clean up data ready for next subscription.
  //   return {
  //     unsubscribe() {
  //       navigator.geolocation.clearWatch(watchId);
  //     }
  //   };
  // });

  // // Call subscribe() to start listening for updates.
  // const locationsSubscription = locations.subscribe({
  //   next(position) {
  //     console.log('Current Position: ', position);
  //   },
  //   error(msg) {
  //     console.log('Error Getting Location: ', msg);
  //   }
  // });

  // // Stop listening for location after 10 seconds
  // setTimeout(() => {
  //   locationsSubscription.unsubscribe();
  // }, 10000);onst Lists1 = new observable((observe) => { })

}
