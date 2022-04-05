import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from './services/api.service';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sewa2021';
  isLoader: boolean = false;
  isBtn: boolean = false;
  timeout:any = 1800000;
  waiting: any = 30000;
  sec: any ;

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private api: ApiService,
    public gs: GlobalService
  ) {
    this.Initialise();
  }

  Initialise = async () => {
    await this.gs.initialiseListByDept();
  }

  ngOnInit(): void {
    this.spinner.show();
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

  aa() {
    this.isLoader = false;
    this.Timer = this.Timer;
  }

  Timer = setInterval(() => {
    this.sec = this.waiting;
    this.isLoader = true;
    let counter = setInterval(()=>{
      this.sec = (this.sec / 1000) - 1;
    },1000);

    setTimeout(() => {
      this.isBtn = true;
      clearInterval(counter);
    }, this.waiting);


  }, this.timeout);
  
}