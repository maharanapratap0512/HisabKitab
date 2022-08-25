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
declare var $: any;

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  page = 1;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  itemDataAll: any = [];
  itemData: any = [];
  categories: any = [];
  subitem_lists: any = [];
  total_count: any = 0;;
  si_total_count: any = 0;;
  subitemData: any = [];
  conditionObj: any = {};
  baseurl:any;
  settings:any = {};
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getItemData(1);
    this.gs.observeList().subscribe(result => {
      this.categories = result.category ? result.category : [];
      this.subitem_lists = result.subitem_list ? result.subitem_list : [];
    });
    this.baseurl = this.api.getUrl('BASE');
    this.settings = this.auth.webUser.settings;
  }

  getItemData(pageNo:any) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id, this.conditionObj).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        // this.itemDataAll = data['result'];
        this.itemData = data['result'];
        this.total_count = data['total_count'];
        this.si_total_count = data['subitem_count']
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  exportItem(){
    let item = [];
    for(let it of this.itemData){
      item.push({
        item_hin:it.item_hin,
        item_eng:it.item_eng,
        subitem_hin:null,
        subitem_eng:null,
        unit:it.unit_short,
        category:it.categories_hin
      });
      for(let sit of it.subitems){
        item.push({
          item_hin:it.item_hin,
          item_eng:it.item_eng,
          subitem_hin:sit.subitem_hin,
          subitem_eng:sit.subitem_eng,
          unit:sit.unit_short,
          category:sit.categories_hin
        });
      }
    }

    this.excelExportService.exportAsExcelFile(item, 'asthai_item_list.xlsx');
  }

  catSelected(ev: any) {
    if (ev) {
      this.conditionObj.categories = ev;
      this.getItemData(1);
    }
    else {
      this.conditionObj.categories = null;
      this.getItemData(1);
    }
  }

  SubitemListSelected(ev: any) {
    if (ev) {
      this.conditionObj.subitem_list_id = ev;
      this.getItemData(1);
    }
    else {
      this.conditionObj.subitem_list_id = null;
      this.getItemData(1);
    }
  }

  addSubitem(item: any) {
    this.editData = {
      item_id: item._id,
      categories: item.categories,
      unit_id: item.unit_id
    }
    this.showModal = 'Add Subitem From Item';
    $('#showModal').modal('show');
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
      let index = this.itemData.indexOf(this.editData);
      
      if(index>=0){
        console.log("index",index);
        // ev.categories = this.itemData[index].categories;
        ev.subitems = this.itemData[index].subitems;
        this.itemData.splice(index, 1, ev);
      }
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }


  addSubitemResponse(ev: any) {
    console.log("item",ev);
    
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == ev.item_id);
      this.itemData[i].subitems.push(ev);
      // this.itemData[i].categories.push(ev.category_id);
      this.si_total_count++;
      this.isLoader = false;
    }
    else {
      console.log("message", ev)
    }
  }

  editSubitemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == ev.item_id);
      let j = this.itemData[i].subitems.findIndex((i: { _id: any; }) => i._id == ev._id);
      this.itemData[i].subitems.splice(j, 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }

  edit(data: any, type: any = null) {
    if (type == 'subitem') {
      this.editData = data;
      this.showModal = 'Edit Subitem'
    }
    else {
      this.editData = data;
      this.showModal = 'Edit Item'
    }
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

  deleteSubitem(i: any, j: any, id: any) {
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
        this.http.delete(this.api.getUrl('SUBITEM') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.itemData[i].subitems.splice(j, 1);
            this.si_total_count--;
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
    this.http.put(this.api.getUrl('ITEM'), body).subscribe((data: any) => {
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == data['result']._id);
      
      this.itemData[i].active = data['result'].active;
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

  protectionToggleSubitem(id: any, active: any) {
    let body = { query: {}, set: {} };
    body.query = {
      _id: id
    }
    body.set = {
      active: !active
    };
    this.http.put(this.api.getUrl('SUBITEM'), body).subscribe((data: any) => {
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == data['result'].item_id);
      let j = this.itemData[i].subitems.findIndex((s: { _id: any; }) => s._id == data['result']._id);

      this.itemData[i].subitems[j].active = data['result'].active;
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
