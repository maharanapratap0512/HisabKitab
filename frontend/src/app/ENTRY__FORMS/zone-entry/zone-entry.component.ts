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
  selector: 'app-zone-entry',
  templateUrl: './zone-entry.component.html',
  styleUrls: ['./zone-entry.component.scss']
})
export class ZoneEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  zoneForm: FormGroup;
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
    this.zoneForm = this.fb.group({
      zone_eng: [null, Validators.required],
      zone_hin: [null, Validators.required],
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
    console.log("zone-changes", changes);
    if (changes.getData.currentValue) {
      this.zoneForm.patchValue({
        zone_eng: changes.getData.currentValue.zone_eng,
        zone_hin: changes.getData.currentValue.zone_hin,
        country_id: changes.getData.currentValue.country_id
      });
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#zoneComponent > #showModal').modal('show');
  }

  closeModal() {
    this.showModal = ''
    $('#zoneComponent > #showModal').modal('hide');
  }

  zoneFormSubmit() {
    if (this.zoneForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('ZONE'), this.zoneForm.value).subscribe((data: any) => {
        console.log('clicked');
        if (data['result'] && data['success']) {
          this.gs.Lists.zone.unshift(data['result'])
          this.zoneForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success('ZONE added successfully.')
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
      this.gs.validationFireOnSubmit(this.zoneForm);
    }
  }

  zoneFormUpdate() {
    if (this.zoneForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        ...this.zoneForm.value
      };
      this.http.put(this.api.getUrl('ZONE'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.zone.splice(this.gs.Lists.zone.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.zoneForm.reset();
          this.isLoader = false;
          this.toastr.success('ZONE Updated successfully.')
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
      this.gs.validationFireOnSubmit(this.zoneForm);
    }
  }


  countryAddResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.zoneForm.patchValue({
        country_id: ev._id
      });
      this.closeModal();
    }
    else {
      console.log("message", ev);

    }
    this.isLoader = false;
  }

}
