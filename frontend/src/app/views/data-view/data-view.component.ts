import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
declare var $:any;

@Component({
  selector: 'app-data-view',
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.scss']
})
export class DataViewComponent implements OnInit {

  @Input() getData: any;
  @Input() Type: string = "";
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  isLoader: boolean = false;
  fields: any = [];
  records: any;
  apiName: any;
  term: any;
  editData:any;
  showModal:string = "";


  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth:AuthService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes", changes);
    if (changes.Type.currentValue) {
      this.Type = changes.Type.currentValue;
      switch (changes.Type.currentValue) {
        case 'mm': this.setMMFields();
          this.apiName = 'MM';
          break;
        case 'country': this.setCountryFields();
          this.apiName = 'COUNTRY';
          break;
        case 'state': this.setStateFields();
          this.apiName = 'STATE';
          break;
        case 'category': this.setCategoryFields();
          this.apiName = 'CATEGORY';
          break;
        case 'unit': this.setUnitFields();
          this.apiName = 'UNIT';
          break;
        case 'gender': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'mm_type': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'relation': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'status': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'aawak_type': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'jawak_type': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'subitem_list': this.setSubitemListFields();
          this.apiName = 'SUBITEMLIST';
          break;
        case 'condition': this.setSupportListFields();
          this.apiName = 'SUPPORTLIST';
          break;
        case 'department': this.setDepartmentFields();
          this.apiName = 'DEPARTMENT';
          break;
        case 'jawak': this.setJawakFields();
          this.apiName = 'JAWAK';
          break;
      }
    }
    if (changes.getData.currentValue) {
      this.records = changes.getData.currentValue;
    }
  }

  closeModal() {
    this.showModal = "";
    $('#dataViewComponent #showModal').modal('hide');
  }

  edit(data: any) {
    this.editData = data;
    this.showModal = 'Edit ' + this.Type;
    $('#dataViewComponent > #showModal').modal('show');
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
        this.http.delete(this.api.getUrl(this.apiName) + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.isLoader = false;
            this.records.splice(i, 1);
            this.toastr.success('deleted successfully.');
          }
          else {
            this.toastr.error(data['message']);
            this.isLoader = false;
          }
        }, err => {
          this.toastr.error(err['error']);
        });
      }
    });
    this.isLoader = false;
  }


  setSupportListFields() {
    this.fields = [
      {
        title: "Name(Hin)",
        field: ["list_name_hin"]
      }, {
        title: "Name(Eng)",
        field: ["list_name_eng"]
      }
    ]
  }

  setDepartmentFields() {
    this.fields = [
      {
        title: "Name(Hin)",
        field: ["dept_hin"]
      }, {
        title: "Name(Eng)",
        field: ["dept_eng"]
      }, {
        title: "Code",
        field: ["dept_code"]
      }
    ]
  }

  setCategoryFields() {
    this.fields = [
      {
        title: "Category(Hin)",
        field: ["category_hin"]
      }, {
        title: "Category(Eng)",
        field: ["category_eng"]
      }
    ]
  }

  setCountryFields() {
    this.fields = [
      {
        title: "Country(Hin)",
        field: ["country_hin"]
      }, {
        title: "Country(Eng)",
        field: ["country_eng"]
      }
    ]
  }

  setUnitFields() {
    this.fields = [
      {
        title: "Unit(Full)",
        field: ["unit_full"]
      }, {
        title: "Unit(Short)",
        field: ["unit_short"]
      }
    ]
  }

  setMMFields() {
    this.fields = [
      {
        title: "MM(Hin)",
        field: ["mm_hin"]
      }, {
        title: "MM(Eng)",
        field: ["mm_eng"]
      }, {
        title: "MM Code",
        field: ["mm_code"]
      }, {
        title: "MM Type",
        field: ["mm_type"]
      }, {
        title: "Parent MM",
        field: ["parent_mm_hin", "parent_mm_eng", "parent_mm_code"]
      }, {
        title: "State",
        field: ["state_hin", "state_eng"]
      }, {
        title: "Opening Date",
        field: ["opening_date"]
      }
    ]
  }

  setStateFields() {
    this.fields = [
      {
        title: "State(Hin)",
        field: ["state_hin"]
      }, {
        title: "State(Eng)",
        field: ["state_eng"]
      }, {
        title: "Country",
        field: ["country_hin", "country_eng"]
      }
    ]
  }

  setSubitemListFields() {
    this.fields = [
      {
        title: "Subitem(Hin)",
        field: ["subitem_hin"]
      }, {
        title: "Subitem(Eng)",
        field: ["subitem_eng"]
      }
    ]
  }


  setJawakFields() {
    this.fields = [
      {
        title: "Date",
        field: ["date"]
      }, {
        title: "Pkt No.",
        field: ["pkt_num"]
      }, {
        title: "Jawak MM",
        field: ["jawak_mm_hin", "jawak_mm_eng"]
      }, {
        title: "Item",
        field: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"]
      }, {
        title: "Qty",
        field: ["qty"]
      }, {
        title: "Item Detail",
        field: ["item_detail"]
      }, {
        title: "Jawak Type",
        field: ["jawak_type_hin", "jawak_type_eng"]
      }, {
        title: "Description",
        field: ["description"]
      }, {
        title: "Nimitt",
        field: ["nimitt_hin"]
      }
    ]
  }


  editSubitemListResponse(ev:any){
    console.log(ev);
    
    if(ev._id){
      let index = this.records.indexOf((i: { _id: any }) => { i._id == ev._id });
      console.log(index);
      
      if(index >= 0){
        this.records.splice(index, 1, ev);
      }
      this.closeModal();
    }
  }


}
