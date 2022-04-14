import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
import { FilterpipePipe } from '../pipe/filterpipe.pipe';
import { AuthService } from '../services/auth.service';
declare var $: any;

@Component({
  selector: 'app-aawak',
  templateUrl: './aawak.component.html',
  styleUrls: ['./aawak.component.scss']
})
export class AawakComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  aawakData: any = [];
  aawakAll: any = [];
  total_count: any;
  mms: any = [];
  viewData: any = [];
  items: any = [];
  units: any = [];
  conditions: any = [];
  subitems: any = [];
  pbks: any = [];
  aawak_types: any = [];
  products: any = [];
  categories: any = [];
  isCondition: any = false;
  productsAll: any = [];
  states: any = [];
  departments: any = [];
  filterBody: any = {
    pbk_id: [],
    mm_id: [],
    aawak_mm_id: [],
    aawak_type_id: [],
    product_id: [],
    item_id: [],
    subitem_id: [],
    condition_id: [],
    pkt_num: null,
    nimmit: null
  };
  cat: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.getaawakData();
    this.gs.observeList().subscribe(result => {
      this.mms = result.mm ? result.mm : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.conditions = result.condition ? result.condition : [];
      this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.products = result.product ? result.product : [];
      this.categories = result.category ? result.category : [];
    });
  }

  mmSelected(ev: any) {

  }

  getaawakData() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.aawakData = data['result'];
        this.aawakAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  aawakDeptSelected(ev: any) {
    if (ev) {
      this.aawakData = this.aawakAll.filter((aawak: { dept_id: any; }) => aawak.dept_id == ev);
    }
    else {
      this.aawakData = this.aawakAll;
    }
  }

  addAawakResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.aawakData.unshift(ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev)
    }
  }

  editAawakResponse(ev: any) {
    if (ev._id) {
      this.isLoader = true;
      $('#showModal').modal('hide');
      this.showModal = '';
      this.aawakData.splice(this.aawakData.indexOf(this.editData), 1, ev);
      this.isLoader = false;
    }
    else {
      this.toastr.error("Something went Wrong.")
      console.log("message", ev);
    }
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit Aawak'
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
        this.http.delete(this.api.getUrl('AAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.aawakData.splice(i, 1);
            this.gs.Lists.aawak.splice(this.gs.Lists.aawak.indexOf((i: { _id: any; }) => i._id == id), 1);
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

  // filter() {
  //   this.aawakData = this.aawakAll;
  //   for (let [key, value] of Object.entries(this.conditionObj)) {
  //     if (value)
  //       this.aawakData = this.aawakData.filter((b: any) => b[key] == value);
  //   }
  // }

  addJawak(data: any) {
    this.editData = data;
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  showJawak(id: any) {
    if (id) {
      this.http.get(this.api.getUrl('JAWAKBYAWK') + id).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.viewData = data['result'];
          this.openModal('Show Jawak');
        }
      });
    }
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    if (ev.aawak_ref_id) {
      let i = this.aawakData.findIndex((b: any) => b._id == ev.aawak_ref_id);
      this.aawakData[i].remaining_qty = (this.aawakData[i].remaining_qty ? this.aawakData[i].remaining_qty : 0) - ev.qty;
      $('#showModal').modal('hide');
      this.showModal = '';
      // this.isLoader = false;
    }
  }

  openModal(type: any) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  stateSelected(ev: any) {
    if (ev)
      this.aawakData = this.aawakAll.filter((aawak: { state_id: any; }) => aawak.state_id == ev);
    else
      this.aawakData = this.aawakAll;
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
