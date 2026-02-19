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

  page = 1;
  pageNo: any = 0;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;
  batches: any = [];
  isEdit = false;
  selectedBatch: any = null;
  filterBody: any = {};
  term: any = '';
  total_count: any = 0;

  // Filter data
  recipes: any = [];
  mms: any = [];
  showFilter = false;

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getBatches();
    this.getRecipes();
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
    });
  }

  getRecipes() {
    this.http.get(this.api.getUrl('HMP') + 'recipe/' + this.auth.webUser.dept_id)
      .subscribe((data: any) => {
        this.recipes = data.result || [];
      });
  }

  getBatches() {
    this.filterBody.pageNo = this.pageNo;
    this.http.put(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, this.filterBody)
      .subscribe((data: any) => {
        this.batches = data.result || [];
        this.total_count = data.total_count || 0;
      });
  }

  getHmpPage(page: any = null) {
    if (page) {
      this.pageNo = page;
      this.getBatches();
    }
  }

  yearChanged(year: any) {
    this.filterBody.year = year;
    this.pageNo = 0;
    this.getBatches();
  }

  applyFilter() {
    this.pageNo = 0;
    this.getBatches();
  }

  clearFilter() {
    this.filterBody = {};
    this.pageNo = 0;
    this.getBatches();
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
