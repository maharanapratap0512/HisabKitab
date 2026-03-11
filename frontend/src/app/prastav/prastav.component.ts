import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-prastav',
  templateUrl: './prastav.component.html',
  styleUrls: ['./prastav.component.scss']
})
export class PrastavComponent implements OnInit {

  page = 1;
  itemsPerPage = 100;
  totalItems: any;
  term: any = '';

  prastavs: any[] = [];

  filterBody: any = {};

  isEdit = false;
  selectedPrastav: any = null;

  constructor(
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getPrastavs();
  }

  getPrastavs() {
    // Simple GET: for now fetch all active rows for current dept mm (if needed filter later)
    this.http.get(this.api.getUrl('PRASTAV'))
      .subscribe((data: any) => {
        this.prastavs = data.result || [];
        this.totalItems = this.prastavs.length;
      });
  }

  openEntryModal(row: any = null) {
    this.isEdit = !!row;
    this.selectedPrastav = row;
    $('#prastavEntryModal').modal('show');
  }

  closeModal() {
    $('#prastavEntryModal').modal('hide');
    this.isEdit = false;
    this.selectedPrastav = null;
  }

  onSaved(ev: any) {
    this.closeModal();
    this.getPrastavs();
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
        this.http.delete(this.api.getUrl('PRASTAV') + id)
          .subscribe((data: any) => {
            if (data.success) {
              this.toastr.success('Deleted successfully');
              this.prastavs.splice(index, 1);
            } else {
              this.toastr.error('Failed to delete');
            }
          });
      }
    });
  }
}
