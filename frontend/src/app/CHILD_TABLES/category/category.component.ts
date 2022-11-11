import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  categoryData: any = [];
  total_count: any = 0;
  settings: any = {};

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService
  ) {
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getCategoryData();
    this.settings = this.auth.webUser.settings;
  }

  getCategoryData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('CATEGORY') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.categoryData = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addCategoryResponse(ev: any) {
    if (ev) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.categoryData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev)
    }
  }

  editCategoryResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.categoryData.splice(this.categoryData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }

  exportToExcel() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('CATEGORY') + 1).subscribe((data) => {
      if (data['result'] && data['success']) {
        let date = new Date();
        let catData = [];
        for (let i = 0; i < data['result'].length; i++) {
          catData.push({
            "Sr No": i + 1,
            "_id": data['result'][i]._id,
            "Category Hin": data['result'][i].category_hin,
            "Category Eng": data['result'][i].category_eng
          });
        }
        this.excelExportService.exportAsExcelFile(catData, "Category_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  excelImport(ev: any) {
    let workBooks: any = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      this.isLoader = true;
      const data = reader.result;
      workBooks = XLSX.read(data, { type: 'binary' });
      console.log(workBooks);

      let jsonData: any = [];
      jsonData = XLSX.utils.sheet_to_json(workBooks.Sheets[workBooks.SheetNames[0]]);
      // this.jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
      //   const sheet = workBooks.Sheets[name];
      //   initial[name] = XLSX.utils.sheet_to_json(sheet);
      //   return initial;
      // }, {});
      this.http.put(this.api.getUrl('CATEGORY') + 'import', jsonData).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          console.log(data);

          this.isLoader = false;
        }
        this.isLoader = false;
      });

    }


    reader.readAsBinaryString(file);
    ev = '';

  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Category'
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
        this.http.delete(this.api.getUrl('CATEGORY') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.categoryData.splice(i, 1);
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

  protectionToggle(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('CATEGORY'), body).subscribe((data: any) => {
      this.categoryData.splice(this.categoryData.findIndex((i: { _id: any; }) => i._id == id), 1, data['result']);
      this.isLoader = false;
      if (data['result'].active) {
        this.toastr.success("Protetion Shield Activated");
      }
      else {
        this.toastr.success("Protetion Shield Deactivated");
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

}
