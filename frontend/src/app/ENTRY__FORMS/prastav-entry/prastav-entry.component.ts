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

  mms: any[] = [];
  pbks: any[] = [];
  items: any[] = [];    // itemmix list (item + subitems combined)
  units: any[] = [];

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
      console.log(changes);

    }
  }

  // ── Line helpers ──────────────────────────────────────────

  /** item_subitem_id change → split into item_id / subitem_id, then auto-add row */
  onItemChange(line: any) {
    this.pfs.resolveItemSubitem(line);

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
        jw.item_subitem_id = line.item_subitem_id;
        this.pfs.resolveItemSubitem(jw);
        jw.unit_id = line.unit_id;
      }
    }
    this.pfs.formStatusChanges();
  }

  /** qty / rate change → auto-calculate amount, then auto-add row */
  onLineChange(line: any) {
    const qty = Number(line.qty) || 0;
    const rate = Number(line.rate) || 0;
    line.amount = qty * rate || null;

    // Sync qty and rate only to the first jawak row
    if (line.jawaks && line.jawaks.length > 0) {
      const jw = line.jawaks[0];
      jw.qty = line.qty;
      jw.rate = line.rate;
      jw.amount = line.amount;
    }
    this.pfs.formStatusChanges();
  }

  onUnitChange(line: any) {
    if (line.jawaks && line.jawaks.length > 0) {
      for (const jw of line.jawaks) {
        // Only override jawak unit if it's currently matching the parent item
        if (jw.item_subitem_id === line.item_subitem_id) {
          jw.unit_id = line.unit_id;
        }
      }
    }
    this.pfs.formStatusChanges();
  }

  onJawakItemChange(line: any, jw: any) {
    this.pfs.resolveItemSubitem(jw);

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

  closeModal() {
    $('#prastavEntryModal').modal('hide');
  }
}
