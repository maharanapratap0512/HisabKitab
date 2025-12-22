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
      enz: {
        aawak_id: null,
        container_aawak_source_id: null,
        container_enz_no: null,
        container_capacity: null,
        container_qty: null,
      },
      active: 1,
    };
    this.aawakFormMain = {
      date: null,
      pkt_num: null,
      reg_pg_no: null,
      mm_id: auth.webUser.settings.defaultMM,
      aawak_mm_id: null,
      pbk_id: null,
      dept_id: auth.webUser.dept_id,
      nimitt_id: null,
      description: null,
      aawaks: [JSON.parse(JSON.stringify(this.aawakForm))],
      voucher_no: null,
    };
    this.jawakForm = {
      aawak_ref_id: null,
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
      enz: {
        jawak_id: null,
        container_capacity: null,
      },
      usage_report: {
        jawak_id: null,
        date: null,
        reporter: null,
        usage_type: null,
        fayda: null,
        nuksan: null,
        rating: null,
      },
      active: 1,
    };
    this.jawakFormMain = {
      date: null,
      date_sent: null,
      pkt_num: null,
      reg_pg_no: null,
      mm_id: auth.webUser.settings.defaultMM,
      jawak_mm_id: null,
      pbk_id: null,
      dept_id: auth.webUser.dept_id,
      nimitt_id: null,
      description: null,
      jawaks: [JSON.parse(JSON.stringify(this.jawakForm))],
      voucher_no: null,
    };
    this.jawakFormMain.date = gs.dateString;
    this.aawakFormMain.date = gs.dateString;
  }

  patchForm(awkObj: any) {
    this.aawakFormMain = {
      date: awkObj.date,
      pkt_num: awkObj.pkt_num ? awkObj.pkt_num : null,
      reg_pg_no: awkObj.reg_pg_no ? awkObj.reg_pg_no : null,
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

  patchFormJawak(jwkObj: any) {
    this.jawakFormMain = {
      date: jwkObj.date,
      date_sent: jwkObj.date_sent ? jwkObj.date_sent : null,
      pkt_num: jwkObj.pkt_num ? jwkObj.pkt_num : null,
      reg_pg_no: jwkObj.reg_pg_no ? jwkObj.reg_pg_no : null,
      mm_id: jwkObj.mm_id,
      jawak_mm_id: jwkObj.jawak_mm_id ? jwkObj.jawak_mm_id : null,
      pbk_id: jwkObj.pbk_id ? jwkObj.pbk_id : null,
      dept_id: jwkObj.dept_id,
      nimitt_id: jwkObj.nimitt_id ? jwkObj.nimitt_id : null,
      description: jwkObj.description ? jwkObj.description : null,
      jawaks: jwkObj.jawaks ? jwkObj.jawaks : [],
      voucher_no: jwkObj.voucher_no,
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
      this.aawakFormMain.aawaks.push(JSON.parse(JSON.stringify(this.aawakForm)));
    }
  }

  jawakFormStatusChanges() {
    let valid = true;

    for (let jwkForm of this.jawakFormMain.jawaks) {
      if (!(jwkForm.item_id && jwkForm.qty && jwkForm.unit_id && jwkForm.jawak_type_id)) {
        valid = false;
        break;
      }
    }

    if (valid && !this.submit) {
      this.jawakFormMain.jawaks.push(JSON.parse(JSON.stringify(this.jawakForm)));
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

  validJawak() {
    this.jawakFormMain.jawaks.splice(this.jawakFormMain.jawaks.length-1, 1);
    for (let i in this.jawakFormMain.jawaks) {
      if (!(this.jawakFormMain.jawaks[i].item_id && this.jawakFormMain.jawaks[i].qty && this.jawakFormMain.jawaks[i].unit_id && this.jawakFormMain.jawaks[i].jawak_type_id)) {
        if (this.jawakFormMain.jawaks.length > 1) {
          this.jawakFormMain.jawaks.splice(i, 1);
        }
      }
    }

    console.log(this.jawakFormMain);


    if (this.jawakFormMain.date && this.jawakFormMain.mm_id && (this.jawakFormMain.jawak_mm_id || this.jawakFormMain.pbk_id) && this.jawakFormMain.jawaks.length > 0) {
      console.log("true");

      return true;
    } else {
      console.log("false");
      console.log(this.jawakFormMain.date, this.jawakFormMain.mm_id, (this.jawakFormMain.jawak_mm_id || this.jawakFormMain.pbk_id), this.jawakFormMain.jawaks.length > 0);
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

  resetJawak() {
    this.jawakFormMain = {
      date: this.jawakFormMain.date,
      date_sent: null,
      pkt_num: null,
      mm_id: this.jawakFormMain.mm_id,
      jawak_mm_id: null,
      pbk_id: null,
      dept_id: this.auth.webUser.dept_id,
      nimitt_id: this.jawakFormMain.nimitt_id,
      description: null,
      jawaks: [JSON.parse(JSON.stringify(this.jawakForm))],
      voucher_no: null,
    }
    this.submit = false;
  }

}
