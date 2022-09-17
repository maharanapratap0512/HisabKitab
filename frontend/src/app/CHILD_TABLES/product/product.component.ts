import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
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
  productDataAll: any = [];
  total_count: any = 0;;
  baseurl: any;
  settings: any = {};

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService:ExcelExportService
  ) {
    this.settings = this.auth.webUser.settings.product;
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getProductData();
    this.baseurl = this.api.getUrl('BASE');
  }

  getProductData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('PRODUCT') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.productDataAll = data['result'];
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
      this.closeModal();
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
      this.closeModal();
      this.productData.splice(this.productData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    this.showModal = ''
    $('#showModal').modal('hide');
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Product'
    $('#showModal').modal('show');
  }

  exportToExcel() {
    let excelData = [];
    for (let i in this.productData) {
      excelData.push({
        No: i,
        "अभी कहा है": this.productData[i].last_mm_hin ? this.productData[i].last_mm_hin : this.productData[i].mm_hin,
        "कब से है": this.productData[i].last_date ? this.productData[i].last_date : this.productData[i].purchase_date,
        "अभी की स्थिति": this.productData[i].last_condition_hin ? this.productData[i].last_condition_hin : this.productData[i].condition_hin,
        "Sr No": this.productData[i].sr_num ? this.productData[i].sr_num : '',
        "Pr Code": this.productData[i].product_code ? this.productData[i].product_code : '',
        "तारीख": this.productData[i].purchase_date ? this.productData[i].purchase_date : '',
        "मि.म.": this.productData[i].mm_hin,
        "आइटम": this.productData[i].item_hin,
        "सबआइटम": this.productData[i].subitem_hin ? this.productData[i].subitem_hin : '',
        "कंपनी": this.productData[i].company_name ? this.productData[i].company_name : '',
        "मोडेल": this.productData[i].model_name ? this.productData[i].model_name : '',
        "कन्डिशन": this.productData[i].condition_hin,
        "रेट": this.productData[i].price ? this.productData[i].price : 0,
        "वॉरन्टी समय": this.productData[i].warranty_period ? this.productData[i].warranty_period : '',
        "वॉरन्टी कहाँ से ?": this.productData[i].warranty_from ? this.productData[i].warranty_from : '',
        "कहाँ से खरीदा": this.productData[i].purchase_from ? this.productData[i].purchase_from : '',
        "किसके थ्रू": this.productData[i].purchased_by ? this.productData[i].purchased_by : '',
        "डेटाइल माहिती": this.productData[i].product_detail ? this.productData[i].product_detail : '',
        "साथ मे क्या2 आया": this.productData[i].accessories ? this.productData[i].accessories : '',
        "निमित्त": this.productData[i].nimitt_hin ? this.productData[i].nimitt_hin : ''

      });
    }
    let date = new Date();
    this.excelExportService.exportAsExcelFile(excelData, "product_list_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());

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

  viewProduct(data: any) {
    this.editData = data;
    this.showModal = 'View Product'
    $('#showModal').modal('show');
  }

  // getImage1(doc:any){
  //   let imgs = doc;
  //   // console.log(doc);

  //   return this.baseurl + ((imgs && imgs.images && imgs.images.length > 0) ? imgs.images[0].toString() : '');
  // }

}
