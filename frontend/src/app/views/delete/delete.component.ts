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
import { SelectionService } from 'src/app/services/selection.service';
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
  mmList: any[] = [];
  targetID: any = null;
  targetItem: any = null;
  targetSubitem: any = null;
  transferring: boolean = false;
  transferList: any[] = [];
  items: any[] = [];
  configMapping: any = {};
  page: number = 1;
  itemsPerPage: number = 100;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private toastr: ToastrService,
    protected gs: GlobalService,
    private excelExportService: ExcelExportService,
    public auth: AuthService,
    private spinner: NgxSpinnerService,
    public selectionService: SelectionService,
    private route: ActivatedRoute) {
    this.apiMapping = {
      'AAWAK': api.URLS['AAWAK'] + 'filter/',
      'JAWAK': api.URLS['JAWAK'] + 'filter/',
      'MM': api.URLS['MM'] + 'filter/',
      'ITEM': api.URLS['ITEMMIX'],
      'PRODUCT': api.URLS['PRODUCT'],
      'BACHAT': api.URLS['BACHAT'] + 'filter/',
      'BACHATNEW': api.URLS['BACHATNEW'] + 'filter/',
      'HMP': api.URLS['HMP'] + 'batch/',
      'PRASTAV': api.URLS['PRASTAV'] + 'filter/',
      'VARIANT': api.URLS['VARIANT'] + 'filter/',
    }
  }

  ngOnInit(): void {
    this.gs.observeList().subscribe(result => {
      this.items = result.itemmix ? result.itemmix : [];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("changes", changes);
    if (changes.Type && changes.Type.currentValue) {
      this.Type = changes.Type.currentValue;
    }
    if (changes.ID && changes.ID.currentValue) {
      this.ID = changes.ID.currentValue;
    }
    this.targetID = null;
    this.targetItem = null;
    this.targetSubitem = null;
    this.configureData();
    console.log(this.ID, this.Type);
  }

  async configureData() {
    this.isLoader = true;
    if (this.Type && this.ID) {
      this.relatedTables = [];
      this.relatedData = {};
      let configKey = this.Type;
      // Handle various support list types
      const supportListTypes = ['aawak_type', 'jawak_type', 'condition', 'usage_list', 'aawak_source', 'mm_type'];
      if (supportListTypes.includes(this.Type)) {
        configKey = 'support_list';
      }

      // Unified configuration for checking related records and transferring references
      this.configMapping = {
        'mm': {
          apiName: 'MM',
          filterBody: { or: true, mm_id: [this.ID], aj_mm_id: [this.ID] },
          relatedTables: ['AAWAK', 'JAWAK', 'BACHAT', 'BACHATNEW', 'PRODUCT', 'HMP', 'PRASTAV'],
          transferAPI: 'MM',
          listAPI: 'MM'
        },
        'item': {
          apiName: 'ITEM',
          filterBody: { item_id: [this.ID] },
          relatedTables: ['SUBITEM', 'AAWAK', 'JAWAK', 'BACHAT', 'BACHATNEW', 'PRODUCT', 'HMP', 'PRASTAV'],
          transferAPI: 'ITEM',
          listAPI: 'ITEM'
        },
        'subitem': {
          apiName: 'SUBITEM',
          filterBody: { subitem_id: [this.ID] },
          relatedTables: ['AAWAK', 'JAWAK', 'BACHAT', 'BACHATNEW', 'PRODUCT', 'PRASTAV'],
          transferAPI: 'SUBITEM',
          listAPI: 'SUBITEM',
        },
        'support_list': {
          apiName: 'SUPPORTLIST',
          transferAPI: 'SUPPORTLIST',
          listAPI: 'SUPPORTLIST',
          subTypes: {
            'aawak_type': { relatedTables: ['AAWAK'], transferField: 'aawak_type_id' },
            'jawak_type': { relatedTables: ['JAWAK'], transferField: 'jawak_type_id' },
            'aawak_source': { relatedTables: ['AAWAK', 'JAWAK'], transferField: 'aawak_source_id' },
            'condition': { relatedTables: ['AAWAK', 'JAWAK', 'BACHATNEW', 'PRODUCT'], transferField: 'condition_id' },
            'usage_list': { relatedTables: ['AAWAK', 'JAWAK'], transferField: 'usage_list_id' },
            'mm_type': { relatedTables: ['MM'], transferField: 'mm_type', matchBy: 'list_name_hin' }
          }
        },
        'category': {
          apiName: 'CATEGORY',
          filterBody: { category_id: [this.ID] },
          relatedTables: ['ITEM', 'SUBITEM'],
          transferAPI: 'CATEGORY',
          listAPI: 'CATEGORY'
        },
        'unit': {
          apiName: 'UNIT',
          filterBody: { unit_id: [this.ID] },
          relatedTables: ['AAWAK', 'JAWAK', 'HMP', 'PRASTAV', 'ITEM', 'SUBITEM', 'PRODUCT'],
          transferAPI: 'UNIT',
          listAPI: 'UNIT'
        },
        'attribute': {
          apiName: 'VARIANT',
          apiPath: 'attributes/',
          filterBody: { attribute_id: [this.ID] },
          relatedTables: ['VARIANT'],
          transferAPI: null,
          listAPI: null
        },
        'attribute_value': {
          apiName: 'VARIANT',
          apiPath: 'attribute-values/',
          filterBody: { attribute_value_id: [this.ID] },
          relatedTables: ['VARIANT'],
          transferAPI: null,
          listAPI: null
        }
      };

      const config = this.configMapping[configKey];
      if (config) {
        this.apiName = config.apiName;
        this.relatedTables = config.relatedTables;

        // Unified handling for standard and support list types
        if (configKey === 'support_list') {
          const sub = config.subTypes[this.Type] || { relatedTables: [], transferField: 'support_list_id' };
          this.relatedTables = sub.relatedTables;

          if (sub.matchBy) {
            // Special case for types like mm_type: match by name string (e.g. list_name_hin) instead of ID
            this.isLoader = true;
            this.http.get(this.api.getUrl('SUPPORTLIST') + 'id/' + this.ID).subscribe((res: any) => {
              if (res?.result?.[0]) {
                const name = res.result[0][sub.matchBy];
                this.filterBody = { [sub.transferField]: [name] };
                this.getRelatedData();
              } else {
                this.isLoader = false;
              }
            }, err => { this.isLoader = false; });
            return; // Wait for async name fetch
          } else {
            this.filterBody = { [sub.transferField]: Array.isArray(this.ID) ? this.ID : [this.ID] };
          }
        } else {
          // If ID is an array, spread it or use it directly, but config.filterBody uses [this.ID] statically in the definition!
          // We must dynamically map the filterBody arrays to use the selected IDs
          this.filterBody = JSON.parse(JSON.stringify(config.filterBody));
          for (let k in this.filterBody) {
            if (Array.isArray(this.filterBody[k])) {
              this.filterBody[k] = Array.isArray(this.ID) ? this.ID : [this.ID];
            }
          }
        }

        // Load transfer list
        if (config.listAPI) {
          let listUrl = this.api.getUrl(config.listAPI);
          if (configKey === 'support_list') {
            listUrl = this.api.getUrl('SUPPORTLIST') + 'splists/';
          }
          this.http.get(listUrl + this.auth.webUser.dept_id).subscribe((data: any) => {
            if (data?.result) {
              if (configKey === 'support_list') {
                this.transferList = data.result.filter((m: any) => m._id != this.ID && m.list_type === this.Type);
              } else {
                this.transferList = data.result.filter((m: any) => m._id != this.ID);
              }
            }
          });
        }
        this.page = 1;
      } else if (this.Type === 'subitem_list') {
        this.apiName = 'SUBITEMLIST';
        this.filterBody = { subitem_list_id: [this.ID] };
        this.relatedTables = ['SUBITEM'];
        this.page = 1;
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

    if (!this.relatedTables || this.relatedTables.length === 0) {
      this.isLoader = false;
      this.canDelete = true;
      // Auto-trigger SWAL if no related tables need checking on frontend
      this.finalDelete();
      return;
    }

    for (let value of this.relatedTables) {
      console.log(value, this.apiMapping[value], this.apiMapping);
      const endpointUrl = this.apiMapping[value] || this.api.getUrl(value);
      if (!endpointUrl) {
        console.warn(`[DeleteComponent] No API URL defined for related table: ${value}`);
        this.relatedData[value] = [];
        if (this.getCounter == 0) {
          this.selectedTable = value;
          this.configureFields(value);
        }
        this.isDeleteCheck();
        continue;
      }

      this.http.put(endpointUrl + this.auth.webUser.dept_id, this.filterBody).subscribe((data: any) => {
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

      // Auto-trigger SWAL if no references are found
      if (this.canDelete) {
        this.finalDelete();
      }
    } else {
      this.canDelete = false;
    }
  }

  async finalDelete() {
    Swal.fire({
      title: 'Are you sure?',
      text: "Is entry ko hamesha ke liye delete kar diya jayega. Kya aap sure hain?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Haan, Delete Karo!',
      cancelButtonText: 'Nahi'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.executeFinalDelete();
      }
    });
  }

  executeFinalDelete() {
    if (!['SUBITEMLIST'].includes(this.apiName)) {
      // Background cleanup for related tables
      this.http.delete(this.api.getUrl('BACHAT') + 'many/' + this.auth.webUser.dept_id, this.filterBody).subscribe();
      this.http.delete(this.api.getUrl('BACHATNEW') + 'many/' + this.auth.webUser.dept_id, this.filterBody).subscribe();
    }

    const configKey = this.configMapping[this.Type] ? this.Type : 'support_list';
    const config = this.configMapping[configKey];
    const apiPath = config?.apiPath || '';

    // Main deletion
    const finalId = Array.isArray(this.ID) ? this.ID.join(',') : this.ID;
    this.http.delete(this.api.getUrl(this.apiName) + apiPath + finalId).subscribe((data: any) => {
      if (data['success']) {
        this.response.emit(true);
      } else {
        this.toastr.error(data['message'] || 'Delete failed.');
      }
    }, err => {
      this.toastr.error(err.error?.message || 'Server error while deleting.');
    });
  }

  configureFields(type: string) {
    this.selectedTable = type;
    this.page = 1;
    switch (type) {
      case 'AAWAK': this.setAawakFields();
        break;
      case 'JAWAK': this.setJawakFields();
        break;
      case 'SUBITEM': this.setSubitemFields();
        break;
      case 'BACHAT': this.setBachatFields();
        break;
      case 'BACHATNEW': this.setBachatNewFields();
        break;
      case 'PRODUCT': this.setProductFields();
        break;
      case 'HMP': this.setHmpFields();
        break;
      case 'PRASTAV': this.setPrastavFields();
        break;
      case 'VARIANT': this.setVariantFields();
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

  setBachatFields() {
    this.fields = [
      {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"]
      }, {
        title: "Stock",
        columns: ["Stock", "unit_short"]
      }, {
        title: "Used",
        columns: ["Used", "unit_short"]
      }
    ]
  }

  setBachatNewFields() {
    this.fields = [
      {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin", "item_eng", "subitem_eng"]
      }, {
        title: "Stock",
        columns: ["Stock", "unit_short"]
      }, {
        title: "Used",
        columns: ["Used", "unit_short"]
      }
    ]
  }

  setProductFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["purchase_date"]
      }, {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin"]
      }, {
        title: "Qty",
        columns: ["qty", "unit_short"]
      }, {
        title: "Code/Sr",
        columns: ["product_code", "sr_num"]
      }
    ]
  }

  setVariantFields() {
    this.fields = [
      {
        title: "Item",
        columns: ["item_hin", "item_eng"]
      }, {
        title: "Variant Name",
        columns: ["display_name"]
      }, {
        title: "SKU",
        columns: ["sku"]
      }
    ]
  }

  setHmpFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["date"]
      }, {
        title: "Batch No",
        columns: ["batch_no"]
      }, {
        title: "Recipe",
        columns: ["recipe_name"]
      }, {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Inputs",
        columns: ["inputs"],
        isHmpIO: true
      }, {
        title: "Outputs",
        columns: ["outputs"],
        isHmpIO: true
      }
    ]
  }

  setPrastavFields() {
    this.fields = [
      {
        title: "Date",
        columns: ["date"]
      }, {
        title: "Voucher No",
        columns: ["voucher_no"]
      }, {
        title: "MM",
        columns: ["mm_hin", "mm_eng"]
      }, {
        title: "Item",
        columns: ["item_hin", "subitem_hin"]
      }, {
        title: "Qty",
        columns: ["qty", "unit_short"]
      }
    ]
  }

  closeModal() {
    this.showModal = "";
    $('#showModal_' + this.Type).modal('hide');
  }

  openModal(type: string) {
    if (this.apiName == 'SUPPORTLIST') {
      this.showModal = 'support_list';
    } else {
      this.showModal = type;
    }
    setTimeout(() => {
      $('#showModal_' + this.Type).modal('show');
    }, 100);
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

  deleteSelected() {
    if (!this.selectedTable) return;
    const selectedIds = this.selectionService.getSelected(this.selectedTable);
    if (!selectedIds || selectedIds.length === 0) {
      this.toastr.warning('Please select at least one item to delete.');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${selectedIds.length} selected items?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete them!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        const idsStr = selectedIds.join(',');

        let type = this.selectedTable ? this.selectedTable.toLowerCase() : '';
        if (['subitem'].includes(type)) {
          // If subitem, open delete modal for bulk? No, subitem API supports bulk now!
          // We can just use the standard API call for all if backend supports it.
        }

        this.http.delete(this.api.getUrl(this.selectedTable) + '/' + idsStr).subscribe((data: any) => {
          this.isLoader = false;
          if (data['success']) {
            this.selectionService.clear(this.selectedTable);
            this.getRelatedData();
            this.toastr.success('Selected items deleted successfully.');
          } else {
            this.toastr.error(data['message'] || 'Delete failed.');
          }
        }, err => {
          this.isLoader = false;
          this.toastr.error(err['error']?.message || 'Server error.');
        });
      }
    });
  }

  transferReferences() {
    if (['item', 'subitem'].includes(this.Type.toLowerCase())) {
      if (!this.targetItem) {
        this.toastr.warning('Please select target first.');
        return;
      }
    } else {
      if (!this.targetID) {
        this.toastr.warning('Please select target first.');
        return;
      }
    }
    Swal.fire({
      title: 'Transfer References?',
      text: `All related entries will be moved to selected target. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Transfer!'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.transferring = true;
        let configKey = this.Type;
        const supportListTypes = ['unit', 'aawak_type', 'jawak_type', 'condition', 'usage_list', 'aawak_source', 'mm_type'];
        if (supportListTypes.includes(this.Type)) {
          configKey = 'support_list';
        }

        const config = this.configMapping[configKey];
        if (config) {
          const sub = configKey === 'support_list' ? config.subTypes[this.Type] : null;

          if (sub && sub.matchBy) {
            // Special case for name-based transfer
            this.transferring = true;
            this.http.get(this.api.getUrl('SUPPORTLIST') + 'id/' + this.ID).subscribe((res: any) => {
              if (res?.result?.[0]) {
                const fromName = res.result[0][sub.matchBy];
                this.http.get(this.api.getUrl('SUPPORTLIST') + 'id/' + this.targetID).subscribe((res2: any) => {
                  if (res2?.result?.[0]) {
                    const toName = res2.result[0][sub.matchBy];
                    const body = {
                      list_type: this.Type,
                      from_id: fromName,
                      to_id: toName
                    };
                    this.executeTransfer(body, config.transferAPI);
                  } else {
                    this.transferring = false;
                  }
                }, err => { this.transferring = false; });
              } else {
                this.transferring = false;
              }
            }, err => { this.transferring = false; });
          } else {
            let body: any = { from_id: this.ID, to_id: this.targetID };
            if (['item', 'subitem'].includes(this.Type.toLowerCase())) {
              if (!this.targetItem) {
                this.transferring = false;
                this.toastr.warning('Please select item/subitem to transfer to.');
                return;
              }
              body.to_id = `${this.targetItem}:${this.targetSubitem || 'null'}`;
            }
            if (configKey === 'support_list') {
              body.list_type = this.Type;
            }
            this.executeTransfer(body, config.transferAPI);
          }
        }
      }
    });
  }

  executeTransfer(body: any, apiName: string) {
    this.http.put(
      this.api.getUrl(apiName) + 'transfer/' + this.auth.webUser.dept_id,
      body
    ).subscribe((data: any) => {
      this.transferring = false;
      if (data?.success) {
        this.toastr.success('References transferred successfully!');
        this.getRelatedData();
      } else {
        this.toastr.error('Transfer failed.');
      }
    }, err => {
      this.transferring = false;
      this.toastr.error('Transfer error.');
    });
  }
}
