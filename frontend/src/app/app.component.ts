import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from './services/api.service';
import { GlobalService } from './services/global.service';
import { HttpService } from './services/http.service';
import { Subject } from 'rxjs';
declare var $:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sewa2021';
  isLoader: boolean = false;
  isBtn: boolean = false;
  // timeout: any = 9000;
  // btnShowTimer: any = 4000;
  timeout: any = 1800000;
  btnShowTimer: any = 30000;
  sec: any = this.btnShowTimer / 1000;
  mainTimer: any;
  point_hin:any;
  appModal$ = new Subject();
  appModal:string = '';
  months:any = [];
  years:any = [];
  lockMonth:any;
  lockYear:any;

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private api: ApiService,
    public gs: GlobalService,
    private http:HttpService
  ) {
    this.months = gs.months;
    this.years = gs.years;

  }

  openModal(name:string){
    this.appModal = name;
    $('#'+name).modal('show');
  }
  closeModal(){
    $('#'+this.appModal).modal('hide');
    this.appModal = '';
  }

  ngOnInit(): void {
    this.spinner.show();
    this.timer()
    // setInterval(() => {
    //   this.toastr.show("में आत्मा शांत स्वरूप हूँ ।", 'Om Shanti', {
    //     timeOut: 10000,
    //     positionClass: 'toast-top-center',
    //     progressBar: true,
    //     progressAnimation: 'increasing',
    //     easing: 'ease-in'
    //   });
    //   this.toastr.show("में एक आत्मा हूँ ।", 'Om Shanti', {
    //     timeOut: 10000,
    //     positionClass: 'toast-top-center',
    //     progressBar: true,
    //     progressAnimation: 'increasing',
    //     easing: 'ease-in'
    //   });
    //   this.spinner.hide();
    // }, 300000);

  }

  submitLockData(){
    if(this.lockMonth && this.lockYear){      
      this.appModal$.next({restrict_month: this.lockMonth, restrict_year: this.lockYear});
    }
    else{
      this.appModal$.next(null);
    }
    this.appModal$.complete();    
    this.closeModal();
  }

  timer() {
    this.sec = this.btnShowTimer / 1000;
    this.isBtn = false;
    this.mainTimer = setTimeout(() => {
      this.getPoint();
      this.isLoader = true;
      let counter = setInterval(() => {
        this.sec -= 1;
        if (this.sec == 0) {
          this.isBtn = true
          clearInterval(counter);
        }
      }, 1000);
    }, this.timeout)
  }

  skipBtn() {
    this.isLoader = false;
    this.timer();
  }

  getPoint(){
    this.http.get(this.api.getUrl('POINT') + "random/").subscribe((data: any) => {
      if (data['result'] && data['result'].length > 0) {   
        this.point_hin = data['result'][0].point_hin + (data['result'][0].mrl_date ? "(" + data['result'][0].mrl_date + ")" : '');    
      }
      else {
        this.point_hin = "मैं आत्मा शांत स्वरूप हूँ ।";
      }
    });
  }


}