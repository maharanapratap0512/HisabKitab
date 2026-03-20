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
      this.mms   = result.mm       || [];
      this.items = result.itemmix  || [];   // itemmix has nested subitems[]
      this.units = result.unit     || [];
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['getData'] && changes['getData'].currentValue) {
      this.pfs.patchForm(changes['getData'].currentValue);
    }
  }

  // ── Line helpers ──────────────────────────────────────────

  /** item_subitem_id change → split into item_id / subitem_id, then auto-add row */
  onItemChange(line: any) {
    this.pfs.resolveItemSubitem(line);
    this.pfs.formStatusChanges();
  }

  /** qty / rate change → auto-calculate amount, then auto-add row */
  onLineChange(line: any) {
    const qty  = Number(line.qty)  || 0;
    const rate = Number(line.rate) || 0;
    line.amount = qty * rate || null;
    this.pfs.formStatusChanges();
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

    const url     = this.api.getUrl('PRASTAV');
    const payload = this.pfs.prastavForm;

    if (this.isEdit && payload._id) {
      this.http.post(url, payload).subscribe((data: any) => {
        if (data.success) {
          this.toastr.success('Updated successfully');
          this.response.emit(data);
        } else {
          this.toastr.error('Failed to update');
        }
      }, () => this.toastr.error('Failed to update'));
    } else {
      this.http.post(url, payload).subscribe((data: any) => {
        if (data.success) {
          this.toastr.success('Saved successfully');
          this.pfs.reset();
          this.response.emit(data);
        } else {
          this.toastr.error('Failed to save');
        }
      }, () => this.toastr.error('Failed to save'));
    }
  }

  closeModal() {
    $('#prastavEntryModal').modal('hide');
  }
}
