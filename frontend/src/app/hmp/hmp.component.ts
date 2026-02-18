import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import Swal from 'sweetalert2';
import { Toast } from 'bootstrap';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-hmp',
  templateUrl: './hmp.component.html',
})
export class HmpComponent implements OnInit {

  batches: any = [];
  isEdit = false;
  selectedBatch: any = null;
  filterBody: any = {};

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getBatches();
  }

  getBatches() {
    this.http.put(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, {})
      .subscribe((data: any) => {
        this.batches = data.result || [];
        console.log('batches', this.batches);

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


  deleteInput(id: any, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('HMP') + 'input/' + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Input deleted successfully');
              this.batches.inputs.splice(index, 1);
            }
            else {
              this.toastr.error('Failed to delete input');
            }

          });
      }
    });

  }

  deleteOutput(id: any, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('HMP') + 'output/' + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Output deleted successfully');
              this.batches.outputs.splice(index, 1);
            }
            else {
              this.toastr.error('Failed to delete output');
            }
          });
      }
    });

  }

  delete(id: any, index: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result: any) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('HMP') + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Batch deleted successfully');
              this.batches.splice(index, 1);
            }
            else {
              this.toastr.error('Failed to delete batch');
            }
          });
      }
    });

  }

}
