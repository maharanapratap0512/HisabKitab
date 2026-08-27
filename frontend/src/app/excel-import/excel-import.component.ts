import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ExcelImportService } from '../services/excel-import.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
import Swal from 'sweetalert2';
import { ExcelExportService } from '../services/excel-export.service';
import { Subject } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-excel-import',
  templateUrl: './excel-import.component.html',
  styleUrls: ['./excel-import.component.scss']
})
export class ExcelImportComponent implements OnInit {
  @Input() importType: any;
  @Input() lockType: boolean = false;
  @Input() stepNo: any = 0;
  @Input() excelFile: any;
  @Input() importedData: any;
  @Output() response = new EventEmitter();
  showModal: any = '';
  showAddModal: string = '';
  activeCorrectionRow: any = null;

  handleAddOption(val: any, data: any, modalTitle: string) {
    if (val === '+add') {
      this.activeCorrectionRow = data;
      data.id = null;
      this.showAddModal = modalTitle;
      setTimeout(() => {
        $('#showAddModal').modal('show');
      }, 100);
    }
  }

  onItemChange(ev: any, data: any) {
    if (ev === '+add') {
      this.handleAddOption('+add', data, 'Add Item');
    } else if (ev) {
      data.id = ev._id;
      this.itemSelected(ev);
    }
  }

  onSubitemChange(ev: any, data: any) {
    if (ev === '+add') {
      this.handleAddOption('+add', data, 'Add Subitem');
    } else if (ev) {
      data.id2 = ev._id;
    }
  }

  onAddResponse(res: any) {
    if (res) {
      const newId = res._id || (res.data && res.data._id) || res;
      if (this.activeCorrectionRow && typeof newId === 'string') {
        this.activeCorrectionRow.id = newId;
      }
      if (this.showAddModal === 'Add Attribute') {
        this.loadAttributes();
      }
    }
    this.closeAddModal();
  }

  closeAddModal() {
    $('#showAddModal').modal('hide');
    this.showAddModal = '';
    this.activeCorrectionRow = null;
  }
  itemsPerPage = 100;
  page1: any = 1;
  page2: any = 1;
  page_excel: any = 1;
  page_in: any = 1;
  page_up: any = 1;
  page_dp: any = 1;
  page_rj: any = 1;
  page_unmatched: any = 1;
  processedCount: any = 0;
  processing: any = false;
  progressStyle: string = "width: 0%";
  import$ = new Subject();
  update$ = new Subject();

  isLoader: any = false;
  items: any = [];
  cat: any = null;
  products: any = [];
  productsAll: any = [];
  itemAll: any = [];
  subitems: any = [];
  subitem_lists: any = [];
  units: any = [];
  states: any = [];
  districts: any = [];
  cities: any = [];
  mms: any = [];
  conditions: any = [];
  genders: any = [];
  relations: any = [];
  categories: any = [];
  pbks: any = [];
  aawak_types: any = [];
  jawak_types: any = [];
  nimitts: any = [];
  attributes: any = [];
  excelArr: any = [];
  excelArrObj: any = [];
  headerList: any = [];
  swHeaderList: any = [];
  headerConfig: any = [];
  secondHeader: any = false;
  header1: any = 0;
  header2: any = null;
  excelData: any = [];
  unmatchedData: any = [];
  newInsertedData: any = [];
  duplicateDate: any = [];
  willUpdateData: any = [];
  updateFailData: any = [];
  rejectedData: any = [];
  settings: any;
  constructor(
    public EIService: ExcelImportService,
    public excelExportService: ExcelExportService,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.gs.observeList().subscribe(result => {
      this.itemAll = result.itemmix ? result.itemmix : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.categories = result.category ? result.category : [];
      this.subitem_lists = result.subitem_list ? result.subitem_list : [];
      this.units = result.unit ? result.unit : [];
      this.states = result.state ? result.state : [];
      this.districts = result.district ? result.district : [];
      this.cities = result.city ? result.city : [];
      this.mms = result.mm ? result.mm : [];
      this.conditions = result.condition ? result.condition : [];
      this.genders = result.gender ? result.gender : [];
      this.relations = result.relation ? result.relation : [];
      // this.departments = result.department ? result.department : [];
      this.pbks = result.pbk ? result.pbk : [];
      this.aawak_types = result.aawak_type ? result.aawak_type : [];
      this.jawak_types = result.jawak_type ? result.jawak_type : [];
      this.nimitts = result.nimitt ? result.nimitt : [];
      if (result.attribute) this.attributes = result.attribute;
    });
    this.settings = this.auth.webUser.settings;
  }

  loadAttributes() {
    this.http.get(this.api.getUrl('VARIANT') + 'attributes').subscribe((d: any) => {
      if (d && d.success) {
        this.attributes = d.result || [];
      }
    });
  }

  ngOnInit(): void {
    this.loadAttributes();
    if (this.importType) {
      for (let i in this.EIService.importList) {
        if (this.EIService.importList[i].name == this.importType) {
          this.importType = this.EIService.importList[i];
          this.importTypeChanged(this.EIService.importList[i]);
          break;
        }
      }
    }

    if (this.excelFile) {
      this.excelImport(this.excelFile)
    }

  }

  ngOnChange(changes: SimpleChanges) {
    console.log(changes);
    if (changes.excelFile) {
      this.excelImport(changes.excelFile)
    }
  }


  finish() {
    this.import$.complete();
    if (this.importType?.name === 'item' || this.importType?.name === 'subitem') {
      this.response.emit([...this.newInsertedData, ...this.willUpdateData, ...this.duplicateDate]);
    } else {
      this.response.emit(true);
    }
  }

  importTypeChanged(ev: any) {
    this.headerConfig = this.EIService.config[ev.name];
    this.secondHeader = ev.secondHeader
  }

  excelImport(ev: any) {
    if (ev) {
      let workBooks: any = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
        this.isLoader = true;
        // this.loadingStatus = "फाइल लोड की जा रही है ।";        
        const data = reader.result;
        workBooks = XLSX.read(data, { type: 'binary' });
        this.excelArr = XLSX.utils.sheet_to_json(workBooks.Sheets[workBooks.SheetNames[0]], { header: 1 });
        this.headerChanged(0)
        this.isLoader = false;
        ev = null
      }
      reader.readAsBinaryString(file);
    }
    else {
      ev = null;
    }
  }

  headerChanged(index: any) {
    // reset header found status
    for (let j in this.headerConfig) {
      this.headerConfig[j].found = false;
      this.headerConfig[j].index = null;
    }
    //matching incoming header with header set in config object.
    for (let i in this.excelArr[index]) {
      let header = this.excelArr[index][i].trim().toLowerCase();
      for (let j in this.headerConfig) {
        if (this.headerConfig[j].name == header || this.headerConfig[j].alt_names.includes(header)) {
          this.headerConfig[j].found = true;
          this.headerConfig[j].index = i;
        }
      }
    }
    //verifying that all required header are found or not?
    this.stepNo = 1;
    for (let i in this.headerConfig) {
      if (this.headerConfig[i].not_null && !this.headerConfig[i].found) {
        this.stepNo = 0;
        break;
      }
    }
  }

  openModal(type: String) {
    this.showModal = type;
    $('#excelImport > #showModal').modal('show');
  }

  closeModal() {
    this.showModal = "";
    $('#excelImport > #showModal').modal('hide');
  }

  showBachatResponse(ev: any) {
    this.response.emit(true);
  }

  setExcelToObjectArray() {
    this.isLoader = true;
    this.headerList = this.getHeaderList();
    this.excelArrObj = [];
    //loop through all rows after header row.
    for (let i = this.header1 + 1; i < this.excelArr.length; i++) {
      let row: any = {};
      //filtering blank rows, length 0 means no data in row
      if (this.excelArr[i].length) {
        //loop for all required coluns configured in service Config object for preparing row object.
        for (let j in this.headerConfig) {
          //verify header found in excel and excel columns index saved in config?
          if (this.headerConfig[j].index) {
            //assign excel data to matched object key and prepare whole row object
            if (this.headerConfig[j].type == "array") {
              row[this.headerConfig[j].col_name] = this.excelArr[i][this.headerConfig[j].index] ? this.excelArr[i][this.headerConfig[j].index].split(",").map((v: string) => this.gs.cleanValue(v)).filter(Boolean) : [];
              // if array type with ref_table
              // if (this.headerConfig[j].ref_table) {
              //   row[this.headerConfig[j].col_name] = row[this.headerConfig[j].col_name].map((value: string) => ({ data: this.gs.cleanValue(value), _id: null }));
              // } 
            } else {
              row[this.headerConfig[j].col_name] = this.gs.cleanValue(this.excelArr[i][this.headerConfig[j].index]);
            }
          }
        }
        // push object into array.
        this.excelArrObj.push(row);
      }
    }

    if (this.importType.name == 'subitem_list') {
      this.excelArrObj = this.excelArrObj.filter((e: { subitem_hin: string | null; }) => e.subitem_hin)
    } else if (this.importType.name == 'item') {
      this.excelArrObj = this.excelArrObj.filter((e: { item_hin: string | null; }) => e.item_hin)
    } else if (this.importType.name == 'subitem') {
      this.excelArrObj = this.excelArrObj.filter((e: { subitem_hin: string | null; }) => e.subitem_hin)
    } else if (this.importType.name == 'bachat') {
      this.excelArrObj = this.excelArrObj.filter((e: { date: any; mm: any; item: any; qty: any; unit: any; }) => e.date && e.mm && e.item && e.qty != null && e.unit)
    } else if (this.importType.name == 'jawak') {
      this.excelArrObj = this.excelArrObj.filter((e: any) => e.date && e.mm && e.item && e.qty != null && e.unit && e.jawak_type)
    } else if (this.importType.name == 'rel_item_category' || this.importType.name == 'rel_subitem_category') {
      let combinations: any[] = [];
      for (let i of this.excelArrObj) {
        const itemVal = i.item || i.item_hin;
        const subitemVal = i.subitem || i.subitem_hin;
        if (this.importType.name == 'rel_subitem_category' && itemVal && !subitemVal) {
          continue;
        }
        if (i.category && typeof i.category === 'string') {
          let cats = i.category.split(',');
          let refItem = null;
          if (this.importedData && this.importedData.length) {
            // Try to match the item by item/item_hin
            refItem = this.importedData.find((d: any) => (d.item === itemVal || d.item_hin === itemVal) && (this.importType.name == 'rel_item_category' || d.subitem === subitemVal || d.subitem_hin === subitemVal));
          }
          for (let cat of cats) {
            if (cat.trim()) {
              combinations.push({
                ...i,
                item_id: refItem ? refItem.item_id || refItem._id : null,
                subitem_id: refItem && this.importType.name == 'rel_subitem_category' ? refItem.subitem_id || refItem._id : null,
                categories: cat.trim()
              });
            }
          }
        }
      }
      this.excelArrObj = combinations;
    }

    this.stepNo = 2;
    this.isLoader = false;
  }

  back() {
    this.stepNo = 2
  }

  verifyExcelData() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('EXCELIMPORT') + 'verify/' + this.auth.webUser.dept_id, { importType: this.importType, excelData: this.excelArrObj, config: this.headerConfig, itemConfig: this.EIService.config.item }).subscribe((res: any) => {
      if (res && res.excelData) {
        this.excelArrObj = res.excelData;
        this.unmatchedData = res.correctionList;
        this.stepNo = 3;
      } else {
        this.toastr.error(res['message']);
        this.isLoader = false;
      }
    }, (err: any) => {
      this.toastr.error(err['error']);
      this.isLoader = false;

    });
    this.isLoader = false;
  }

  isDropdownOpen: boolean = false;

  onDropdownOpen() {
    this.isDropdownOpen = true;
  }

  onDropdownClose() {
    this.isDropdownOpen = false;
  }

  toggleCorrection(i: any, action: boolean) {
    if (this.isDropdownOpen) {
      return;
    }
    if (this.unmatchedData && this.unmatchedData[i]) {
      this.unmatchedData[i].correction = action;

      if (action) {
        if (this.unmatchedData[i].type == 'item' && this.unmatchedData[i].item) {
          this.itemSelected(this.unmatchedData[i].item);
        } else if (this.unmatchedData[i].type == 'item' && this.unmatchedData[i].id) {
          let item = this.items.find((it: { _id: any; }) => it._id == this.unmatchedData[i].id);
          this.unmatchedData[i].item = item;
          this.itemSelected(this.unmatchedData[i].item);
        }
      } else {
        this.items = this.itemAll;
        this.subitems = [];
      }
    }
  }

  itemSelected(ev: any) {
    if (ev) {
      if (this.cat) {
        this.subitems = ev.subitems.filter((s: { categories: any; }) => s.categories.includes(this.cat));
      }
      else {
        this.subitems = ev.subitems;
      }
    }
    else {
      this.subitems = [];
    }
  }

  ignoreCorrection(data: any, i: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: "",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'हाँ, जी। '
    }).then((result) => {
      if (result.isConfirmed) {
        this.unmatchedData[i].ignore = true;
      }
    });
  }

  itemChange(event: any, data: any, index?: any) {
    // console.log("itemChange event:", event, "data:", data, "index:", index);
    if (event) {
      data.id = event.item_id;
      data.subitem_id = event.subitem_id;
      data.item = event.item;
      data.subitem = event.subitem_id ? event.subitem : null;
    }
  }

  correctionSubmit(data: any, index: any) {
    let conf = this.headerList.filter((h: { ref_table: any; }) => h.ref_table == data.type);
    // console.log("data", data, "conf", conf);
    // console.log(this.excelArrObj);

    if (data.type == 'item') {
      for (let i in this.excelArrObj) {
        if (typeof data.name === 'string') {
          if (this.excelArrObj[i].item == data.name) {
            if (data.item) {
              this.excelArrObj[i].item_id = data.item_id;
              this.excelArrObj[i].item_hin = data.item.item_hin;
            }
            if (data.subitem) {
              this.excelArrObj[i].subitem_id = data.subitem_id;
              this.excelArrObj[i].subitem_hin = data.subitem.subitem_hin;
              this.excelArrObj[i].subitem_corrected = true;
            }
            console.log("excel data", this.excelArrObj[i]);

          }
        } else if (data.name && typeof data.name === 'object' && this.excelArrObj[i].item == data.name.item && this.excelArrObj[i].subitem == data.name.subitem) {
          if (data.item) {
            this.excelArrObj[i].item_id = data.item_id;
            this.excelArrObj[i].item_hin = data.item.item_hin;
          }
          this.excelArrObj[i].subitem_corrected = true;
          this.excelArrObj[i].subitem_hin = '-';
          if (data.subitem) {
            this.excelArrObj[i].subitem_id = data.subitem_id;
            this.excelArrObj[i].subitem_hin = data.subitem.subitem_hin;
          }
          console.log("excel data", this.excelArrObj[i]);
        }
      }
    } else if (data.isArray) {
      // Array-type correction (e.g. categories): data.name is string[], data.ids is id[]
      for (let i in this.excelArrObj) {
        for (let j in conf) {
          const rowVal = this.excelArrObj[i][conf[j].name];
          // Match if the row's name array equals data.name array
          if (Array.isArray(rowVal) && Array.isArray(data.name) &&
            rowVal.length === data.name.length &&
            rowVal.every((v: string, idx: number) => v === data.name[idx])) {
            this.excelArrObj[i][conf[j].ref_field] = data.ids;
          }
        }
      }
    } else {
      for (let i in this.excelArrObj) {
        for (let j in conf) {
          if (this.excelArrObj[i][conf[j].name] == data.name) {
            this.excelArrObj[i][conf[j].ref_field] = data.id;
          }
        }
      }
    }

    this.unmatchedData[index].done = true;
    this.unmatchedData[index].ignore = false;
    if (data.dictionary) {
      this.http.post(this.api.getUrl('DICT'), data).subscribe((res: any) => {
        if (res.success) {
          this.toastr.success('Added to Dictionary');
        }
      }, (err) => {
        this.toastr.error('Error Occuring while inserting into Dictionary.')
      });
    }
  }

  async processImport(i: number = 0) {
    if (await this.verifyForRejection(this.excelArrObj[i])) {
      this.rejectedData.push(this.excelArrObj[i]);
      this.import$.next(0);
    } else {
      this.http.put(this.api.getUrl('EXCELIMPORT') + 'final/' + this.auth.webUser.dept_id, { importType: this.importType, headerList: this.headerList, excelData: this.excelArrObj[i] }).subscribe((res: any) => {
        this.import$.next(res);
      }, (err: any) => {
        this.rejectedData.push(this.excelArrObj[i]);
        this.import$.next(0);
      });
    }
  }

  /*
  async finalImport() {
    this.newInsertedData = [];
    this.willUpdateData = [];
    this.duplicateDate = [];
    this.rejectedData = [];
    this.swHeaderList = this.getSwHeaderList();
    this.processedCount = 0;

    if (this.importType.name == 'jawak') {
      this.isLoader = true;
      this.http.put(this.api.getUrl('EXCELIMPORT') + 'final_bulk/' + this.auth.webUser.dept_id, {
        importType: this.importType,
        headerList: this.headerList,
        excelData: this.excelArrObj
      }).subscribe((res: any) => {
        this.isLoader = false;
        if (res.success) {
          this.newInsertedData = res.result.inserted;
          this.rejectedData = res.result.rejected;
          this.stepNo = 4;
          this.toastr.success("Bulk import complete.");
        }
      }, (err: any) => {
        this.isLoader = false;
        this.toastr.error("Error in bulk import.");
      });
    } else {
      this.import$.subscribe((res: any) => {
        this.processedCount++;
        this.progressStyle = "width:" + (this.processedCount * 100) / this.excelArrObj.length + "%;";
        if (res) {
          switch (res.result.status) {
            case 'inserted': this.newInsertedData.push(res.result.data.newData)
              break;
            case 'update': this.willUpdateData.push(res.result.data)
              break;
            case 'duplicate': this.duplicateDate.push(res.result.data)
              break;
            default: this.rejectedData.push(res.result.data)
          }
        }

        if (this.excelArrObj.length > this.processedCount) {
          this.processImport(this.processedCount);
        } else {
          this.import$.complete();
          this.stepNo = 4;
          this.toastr.success("import complete. test your result")
        }
      });

      this.processImport(0);
    }
  }
  */

  async finalImport() {
    this.newInsertedData = [];
    this.willUpdateData = [];
    this.duplicateDate = [];
    this.rejectedData = [];
    this.processedCount = 0;
    this.isLoader = true;
    this.stepNo = 4;


    const validData = await this.filterValidData();

    if (validData.length === 0) {
      this.isLoader = false;
      this.toastr.warning("No valid data to import.");
      return;
    }

    const url = this.api.getUrl('EXCELIMPORT') + 'final_stream/' + this.auth.webUser.dept_id;
    const body = {
      importType: this.importType,
      headerList: this.headerList,
      excelData: validData
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (!reader) throw new Error("Stream reader not available");

      while (true) {
        console.log("[Stream] Waiting for data...");
        const { value, done } = await reader.read();

        if (done) {
          console.log("[Stream] done = true (Server closed or reader cancelled)");
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log("[Stream] Received chunk size:", chunk.length);
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            this.isLoader = false;
            try {
              const data = JSON.parse(trimmedLine.replace('data: ', ''));
              // console.log(data);

              // Global Error Handling
              if (data.error) {
                console.error("[Stream] Global error received:", data.error);
                this.isLoader = false;
                this.processedCount = 0;
                this.progressStyle = "width: 0%;";
                this.newInsertedData = [];
                this.willUpdateData = [];
                this.duplicateDate = [];
                this.rejectedData = [];
                this.toastr.error("Import failed: " + data.error);
                return;
              }

              if (data.done) {
                this.isLoader = false;
                this.stepNo = 4;
                this.toastr.success("Import complete.");
                return;
              }

              if (data.error) {
                this.toastr.error('Import failed: ' + data.error);
                this.isLoader = false;
                break;
              }

              // Update Progress
              this.processedCount = data.index;
              this.progressStyle = "width:" + (this.processedCount * 100) / data.total + "%;";

              // Process Result
              const res = data.result;
              if (res) {
                switch (res.status) {
                  case 'inserted': this.newInsertedData.push(res.data.newData || res.data)
                    break;
                  case 'update': this.willUpdateData.push(res.data)
                    break;
                  case 'duplicate': this.duplicateDate.push(res.data)
                    break;
                  default: this.rejectedData.push(res.data)
                }
                this.cdr.detectChanges();
              }
            } catch (e) {
              console.warn("JSON parse error on line:", trimmedLine);
            }
          }
        }
      }
    } catch (err: any) {
      this.isLoader = false;
      this.toastr.error("Stream error: " + err.message);
    }
  }

  verifyForRejection(data: any) {
    if (this.importType.name == 'jawak') {
      if (!data.pbk_id && !data.jawak_mm_id) {
        return true;
      }
    }

    for (let j in this.headerList) {
      if (this.headerList[j].not_null && !data[this.headerList[j].name]) {
        return true;
      } else if (this.headerList[j].ref_table && this.headerList[j].type == "array" && (data[this.headerList[j].name] && data[this.headerList[j].ref_field])) {
        if (data[this.headerList[j].ref_field].includes(null)) {
          return true;
        }
      } else if (this.headerList[j].ref_table && ((data[this.headerList[j].name] && !data[this.headerList[j].ref_field]) || data[this.headerList[j].name + '_corrected'])) {
        return true;
      }
    }

    return false;
  }

  filterValidData() {
    return this.excelArrObj.filter((item: any) => {
      const isRejected = this.verifyForRejection(item);
      if (isRejected) {
        this.rejectedData.push(item); // Keep track of why/what was rejected
        return false; // Remove from the list being sent to server
      }
      return true; // Keep in the list
    });
  }

  processUpdate(i: number = 0) {
    this.http.put(this.api.getUrl('EXCELIMPORT') + 'update/' + this.auth.webUser.dept_id, { importType: this.importType, headerList: this.headerList, excelData: this.willUpdateData[i] }).subscribe((res: any) => {
      if (res.success) {
        this.willUpdateData[i].status = true;
      } else {
        this.updateFailData.push(this.willUpdateData[i]);
      }
      this.update$.next(res);
    }, (err) => {
      this.updateFailData.push(this.willUpdateData[i]);
      this.update$.next(0);
    });
  }

  updateData() {
    this.processedCount = 0;
    this.progressStyle = "width: 0%";
    this.processing = true;

    this.update$.subscribe((res: any) => {
      this.processedCount++;
      this.progressStyle = "background-color: #ffbc00 !important; width:" + (this.processedCount * 100) / this.willUpdateData.length + "%;";

      if (this.willUpdateData.length > this.processedCount) {
        this.processUpdate(this.processedCount);
      } else {
        this.update$.complete();
        this.stepNo = 5;
        this.toastr.success("Update complete, check your result");
      }
    })

    this.processUpdate();
  }

  getHeaderList() {
    return this.headerConfig.filter((h: { found: any; }) => h.found);
  }

  getSwHeaderList() {
    return this.headerConfig
      .filter((h: any) => h.found)
      .map((h: { name: any; ref_data: any; found: any; }) => {
        return h.ref_data ? h.ref_data : h.name;
      });
  }

  getValue(obj: any, path: string) {
    if (!path || !obj) return null;
    return path.split('.').reduce((o, i) => (o ? o[i] : null), obj);
  }

  isDifferent(excelVal: any, dbVal: any): boolean {
    if (!dbVal || !excelVal) return false;
    const str1 = String(excelVal).trim().toLowerCase();
    const str2 = String(dbVal).trim().toLowerCase();
    return str1 !== str2;
  }


  catSelected(ev: any) {
    if (ev) {
      this.cat = ev;
      this.items = this.itemAll.filter((i: { category_id: any, categories: any }) => i.category_id == ev || i.categories.includes(ev));
    }
    else {
      this.cat = null;
      this.items = this.itemAll;
    }
  }

  exportToExcel() {
    let date = new Date();

    this.excelExportService.exportAsExcelFile(this.rejectedData, this.importType.name + '_rejected_excel_import_data_' + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear());
  }

}
