import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  aawakFormMain: any;
  aawakForm: any;
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
    // this.aawakFormArray = [this.aawakForm];
    // this.aawakFormArray.valueChanges.subscribe(changes => {
    //   console.log("form change", changes);

    //   // let status = true;
    //   // for (let awkForm of this.aawakFormArray.controls) {
    //   //   if (!awkForm.valid) {
    //   //     status = false;
    //   //     break;
    //   //   }
    //   // }

    //   // if (status) {
    //   //   this.aawakFormArray.push(fb.group({
    //   //     item_id: [null, Validators.required],
    //   //     subitem_id: [null],
    //   //     product_id: [null],
    //   //     item_detail: [null],
    //   //     company_name: [null],
    //   //     condition_id: [null, Validators.required],
    //   //     qty: [null, Validators.required],
    //   //     unit_id: [1, Validators.required],
    //   //     rate: [null],
    //   //     actual_amt: [null],
    //   //     aawak_source_id: [null],
    //   //     aawak_type_id: [null, Validators.required],
    //   //     usage_list_id: [null],
    //   //     remaining_qty: [null],
    //   //     isbill: [null],
    //   //     document: [[]],
    //   //     hl: [0],
    //   //     is_xl: [0],
    //   //     is_auto_pd: [0],
    //   //     is_auto: [0],
    //   //     is_variable_qty: [0],
    //   //     is_process: [0],
    //   //     active: [0],
    //   //   }));
    //   // }
    // });

    this.aawakFormMain.date = gs.dateString;
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

    // for (let i in awkObj.aawaks) {
    //   let awkForm = {
    //     item_id: awkObj.aawaks[i].item_id ? awkObj.aawaks[i].item_id : null,
    //     subitem_id: awkObj.aawaks[i].subitem_id ? awkObj.aawaks[i].subitem_id : null,
    //     product_id: awkObj.aawaks[i].product_id ? awkObj.aawaks[i].product_id : null,
    //     item_detail: awkObj.aawaks[i].item_detail ? awkObj.aawaks[i].item_detail : null,
    //     company_name: awkObj.aawaks[i].company_name ? awkObj.aawaks[i].company_name : null,
    //     condition_id: awkObj.aawaks[i].condition_id ? awkObj.aawaks[i].condition_id : null,
    //     qty: awkObj.aawaks[i].qty ? awkObj.aawaks[i].qty : null,
    //     unit_id: awkObj.aawaks[i].unit_id ? awkObj.aawaks[i].unit_id : null,
    //     rate: awkObj.aawaks[i].rate ? awkObj.aawaks[i].rate : null,
    //     actual_amt: awkObj.aawaks[i].actual_amt ? awkObj.aawaks[i].actual_amt : null,
    //     aawak_source_id: awkObj.aawaks[i].aawak_source_id ? awkObj.aawaks[i].aawak_source_id : null,
    //     aawak_type_id: awkObj.aawaks[i].aawak_type_id ? awkObj.aawaks[i].aawak_type_id : null,
    //     usage_list_id: awkObj.aawaks[i].usage_list_id ? awkObj.aawaks[i].usage_list_id : null,
    //     remaining_qty: awkObj.aawaks[i].remaining_qty ? awkObj.aawaks[i].remaining_qty : null,
    //     isbill: awkObj.aawaks[i].isbill ? awkObj.aawaks[i].isbill : null,
    //     document: awkObj.aawaks[i].document ? awkObj.aawaks[i].document : null,
    //     hl: awkObj.aawaks[i].hl ? awkObj.aawaks[i].hl : null,
    //     is_xl: awkObj.aawaks[i].is_xl ? awkObj.aawaks[i].is_xl : null,
    //     is_auto_pd: awkObj.aawaks[i].is_auto_pd ? awkObj.aawaks[i].is_auto_pd : null,
    //     is_auto: awkObj.aawaks[i].is_auto ? awkObj.aawaks[i].is_auto : null,
    //     is_variable_qty: awkObj.aawaks[i].is_variable_qty ? awkObj.aawaks[i].is_variable_qty : null,
    //     is_process: awkObj.aawaks[i].is_process ? awkObj.aawaks[i].is_process : null,
    //     active: awkObj.aawaks[i].active ? awkObj.aawaks[i].active : null,
    //   };
    //   this.aawakFormArray.push(this.aawakForm);
    // }
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
      date: null,
      pkt_num: null,
      mm_id: null,
      aawak_mm_id: null,
      pbk_id: null,
      dept_id: this.auth.webUser.dept_id,
      nimitt_id: null,
      description: null,
      aawaks: [{ ...this.aawakForm }],
      voucher_no: null,
    }
    this.submit = false;
  }

}
