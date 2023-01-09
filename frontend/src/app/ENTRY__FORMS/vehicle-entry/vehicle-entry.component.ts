import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
  states: any = [];
  nimitts: any = [];
  mms: any = [];
  departments: any = [];
  showModal: string = ''
  isLoader: boolean = false;
  viewType: any;
  parentMM: any;
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

      mm_id: [null],
      vehicle_type: [null],
      gadi_name: [null],
      gadi_num: [null, Validators.required],
      seating_capacity: [null],
      fuel_type: [null],
      owner_name: [null, Validators.required],
      nominee: [null],
      aawak_type: [null],
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
      this.states = result.state ? result.state : [];
      this.departments = result.department ? result.department : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
    });
  }

  openModal(name: any) {
    this.showModal = name;
    $('#mmEntryComponent > #' + name).modal('show')
  }

  closeModal(name: any) {
    this.showModal = name;
    $('#mmEntryComponent > #' + this.showModal).modal('hide')
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData.currentValue) {
      this.vehForm.patchValue({
        mm_eng: changes.getData.currentValue.mm_eng,
        mm_hin: changes.getData.currentValue.mm_hin,
        mm_code: changes.getData.currentValue.mm_code,
        parent_mm_id: changes.getData.currentValue.parent_mm_id,
        dept_id: changes.getData.currentValue.dept_id,
        state_id: changes.getData.currentValue.state_id,
        opening_date: changes.getData.currentValue.opening_date,
        nimitt_id: changes.getData.currentValue.nimitt_id,
      });
    }
  }


  vehFormSubmit() {
    if (this.vehForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('MM') + this.auth.webUser.dept_id, this.vehForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.mm.unshift(data['result']);
          // this.mms.unshift(data['result']);
          this.vehForm.reset();
          this.isLoader = false;
          this.toastr.success('MM Added Successfully.');
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
        mm_eng: this.vehForm.value.mm_eng,
        mm_hin: this.vehForm.value.mm_hin,
        mm_code: this.vehForm.value.mm_code,
        parent_mm_id: this.vehForm.value.parent_mm_id,
        dept_id: this.vehForm.value.dept_id,
        state_id: this.vehForm.value.state_id,
        opening_date: this.vehForm.value.opening_date,
        nimitt_id: this.vehForm.value.nimitt_id
      };
      this.http.put(this.api.getUrl('MM'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any }) => { i._id = this.getData._id }), 1, data['result']);
          this.mms.splice(this.mms.indexOf((i: { _id: any }) => { i._id = this.getData._id }), 1, data['result']);
          this.vehForm.reset();
          this.isLoader = false;
          this.toastr.success('MM Updated Successfully.');
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

  stateAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.vehForm.patchValue({ state_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  nimittAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.vehForm.patchValue({ nimitt_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }

  departmentAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#mmEntryComponent > #showModal').modal('hide');
      this.showModal = '';
      this.vehForm.patchValue({ dept_id: ev._id });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
    }
  }


  setView(type: string) {
    this.viewType = type;
    switch (type) {
      case 'Department':
        this.viewData = this.gs.Lists.department;
        $('#mmEntryComponent > #dataView').modal('show');
        break;
    }
  }


}
