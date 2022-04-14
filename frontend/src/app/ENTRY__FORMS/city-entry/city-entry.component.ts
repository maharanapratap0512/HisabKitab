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
  selector: 'app-city-entry',
  templateUrl: './city-entry.component.html',
  styleUrls: ['./city-entry.component.scss']
})
export class CityEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  cityForm: FormGroup;
  states: any = [];
  showModal: string = '';
  isLoader: boolean = false;
  viewType: any;
  viewData: any = [];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.cityForm = this.fb.group({
      city_eng: [null],
      city_hin: [null, Validators.required],
      state_id: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("city-changes", changes || {});
    if (changes && changes.getData.currentValue) {
      this.cityForm.patchValue({
        city_eng: changes.getData.currentValue.city_eng,
        city_hin: changes.getData.currentValue.city_hin,
        state_id: changes.getData.currentValue.state_id
      });
    }
  }

  cityFormSubmit() {
    if (this.cityForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('CITY'), this.cityForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.cityForm.reset({ active: true });
          this.gs.Lists.city.unshift(data['result']);
          this.isLoader = false;
          this.toastr.success('City Added Successfully.');
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
      this.gs.validationFireOnSubmit(this.cityForm);
    }
  }

  cityFormUpdate() {
    if (this.cityForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        city_eng: this.cityForm.value.city_eng,
        city_hin: this.cityForm.value.city_hin,
        state_id: this.cityForm.value.state_id
      };
      this.http.put(this.api.getUrl('CITY'), body).subscribe((data: any) => {
        if (data && data['success']) {
          console.log("data", data);
          this.gs.Lists.city.splice(this.gs.Lists.city.indexOf((i: { _id: any; }) => i._id == this.getData._id), 1, data['result']);
          this.cityForm.reset();
          this.isLoader = false;
          this.toastr.success('City Updated Successfully.');
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
      this.gs.validationFireOnSubmit(this.cityForm);
    }
  }

  StateAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#cityComponent > #addState').modal('hide');
      this.showModal = '';
      // this.states.unshift(ev);
      this.cityForm.patchValue(
        {
          state_id: ev._id
        });
    }
    else {
      console.log("message", ev);
    }
    this.isLoader = false;
  }

  getStateData() {
    return new Promise((resolve) => {
      this.http.get(this.api.getUrl('STATE')).subscribe((data) => {
        if (data['result'] && data['success']) {
          return resolve(data['result'])
        }
      });
    })
  }

  async setView(type: string) {
    this.isLoader = true;
    switch (type) {
      case 'State':
        await this.getStateData().then((res) => {
          this.viewData = res;
        });
        this.viewType = type;
        $('#cityEntryComponent > #dataView').modal('show');
        this.isLoader = false;
        break;
    }
  }
}
