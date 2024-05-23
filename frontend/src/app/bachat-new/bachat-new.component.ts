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
  subitems: any = [];
  // conditionObj: any = {};
  filterBody: any = {
    mm_id: null,
    state_id: null,
    category_id: null,
    item_id: null,
    subitem_id: null,
    year: null,
    months: []
  };
  images: any = [];
  imageNames: any = [];
  settings: any = {};
  imagesToShow: any = [];
  currentImage: any;
  months: any = [];
  monthsSel: any = []
  clickOperation: any = 1;
  operationList: any = [
    { key: 'condition_wise', name: 'Condition Wise' },
    { key: 'awk_type_wise', name: 'A/J Type Wise' },
  ]
  subBachatData: any = []

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
    // this.months = gs.months;
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
    // this.filterBody.year = 2024;
    // this.gs.yearChangedGetMonth(2024);
    // this.filterBody.months = [3, 1];
    // this.filter();
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
        for (let i in this.bachatAll) {
          this.bachatAll[i].categories_hin = '';
          this.bachatAll[i].categories_eng = '';
          if (this.bachatAll[i].arr_subitem_categories && this.bachatAll[i].arr_subitem_categories.length > 0) {
            for (let j in this.categories) {
              if (this.bachatAll[i].arr_subitem_categories.includes(this.categories[j]._id)) {
                this.bachatAll[i].categories_hin += this.categories[j].category_hin + ', ';
                this.bachatAll[i].categories_eng += this.categories[j].category_eng + ', ';
              }
            }
          } else {
            for (let j in this.categories) {
              if (this.bachatAll[i].arr_item_categories.includes(this.categories[j]._id)) {
                this.bachatAll[i].categories_hin += this.categories[j].category_hin + ', ';
                this.bachatAll[i].categories_eng += this.categories[j].category_eng + ', ';
              }
            }
          }
        }
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
    if (ev) {
      this.mms = this.gs.Lists.mm.filter((b: { state_id: any; }) => b.state_id == ev);
    }
    else {
      this.mms = this.gs.Lists.mm;
    }

    this.filter();
  }

  catSelected(ev: any) {
    if (ev) {
      this.items = this.gs.Lists.itemmix.filter((i: { categories: string | any[]; }) => i.categories.includes(ev));
    }
    else {
      this.items = this.gs.Lists.itemmix;
    }
    this.filter();
  }

  itemSelected(ev: any) {
    if (ev) {
      let item = this.items.find((i: { _id: any; }) => i._id == ev);

      if (this.filterBody.category_id && item) {
        this.subitems = item.subitems.filter((s: { categories: string | any[]; }) => s.categories.includes(this.filterBody.category_id));
      } else {
        this.subitems = item.subitems ? item.subitems : [];
      }
    } else {
      this.subitems = [];
    }
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

  excelExportBachatOnly() {
    this.isLoader = true;
    let bchtData: any = [];
    let conditionTotals: any = {}; // Object to store condition totals
    let uniqueMM = new Set();
    let uniqueUnit = new Set();
    let wholeTotal = 0;

    for (let i = 0; i < this.bachatData.length; i++) {
      uniqueMM.add(this.bachatData[i].mm_id);
      uniqueUnit.add(this.bachatData[i].unit_id);

      let bachatRow: any = {
        'No.': i + 1,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.bachatData[i].categories_hin,
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-',
      }

      for (let j in this.conditions) {
        let qty = '0';
        for (let k in this.bachatData[i].arr_condition_id) {
          if (this.conditions[j]._id == this.bachatData[i].arr_condition_id[k]) {
            qty = this.bachatData[i].arr_sum_bachat[k] ? this.bachatData[i].arr_sum_bachat[k] : 0;
            conditionTotals[this.conditions[j].list_name_hin] = (conditionTotals[this.conditions[j].list_name_hin] || 0) + parseFloat(qty); // Update or initialize condition total
          }
        }
        bachatRow[this.conditions[j].list_name_hin] = qty;
      }
      bachatRow['टोटल बचत'] = this.bachatData[i].total_bachat_all ? this.bachatData[i].total_bachat_all : 0;
      wholeTotal += bachatRow['टोटल बचत'];
      bchtData.push(bachatRow);
    }

    // Add a footer row with condition totals
    const footerRow: any = {};
    footerRow['No.'] = '*';
    footerRow['State'] = 'Total'
    footerRow['MM'] = uniqueMM.size + ' MMs'
    footerRow['Unit'] = uniqueUnit.size + ' Units'
    footerRow['टोटल बचत'] = wholeTotal;
    for (const condition in this.conditions) {
      footerRow[this.conditions[condition].list_name_hin] = conditionTotals[this.conditions[condition].list_name_hin] || 0;
    }
    bchtData.push(footerRow);


    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Bachat_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  excelExportFull() {
    this.isLoader = true;
    let bchtData: any = [];
    for (let i = 0; i < this.bachatData.length; i++) {

      let bachatRow: any = {
        'No.': i + 1,
        'टोटल बचत': this.bachatData[i].total_bachat_all ? this.bachatData[i].total_bachat_all : 0,
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-',
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.bachatData[i].categories_hin,
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
      }
      for (let j in this.conditions) {
        let aawak = 0, jawak = 0, used = 0, bachat = 0;
        for (let k in this.bachatData[i].arr_condition_id) {
          if (this.conditions[j]._id == this.bachatData[i].arr_condition_id[k]) {
            aawak = this.bachatData[i].arr_sum_aawak[k] ? this.bachatData[i].arr_sum_aawak[k] : 0;
            jawak = this.bachatData[i].arr_sum_jawak[k] ? this.bachatData[i].arr_sum_jawak[k] : 0;
            used = this.bachatData[i].arr_sum_used[k] ? this.bachatData[i].arr_sum_used[k] : 0;
            bachat = this.bachatData[i].arr_sum_bachat[k] ? this.bachatData[i].arr_sum_bachat[k] : 0;
          }
        }
        bachatRow[this.conditions[j].list_name_hin + "_आवक"] = aawak;
        bachatRow[this.conditions[j].list_name_hin + "_यूज"] = used;
        bachatRow[this.conditions[j].list_name_hin + "_जावक"] = jawak;
        bachatRow[this.conditions[j].list_name_hin + "_बचत"] = bachat;
      }
      bachatRow['यूनिट'] = this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-';
      bchtData.push(bachatRow);
    }
    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Bachat_Full_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  excelExportSaar() {
    this.isLoader = true;
    let bchtData: any = [];
    let footerRow: any = {
      'No.': '*',
      'State': 'Total',
      'टोटल आवक': 0,
      'घर मे यूज': 0,
      'टोटल जावक': 0,
      'बचत': 0,
    }; // Object to store totals for footer
    let uniqueMM = new Set();
    let uniqueUnit = new Set();

    for (let i = 0; i < this.bachatData.length; i++) {
      uniqueMM.add(this.bachatData[i].mm_id);
      uniqueUnit.add(this.bachatData[i].unit_id);

      let bachatRow: any = {
        'No.': i + 1,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.bachatData[i].categories_hin,
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'टोटल आवक': this.bachatData[i].total_aawak_all ? this.bachatData[i].total_aawak_all : 0,
        'घर मे यूज': this.bachatData[i].total_used_all ? this.bachatData[i].total_used_all : 0,
        'टोटल जावक': this.bachatData[i].total_jawak_all ? this.bachatData[i].total_jawak_all : 0,
        'बचत': this.bachatData[i].total_bachat_all ? this.bachatData[i].total_bachat_all : 0,
        'Unit': this.bachatData[i].unit_id ? this.bachatData[i].unit_short : '-',
      }

      footerRow['टोटल आवक'] += bachatRow['टोटल आवक'];
      footerRow['घर मे यूज'] += bachatRow['घर मे यूज'];
      footerRow['टोटल जावक'] += bachatRow['टोटल जावक'];
      footerRow['बचत'] += bachatRow['बचत'];

      bchtData.push(bachatRow);
    }

    // Add a footer row with condition totals
    footerRow['MM'] = uniqueMM.size + ' MMs'
    footerRow['Unit'] = uniqueUnit.size + ' Units'
    bchtData.push(footerRow);


    let date = new Date();
    this.excelExportService.exportAsExcelFile(bchtData, "Bachat_Full_" + this.auth.webUser.dept_eng + '_' + date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear() + '.xlsx');
    this.isLoader = false;
  }

  excelExportMonthlyMain() {
    this.isLoader = true;
    let bchtData: any = [];
    for (let i = 0; i < this.bachatData.length; i++) {

      let bachatRow: any = {
        'No.': i + 1,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.bachatData[i].categories_eng ? this.bachatData[i].categories_eng : this.bachatData[i].categories_hin,
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'unit': this.bachatData[i].unit_short,
        'पिछला बचत': this.bachatData[i].past_bachat ? this.bachatData[i].past_bachat : 0,
        'arr_sum_aawak': this.bachatData[i].arr_sum_aawak ? this.bachatData[i].arr_sum_aawak : [],
        'arr_sum_used': this.bachatData[i].arr_sum_used ? this.bachatData[i].arr_sum_used : [],
        'arr_sum_jawak': this.bachatData[i].arr_sum_jawak ? this.bachatData[i].arr_sum_jawak : [],
        'arr_sum_bachat': this.bachatData[i].arr_sum_bachat ? this.bachatData[i].arr_sum_bachat : [],
        'arr_comment': this.bachatData[i].arr_comment ? this.bachatData[i].arr_comment : [],
      }
      bchtData.push(bachatRow);
    }
    let option: any = {};
    option.months = this.monthsSel;
    option.year = this.filterBody.year;

    let mm: any = null;
    if (this.filterBody.mm_id) {
      mm = this.mms.find((m: { _id: any; }) => m._id == this.filterBody.mm_id)
    }
    this.excelExportService.generateReportExcel(bchtData, (mm ? mm.mm_hin : null), option);
    this.isLoader = false;
  }

  async excelExportMonthlyConditionWise() {
    this.isLoader = true;
    let bchtData: any = [];
    for (let i = 0; i < this.bachatData.length; i++) {

      let bachatRow: any = {
        'No.': i + 1,
        'Department': this.bachatData[i].dept_hin ? this.bachatData[i].dept_hin : '-',
        'State': this.bachatData[i].state_hin ? this.bachatData[i].state_hin : '-',
        'MM': this.bachatData[i].mm_hin,
        'Category': this.bachatData[i].categories_eng ? this.bachatData[i].categories_eng : this.bachatData[i].categories_hin,
        'Item': this.bachatData[i].item_hin,
        'Subitem': this.bachatData[i].subitem_id ? this.bachatData[i].subitem_hin : '-',
        'unit': this.bachatData[i].unit_short,
        'पिछला बचत': this.bachatData[i].past_bachat ? this.bachatData[i].past_bachat : 0,
        'arr_sum_bachat': this.bachatData[i].arr_sum_bachat,
      }

      await new Promise<void>((resolve, reject) => {
        this.http.put(this.api.getUrl('BACHATNEW') + 'condition/' + this.auth.webUser.dept_id, this.bachatData[i]).subscribe(async (data: any) => {
          if (data['result'] && data['success']) {
            bachatRow.arr_conditionReport = data['result'];
          }
          resolve(); // Resolve the promise when the HTTP request is complete
        });
      });

      bchtData.push(bachatRow);
    }
    let option: any = {};
    option.months = this.monthsSel;
    option.year = this.filterBody.year;

    let mm: any = null;
    if (this.filterBody.mm_id) {
      mm = this.mms.find((m: { _id: any; }) => m._id == this.filterBody.mm_id)
    }

    console.log("bachat", bchtData);

    this.excelExportService.generateConditionWiseReport(bchtData, this.conditions, (mm ? mm.mm_hin : "report"), option);
    this.isLoader = false;
  }


  filter() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('BACHATNEW') + 'filter/' + this.auth.webUser.dept_id, this.filterBody).subscribe(async (data: any) => {
      if (data['result'] && data['success']) {

        this.bachatAll = data['result'];

        if (this.filterBody.months.length > 0) {
          this.monthsSel = this.gs.months.filter((m: { m: any; }) => data['months'].includes(m.m));

        }
        else {
          this.monthsSel = []
        }

        for (let i in this.bachatAll) {
          this.bachatAll[i].showTooltip = {};
          this.bachatAll[i].categories_hin = '';
          this.bachatAll[i].categories_eng = '';
          if (this.bachatAll[i].arr_subitem_categories && this.bachatAll[i].arr_subitem_categories.length > 0) {
            for (let j in this.categories) {
              if (this.bachatAll[i].arr_subitem_categories.includes(this.categories[j]._id)) {
                this.bachatAll[i].categories_hin += this.categories[j].category_hin + ', ';
                this.bachatAll[i].categories_eng += this.categories[j].category_eng + ', ';
              }
            }
          } else {
            for (let j in this.categories) {
              if (this.bachatAll[i].arr_item_categories.includes(this.categories[j]._id)) {
                this.bachatAll[i].categories_hin += this.categories[j].category_hin + ', ';
                this.bachatAll[i].categories_eng += this.categories[j].category_eng + ', ';
              }
            }
          }
        }
        this.bachatData = this.bachatAll;
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  filterFormSubmit(formdata: any) {
    if (formdata) {

    }
    else {
      this.toastr.error('All Fields are Empty.');
    }
  }


  rowClicked(row: any, i: any) {
    row.months = this.filterBody.months;
    this.http.put(this.api.getUrl('BACHATNEW') + 'condition/' + this.auth.webUser.dept_id, row).subscribe(async (data: any) => {
      if (data['result'] && data['success']) {
        this.bachatData[i].condition_wise = data['result'];
        this.bachatData[i].awk_type_wise = data['awk'];

        if (this.bachatData[i].condition_wise.length > 0 || this.bachatData[i].awk_type_wise.length > 0) {
          this.bachatData[i].subReport = true;
          this.bachatData[i].currentReport = 'condition_wise';
        } else {
          this.bachatData[i].subReport = false;
        }
      }
    });
  }

  operationClick(key: any, i: any) {
    if (this.bachatData[i][key] && this.bachatData[i][key].length > 0) {
      this.bachatData[i].currentReport = key;
    }
  }

  editComment(index: any, month: any, data: any, row_type: any, sindex: any = -1) {

    Swal.fire({
      title: 'Enter Comment',
      input: 'textarea',
      inputPlaceholder: 'comment',
      showCancelButton: true,
      confirmButtonText: 'Save',
      showDenyButton: true,
      denyButtonText: 'Delete',
      inputValue: data.arr_comment[month]
    }).then((result) => {
      if (result.isConfirmed) {
        // User clicked the Submit button and provided a name

        if (data.arr_comment_id[month]) {
          let body = {
            _id: data.arr_comment_id[month],
            comment: result.value
          }
          this.http.put(this.api.getUrl('COMMENT') + data.arr_comment_id[month], body).subscribe(async (res: any) => {
            if (res.success) {
              this.toastr.success("comment Updated.")

              if (sindex >= 0) {
                this.bachatData[index][this.bachatData[index].currentReport][sindex].arr_comment[month] = result.value;
              } else {
                this.bachatData[index].arr_comment[month] = result.value;
              }
            }
            else
              this.toastr.error("something went wrong");
          });

        } else {
          data.comment = result.value;
          data.month = this.monthsSel[month].m;
          data.report_type = 'full_saar';
          data.row_type = row_type;
          if (this.bachatData[index].currentReport == 'awk_type_wise') {
            data.type_id = data.aawak_type_id;
          } else if (this.bachatData[index].currentReport == 'condition_wise') {
            data.type_id = data.condition_id;
          } else {
            data.type_id = null;
          }
          this.http.post(this.api.getUrl('COMMENT') + this.auth.webUser.dept_id, data).subscribe(async (res: any) => {
            this.toastr.success("comment added : " + res.result.comment);
            if (sindex >= 0) {
              this.bachatData[index][this.bachatData[index].currentReport][sindex].arr_comment[month] = res.result.comment;
              this.bachatData[index][this.bachatData[index].currentReport][sindex].arr_comment_id[month] = res.result._id;
            } else {
              this.bachatData[index].arr_comment[month] = res.result.comment;
              this.bachatData[index].arr_comment_id[month] = res.result._id;
            }
          });
        }
      } else if (result.isDenied) {
        if (data.arr_comment_id[month]) {
          this.http.delete(this.api.getUrl('COMMENT') + data.arr_comment_id[month]).subscribe(async (res: any) => {
            this.toastr.success("comment Deleted");
            if (sindex >= 0) {
              this.bachatData[index][this.bachatData[index].currentReport][sindex].arr_comment[month] = null;
              this.bachatData[index][this.bachatData[index].currentReport][sindex].arr_comment_id[month] = null;
            } else {
              this.bachatData[index].arr_comment[month] = null;
              this.bachatData[index].arr_comment_id[month] = null;
            }
          });
        } else {
          this.toastr.warning('There is no any comment exists.')
        }
      }
    }).catch((error) => {
      // An error occurred
      this.toastr.error('Error:', error);
    });

  }

  toggleEditMode(i: number, m: number): void {
    this.bachatData[i].editMode = this.bachatData[i].editMode ? this.bachatData[i].editMode : [];
    this.bachatData[i].editMode[m] = !this.bachatData[i].editMode[m];
  }

  // Function to handle changes in the textarea input
  handleInputChange(i: number, m: number): void {
    this.bachatData[i].commentChanged = this.bachatData[i].commentChanged ? this.bachatData[i].commentChanged : [];
    this.bachatData[i].commentChanged[m] = true;
  }

}

