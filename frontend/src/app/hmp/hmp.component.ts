import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';

declare var $: any;

@Component({
  selector: 'app-hmp',
  templateUrl: './hmp.component.html',
  styleUrls: ['./hmp.component.scss']
})
export class HmpComponent implements OnInit {

  batches: any = [];
  isEdit = false;
  selectedBatch: any = null;

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.getBatches();
  }

  getBatches() {
    this.http.get(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id)
      .subscribe((data: any) => {
        this.batches = data.result || [];
      });
  }

  openEntryModal(batch: any = null) {
    this.isEdit = !!batch;
    this.selectedBatch = batch;
    $('#hmpEntryModal').modal('show');
  }

  onBatchSaved(event: any) {
    // Refresh list
    this.getBatches();
  }

}
