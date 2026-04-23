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
  excelFile: any;

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
    this.settings = this.auth.webUser.settings.category;
  }

  getCategoryData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('CATEGORY') + this.auth.webUser.dept_id).subscribe((data: any) => {
      if (data && data['result'] && data['success']) {
        this.categoryData = this.buildTree(data['result']);
        this.total_count = data['total_count'] || this.categoryData.length;
      }
      this.isLoader = false;
    }, err => {
      this.isLoader = false;
    });
  }

  buildTree(list: any[]) {
    const map = new Map();
    const roots: any[] = [];

    // Create a map for quick lookup and normalize IDs
    list.forEach(item => {
      item._id = Number(item._id);
      if (item.parent_id) item.parent_id = Number(item.parent_id);
      item.children = [];
      map.set(item._id, item);
    });

    // Populate children
    list.forEach(item => {
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id).children.push(item);
      } else {
        roots.push(item);
      }
    });

    // Flatten with level info
    const flattened: any[] = [];
    const traverse = (nodes: any[], level: number) => {
      // Sort nodes by sort_order then by name
      nodes.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.category_hin.localeCompare(b.category_hin));
      
      nodes.forEach(node => {
        node.level = level;
        flattened.push(node);
        if (node.children && node.children.length > 0) {
          traverse(node.children, level + 1);
        }
      });
    };

    traverse(roots, 0);
    return flattened;
  }



  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
  }
  closeModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
  }

  addCategoryResponse(ev: any) {
    if (ev) {
      this.isLoader = true;
      this.closeModal();
      this.getCategoryData(); // Refresh to rebuild tree correctly
      this.isLoader = false;
    }
    else {
      console.log("message", ev)
    }
  }

  editCategoryResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
      this.getCategoryData(); // Refresh to rebuild tree correctly
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
    this.excelFile = ev;
    this.openModal('ei_category')
  }

  importResponse(type:any){
    this.closeModal();
    this.getCategoryData();
  }

  edit(data: any) {
    this.editData = data;
    this.openModal('Edit Category');
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
            this.getCategoryData(); // Refresh entire tree
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
