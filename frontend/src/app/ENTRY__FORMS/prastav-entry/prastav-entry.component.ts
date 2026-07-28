import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { PrastavFormService } from 'src/app/services/prastav-form.service';

declare var $: any;

@Component({
  selector: 'app-prastav-entry',
  templateUrl: './prastav-entry.component.html',
  styleUrls: ['./prastav-entry.component.scss']
})
export class PrastavEntryComponent implements OnInit, OnChanges {

  @Output() response = new EventEmitter();
  @Input() isEdit: any;
  @Input() getData: any;
  @Input() jawakFocusMode: boolean = false;
  @Input() focusedLineIndex: number = 0;
  @Input() allJawakMode: boolean = false;

  // Focus state triggers
  focusJawakLine: number | null = null;
  focusJawakIndex: number | null = null;

  mms: any[] = [];
  pbks: any[] = [];
  items: any[] = [];    // itemmix list (item + subitems combined)
  units: any[] = [];

  commonSourceMM: any = null;

  onCommonSourceMMChange() {
    if (!this.commonSourceMM) return;
    const lines = this.pfs.prastavForm?.lines || [];
    for (const line of lines) {
      if (line.jawaks && line.jawaks.length > 0) {
        for (const jw of line.jawaks) {
          jw.source_mm_id = this.commonSourceMM;
          this.pfs.onJawakChange(line, jw);
        }
      }
    }
  }

  constructor(
    public pfs: PrastavFormService,
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService
  ) {
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
      this.pbks = result.pbk || [];
      this.items = result.itemmix || [];   // itemmix has nested subitems[]
      this.units = result.unit || [];
    });
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['getData'] && changes['getData'].currentValue) {
      this.pfs.patchForm(changes['getData'].currentValue);
    }

    if (changes['jawakFocusMode'] && changes['jawakFocusMode']?.currentValue === true) {
      this.focusLastJawak(this.focusedLineIndex);
    }

    if (changes['allJawakMode'] && changes['allJawakMode']?.currentValue === true) {
      // Auto-populate first jawak row for all lines
      setTimeout(() => {
        const lines = this.pfs.prastavForm?.lines || [];
        for (const line of lines) {
          if (line.item_id && line.jawaks && line.jawaks.length > 0) {
            const firstJw = line.jawaks[0];
            if (firstJw && !firstJw.source_mm_id && this.auth.webUser?.settings?.defaultMM) {
              firstJw.source_mm_id = this.auth.webUser.settings.defaultMM;
            }
            if (firstJw && !firstJw.qty) {
              firstJw.qty = line.qty;
              firstJw.rate = line.rate;
              firstJw.amount = (Number(line.qty) || 0) * (Number(line.rate) || 0) || null;
            }
          }
        }
      }, 100);
    }
  }

  focusLastJawak(lineIdx: number) {
    // Small delay to ensure *ngIf has rendered the Jawak table before we set focus indices
    setTimeout(() => {
      const line = this.pfs.prastavForm.lines[lineIdx];
      if (line && line.jawaks) {
        this.focusJawakLine = lineIdx;
        this.focusJawakIndex = line.jawaks.length - 1;
        this.resetFocusTriggers();
      }
    }, 100);
  }

  resetFocusTriggers() {
    setTimeout(() => {
      this.focusJawakLine = null;
      this.focusJawakIndex = null;
    }, 500);
  }

  // ── Line helpers ──────────────────────────────────────────

  /** item_subitem_id change → split into item_id / subitem_id, then auto-add row */
  onItemChange(line: any) {

    // Auto-select unit if available
    if (line.item_id) {
      const parentItem = this.items.find(it => it._id === line.item_id);
      if (parentItem) {
        if (line.subitem_id) {
          const subitem = parentItem.subitems?.find((s: any) => s._id === line.subitem_id);
          if (subitem && subitem.unit_id) line.unit_id = subitem.unit_id;
        } else if (parentItem.unit_id) {
          line.unit_id = parentItem.unit_id;
        }
      }
    }

    // Sync item and unit to ALL jawaks
    if (line.jawaks && line.jawaks.length > 0) {
      for (const jw of line.jawaks) {
        jw.item_id = line.item_id;
        jw.subitem_id = line.subitem_id;
        jw.unit_id = line.unit_id;
      }
      // Autofill first jawak's source MM if empty
      const firstJw = line.jawaks[0];
      if (firstJw && !firstJw.source_mm_id && this.auth.webUser?.settings?.defaultMM) {
        firstJw.source_mm_id = this.auth.webUser.settings.defaultMM;
      }
    }
    this.pfs.formStatusChanges();
  }

  /** qty / rate change → auto-calculate amount, then auto-add row */
  onLineChange(line: any) {
    const qty = Number(line.qty) || 0;
    const rate = Number(line.rate) || 0;
    line.amount = qty * rate || null;

    this.pfs.formStatusChanges();

    // Sync rate to all jawaks and quantity to the first jawak row
    if (line.jawaks && line.jawaks.length > 0) {
      for (const jw of line.jawaks) {
        jw.rate = line.rate;
        jw.amount = (Number(jw.qty) || 0) * (Number(jw.rate) || 0) || null;
      }

      // Sync qty only to the first jawak row if there is only 1 jawak row
      if (line.jawaks.length === 1) {
        const jw = line.jawaks[0];
        jw.qty = line.qty;
        jw.amount = line.amount;
        if (!jw.source_mm_id && this.auth.webUser?.settings?.defaultMM) {
          jw.source_mm_id = this.auth.webUser.settings.defaultMM;
        }
      }
      this.onJawakChange(line, line.jawaks[0]);
    }
  }

  // -------------------------------------------------
  /** amount change → auto-calculate rate (based on qty) */
  onAmountChangeLine(line: any) {
    const qty = Number(line.qty) || 0;
    const amount = Number(line.amount) || 0;
    line.rate = qty > 0 ? amount / qty : null;

    // sync to jawaks
    if (line.jawaks && line.jawaks.length) {
      for (const jw of line.jawaks) {
        jw.amount = line.amount;
        jw.rate = line.rate;
      }
      this.onJawakChange(line, line.jawaks[0]);
    }
    this.pfs.formStatusChanges();
  }

  /** jawak amount change → recalc its rate */
  onJawakAmountChange(line: any, jw: any) {
    const qty = Number(jw.qty) || 0;
    const amount = Number(jw.amount) || 0;
    jw.rate = qty > 0 ? amount / qty : null;
    this.onJawakChange(line, jw);
    this.pfs.formStatusChanges();
  }


  onUnitChange(line: any) {
    if (line.jawaks && line.jawaks.length > 0) {
      for (const jw of line.jawaks) {
        // Only override jawak unit if it's currently matching the parent item
        if (jw.item_id === line.item_id && jw.subitem_id === line.subitem_id) {
          jw.unit_id = line.unit_id;
        }
      }
    }
    this.pfs.formStatusChanges();
  }

  onJawakChange(line: any, jLine: any) {
    this.pfs.onJawakChange(line, jLine);
  }

  onJawakItemChange(line: any, jw: any) {

    if (jw.item_id) {
      const parentItem = this.items.find((it: any) => it._id === jw.item_id);
      if (parentItem) {
        if (jw.subitem_id) {
          const subitem = parentItem.subitems?.find((s: any) => s._id === jw.subitem_id);
          if (subitem && subitem.unit_id) jw.unit_id = subitem.unit_id;
        } else if (parentItem.unit_id) {
          jw.unit_id = parentItem.unit_id;
        }
      }
    }

    this.pfs.onJawakChange(line, jw);
  }

  removeLine(index: number) {
    if (this.pfs.prastavForm.lines.length > 1) {
      this.pfs.prastavForm.lines.splice(index, 1);
    }
  }

  // ── Submit ──────────────────────────────────────────────

  onSubmit() {
    if (!this.pfs.valid()) {
      this.toastr.error('कृपया सभी जरूरी fields भरें');
      return;
    }

    // Lock Save button for the duration of the HTTP call only
    this.pfs.submit = true;

    const url = this.api.getUrl('PRASTAV');
    const payload = this.pfs.prastavForm;

    if (this.isEdit && payload.voucher_no) {
      const updateUrl = `${this.api.getUrl('PRASTAV')}/voucher/${payload.voucher_no}`;
      this.http.put(updateUrl, payload).subscribe((data: any) => {
        if (data.success) {
          this.pfs.submit = false;
          this.toastr.success('Updated successfully');
          this.response.emit(data);
        } else {
          this.pfs.submit = false;
          this.toastr.error('Failed to update');
        }
      }, () => {
        this.pfs.submit = false;
        this.toastr.error('Failed to update');
      });
    } else {
      this.http.post(url, payload).subscribe((data: any) => {
        if (data.success) {
          this.toastr.success('Saved successfully');
          this.pfs.reset();          // reset() already sets submit = false
          this.response.emit(data);
        } else {
          this.pfs.submit = false;   // unlock on backend error
          this.toastr.error('Failed to save');
        }
      }, () => {
        this.pfs.submit = false;     // unlock on network error
        this.toastr.error('Failed to save');
      });
    }
  }

  showModal: string = '';

  openModal(title: string) {
    this.showModal = title;
    setTimeout(() => {
      $('#prastavEntryComponent > #showModal').modal('show');
    }, 100);
  }

  closeModal() {
    $('#prastavEntryModal').modal('hide');
    $('#prastavEntryComponent > #showModal').modal('hide');
    this.showModal = '';
  }

  addMMResponse(ev: any) {
    if (ev && ev._id) {
      this.pfs.prastavForm.mm_id = ev._id;
    }
    this.closeModal();
  }

  addPbkResponse(ev: any) {
    if (ev && ev._id) {
      this.pfs.prastavForm.pbk_id = ev._id;
    }
    this.closeModal();
  }

  // ── Display Helpers for Jawak Focus Mode ──────────────
  getMMDisplay(mmId: any) {
    return this.mms.find(m => m._id === mmId)?.mm_hin || '-';
  }

  getPBKDisplay(pbkId: any) {
    const p = this.pbks.find(item => item._id === pbkId);
    if (!p) return '-';
    return `${p.pbk_hin}${p.pbk_eng ? ' : ' + p.pbk_eng : ''}`;
  }

  getUnitShort(unitId: any) {
    return this.units.find(u => u._id === unitId)?.unit_short || '';
  }

  getItemDisplay(item_id: any, subitem_id: any) {
    if (!item_id) return '-';
    const it = this.items.find(i => i._id === item_id);
    if (!it) return '-';

    if (subitem_id) {
      const sub = it.subitems?.find((s: any) => s._id === subitem_id);
      return sub ? `${sub.subitem_hin} ${it.item_hin}` : it.item_hin;
    }
    return it.item_hin;
  }
}
