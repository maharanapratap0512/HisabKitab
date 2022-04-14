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
  selector: 'app-state-entry',
  templateUrl: './state-entry.component.html',
  styleUrls: ['./state-entry.component.scss']
})
export class StateEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  stateForm: FormGroup;
  countries: any = [];
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
    this.stateForm = this.fb.group({
      state_eng: [null, Validators.required],
      state_hin: [null, Validators.required],
      country_id: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.spinner.show();
    this.gs.observeList().subscribe(result => {
      this.countries = result.country ? result.country : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("state-changes", changes);
    if (changes.getData.currentValue) {
      this.stateForm.patchValue({
        state_eng: changes.getData.currentValue.state_eng,
        state_hin: changes.getData.currentValue.state_hin,
        country_id: changes.getData.currentValue.country_id
      });
    }
  }

  stateFormSubmit() {
    if (this.stateForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('STATE'), this.stateForm.value).subscribe((data: any) => {
        console.log('clicked');
        if (data['result'] && data['success']) {
          this.gs.Lists.state.unshift(data['result'])
          this.stateForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success('STATE added successfully.')
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error'].message);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.stateForm);
    }
  }

  stateFormUpdate() {
    if (this.stateForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        state_eng: this.stateForm.value.state_eng,
        state_hin: this.stateForm.value.state_hin,
        country_id: this.stateForm.value.country_id
      };
      this.http.put(this.api.getUrl('STATE'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.state.splice(this.gs.Lists.state.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.stateForm.reset();
          this.isLoader = false;
          this.toastr.success('STATE Updated successfully.')
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error'].message);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.stateForm);
    }
  }


  countryAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#stateComponent > #addCountry').modal('hide');
      this.showModal = '';
      // this.countries.unshift(ev);
      this.stateForm.patchValue(
        {
          country_id: ev._id
        });
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

}
