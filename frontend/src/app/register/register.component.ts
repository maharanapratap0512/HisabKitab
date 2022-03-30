import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { HttpService } from '../services/http.service';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  showPass: boolean = false;
  passTyep: any = 'password';
  loginForm: FormGroup;

  constructor(
    private http: HttpService,
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private spinner: NgxSpinnerService
 ) {
    this.loginForm = this.fb.group({
       // role: [null],
       email: [null, Validators.required],
       password: [null, Validators.required],
    })
 }

 ngOnInit(): void {
   this.spinner.show();
 }

 loginSubmit() {
    if (this.loginForm.valid) {
       this.router.navigate(['main_entry']);
       // this.http.put(this.api.getUrl('IMPORTSTATES'), this.states).subscribe((data: any) => {
       //    if (data['success']) {
       //    }
       //    else{
       //       console.log("server error");          
       //    }
       // });
    }
    else {
       console.log("invalid loginForm");
    }
 }

 passHideShow() {
    this.showPass = !this.showPass;
    if (this.showPass) {
       this.passTyep = 'text';
    } else {
       this.passTyep = 'password';
    }
 }


}
