import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-point-entry',
  templateUrl: './point-entry.component.html',
  styleUrls: ['./point-entry.component.scss']
})
export class PointEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  pointForm: FormGroup;
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
    this.pointForm = this.fb.group({
      type:[null],
      no:[null],
      mrl_date:[null],
      clrf_date:[null],
      time_from:[null],
      time_to:[null],
      point_eng: [null],
      point_hin: [null, Validators.required],
      active: 1
    });
  }

  ngOnInit() {
    this.spinner.show();
    // this.gs.observeList().subscribe(result => {
    //   this.countries = result.country ? result.country : [];
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("point-changes", changes);
    if (changes.getData && changes.getData.currentValue) {
      this.pointForm.patchValue({
        type: changes.getData.currentValue.type,
        no: changes.getData.currentValue.no,
        mrl_date: changes.getData.currentValue.mrl_date,
        point_eng: changes.getData.currentValue.point_eng,
        point_hin: changes.getData.currentValue.point_hin,
      });
    }
  }

  pointFormSubmit() {
    if (this.pointForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('POINT'), this.pointForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          // this.gs.Lists.point.unshift(data['result'])
          this.pointForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success('point added successfully.')
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
      this.gs.validationFireOnSubmit(this.pointForm);
    }
  }

  pointFormUpdate() {
    if (this.pointForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        type: this.pointForm.value.type,
        no: this.pointForm.value.no,
        mrl_date: this.pointForm.value.mrl_date,
        point_eng: this.pointForm.value.point_eng,
        point_hin: this.pointForm.value.point_hin,
      };
      this.http.put(this.api.getUrl('POINT'), body).subscribe((data: any) => {
        if (data && data['success']) {
          // this.gs.Lists.point.splice(this.gs.Lists.point.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result'])
          this.pointForm.reset();
          this.isLoader = false;
          this.toastr.success('point Updated successfully.')
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
      this.gs.validationFireOnSubmit(this.pointForm);
    }
  }


  // countryAddResponse(ev: any) {
  //   if (ev._id) {
  //     this.isLoader = true;
  //     $('#pointComponent > #addCountry').modal('hide');
  //     this.showModal = '';
  //     // this.countries.unshift(ev);
  //     this.pointForm.patchValue(
  //       {
  //         country_id: ev._id
  //       });
  //   }
  //   else {
  //     console.log("message", ev);

  //   }
  //   this.isLoader = false;
  // }

}
