import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
declare var $: any;

@Component({
  selector: 'app-vehicle-entry',
  templateUrl: './vehicle-entry.component.html',
  styleUrls: ['./vehicle-entry.component.scss']
})
export class VehicleEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  vehForm: FormGroup;
  mms: any = [];
  showModal: string = ''
  isLoader: boolean = false;
  viewType: any;
  viewData: any = [];
  
  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.vehForm = this.fb.group({
      mm_id: [null, Validators.required],
      vehicle_type: [null],
      gadi_name: [null],
      gadi_num: [null, Validators.required],
      seating_capacity: [null],
      fuel_type: [null],
      owner_name: [null],
      nominee: [null],
      aawak_type: [null, Validators.required],
      rc_date: [null],
      rc_exp_date: [null],
      rc_amount: [null],
      insurance_date: [null],
      insurance_exp_date: [null],
      insurance_type: [null],
      insurance_company: [null],
      insurance_amount: [null],
      puc_date: [null],
      puc_exp_date: [null],
      puc_amount: [null],
    });    
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
    });
  }

  openModal(name: any) {
    this.showModal = name;
    $('#vehEntryComponent > #' + name).modal('show')
  }

  closeModal(name: any) {
    this.showModal = name;
    $('#vehEntryComponent > #' + this.showModal).modal('hide')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      changes.getData.currentValue.rc_date = new Date(changes.getData.currentValue.rc_date).toLocaleDateString();
      console.log( new Date(changes.getData.currentValue.rc_date).toLocaleString());
      const rc_date:any = this.vehForm.get('rc_date');
      rc_date.setValue(new Date(changes.getData.currentValue.rc_date).toLocaleString());
      this.vehForm.patchValue({
        mm_id: changes.getData.currentValue.mm_id,
        vehicle_type: changes.getData.currentValue.vehicle_type,
        gadi_name: changes.getData.currentValue.gadi_name,
        gadi_num: changes.getData.currentValue.gadi_num,
        seating_capacity: changes.getData.currentValue.seating_capacity,
        fuel_type: changes.getData.currentValue.fuel_type,
        owner_name: changes.getData.currentValue.owner_name,
        nominee: changes.getData.currentValue.nominee,
        aawak_type: changes.getData.currentValue.aawak_type,
        // rc_date: changes.getData.currentValue.rc_date,
        rc_exp_date: new Date(changes.getData.currentValue.rc_exp_date).toLocaleDateString(),
        rc_amount: changes.getData.currentValue.rc_amount,
        insurance_date: new Date(changes.getData.currentValue.insurance_date).toLocaleDateString(),
        insurance_exp_date: new Date(changes.getData.currentValue.insurance_exp_date).toLocaleDateString(),
        insurance_type: changes.getData.currentValue.insurance_type,
        insurance_company: changes.getData.currentValue.insurance_company,
        insurance_amount: changes.getData.currentValue.insurance_amount,
        puc_date: new Date(changes.getData.currentValue.puc_date),
        puc_exp_date: new Date(changes.getData.currentValue.puc_exp_date),
        puc_amount: changes.getData.currentValue.puc_amount
      });
    }
  }


  vehFormSubmit() {    
    
    if (this.vehForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('VEHICLE') + this.auth.webUser.dept_id, this.vehForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.vehForm.reset();
          this.isLoader = false;
          this.toastr.success('Vehicle Detail Added Successfully.');
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.vehForm);
    }
  }

  vehFormUpdate() {
    if (this.vehForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        mm_id: this.vehForm.value.mm_id,
        vehicle_type: this.vehForm.value.vehicle_type,
        gadi_name: this.vehForm.value.gadi_name,
        gadi_num: this.vehForm.value.gadi_num,
        seating_capacity: this.vehForm.value.seating_capacity,
        fuel_type: this.vehForm.value.fuel_type,
        owner_name: this.vehForm.value.owner_name,
        nominee: this.vehForm.value.nominee,
        aawak_type: this.vehForm.value.aawak_type,
        rc_date: this.vehForm.value.rc_date,
        rc_exp_date: this.vehForm.value.rc_exp_date,
        rc_amount: this.vehForm.value.rc_amount,
        insurance_date: this.vehForm.value.insurance_date,
        insurance_exp_date: this.vehForm.value.insurance_exp_date,
        insurance_type: this.vehForm.value.insurance_type,
        insurance_company: this.vehForm.value.insurance_company,
        insurance_amount: this.vehForm.value.insurance_amount,
        puc_date: this.vehForm.value.puc_date,
        puc_exp_date: this.vehForm.value.puc_exp_date,
        puc_amount: this.vehForm.value.puc_amount
      };
      this.http.put(this.api.getUrl('VEHICLE'), body).subscribe((data: any) => {
        if (data && data['success']) {
          // this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any }) => { i._id = this.getData._id }), 1, data['result']);
          // this.mms.splice(this.mms.indexOf((i: { _id: any }) => { i._id = this.getData._id }), 1, data['result']);
          this.vehForm.reset();
          this.isLoader = false;
          this.toastr.success('Vehicle Updated Successfully.');
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.vehForm);
    }
  }

  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Department':
        this.viewData = this.gs.Lists.department;
        $('#vehEntryComponent > #dataView').modal('show');
        break;
    }
  }


}
