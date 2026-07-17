import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { GlobalService } from './global.service';
import { ToastrService } from 'ngx-toastr';

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
    private toastr: ToastrService
  ) {
    this.jawakTemplate = {
      date: gs.dateString,
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
      packing_date: null,
      pkt_no: null,
      received_date: null,
      review: 1,
      review_reason: null,
      active: 1
    };

    this.lineTemplate = {
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
      is_rejected: false,
      reject_reason: null,
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
   * Patch form from API object (grouped voucher or single item)
   */
  patchForm(data: any) {
    if (!data) return;

    // Data can be a full voucher (has 'lines' or 'items') 
    // or a single prastav item from individual mode (which has nested 'jawaks')
    let lines = [];
    if (Array.isArray(data.lines)) {
      lines = structuredClone(data.lines);
    } else if (Array.isArray(data.items)) {
      lines = structuredClone(data.items);
    } else if (data._id) {
      // Single item mode - treat the object itself as a line
      lines = [structuredClone(data)];
    }

    const header = {
      _id: data._id ?? null,
      date: data.date,
      // Pull common fields from top-level or from the first line if grouping didn't include them
      mm_id: data.mm_id ?? lines[0]?.mm_id,
      pbk_id: data.pbk_id ?? lines[0]?.pbk_id ?? null,
      pbk_count: data.pbk_count ?? null,
      voucher_no: data.voucher_no ?? null,
      is_noted: data.is_noted ?? 0,
      note_details: data.note_details ?? null,
      active: data.active ?? 1
    };

    if (!lines.length) {
      lines = [structuredClone(this.lineTemplate)];
    } else {
      for (const row of lines) {
        // IDs are already present in the API object

        row.bachat = row.bachat ?? null;
        row.monthly_uses = row.monthly_uses ?? null;

        // Ensure nested jawaks have their own UI helpers
        if (!row.jawaks || !row.jawaks.length) {
          row.jawaks = [structuredClone(this.jawakTemplate)];
        } else {
          for (const jw of row.jawaks) {
            jw.item_id = row.item_id;
            jw.subitem_id = row.subitem_id;
          }
        }

        // Auto-fill first jawak if it is empty/new
        const firstJw = row.jawaks[0];
        if (firstJw) {
          if (!firstJw.source_mm_id && this.auth.webUser?.settings?.defaultMM) {
            firstJw.source_mm_id = this.auth.webUser.settings.defaultMM;
          }
          if (!firstJw.qty) {
            firstJw.qty = row.qty;
            firstJw.rate = row.rate;
            firstJw.amount = (Number(row.qty) || 0) * (Number(row.rate) || 0);
          }
          if (!firstJw.item_id) {
            firstJw.item_id = row.item_id;
            firstJw.subitem_id = row.subitem_id;
            firstJw.unit_id = row.unit_id;
          }
        }
      }
    }

    this.prastavForm = {
      ...header,
      lines
    };

    // Auto-add rows if existing ones are valid
    this.formStatusChanges();
    for (const line of this.prastavForm.lines) {
      if (line.jawaks && line.jawaks.length > 0) {
        this.onJawakChange(line, line.jawaks[line.jawaks.length - 1]);
      }
    }
  }

  /**
   * Auto-add blank line when all existing lines are valid
   */
  formStatusChanges() {
    // Auto-add line is disabled, user will manually click 'Add More'
  }

  addLine() {
    this.prastavForm.lines.push(structuredClone(this.lineTemplate));
  }

  // Nested Jawak Handlers
  onJawakChange(line: any, jLine: any) {
    if (!jLine.rate && line.rate) {
      jLine.rate = line.rate;
    }
    let qty = Number(jLine.qty) || 0;
    const rate = Number(jLine.rate) || 0;

    // Ensure total jawak qty doesn't exceed parent line qty (aawak)
    const jawaksCount = line.jawaks.length;
    const lastJw = jawaksCount > 0 ? line.jawaks[jawaksCount - 1] : null;
    const isLastPending = lastJw && lastJw !== jLine && (!lastJw.source_mm_id || !lastJw.qty);

    const sumOtherQty = line.jawaks
      .filter((jw: any) => jw !== jLine && !(isLastPending && jw === lastJw))
      .reduce((sum: number, jw: any) => sum + (Number(jw.qty) || 0), 0);
    const maxAllowedQty = Math.max(0, (Number(line.qty) || 0) - sumOtherQty);

    if (qty > maxAllowedQty) {
      qty = maxAllowedQty;
      jLine.qty = maxAllowedQty || null;
      this.toastr.warning(`Quantity capped to remaining approved amount: ${maxAllowedQty}`);
    }

    jLine.amount = qty * rate || null;

    // Recalculate remaining quantity and update the last pending row if it exists
    if (jawaksCount > 1 && lastJw) {
      // If the last row is pending/not fully filled, we recalculate its values
      if (lastJw !== jLine && (!lastJw.source_mm_id || !lastJw.qty)) {
        const sumPrevQty = line.jawaks.slice(0, -1).reduce((sum: number, jw: any) => sum + (Number(jw.qty) || 0), 0);
        const remainingQty = (Number(line.qty) || 0) - sumPrevQty;
        if (remainingQty > 0) {
          lastJw.qty = remainingQty;
          lastJw.rate = line.rate;
          lastJw.amount = remainingQty * (Number(line.rate) || 0);
        } else {
          lastJw.qty = null;
          lastJw.rate = null;
          lastJw.amount = null;
        }
      }
    }

    let valid = true;
    for (const jw of line.jawaks) {
      if (!(jw.source_mm_id && jw.qty)) {
        valid = false;
        break;
      }
    }

    if (valid && !this.submit) {
      // Only auto-add a new row if there is still remaining qty to distribute
      const sumPrevQty = line.jawaks.reduce((sum: number, jw: any) => sum + (Number(jw.qty) || 0), 0);
      const remainingQty = (Number(line.qty) || 0) - sumPrevQty;

      if (remainingQty > 0) {
        const newJw = structuredClone(this.jawakTemplate);
        newJw.item_id = line.item_id;
        newJw.subitem_id = line.subitem_id;
        newJw.unit_id = line.unit_id;
        newJw.qty = remainingQty;
        newJw.rate = line.rate;
        newJw.amount = remainingQty * (Number(line.rate) || 0);
        line.jawaks.push(newJw);
      }
    }
  }

  removeJawak(line: any, jIndex: number) {
    if (line.jawaks.length > 1) {
      line.jawaks.splice(jIndex, 1);
    }
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
      if (row.jawaks && row.jawaks.length > 0) {
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

