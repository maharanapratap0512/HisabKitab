import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  itemData: any = [];
  total_count: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getItemData();
  }

  getItemData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('ITEM') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.itemData = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.itemData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev)
    }
  }

  editItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.itemData.splice(this.itemData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Item'
    $('#showModal').modal('show');
  }

  delete(i: any, id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.api.getUrl('ITEM') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.itemData.splice(i, 1);
            this.gs.Lists.mm.splice(this.gs.Lists.mm.indexOf((i: { _id: any; }) => i._id == id), 1);
            this.total_count -= 1;
            this.toastr.success('Deleted Successfully');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        });
      }
    })
  }


}
