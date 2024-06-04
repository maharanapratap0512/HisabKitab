import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
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

  importType: any;
  excelFile: any;
  page = 1;
  itemsPerPage = 100;
  currentPage: any;
  totalItems: any;
  expandAll: any = false;
  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  itemDataAll: any = [];
  itemData: any = [];
  categories: any = [];
  subitem_lists: any = [];
  total_count: any = 0;
  si_total_count: any = 0;
  subitemData: any = [];
  conditionObj: any = {};
  baseurl: any;
  settings: any = {};
  auto_close: any = true;
  del_permitted_date = new Date('2024-06-10');
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getItemData(1);
    this.gs.observeList().subscribe(result => {
      this.categories = result.category ? result.category : [];
      this.subitem_lists = result.subitem_list ? result.subitem_list : [];
    });
    this.baseurl = this.api.getUrl('BASE');
    this.settings = this.auth.webUser.settings.item;
  }

  FilterActive() {
    this.itemData = this.itemDataAll.filter((i: { active: any; }) => !i.active)
  }

  getItemData(pageNo: any) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id, this.conditionObj).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        // this.itemDataAll = data['result'];
        this.itemData = data['result'];
        this.itemDataAll = data['result'];
        this.total_count = data['total_count'];
        this.si_total_count = data['subitem_count']
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  exportToExcel() {
    let item = [];
    let counter = 1;
    for (let i in this.itemData) {
      item.push({
        No: counter++,
        "Item Hin": this.itemData[i].item_hin.trim(),
        "Item Eng": this.itemData[i].item_eng,
        "Item Roman": this.itemData[i].item_roman,
        "Item Code": this.itemData[i].item_code,
        "Subitem Hin": null,
        "Subitem Eng": null,
        "Subitem Roman": null,
        "Categories": this.itemData[i].categories_hin.join(", "),
        "Unit": this.itemData[i].unit_short,
        "Extra Note": this.itemData[i].extra_note,
        "Min Rate": this.itemData[i].min_rate,
        "Max Rate": this.itemData[i].max_rate,
        "Restrict Month": this.itemData[i].restrict_month,
        "Restrict Year": this.itemData[i].restrict_year,
      });
      for (let j in this.itemData[i].subitems) {
        item.push({
          No: counter++,
          "Item Hin": null,
          "Item Eng": null,
          "Item Roman": null,
          "Item Code": null,
          "Subitem Hin": this.itemData[i].subitems[j].subitem_hin,
          "Subitem Eng": this.itemData[i].subitems[j].subitem_eng,
          "Subitem Roman": this.itemData[i].subitems[j].subitem_roman,
          "Categories": this.itemData[i].subitems[j].categories_hin.join(", "),
          "Unit": this.itemData[i].subitems[j].unit_short,
          "Extra Note": this.itemData[i].subitems[j].extra_note,
          "Min Rate": this.itemData[i].subitems[j].min_rate,
          "Max Rate": this.itemData[i].subitems[j].max_rate,
          "Restrict Month": this.itemData[i].subitems[j].restrict_month,
          "Restrict Year": this.itemData[i].subitems[j].restrict_year,
        });
      }
    }

    let date = new Date();
    console.log(date);

    this.excelExportService.exportAsExcelFile(item, "item_list-" + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());

  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    if (this.auto_close) {
      $('#showModal').modal('hide');
      this.showModal = '';
    }
  }

  excelImport(ev: any) {
    if (ev) {
      this.excelFile = ev;
      this.importResponse(null);
    }
    ev = null;
  }

  importResponse(iType: any) {
    switch (iType) {
      case 'subitem_list':
        this.importType = 'item';
        this.openModal('ei_item');
        break;

      case 'item':
        this.importType = 'subitem';
        this.openModal('ei_subitem');
        break;

      case 'subitem':
        this.importType = '';
        this.closeModal();
        break;

      default:
        this.importType = 'subitem_list';
        this.openModal('ei_subitem_list');
    }
  }



  lockItem(i: any, id: any) {
    this.app.appModal$ = new Subject();
    this.app.appModal$.subscribe((result: any) => {
      if (result) {
        this.toggleLock(i, { _id: id, ...result }, 'ITEM');
      }
    });
    this.app.openModal('lockModal');
  }

  unlockItem(i: any, id: any) {
    this.toggleLock(i, { _id: id, restrict_month: null, restrict_year: null }, 'ITEM');
  }

  lockSubitem(i: any, j: any, id: any) {
    this.app.appModal$ = new Subject();
    this.app.appModal$.subscribe((result: any) => {
      if (result) {
        this.toggleLock(i, { _id: id, ...result }, 'SUBITEM', j);
      }
    });
    this.app.openModal('lockModal');
  }

  unlockSubitem(i: any, j: any, id: any) {
    if (this.itemData[i].restrict_year) {
      this.toggleLock(i, { _id: this.itemData[i]._id, restrict_month: null, restrict_year: null }, 'ITEM');
    }
    this.toggleLock(i, { _id: id, restrict_month: null, restrict_year: null }, 'SUBITEM', j);
  }

  toggleLock(i: any, row: any, APIname: any, j: any = null) {
    this.http.put(this.api.getUrl(APIname) + 'lock/', row).subscribe((data: any) => {
      if (data['result'].restrict_year) {
        this.toastr.success(APIname + " Lock Successfully.");
      }
      else {
        this.toastr.success(APIname + " Unlock Successfully.");
      }
      if (APIname == 'SUBITEM') {
        this.itemData[i].subitems[j].restrict_month = data['result'].restrict_month;
        this.itemData[i].subitems[j].restrict_year = data['result'].restrict_year;
      } else {
        this.itemData[i].restrict_month = data['result'].restrict_month;
        this.itemData[i].restrict_year = data['result'].restrict_year;
      }
    }, err => {
      this.toastr.error(err['message']);
      this.isLoader = false;
    });
  }

  viewProduct(data: any) {
    this.editData = data;
    this.openModal('View Product');
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
    this.openModal('Add Subitem From Item');
  }

  cloneWithSubitem(item: any) {
    this.editData = {
      categories: item.categories,
      unit_id: item.unit_id,
      subitems: item.subitems
    }
    this.openModal('Clone Item');
  }

  cloneItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      for (let i in this.editData.subitems) {
        let subitem = this.editData.subitems[i];
        subitem.item_id = ev._id;
        subitem.categories = ev.categories;
        this.http.post(this.api.getUrl('SUBITEM') + this.auth.webUser.dept_id, subitem).subscribe((data: any) => {
          if (data['result'] && data['success']) {
            // this.gs.Lists.subitem.unshift(data['result'])
            let j = this.gs.Lists.itemmix.findIndex((i: { _id: any; }) => i._id == ev._id);
            this.gs.Lists.itemmix[j].subitems.push(data['result']);
            // ev.subitems.push(data['result']);
            this.toastr.success('SUBITEM added successfully.')
          } else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        }, err => {
          this.toastr.error(err['error']);
          this.isLoader = false;
        });
      }
      this.itemData.unshift(ev);
      this.closeModal();
      this.isLoader = false;
    }
    else {
      console.log("clone item", ev);

    }
  }

  addItemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
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
      this.closeModal();
      let index = this.itemData.indexOf(this.editData);

      if (index >= 0) {
        console.log("index", index);
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
    console.log("item", ev);

    if (ev._id) {
      this.isLoader = true;
      this.closeModal();
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
      this.closeModal();
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
      this.openModal('Edit Subitem');
    }
    else {
      this.editData = data;
      this.openModal('Edit Item');
    }
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
