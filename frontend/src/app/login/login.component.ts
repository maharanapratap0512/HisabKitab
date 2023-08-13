import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HttpService } from '../services/http.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GlobalService } from '../services/global.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
declare var $: any;


@Component({
   selector: 'app-login',
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

   showPass: boolean = false;
   passType: any = 'password';
   loginForm: FormGroup;
   isLoader: any = false;
   showMM: any = false;
   departments: any = [];
   mms: any = [];

   constructor(
      private http: HttpService,
      private api: ApiService,
      private fb: FormBuilder,
      private gs: GlobalService,
      private router: Router,
      private toastr: ToastrService,
      private spinner: NgxSpinnerService,
      public auth: AuthService
   ) {
      this.loginForm = this.fb.group({
         // role: [null],
         dept_id: [null, Validators.required],
         mm_id: [null],
         password: [null, Validators.required],
      })
   }

   ngOnInit(): void {
      this.spinner.show();
      this.getDepartment();
      this.getMM();
   }

   getDepartment() {
      this.isLoader = true;
      this.http.get(this.api.getUrl('DEPT')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.departments = data['result'];
            console.log(this.departments);
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getMM() {
      this.isLoader = true;
      this.http.get(this.api.getUrl('MM')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.mms = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   deptSelected(ev: any) {
      if (ev == 2) {
         this.showMM = true;
         this.loginForm.controls['mm_id'].setValidators(Validators.required)
      } else {
         this.showMM = false;
         this.loginForm.controls['mm_id'].clearValidators();
      }
   }

   loginSubmit() {
      
      if (this.loginForm.valid) {
         this.http.put(this.api.getUrl('LOGIN'), this.loginForm.value).subscribe(async (data: any) => {
            if (data['total_count'] == 1) {
               let dept = this.departments.find((i: { _id: any; }) => i._id == this.loginForm.value.dept_id);
               await this.auth.setWebUser({ 'dept_eng': dept.dept_eng, 'dept_code': dept.dept_code, 'dept_id': dept._id, 'settings_id': data['settings_id'], 'settings': data['settings'] });
               this.router.navigate(['dashboard']);
            }
            else {
               this.toastr.error('Password not match');
            }
         });
      }
      else {
         this.gs.validationFireOnSubmit(this.loginForm);
      }
   }

   passHideShow() {
      this.showPass = !this.showPass;
      if (this.showPass) {
         this.passType = 'text';
      } else {
         this.passType = 'password';
      }
   }


}
