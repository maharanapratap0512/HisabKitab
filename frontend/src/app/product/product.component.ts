import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  productData: any = [];
  total_count: any;
  viewProduct: any;
  baseurl:any;

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
    this.getProductData();
    this.baseurl = this.api.getUrl('BASE');
  }

  getProductData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.productData = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addProductResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.productData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev)
      this.isLoader = false;
    }
  }

  editProductResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.productData.splice(this.productData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Product'
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
        this.isLoader = true;
        this.http.delete(this.api.getUrl('PRODUCT') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.productData.splice(i, 1);
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

  rowDetail(data: any) {
    this.viewProduct = data;
    this.showModal = 'View Product'
    $('#showModal').modal('show');
  }

  getImage1(doc:any){
    let imgs = JSON.parse(doc);
    return this.baseurl + (imgs.images ? imgs.images[0].toString() : '');
  }

}
