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
  itemDataAll: any = [];
  itemData: any = [];
  categories: any = [];
  subitem_lists: any = [];
  total_count: any;
  si_total_count: any;
  subitemData: any = [];
  conditionObj: any = {};

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
    // this.gs.getList$.subscribe((result: any) => {
    //   this.categories = result.category ? result.category : [];
    //   this.subitem_lists = result.subitem_list ? result.subitem_list : [];
    // });
  }

  getItemData() {
    this.isLoader = true;
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

  // getSubitemData() {
  //   this.isLoader = true;
  //   this.http.get(this.api.getUrl('SUBITEM') + this.auth.webUser.dept_id).subscribe((data) => {
  //     if (data['result'] && data['success']) {
  //       this.subitemData = data['result'];
  //       this.si_total_count = data['total_count'];
  //       this.isLoader = false;
  //     }
  //     this.isLoader = false;
  //   });
  // }

  catSelected(ev: any) {
    if (ev) {
      this.conditionObj.category_id = ev;
      this.getItemData();
    }
    else {
      this.conditionObj.category_id = null;
      this.getItemData();
    }
  }

  SubitemListSelected(ev: any) {
    if (ev) {
      this.conditionObj.subitem_list_id = ev;
      this.getItemData();
    }
    else {
      this.conditionObj.subitem_list_id = null;
      this.getItemData();
    }
  }

  addSubitem(item: any) {

    this.editData = {
      item_id: item._id,
      category_id: item.category_id,
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
      this.itemData.splice(this.itemData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("message", ev);
    }
  }


  addSubitemResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      let i = this.itemData.findIndex((i: { _id: any; }) => i._id == ev.item_id);
      this.itemData[i].subitems.push(ev);
      this.itemData[i].categories.push(ev.category_id);
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
