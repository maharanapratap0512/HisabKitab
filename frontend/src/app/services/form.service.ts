import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  aawakFormMain: any;
  jawakFormMain: any;
  aawakForm: any;
  jawakForm: any;
  submit: boolean = false;
  // aawakFormArray: any = [];

  constructor(private fb: FormBuilder,
    public gs: GlobalService,
    public auth: AuthService,) {

    this.aawakForm = {
      lot_no: null,
      item_id: null,
      subitem_id: null,
      product_id: null,
      item_detail: null,
      company_name: null,
      condition_id: null,
      qty: null,
      unit_id: null,
      rate: null,
      actual_amt: null,
      aawak_source_id: null,
      aawak_type_id: null,
      usage_list_id: null,
      remaining_qty: null,
      isbill: null,
      document: null,
      hl: 0,
      is_xl: 0,
      is_auto_pd: 0,
      is_auto: 0,
      is_variable_qty: 0,
      is_process: 0,
      active: 1,
    };
    this.aawakFormMain = {
      date: null,
      pkt_num: null,
      mm_id: null,
      aawak_mm_id: null,
      pbk_id: null,
      dept_id: auth.webUser.dept_id,
      nimitt_id: null,
      description: null,
      aawaks: [{ ...this.aawakForm }],
      voucher_no: null,
    };
    this.jawakForm = {
      aawak_ref_id:null,
      lot_no: null,
      item_id: null,
      subitem_id: null,
      product_id: null,
      item_detail: null,
      company_name: null,
      condition_id: null,
      qty: null,
      unit_id: null,
      rate: null,
      actual_amt: null,
      aawak_source_id: null,
      jawak_type_id: null,
      usage_list_id: null,
      isbill: null,
      document: null,
      hl: 0,
      is_xl: 0,
      // is_auto: 0,
      // is_variable_qty: 0,
      is_process: 0,
      active: 1,
    };
    this.jawakFormMain = {
      date: null,
      date_sent: null,
      pkt_num: null,
      mm_id: null,
      jawak_mm_id: null,
      pbk_id: null,
      dept_id: auth.webUser.dept_id,
      nimitt_id: null,
      description: null,
      jawaks: [{ ...this.aawakForm }],
      voucher_no: null,
    };
    this.jawakFormMain.date = gs.dateString;
  }

  patchForm(awkObj: any) {
    this.aawakFormMain = {
      date: awkObj.date,
      pkt_num: awkObj.pkt_num ? awkObj.pkt_num : null,
      mm_id: awkObj.mm_id,
      aawak_mm_id: awkObj.aawak_mm_id ? awkObj.aawak_mm_id : null,
      pbk_id: awkObj.pbk_id ? awkObj.pbk_id : null,
      dept_id: awkObj.dept_id,
      nimitt_id: awkObj.nimitt_id ? awkObj.nimitt_id : null,
      description: awkObj.description ? awkObj.description : null,
      aawaks: awkObj.aawaks ? awkObj.aawaks : [],
      voucher_no: awkObj.voucher_no,
    };
  }

  formStatusChanges() {
    let valid = true;

    for (let awkForm of this.aawakFormMain.aawaks) {
      if (!(awkForm.item_id && awkForm.qty && awkForm.unit_id && awkForm.aawak_type_id)) {
        valid = false;
        break;
      }
    }

    if (valid && !this.submit) {
      this.aawakFormMain.aawaks.push({ ...this.aawakForm });
    }
  }

  valid() {
    for (let i in this.aawakFormMain.aawaks) {
      if (!(this.aawakFormMain.aawaks[i].item_id && this.aawakFormMain.aawaks[i].qty && this.aawakFormMain.aawaks[i].unit_id && this.aawakFormMain.aawaks[i].aawak_type_id)) {
        if (this.aawakFormMain.aawaks.length > 1) {
          this.aawakFormMain.aawaks.splice(i, 1);
        }
      }
    }

    if (this.aawakFormMain.date && this.aawakFormMain.mm_id && (this.aawakFormMain.aawak_mm_id || this.aawakFormMain.pbk_id) && this.aawakFormMain.aawaks.length > 0) {
      return true;
    } else {
      return false;
    }
  }


  reset() {
    this.aawakFormMain = {
      date: this.aawakFormMain.date,
      pkt_num: null,
      mm_id: this.aawakFormMain.mm_id,
      aawak_mm_id: null,
      pbk_id: null,
      dept_id: this.auth.webUser.dept_id,
      nimitt_id: this.aawakFormMain.nimitt_id,
      description: null,
      aawaks: [{ ...this.aawakForm }],
      voucher_no: null,
    }
    this.submit = false;
  }

}
