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
  jawakTemplate: any;

  submit = false;

  constructor(
    public gs: GlobalService,
    public auth: AuthService,
  ) {
    this.jawakTemplate = {
      date: gs.dateString,
      item_subitem_id: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      source_mm_id: null,
      qty: null,
      rate: null,
      amount: null,
      bori_count: null,
      kiske_dwara: null,
      description: null,
      is_received: false,
      active: 1
    };

    this.lineTemplate = {
      item_subitem_id: null,   // UI helper: "itemId:subitemId"
      item_id: null,
      subitem_id: null,
      unit_id: null,
      qty_needs: null,
      qty: null,
      rate: null,
      amount: null,
      bachat: null,
      monthly_uses: null,
      description: null,
      active: 1,
      jawaks: [structuredClone(this.jawakTemplate)]
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

    // Legacy or flattened list handling - normally data comes structured or we just init empty
    if (!lines.length) {
      lines = [structuredClone(this.lineTemplate)];
    } else {
      // If backend returns jawaks inside lines already, this will handle it
      for (const row of lines) {
        row.item_subitem_id = row.subitem_id
          ? `${row.item_id}:${row.subitem_id}`
          : row.item_id;

        row.bachat = row.bachat ?? null;
        row.monthly_uses = row.monthly_uses ?? null;

        if (!row.jawaks || !row.jawaks.length) {
          row.jawaks = [structuredClone(this.jawakTemplate)];
        }
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

  // Nested Jawak Handlers
  onJawakChange(line: any, jLine: any) {
    this.resolveItemSubitem(jLine);
    const qty = Number(jLine.qty) || 0;
    const rate = Number(jLine.rate) || 0;
    jLine.amount = qty * rate || null;

    let valid = true;
    for (const jw of line.jawaks) {
      if (!(jw.source_mm_id && jw.qty)) {
        valid = false;
        break;
      }
    }

    if (valid && !this.submit) {
      const newJw = structuredClone(this.jawakTemplate);
      newJw.item_subitem_id = line.item_subitem_id;
      newJw.item_id = line.item_id;
      newJw.subitem_id = line.subitem_id;
      newJw.unit_id = line.unit_id;
      line.jawaks.push(newJw);
    }
  }

  removeJawak(line: any, jIndex: number) {
    if (line.jawaks.length > 1) {
      line.jawaks.splice(jIndex, 1);
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
    line.item_id = parts[0] ? Number(parts[0]) : null;
    line.subitem_id = parts[1] ? Number(parts[1]) : null;
  }

  valid(): boolean {
    // ── Remove last invalid LINE (auto-added empty row) ──────
    const lines = this.prastavForm.lines;
    const lastLine = lines[lines.length - 1];
    if (lastLine && (!lastLine.item_id || !lastLine.qty)) {
      lines.splice(lines.length - 1, 1);
    }

    // ── For each line, remove last invalid JAWAK row ─────────
    for (const row of lines) {
      if (row.jawaks && row.jawaks.length > 1) {
        const lastJw = row.jawaks[row.jawaks.length - 1];
        if (!lastJw.source_mm_id || !lastJw.qty) {
          row.jawaks.splice(row.jawaks.length - 1, 1);
        }
      }
    }

    // ── Header Validation ──────────────────────────────────
    if (!this.prastavForm.date || !this.prastavForm.mm_id) {
      return false;
    }

    if (!lines.length) {
      return false;
    }

    // ── Body Validation (Lines & Nested Jawaks) ───────────
    for (const row of lines) {
      if (!(row.item_id && row.qty && row.unit_id)) {
        return false;
      }
      // Stricter Jawak validation
      if (row.jawaks && row.jawaks.length > 0) {
        for (const jw of row.jawaks) {
          if (!(jw.date && jw.source_mm_id && jw.qty && jw.unit_id)) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

