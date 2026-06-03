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
      item_id: null,
      subitem_id: null,
      unit_id: null,
      condition_id: null,
      qty: null,
      rate: null,
      lot_no: null,
      aawak_source_id: null,
      jawak_ref_id: null,
      aawak_ref_id: null,
      auto_jawak: false,
      auto_aawak: false,
      aawak_type_id: null,
      active: 1
    };

    this.outputFormTemplate = {
      item_id: null,
      subitem_id: null,
      unit_id: null,
      condition_id: null,
      qty: null,
      rate: null,
      lot_no: null,
      aawak_ref_id: null,
      auto_aawak: false,
      jawak_detail: [],
      active: 1
    };

    this.hmpBatchForm = {
      date: gs.dateString,
      batch_no: null,
      mm_id: auth.webUser.settings.defaultMM,
      recipe_id: null,
      recipe_name: null,
      description: null,
      dept_id: auth.webUser.dept_id,
      inputs: [JSON.parse(JSON.stringify(this.inputFormTemplate))],
      outputs: [JSON.parse(JSON.stringify(this.outputFormTemplate))],
      update_recipe: false,
      auto_jawak: false,
      auto_aawak: false,
      active: 1
    };
  }

  reset() {
    this.hmpBatchForm = {
      date: this.hmpBatchForm.date,
      batch_no: null,
      mm_id: this.hmpBatchForm.mm_id,
      recipe_id: null,
      recipe_name: null,
      recipe_description: null,
      dept_id: this.auth.webUser.dept_id,
      inputs: [JSON.parse(JSON.stringify(this.inputFormTemplate))],
      outputs: [JSON.parse(JSON.stringify(this.outputFormTemplate))],
      update_recipe: false,
      auto_jawak: false,
      auto_aawak: false,
      active: 1
    };
    this.submit = false;
  }

  patchForm(data: any) {
    console.log('data', data);

    for (let j in data.inputs) {
      if (data.inputs[j].jawak_ref_id) {
        data.inputs[j].auto_jawak = true;
      }
      if (data.inputs[j].is_auto_jwk) {
        data.inputs[j].auto_jawak = true;
      }
      if (data.inputs[j].is_auto_awk) {
        data.inputs[j].auto_aawak = true;
      }
    }
    for (let j in data.outputs) {
      if (data.outputs[j].aawak_ref_id) {
        data.outputs[j].auto_aawak = true;
      }
      if (data.outputs[j].is_auto_awk) {
        data.outputs[j].auto_aawak = true;
      }
    }

    this.hmpBatchForm = structuredClone(data);
  }

  // Logic to auto-add rows if the last row is valid (handles both traditional and modern)
  formStatusChanges(editorMode: string = 'traditional') {
    if (editorMode === 'modern') return;
    console.log("fsc");

    let validInput = true;
    for (let form of this.hmpBatchForm.inputs) {
      if (!(form.item_id)) {
        validInput = false;
        break;
      }
    }
    if (validInput) {
      this.hmpBatchForm.inputs.push(JSON.parse(JSON.stringify(this.inputFormTemplate)));
    }

    let validOutput = true;
    for (let form of this.hmpBatchForm.outputs) {
      if (!(form.item_id)) {
        validOutput = false;
        break;
      }
    }
    if (validOutput) {
      this.hmpBatchForm.outputs.push(JSON.parse(JSON.stringify(this.outputFormTemplate)));
    }
  }

  valid(editorMode: string = 'traditional') {
    // Basic Validation
    if (!this.hmpBatchForm.date || !this.hmpBatchForm.mm_id) return false;

    if (editorMode === 'traditional') {
      // Remove trailing blank inputs row (auto-added by formStatusChanges)
      const lastInput = this.hmpBatchForm.inputs[this.hmpBatchForm.inputs.length - 1];
      if (lastInput && !lastInput.item_id) {
        this.hmpBatchForm.inputs.splice(this.hmpBatchForm.inputs.length - 1, 1);
      }
      // Remove trailing blank outputs row
      const lastOutput = this.hmpBatchForm.outputs[this.hmpBatchForm.outputs.length - 1];
      if (lastOutput && !lastOutput.item_id) {
        this.hmpBatchForm.outputs.splice(this.hmpBatchForm.outputs.length - 1, 1);
      }
    } else {
      // Modern mode filtering
      this.hmpBatchForm.inputs = this.hmpBatchForm.inputs.filter((row: any) => row.item_id && row.qty);
      this.hmpBatchForm.outputs = this.hmpBatchForm.outputs.filter((row: any) => row.item_id && row.qty);
    }

    // At least 1 filled row each
    if (!this.hmpBatchForm.inputs.length || !this.hmpBatchForm.outputs.length) return false;

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
