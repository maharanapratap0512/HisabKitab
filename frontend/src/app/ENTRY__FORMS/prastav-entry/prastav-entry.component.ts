import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

declare var $: any;

@Component({
  selector: 'app-prastav-entry',
  templateUrl: './prastav-entry.component.html',
  styleUrls: ['./prastav-entry.component.scss']
})
export class PrastavEntryComponent implements OnInit, OnChanges {

  @ViewChild('f') f!: NgForm;
  @Output() response = new EventEmitter();
  @Input() isEdit: any;
  @Input() getData: any;

  prastav: any = {};
  jawaks: any[] = [];

  mms: any[] = [];
  items: any[] = [];
  units: any[] = [];

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService
  ) {
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
      this.items = result.itemmix || [];
      this.units = result.unit || [];
    });

    this.reset();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.getData && changes.getData.currentValue) {
      const data = changes.getData.currentValue;
      this.prastav = {
        _id: data._id,
        date: data.date,
        mm_id: data.mm_id,
        pbk_count: data.pbk_count,
        item_id: data.item_id,
        subitem_id: data.subitem_id,
        unit_id: data.unit_id,
        qty: data.qty,
        rate: data.rate,
        amount: data.amount,
        active: data.active
      };
      this.jawaks = (data.jawaks || []).map((j: any) => ({ ...j }));
    }
  }

  reset() {
    this.prastav = {
      date: this.gs.dateString,
      mm_id: this.auth.webUser.settings.defaultMM,
      pbk_count: null,
      item_id: null,
      subitem_id: null,
      unit_id: null,
      qty: null,
      rate: null,
      amount: null,
      active: 1
    };
    this.jawaks = [];
  }

  updateAmount() {
    const qty = Number(this.prastav.qty) || 0;
    const rate = Number(this.prastav.rate) || 0;
    this.prastav.amount = qty * rate;
  }

  addJawakRow() {
    this.jawaks.push({
      _id: null,
      prastav_id: this.prastav._id || null,
      date: this.prastav.date,
      mm_id: this.prastav.mm_id,
      item_id: this.prastav.item_id,
      subitem_id: this.prastav.subitem_id,
      unit_id: this.prastav.unit_id,
      qty: null,
      rate: null,
      amount: null,
      bori_count: null,
      kiske_dwara: null,
      source_mm_id: null,
      is_received: 0,
      active: 1
    });
  }

  removeJawakRow(index: number) {
    if (index >= 0 && index < this.jawaks.length) {
      this.jawaks.splice(index, 1);
    }
  }

  onSubmit() {
    if (!this.prastav.date || !this.prastav.mm_id || !this.prastav.item_id || !this.prastav.unit_id || !this.prastav.qty) {
      this.toastr.error('Please fill required fields');
      return;
    }

    // auto amount (ensure latest before save)
    this.updateAmount();

    const url = this.api.getUrl('PRASTAV');
    if (this.isEdit && this.prastav._id) {
      this.http.post(url, this.prastav).subscribe((data: any) => {
        if (data.success) {
          this.toastr.success('Updated successfully');
          this.response.emit(data);
        } else {
          this.toastr.error('Failed to update');
        }
      }, err => {
        this.toastr.error('Failed to update');
      });
    } else {
      this.http.post(url, this.prastav).subscribe((data: any) => {
        if (data.success) {
          this.toastr.success('Saved successfully');
          this.reset();
          this.response.emit(data);
        } else {
          this.toastr.error('Failed to save');
        }
      }, err => {
        this.toastr.error('Failed to save');
      });
    }
  }

  closeModal() {
    $('#prastavEntryModal').modal('hide');
  }
}
