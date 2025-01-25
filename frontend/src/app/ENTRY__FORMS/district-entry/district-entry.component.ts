
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
  selector: 'app-district-entry',
  templateUrl: './district-entry.component.html',
  styleUrls: ['./district-entry.component.scss']
})
export class DistrictEntryComponent {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  districtForm: FormGroup;
  states: any = [];
  isLoader: boolean = false;
  showModal: string = '';

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.districtForm = this.fb.group({
      district_eng: [null, Validators.required],
      district_hin: [null, Validators.required],
      state_id: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("district-changes", changes);
    if (changes.getData.currentValue) {
      this.districtForm.patchValue({
        district_eng: changes.getData.currentValue.district_eng,
        district_hin: changes.getData.currentValue.district_hin,
        state_id: changes.getData.currentValue.state_id
      });
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#districtComponent > #showModal').modal('show');
  }

  closeModal() {
    this.showModal = ''
    $('#districtComponent > #showModal').modal('hide');
  }

  districtFormSubmit() {
    if (this.districtForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('DISTRICT'), this.districtForm.value).subscribe((data: any) => {
        console.log('clicked');
        if (data['result'] && data['success']) {
          this.gs.Lists.district.unshift(data['result'])
          this.districtForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success('DISTRICT added successfully.')
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
      this.gs.validationFireOnSubmit(this.districtForm);
    }
  }

  districtFormUpdate() {
    if (this.districtForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        ...this.districtForm.value
      };
      this.http.put(this.api.getUrl('DISTRICT'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.district.splice(this.gs.Lists.district.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.districtForm.reset();
          this.isLoader = false;
          this.toastr.success('DISTRICT Updated successfully.')
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
      this.gs.validationFireOnSubmit(this.districtForm);
    }
  }


  stateAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.districtForm.patchValue({
        state_id: ev._id
      });
      this.closeModal();
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

}
