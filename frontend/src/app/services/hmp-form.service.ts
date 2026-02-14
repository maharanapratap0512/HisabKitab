import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class HmpFormService {
  hmpBatchForm: any;
  inputFormTemplate: any;
  outputFormTemplate: any;
  submit: boolean = false;

  constructor(
    private fb: FormBuilder,
    public gs: GlobalService,
    public auth: AuthService,
  ) {
    this.inputFormTemplate = {
      item_subitem_id: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      condition_id: null,
      qty: null,
      rate: null,
      lot_no: null,
      jawak_ref_id: null,
      active: 1
    };

    this.outputFormTemplate = {
      item_subitem_id: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      condition_id: null,
      qty: null,
      rate: null,
      lot_no: null,
      aawak_ref_id: null,
      active: 1
    };

    this.hmpBatchForm = {
      date: gs.dateString,
      mm_id: auth.webUser.settings.defaultMM,
      recipe_id: null,
      recipe_name: null,
      recipe_description: null,
      dept_id: auth.webUser.dept_id,
      inputs: [JSON.parse(JSON.stringify(this.inputFormTemplate))],
      outputs: [JSON.parse(JSON.stringify(this.outputFormTemplate))],
      update_recipe: false,
      active: 1
    };
  }

  reset() {
    this.hmpBatchForm = {
      date: this.hmpBatchForm.date,
      mm_id: this.hmpBatchForm.mm_id,
      recipe_id: null,
      recipe_name: null,
      recipe_description: null,
      dept_id: this.auth.webUser.dept_id,
      inputs: [JSON.parse(JSON.stringify(this.inputFormTemplate))],
      outputs: [JSON.parse(JSON.stringify(this.outputFormTemplate))],
      update_recipe: false,
      active: 1
    };
    this.submit = false;
  }

  patchForm(data: any) {
    this.hmpBatchForm = {
      ...this.hmpBatchForm,
      ...data,
      inputs: data.inputs ? data.inputs : [JSON.parse(JSON.stringify(this.inputFormTemplate))],
      outputs: data.outputs ? data.outputs : [JSON.parse(JSON.stringify(this.outputFormTemplate))]
    };
  }

  // Logic to auto-add rows if the last row is valid
  formStatusChanges() {
    let valid = true;
    for (let form of this.hmpBatchForm.inputs) {
      if (!(form.item_id)) {
        valid = false;
        break;
      }
    }
    if (valid) {
      this.hmpBatchForm.inputs.push(JSON.parse(JSON.stringify(this.inputFormTemplate)));
    }

    valid = true;
    for (let form of this.hmpBatchForm.outputs) {
      if (!(form.item_id)) {
        valid = false;
        break;
      }
    }
    if (valid) {
      this.hmpBatchForm.outputs.push(JSON.parse(JSON.stringify(this.outputFormTemplate)));
    }
  }

  valid() {
    // Remove last empty inputs
    if (!this.hmpBatchForm.inputs[this.hmpBatchForm.inputs.length - 1].item_id) {
      this.hmpBatchForm.inputs.splice(this.hmpBatchForm.inputs.length - 1, 1);
    }
    // Remove last empty outputs
    if (!this.hmpBatchForm.outputs[this.hmpBatchForm.outputs.length - 1].item_id) {
      this.hmpBatchForm.outputs.splice(this.hmpBatchForm.outputs.length - 1, 1);
    }

    // Basic Validation
    if (!this.hmpBatchForm.date || !this.hmpBatchForm.mm_id) return false;
    if (this.hmpBatchForm.inputs.length === 0 || this.hmpBatchForm.outputs.length === 0) return false;

    // Validate Input Rows
    for (let row of this.hmpBatchForm.inputs) {
      if (!row.item_id || !row.qty) return false;
    }

    // Validate Output Rows 
    for (let row of this.hmpBatchForm.outputs) {
      if (!row.item_id || !row.qty) return false;
    }

    return true;
  }
}
