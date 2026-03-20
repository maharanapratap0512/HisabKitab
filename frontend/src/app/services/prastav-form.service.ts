import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class PrastavFormService {

  // Header + lines (FormArray style) container
  prastavForm: any;

  // Single line template
  lineTemplate: any;

  submit = false;

  constructor(
    public gs: GlobalService,
    public auth: AuthService,
  ) {
    this.lineTemplate = {
      item_subitem_id: null,   // UI helper: "itemId:subitemId"
      item_id: null,
      subitem_id: null,
      unit_id: null,
      qty: null,
      rate: null,
      amount: null,
      description: null,
      active: 1
    };

    this.prastavForm = {
      date: gs.dateString,
      mm_id: auth.webUser.settings.defaultMM,
      pbk_id: null,
      pbk_count: null,
      is_noted: 0,
      note_details: null,
      lines: [structuredClone(this.lineTemplate)],
      active: 1
    };
  }

  reset() {
    this.prastavForm = {
      date: this.prastavForm.date,
      mm_id: this.prastavForm.mm_id,
      pbk_id: this.prastavForm.pbk_id,
      pbk_count: null,
      is_noted: 0,
      note_details: null,
      lines: [structuredClone(this.lineTemplate)],
      active: 1
    };
    this.submit = false;
  }

  /**
   * Patch form from API object (joined prastav with jawaks)
   */
  patchForm(data: any) {
    const header = {
      date: data.date,
      mm_id: data.mm_id,
      pbk_id: data.pbk_id ?? null,
      pbk_count: data.pbk_count ?? null,
      is_noted: data.is_noted ?? 0,
      note_details: data.note_details ?? null,
      active: data.active ?? 1
    };

    let lines = Array.isArray(data.jawaks) ? structuredClone(data.jawaks) : [];

    if (!lines.length) {
      lines = [structuredClone(this.lineTemplate)];
    } else {
      for (const row of lines) {
        row.item_subitem_id = row.subitem_id
          ? `${row.item_id}:${row.subitem_id}`
          : row.item_id;
      }
    }

    this.prastavForm = {
      ...header,
      lines
    };
  }

  /**
   * Auto-add blank line when all existing lines are valid
   */
  formStatusChanges() {
    let valid = true;

    for (const row of this.prastavForm.lines) {
      if (!(row.item_id && row.qty && row.unit_id)) {
        valid = false;
        break;
      }
    }

    if (valid && !this.submit) {
      this.prastavForm.lines.push(structuredClone(this.lineTemplate));
    }
  }

  /**
   * item_subitem_id  →  item_id + subitem_id
   * Called when user picks from item ng-select in a line row.
   */
  resolveItemSubitem(line: any) {
    const val = line.item_subitem_id;
    if (!val) {
      line.item_id = null;
      line.subitem_id = null;
      return;
    }
    const parts = String(val).split(':');
    line.item_id = parts[0] || null;
    line.subitem_id = parts[1] || null;
  }

  valid(): boolean {
    const last = this.prastavForm.lines[this.prastavForm.lines.length - 1];
    if (last && !last.item_id) {
      this.prastavForm.lines.splice(this.prastavForm.lines.length - 1, 1);
    }

    if (!this.prastavForm.date || !this.prastavForm.mm_id) {
      return false;
    }

    if (!this.prastavForm.lines.length) {
      return false;
    }

    for (const row of this.prastavForm.lines) {
      if (!(row.item_id && row.qty && row.unit_id)) {
        return false;
      }
    }

    this.submit = true;
    return true;
  }
}

