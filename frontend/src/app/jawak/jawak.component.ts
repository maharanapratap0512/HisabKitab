import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;

@Component({
  selector: 'app-jawak',
  templateUrl: './jawak.component.html',
  styleUrls: ['./jawak.component.scss']
})
export class JawakComponent implements OnInit {
  isLoader: boolean = false;
  term: any;
  showModal: String = '';
  total_count: any = 0;
  jawakData: any = [];
  editData: any = {};
  mms: any = [];
  viewData: any = [];
  items: any = [];
  units: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  jawak_types: any = [];
  products: any = [];
  categories: any = [];
  isCondition: any = false;
  productsAll: any = [];
  states: any = [];
  departments: any = [];
  filterBody: any = {
    pbk_id: [],
    mm_id: [],
    jawak_mm_id: [],
    jawak_type_id: [],
    product_id: [],
    item_id: [],
    subitem_id: [],
    condition_id: [],
    nimmit: null,
    pkt_num: null
  };
  cat: any;
  settings:any = {};


  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public gs: GlobalService,
    public auth: AuthService,
  ) {
    this.settings = this.auth.webUser.settings.jawak;
   }

  ngOnInit(): void {
    this.getJawakData();
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.units = result.unit ? result.unit : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.states = result.state ? result.state : [];
    });
  }

  openModal(type: String) {
    this.showModal = type;
    $('#showModal').modal('show');
  }


  getJawakData() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('JAWAK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.jawakData = data['result'];
        this.total_count = data['result'].length;
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  addJawakResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.jawakData.unshift(ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev)
      this.isLoader = false;
    }
  }

  editJawakResponse(ev: any) {
    this.isLoader = true;
    if (ev._id) {
      $('#showModal').modal('hide');
      this.showModal = '';
      this.jawakData.splice(this.jawakData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      console.log("err", ev);
      this.isLoader = false;
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Jawak'
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
        this.http.delete(this.api.getUrl('JAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.jawakData.splice(i, 1);
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

  stateSelected(ev: any) {
    // if (ev)
    //   this.aawakData = this.aawakAll.filter((aawak: { state_id: any; }) => aawak.state_id == ev);
    // else
    //   this.aawakData = this.aawakAll;
  }

  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.gs.Lists.itemmix.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.gs.Lists.itemmix;
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { item_id: any; }) => p.item_id == ev);
      if (this.cat) {
        this.subitems = item.subitems.filter((s: { category_id: any; }) => s.category_id == this.cat);
      }
      else {
        this.subitems = item.subitems;
      }
    }
    else {
      this.subitems = [];
    }
  }

  subitemSelected(ev: any) {
    if (ev) {
      let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
      this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
    }
    else {
      this.products = this.productsAll;
    }
  }

  productSelected(ev: any) {
    this.isCondition = true;
    let product = this.products.find((p: { _id: any; }) => p._id == ev);
  }

}
