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
  selector: 'app-product-transfer-entry',
  templateUrl: './product-transfer-entry.component.html',
  styleUrls: ['./product-transfer-entry.component.scss']
})
export class ProductTransferEntryComponent implements OnInit {

  @Input() getData: any;
  @Input() productData: any;
  @Input() isEdit: any;
  @Input() isVerify: any;
  @Output() response = new EventEmitter();
  prdctTrnsfrForm: FormGroup;
  mms: any = [];
  viewData: any = [];
  viewType: any;
  showModal: string = '';
  isLoader: boolean = false;
  imagebase: any = [];
  imagepath: any;
  conditions: any = [];
  units: any = [];
  nimitts: any = [];
  settings: any = {};

  constructor(private fb: FormBuilder,
    private http: HttpService,
    public api: ApiService,
    private toastr: ToastrService,
    public gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.prdctTrnsfrForm = this.fb.group({
      product_id: [null, Validators.required],
      date: [null, Validators.required,],
      mm_id: [this.auth.webUser.settings?.defaultMM, Validators.required],
      entry_type: [null, Validators.required],
      aj_mm_id: [null],
      pkt_num: [null],
      condition_id: [null, Validators.required],
      nimitt_id: [null],
      old_condition_id: [null],
      transfer_detail: [null],
      repairing_ref: [null],
      dept_id: this.auth.webUser.dept_id,
      hl: false
    });
    this.settings = this.auth.webUser.settings;
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.units = result.unit ? result.unit : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
      this.conditions = result.condition ? result.condition : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("prdctTrnsfr-changes", changes);
    if (changes.isEdit && changes.isEdit.currentValue) {
      this.gs.observeList().subscribe(result => {
        this.nimitts = result.nimitt ? result.nimitt : [];
        this.conditions = result.condition ? result.condition : [];
        this.mms = result.mm ? result.mm : [];
      });
    }
    if (changes.productData && changes.productData.currentValue) {
      this.productData = changes.productData.currentValue;
      console.log(this.productData);
      this.prdctTrnsfrForm = this.fb.group({
        product_id: [null, Validators.required],
        date: [null, Validators.required,],
        mm_id: [null, Validators.required],
        entry_type: [null, Validators.required],
        aj_mm_id: [null, Validators.required],
        pkt_num: [null],
        condition_id: [null, Validators.required],
        nimitt_id: [null],
        old_condition_id: [null],
        transfer_detail: [null],
        repairing_ref: [null],
        dept_id: this.auth.webUser.dept_id,
        hl: false
      }, { validator: this.verifyDate('date') });
      if (this.productData._id) {
        this.prdctTrnsfrForm.patchValue({
          product_id: this.productData._id,
          mm_id: this.productData.last_mm ? this.productData.last_mm : this.productData.mm_id,
          old_condition_id: this.productData.last_condition ? this.productData.last_condition : this.productData.condition_id,
          condition_id: this.productData.last_condition ? this.productData.last_condition : this.productData.condition_id,
          entry_type: 'jwk'
        });
      }
    }
    if (changes.getData && changes.getData.currentValue) {
      this.getData = changes.getData.currentValue;
      this.prdctTrnsfrForm.patchValue({
        product_id: changes.getData.currentValue.product_id,
        date: changes.getData.currentValue.date,
        mm_id: changes.getData.currentValue.mm_id,
        entry_type: changes.getData.currentValue.entry_type,
        aj_mm_id: changes.getData.currentValue.aj_mm_id,
        pkt_num: changes.getData.currentValue.pkt_num ? changes.getData.currentValue.pkt_num : null,
        condition_id: changes.getData.currentValue.condition_id,
        nimitt_id: changes.getData.currentValue.nimitt_id ? changes.getData.currentValue.nimitt_id : null,
        old_condition_id: changes.getData.currentValue.old_condition_id ? changes.getData.currentValue.old_condition_id : null,
        transfer_detail: changes.getData.currentValue.transfer_detail ? changes.getData.currentValue.transfer_detail : null,
        repairing_ref: changes.getData.currentValue.repairing_ref ? changes.getData.currentValue.repairing_ref : null,
        hl: changes.getData.currentValue.hl ? changes.getData.currentValue.hl : false,
      });
      console.log(this.prdctTrnsfrForm.value);

    }
    if (changes.isVerify && changes.isVerify.currentValue) {
      this.isVerify = changes.isVerify.currentValue;
    }
  }

  verifyDate(date: string) {
    return (group: FormGroup): { [key: string]: any } => {
      let fdate = group.controls[date];
      if (this.productData.last_date && fdate.value < this.productData.last_date) {
        return {
          date: "must > " + this.productData.last_date
        };
      }
      else if (this.productData.purchase_date && fdate.value < this.productData.purchase_date) {
        return {
          date: "must > " + this.productData.purchase_date
        };
      }
      return {};
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#prdctTrnsfrEntryComponent > #showModal').modal('show')
  }

  closeModal() {
    this.showModal = '';
    $('#prdctTrnsfrEntryComponent > #showModal').modal('hide');
  }

  setView(type: string) {
    this.viewType = type;
    this.viewData = this.gs.Lists[type];
    this.openModal('View Data');
  }

  prdctTrnsfrFormSubmit() {
    if (this.prdctTrnsfrForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('PRDCT_TRNSFR') + this.auth.webUser.dept_id, this.prdctTrnsfrForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.prdctTrnsfrForm.reset();
          this.isLoader = false;
          this.toastr.success("prdctTrnsfr Added Successfully.")
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
      console.log(this.prdctTrnsfrForm);

      this.gs.validationFireOnSubmit(this.prdctTrnsfrForm);
    }
  }

  prdctTrnsfrFormUpdate() {
    if (this.prdctTrnsfrForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        product_id: this.prdctTrnsfrForm.value.product_id,
        date: this.prdctTrnsfrForm.value.date,
        mm_id: this.prdctTrnsfrForm.value.mm_id,
        entry_type: this.prdctTrnsfrForm.value.entry_type,
        aj_mm_id: this.prdctTrnsfrForm.value.aj_mm_id,
        pkt_num: this.prdctTrnsfrForm.value.pkt_num,
        condition_id: this.prdctTrnsfrForm.value.condition_id,
        nimitt_id: this.prdctTrnsfrForm.value.nimitt_id,
        old_condition_id: this.prdctTrnsfrForm.value.old_condition_id,
        transfer_detail: this.prdctTrnsfrForm.value.transfer_detail,
        repairing_ref: this.prdctTrnsfrForm.value.repairing_ref,
        hl: (this.isVerify ? 0 : this.prdctTrnsfrForm.value.hl),
      };
      // console.log("body", body);

      this.http.put(this.api.getUrl('PRDCT_TRNSFR'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.prdctTrnsfrForm.reset();
          this.isLoader = false;
          this.toastr.success("prdctTrnsfr Updated Successfully");
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
      console.log(this.prdctTrnsfrForm);

      this.gs.validationFireOnSubmit(this.prdctTrnsfrForm);
    }
  }

  mmAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      this.closeModal()
      // this.mms.unshift(ev);
      this.prdctTrnsfrForm.patchValue(
        {
          mm_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

  conditionAddResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      this.closeModal()
      // this.conditions.unshift(ev);
      this.prdctTrnsfrForm.patchValue(
        {
          condition_id: ev._id
        });
      this.isLoader = false;
    }
    else {
      this.isLoader = false;
      console.log("err", ev);
    }
  }

}

