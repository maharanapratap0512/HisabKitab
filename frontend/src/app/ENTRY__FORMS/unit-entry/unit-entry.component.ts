import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-unit-entry',
  templateUrl: './unit-entry.component.html',
  styleUrls: ['./unit-entry.component.scss']
})
export class UnitEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  unitForm: FormGroup;
  isLoader: boolean = false;
  showModal: string = '';

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.unitForm = this.fb.group({
      unit_full: [null, Validators.required],
      unit_short: [null, Validators.required]
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("unit-changes", changes);
    if (changes.getData.currentValue) {
      this.unitForm.patchValue({
        unit_full: changes.getData.currentValue.unit_full,
        unit_short: changes.getData.currentValue.unit_short
      });
    }
  }

  unitFormSubmit() {
    if (this.unitForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('UNIT'), this.unitForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.unit.unshift(data['result'])
          this.unitForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success("UNIT added successfully.");
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
      this.gs.validationFireOnSubmit(this.unitForm);
    }
  }

  unitFormUpdate() {
    if (this.unitForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        unit_full: this.unitForm.value.unit_full,
        unit_short: this.unitForm.value.unit_short
      };
      this.http.put(this.api.getUrl('UNIT'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.unit.splice(this.gs.Lists.unit.indexOf((i: { _id: any }) => { i._id == this.getData._id }), 1, data['result']);
          this.unitForm.reset();
          this.isLoader = false;
          this.toastr.success("UNIT updated successfully.");
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
      this.gs.validationFireOnSubmit(this.unitForm);
    }
  }

}
