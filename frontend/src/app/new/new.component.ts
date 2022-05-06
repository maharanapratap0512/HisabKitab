import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx';

declare var $: any;

@Component({
  selector: 'app-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss']
})
export class NewComponent implements OnInit {

  term: any;
  editEntry: any;
  isLoader: boolean = false;
  // formData = new FormData();
  total_count: any = 0;;
  productData: any = [];
  // doctfile: any = [];
  imagebase: any = [];
  viewProduct: any;
  // @ViewChild(ProductEntryFormComponent, {static: false}) productEntry : ProductEntryFormComponent;



  constructor(private fb: FormBuilder, private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit(): void {
    this.spinner.show();
    this.imagebase = this.api.getUrl('BASE');
    this.getProducts();
  }

  getProducts() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('PRODUCT')).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.productData = data['result'];
        this.isLoader = false;
      }
      this.isLoader = false;
    })
  }

  getResponse($event: any) {
    
    console.log("event", $event);
    if ($event.length > 0) {
      this.productData.unshift($event[0]);
      this.total_count += 1;
      $('#addProduct').modal('hide');
    }
  }


  productEditResponse($event: any) {
    console.log("updated", $event);
    if ($event.length > 0) {
      this.productData.splice(this.productData.indexOf(this.editEntry), 1, $event[0]);
      console.log("formdata", this.productData);

      $('#editEntry').modal('hide');
      this.editEntry = null;
    }
  }

  edit(data: any) {
    console.log("edit", data);
    this.editEntry = data;
    $('#editEntry').modal('show');
  }


  delete(i: any, id: any) {
    console.log("delete", i, "id", id);
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
        this.http.delete(this.api.getUrl('PRODUCT') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.productData.splice(i, 1);
            this.total_count -= 1;
            this.toastr.success('PRODUCT deleted successfully.');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        }, err => {
          this.toastr.error(err['error'].message);
        });
      }
    });
    this.isLoader = false;
  }

  rowClicked(data: any) {
    this.viewProduct = data;
    $('#viewProduct').modal('show');
  }

}
