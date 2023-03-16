import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrls: ['./vehicle.component.scss']
})
export class VehicleComponent implements OnInit {

  page = 1;
  itemsPerPage = 50;
  // currentPage: any;
  // totalItems: any;
  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  mode: any = '';
  vehData: any = [];
  vehDataAll: any = [];
  mms: any = [];
  total_count: any = 0;
  // departments: any = [];
  // states: any = [];
  temp: any = {};
  settings: any = {};
  constructor(
    private fb: FormBuilder,
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
    this.getvehData();
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
    });
    this.settings = this.auth.webUser.settings;
  }

  openModal(type:string, mode:string = ''){
    this.showModal = type;
    this.mode = mode;
    $('#showModal').modal('show')
  }

  getvehData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('VEHICLE') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.vehDataAll = data['result'];
        this.vehData = this.vehDataAll;
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  mmSelected(ev: any) {
    if (ev)
      this.vehData = this.vehDataAll.filter((veh: { mm_id: any; }) => veh.mm_id == ev);
    else
      this.vehData = this.vehDataAll;
  }

  // mmDeptSelected(ev: any) {
  //   if (ev) {
  //     this.vehData = this.mmAll.filter((mm: { dept_id: any; }) => mm.dept_id == ev);
  //   }
  //   else {
  //     this.vehData = this.mmAll;
  //   }
  // }

  exportToExcel() {
    this.isLoader = true;
    let date = new Date();
    let vehExportData = [];
    for (let i = 0; i < this.vehData.length; i++) {
      vehExportData.push({
        "Sr No": i + 1,
        // "_id": this.vehData[i]._id,
        "mm": this.vehData[i].mm_hin,
        "vehicle_type": this.vehData[i].vehicle_type,
        "gadi_name": this.vehData[i].gadi_name,
        "gadi_num": this.vehData[i].gadi_num,
        "seating_capacity": this.vehData[i].seating_capacity,
        "fuel_type": this.vehData[i].fuel_type,
        "owner_name": this.vehData[i].owner_name,
        "nominee": this.vehData[i].nominee,
        "aawak_type": this.vehData[i].aawak_type,
        "rc_date": this.gs.formatDisplayDate(this.vehData[i].rc_date),
        "rc_exp_date": this.gs.formatDisplayDate(this.vehData[i].rc_exp_date),
        "rc_amount": this.vehData[i].rc_amount,
        "insurance_date": this.gs.formatDisplayDate(this.vehData[i].insurance_date),
        "insurance_exp_date": this.gs.formatDisplayDate(this.vehData[i].insurance_exp_date),
        "insurance_type": this.vehData[i].insurance_type,
        "insurance_company": this.vehData[i].insurance_company,
        "insurance_amount": this.vehData[i].insurance_amount,
        "puc_date": this.gs.formatDisplayDate(this.vehData[i].puc_date),
        "puc_exp_date": this.gs.formatDisplayDate(this.vehData[i].puc_exp_date),
        "puc_amount": this.vehData[i].puc_amount
      });
    }

    this.excelExportService.exportAsExcelFile(vehExportData, "Vehicle_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  addVehicleResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.vehData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
    }
  }

  editVehicleResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.vehData.splice(this.vehData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
    }
  }

  edit(data: any, mode: string) {
    this.editData = data;
    this.mode = mode;
    this.showModal = 'Edit Vehicle'
    $('#showModal').modal('show');
    console.log("mode//////", mode);

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
        this.http.delete(this.api.getUrl('VEHICLE') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.vehData.splice(i, 1);
            // this.gs.Lists.vehData.splice(this.gs.Lists.vehData.indexOf((i: { _id: any; }) => i._id == id), 1);
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

  protectionToggle(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('VEHICLE'), body).subscribe((data: any) => {
      console.log("data", data);
      this.vehData.splice(this.vehData.findIndex((i: { _id: any; }) => i._id == id), 1, data['result']);
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
