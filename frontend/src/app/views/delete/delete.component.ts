import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent {
  @Input() Type: any = "";
  @Input() ID: any = "";
  @Output() response = new EventEmitter();
  isLoader: boolean = false;
  loaderStatus: string = 'संबंधित एंट्री ढूँढी जा रही है। ';
  fields: any = [];
  records: any;
  recordsAll: any;
  editData: any;
  apiName: any;
  filterBody: any = {}
  term: any;
  showModal: string = "";
  settings: any = null;
  relatedData: any = {};
  relatedTables: any = [];
  selectedTable: any = '';
  apiMapping: any = {};
  canDelete: boolean = false;
  getCounter: any = 0;
  deleteModel: any = {
    ID: null,
    Type: null,
  }

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    protected gs: GlobalService,
    private excelExportService: ExcelExportService,
    public auth: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute) {
    this.apiMapping = {
      'AAWAK': api.URLS['AAWAK'] + 'filter/',
      'JAWAK': api.URLS['JAWAK'] + 'filter/',
      'ITEM': api.URLS['ITEMMIX'],
    }
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes", changes);
    if (changes.Type.currentValue) {
      this.Type = changes.Type.currentValue;
    }
    if (changes.ID.currentValue) {
      this.ID = changes.ID.currentValue;
    }
    this.configureData();
    console.log(this.ID, this.Type);

  }

  async configureData() {
    this.isLoader = true;
    if (this.Type && this.ID) {
      switch (this.Type) {
        case 'mm': this.apiName = 'MM';
          this.filterBody = { or: true, mm_id: [this.ID], aj_mm_id: [this.ID] }
          this.relatedTables = ['AAWAK', 'JAWAK', 'PRODUCT'];
          break;
        case 'item': this.apiName = 'ITEM';
          this.filterBody = { item_id: [this.ID] }
          this.relatedTables = ['SUBITEM', 'AAWAK', 'JAWAK', 'PRODUCT'];
          break;
        case 'subitem': this.apiName = 'SUBITEM';
          this.filterBody = { subitem_id: [this.ID] }
          this.relatedTables = ['AAWAK', 'JAWAK', 'PRODUCT'];
          break;
        case 'subitem_list': this.apiName = 'SUBITEMLIST';
          this.filterBody = { subitem_list_id: [this.ID] }
          this.relatedTables = ['SUBITEM'];
          break;
        default:
      }

      await this.getRelatedData();
    }
  }

  async getRelatedData() {
    this.isLoader = true;
    this.getCounter = 0;
    this.canDelete = false;
    this.relatedData = {}
    this.selectedTable = '';
    for (let value of this.relatedTables) {
      console.log(value, this.apiMapping[value], this.apiMapping);

      this.http.put((this.apiMapping[value] || this.api.getUrl(value)) + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
        if (data['success'] && data['result'] && data['result'].length > 0) {
          this.relatedData[value] = data['result'];
          this.relatedData[value + '_count'] = data['total_count'] || data['result'].length;

        } else {
          this.relatedData[value] = []
        }
        if (this.getCounter == 0) {
          this.selectedTable = value;
          this.configureFields(value);
        }
        this.isDeleteCheck();
      });
    }
  }

  isDeleteCheck() {
    this.getCounter++;
    if (this.getCounter == this.relatedTables.length) {
      this.canDelete = Object.keys(this.relatedData).every(key =>
        !this.relatedData[key] || this.relatedData[key].length === 0
      );
      this.isLoader = false;
    } else {
      this.canDelete = false;
    }
  }

  async finalDelete() {
    if (!['SUBITEMLIST'].includes(this.apiName)) {
      await this.http.delete(this.api.getUrl('BACHAT') + 'many/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      });
      await this.http.delete(this.api.getUrl('BACHATNEW') + 'many/' + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
      });
    }
    await this.http.delete(this.api.getUrl(this.apiName) + this.ID).subscribe((data: any) => {
      if (data['success']) {
        this.toastr.success('deleted successfully.');
        this.response.emit(true);
      }
    });
  }

  configureFields(type: string) {
    this.selectedTable = type
    switch (type) {
      case 'AAWAK': this.setAawakFields();
        break;
      case 'JAWAK': this.setJawakFields();
        break;
      case 'SUBITEM': this.setSubitemFields();
        break;
      default:
    }
  }

  setAawakFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["date"]
      }, {
        title: "Pkt No.",
        columns: ["pkt_num"]
      }, {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Aawak MM",
        columns: ["aawak_mm_hin", "aawak_mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"]
      }, {
        title: "Qty",
        columns: ["qty", "unit_short"]
      }, {
        title: "Item Detail",
        columns: ["item_detail"]
      }, {
        title: "Aawak Type",
        columns: ["aawak_type_hin", "aawak_type_eng"]
      }, {
        title: "Description",
        columns: ["description"]
      }, {
        title: "Nimitt",
        columns: ["nimitt_hin"]
      }
    ]
  }

  setJawakFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["date"]
      }, {
        title: "Pkt No.",
        columns: ["pkt_num"]
      }, {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Jawak MM",
        columns: ["jawak_mm_hin", "jawak_mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"]
      }, {
        title: "Qty",
        columns: ["qty", "unit_short"]
      }, {
        title: "Item Detail",
        columns: ["item_detail"]
      }, {
        title: "Jawak Type",
        columns: ["jawak_type_hin", "jawak_type_eng"]
      }, {
        title: "Description",
        columns: ["description"]
      }, {
        title: "Nimitt",
        columns: ["nimitt_hin"]
      }
    ]
  }

  setSubitemFields() {
    this.fields = [
      {
        title: "Item",
        columns: ["item_hin, item_eng"]
      }, {
        title: "Subitem(Hin)",
        columns: ["subitem_hin"]
      }, {
        title: "Subitem(Eng)",
        columns: ["subitem_eng"]
      }, {
        title: "Category(Hin)",
        columns: ["categories_hin"]
      }, {
        title: "Category(Eng)",
        columns: ["categories_eng"]
      }, {
        title: "Default Unit",
        columns: ["unit_short"]
      }
    ]
  }

  closeModal() {
    this.showModal = "";
    $('#deleteComponent' + this.Type + ' > #showModal').modal('hide');
  }

  openModal(type: string) {
    if (this.apiName == 'SUPPORTLIST') {
      this.showModal = 'support_list';
    } else {
      this.showModal = type;
    }
    $('#deleteComponent' + this.Type + ' > #showModal').modal('show');
  }

  edit(data: any) {
    this.editData = data;
    this.openModal(this.Type);
  }

  editResponse(ev: any) {

    if (ev._id) {
      for (let i in this.records) {
        if (this.records[i]._id == ev._id) {
          this.records[i] = ev;
        }
      }
    }
    this.closeModal();
  }

  delete(i: any, id: any) {
    let type = this.selectedTable ? this.selectedTable.toLowerCase() : '';
    if (['subitem'].includes(type)) {
      this.deleteModel.Type = type;
      this.deleteModel.ID = id;
      this.openModal('delete_' + type);
    } else {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.http.delete(this.api.getUrl(this.selectedTable) + '/' + id).subscribe((data: any) => {
            if (data['success']) {
              this.isLoader = false;
              this.relatedData[this.selectedTable].splice(i, 1);
              if (this.relatedData[this.selectedTable].length <= 0) {
                this.getRelatedData();
              }
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
    }
    this.isLoader = false;
  }

  deleteResponse(ev: any) {
    this.closeModal();
    this.getRelatedData();
  }
}
