import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-nimitt',
  templateUrl: './nimitt.component.html',
  styleUrls: ['./nimitt.component.scss']
})
export class NimittComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  nimittData: any = [];
  total_count: any = 0;
  settings:any = {};

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getNimittData();
    this.settings = this.auth.webUser.settings;
  }

  getNimittData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('NIMITT') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.nimittData = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addNimittResponse(ev: any) {
    if (ev) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.nimittData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev)
    }
  }

  editNimittResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.nimittData.splice(this.nimittData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Nimitt'
    $('#showModal').modal('show');
  }

  delete(i: any, id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('NIMITT') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.nimittData.splice(i, 1);
            this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any; }) => i._id == id), 1);
            this.total_count -= 1;
            this.toastr.success('Deleted Successfully');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        });
      }
    })
  }

  exportToExcel() {
    this.isLoader = true;
    let date = new Date();
    let nimittD = [];
    for (let i = 0; i < this.nimittData.length; i++) {
      nimittD.push({
        "Sr No": i + 1,
        "_id": this.nimittData[i]._id,
        "Roll No": this.nimittData[i].roll_no,
        "MM Hin": this.nimittData[i].nimitt_hin,
        "MM Eng": this.nimittData[i].nimitt_eng,
        "Gender": this.nimittData[i].gender,
        "Father Name": this.nimittData[i].relative_name,
        "Townarea": this.nimittData[i].townarea,
        "State": this.nimittData[i].state_hin,        
      });
    }
    
    this.excelExportService.exportAsExcelFile(nimittD, "Nimitt_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
    this.isLoader = false;
  }

  protectionToggle(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('NIMITT'), body).subscribe((data: any) => {
      this.nimittData.splice(this.nimittData.findIndex((i: { _id: any; }) => i._id == id), 1, data['result']);
      this.isLoader = false;
      if (data['result'].active) {
        this.toastr.success("Protetion Shield Activated");
      }
      else {
        this.toastr.success("Protetion Shield Deactivated");
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }


}
