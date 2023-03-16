import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ExcelExportService } from '../services/excel-export.service';
import { GlobalService } from '../services/global.service';
import { HttpService } from '../services/http.service';
declare var $: any;


@Component({
  selector: 'app-bachat-new',
  templateUrl: './bachat-new.component.html',
  styleUrls: ['./bachat-new.component.scss']
})
export class BachatNewComponent implements OnInit {

  isLoader: boolean = false;
  term: any;
  showModal: string = '';
  editData: any = {};
  bachatData: any = [];
  bachatAll: any = [];
  total_count: any = 0;;
  states: any = [];
  mms: any = [];
  conditions: any = [];
  categories: any = [];
  items: any = [];
  conditionObj: any = {};
  filterBody: any = {
    pbk_id: [],
    mm_id: [],
    aawak_mm_id: [],
    aawak_type_id: [],
    product_id: [],
    item_id: [],
    subitem_id: [],
    condition_id: [],
  };
  images: any = [];
  imageNames: any = [];
  settings: any = {};
  imagesToShow: any = [];
  currentImage: any;


  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private excelExportService: ExcelExportService,
    private domSanitizer: DomSanitizer
  ) {
    this.settings = this.auth.webUser.settings.bachat;
    this.getBase64Images();
  }

  ngOnInit(): void {
    this.spinner.show();
    this.getbachatData();
    this.gs.observeList().subscribe(result => {
      this.states = result.state ? result.state : [];
      this.mms = result.mm ? result.mm : [];
      this.categories = result.category ? result.category : [];
      this.items = result.itemmix ? result.itemmix : [];
      this.conditions = result.condition ? result.condition : [];
    });
  }

  getBase64Images() {
    this.http.put(this.api.getUrl('IMAGE64'), { type: 'item' }).subscribe((data: any) => {
      if (data['success']) {
        this.imageNames = data['filenames'];
        this.images = data['files'];
      }
    });
  }

  getbachatData() {
    this.isLoader = true;
    this.http.get(this.api.getUrl('BACHATNEW') + this.auth.webUser.dept_id).subscribe(async (data) => {
      if (data['result'] && data['success']) {

        this.bachatAll = data['result'];


        this.total_count = data['total_count'];        
        this.bachatData = this.bachatAll;
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  openImageModal() {
    $('#showImageModal').modal('show');
  }  

  showImages(list: any) {
    this.imagesToShow = [];
    this.currentImage = null;
    for (let i in list) {
      let iname = list[i].split('/').pop();
      for (let j in this.imageNames) {
        if (iname == this.imageNames[j]) {
          this.imagesToShow.push(this.domSanitizer.bypassSecurityTrustUrl(this.images[j]));
          break;
        }
      }
    }

    if (this.imagesToShow.length > 0) {
      this.currentImage = this.imagesToShow[0];
    }
    this.openImageModal();
  }

  // openImage(data: any) {
  //   var image = new Image(1000, 700);
  //   image.src = data;

  //   window.open("")?.document.write(image.outerHTML);
  // }

  setImages(data: any) {

    if (data.sdocument && data.sdocument.images) {
      this.showImages(data.sdocument.images)
    } else if (data.idocument && data.idocument.images) {
      this.showImages(data.idocument.images)
    }
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
    data._id = null;
    this.editData = data;
    this.showModal = "Add Jawak";
    $('#showModal').modal('show');
  }

  addJawakResponse(ev: any) {
    // this.isLoader = true;

    let i = this.bachatData.findIndex((b: any) => b.dept_id == ev.dept_id && b.item_id == ev.item_id && (b.subitem_id == ev.subitem_id || !ev.subitem_id) && b.mm_id == ev.mm_id);

    if (i >= 0) {
      if (ev.jawak_type_eng == "Used") {
        this.bachatData[i].Used = (this.bachatData[i].Used ? this.bachatData[i].Used : 0) + ev.qty;
      }
      this.bachatData[i].Stock = (this.bachatData[i].Stock ? this.bachatData[i].Stock : 0) - ev.qty;

      if (this.bachatData[i].Used == 0 && this.bachatData.Stock == 0) {
        this.bachatData.splice(i, 1);
      }
    }

    $('#showModal').modal('hide');
    this.showModal = '';

    // this.isLoader = false;
  }

  excelExport() {
    this.isLoader = true;
    let bchtData: any = [];
    for (let i = 0; i < this.bachatData.length; i++) {
      bchtData.push({
        'No.': i + 1,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Item': this.bachatData[i].item_id ? this.bachatData[i].item_hin : '-',
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'Used': this.bachatData[i].Used ? this.bachatData[i].Used : '-',
        'New': this.bachatData[i].New ? this.bachatData[i].New : '-',
        'Old': this.bachatData[i].Old ? this.bachatData[i].Old : '-',
        'In Repair': this.bachatData[i].Repairing ? this.bachatData[i].Repairing : '-',
        'Defective': this.bachatData[i].Defective ? this.bachatData[i].Defective : '-',
        'Scrap': this.bachatData[i].Scrap ? this.bachatData[i].Scrap : '-',
        'Total Stock': this.bachatData[i].Stock ? this.bachatData[i].Stock : '-',
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-'
      });
    }
    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Jawak_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }


  filter() {
    this.bachatData = this.bachatAll;
    for (let [key, value] of Object.entries(this.conditionObj)) {
      if (value)
        this.bachatData = this.bachatData.filter((b: any) => {
          if (key == "category_id") {
            if (b.scategories && b.scategories.length > 0) {
              console.log(b.scategories, value);

              return b.scategories.includes(value);
            }
            else {
              console.log(b.icategories, value);
              return b.icategories.includes(value);
            }
          }
          else {
            return b[key] == value;
          }
        });

    }
  }

  filterFormSubmit(formdata: any) {
    if (formdata) {
      console.log("formdata", formdata);
    }
    else {
      this.toastr.error('All Fields are Empty.');
    }
  }

}

