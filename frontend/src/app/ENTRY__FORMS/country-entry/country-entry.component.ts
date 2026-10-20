import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-country-entry',
  templateUrl: './country-entry.component.html',
  styleUrls: ['./country-entry.component.scss']
})
export class CountryEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  countryForm: FormGroup;
  isLoader: boolean = false;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.countryForm = this.fb.group({
      country_eng: [null, Validators.required],
      country_hin: [null, Validators.required]
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['getData'] && changes['getData'].currentValue) {
      this.countryForm.patchValue({
        country_eng: changes['getData'].currentValue.country_eng,
        country_hin: changes['getData'].currentValue.country_hin
      });
    } else if (changes['getData'] && !changes['getData'].currentValue) {
      this.countryForm.reset();
    }
  }

  countryFormSubmit() {
    if (this.countryForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('COUNTRY') + this.auth.webUser.dept_id, this.countryForm.value).subscribe({
        next: (data: any) => {
          if (data && data['result'] && data['success']) {
            if (this.gs.Lists && this.gs.Lists.country) {
              this.gs.Lists.country.unshift(data['result']);
            }
            this.countryForm.reset();
            this.isLoader = false;
            this.toastr.success("Country added successfully.");
            this.response.emit(data['result']);
          } else {
            this.toastr.error(data?.['message'] || 'Failed to add country');
            this.isLoader = false;
          }
        },
        error: (err: any) => {
          this.toastr.error(err?.['error']?.message || err?.['error'] || 'Error adding country');
          this.isLoader = false;
        }
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.countryForm);
    }
  }

  countryFormUpdate() {
    if (this.countryForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        country_eng: this.countryForm.value.country_eng,
        country_hin: this.countryForm.value.country_hin
      };
      this.http.put(this.api.getUrl('COUNTRY'), body).subscribe({
        next: (data: any) => {
          if (data && data['success']) {
            if (this.gs.Lists && this.gs.Lists.country) {
              const idx = this.gs.Lists.country.findIndex((i: { _id: any }) => i._id == this.getData._id);
              if (idx > -1) {
                this.gs.Lists.country.splice(idx, 1, data['result']);
              }
            }
            this.countryForm.reset();
            this.isLoader = false;
            this.toastr.success("Country updated successfully.");
            this.response.emit(data['result']);
          }
          else {
            this.toastr.error(data?.['message'] || 'Failed to update country');
            this.isLoader = false;
          }
        },
        error: (err: any) => {
          this.toastr.error(err?.['error']?.message || err?.['error'] || 'Error updating country');
          this.isLoader = false;
        }
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.countryForm);
    }
  }

}
