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
  // timeout: any = 9000;
  // btnShowTimer: any = 4000;
  timeout:any = 1800000;
  btnShowTimer: any = 30000;
  sec: any = this.btnShowTimer / 1000;
  mainTimer: any;

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

  timer() {
    this.sec = this.btnShowTimer / 1000;
    this.isBtn = false;
    this.mainTimer = setTimeout(() => {
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


}