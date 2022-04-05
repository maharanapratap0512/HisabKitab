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
  selector: 'app-bachat',
  templateUrl: './bachat.component.html',
  styleUrls: ['./bachat.component.scss']
})
export class BachatComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  bachatData: any = [];
  bachatAll: any = [];
  total_count: any;
  states: any = [];
  mms: any = [];
  categories: any = [];
  items: any = [];
  conditionObj:any = {};


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
    this.getbachatData();
    this.states = this.gs.Lists.state;
    this.mms = this.gs.Lists.mm;
    this.categories = this.gs.Lists.category;
    this.items = this.gs.Lists.item;
  }

  getbachatData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('BACHAT') + this.auth.webUser.dept_id).subscribe((data) => {
      if (data['result'] && data['success']) {
        this.bachatData = data['result'];
        this.bachatAll = data['result'];
        this.total_count = data['total_count'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  stateSelected(ev: any) {
    // this.bachatData = this.bachatAll.filter((b: { state_id: any; }) => b.state_id == ev);
    if (ev)
     this.conditionObj.state_id = ev;
    else
      this.conditionObj.state_id = null;
    this.filter();
  }

  mmSelected(ev: any) {
    if (ev)
     this.conditionObj.mm_id = ev;
    else
      this.conditionObj.mm_id = null;
    this.filter();
  }

  catSelected(ev: any) {
    if (ev)
     this.conditionObj.category_id = ev;
    else
      this.conditionObj.category_id = null;
    this.filter();
  }
  
  itemSelected(ev: any) {
    if (ev)
     this.conditionObj.item_id = ev;
    else
      this.conditionObj.item_id = null;
    this.filter();
  }

  addJawak(data: any) {
    this.editData = {
      mm_id: data.mm_id,
      item_id: data.item_id,
      subitem_id: data.subitem_id,
      qty: data.Stock,
      unit_id: data.unit_id,
      dept_id: data.dept_id
    }
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;
    let i = this.bachatData.findIndex((b:any)=>b.dept_id == ev.dept_id && b.item_id ==  ev.item_id && b.subitem_id == ev.subitem_id && b.mm_id == ev.mm_id);
    if(i && ev.jawak_type_eng == "Used"){
      this.bachatData[i].Used = (this.bachatData[i].Used ? this.bachatData[i].Used : 0) + ev.qty;
      this.bachatData[i].Stock = (this.bachatData[i].Stock ? this.bachatData[i].Stock : 0) - ev.qty;
    }
    else if(i){
      this.bachatData[i].Stock = (this.bachatData[i].Stock ? this.bachatData[i].Stock : 0) - ev.qty;
    }

    if(!this.bachatData[i].Used && !this.bachatData.Stock){
      this.bachatData.splice(i,1);
    }
    $('#showModal').modal('hide');
    this.showModal = '';

    // this.isLoader = false;
  }

  filter(){
    this.bachatData = this.bachatAll;
    for(let [key, value] of Object.entries(this.conditionObj)){
      if(value)
        this.bachatData = this.bachatData.filter((b: any)=>{
          if(key == "category_id"){
            return (b.scat_id == value) || (!b.scat_id && b.icat_id == value) 
          }
          else{
            return b[key] == value;
          }
        });
    }    
  }  
}
