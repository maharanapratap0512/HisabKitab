import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx';
declare var $: any;

@Component({
   selector: 'app-main-entry',
   templateUrl: './main-entry.component.html',
   styleUrls: ['./main-entry.component.scss'],
   providers: [DatePipe]
})
export class MainEntryComponent implements OnInit {
   // [x: string]: any;

   term: any;
   entryForm: FormGroup;
   entryFormData: any = [];
   isLoader: boolean = false;
   total_count: any;
   editId: any;
   qnt: any;
   rate: any;
   amnt: any;
   mmFormData: any = [];
   itemFormData: any = [];
   pbkList: any = [];
   awakTypeData: any = [];
   unitFormData: any = [];
   states: any = [];
   subitemFormData: any = [];
   jawak_detail: FormArray;
   inputFile: any;
   skippeddata: any = [];
   duplicatedata: any = [];
   totaldata: any = [];
   finaldata: any = [];
   excel_aawak_mm: any;
   tempdata: any = [];
   correctiondata: any = [];
   itemcorrection: any;
   datatobeimported: any = [];
   entity: any = 0;
   entityDesc: any = 0;
   // showtag: boolean = false;
   // jawak_detail: FormArray;
   // jawakqnt: any;

   constructor(
      private fb: FormBuilder,
      private http: HttpService,
      private api: ApiService,
      public gs: GlobalService,
      private toastr: ToastrService,
      private spinner: NgxSpinnerService,
      private datepipe: DatePipe
   ) {
      this.entryForm = this.fb.group({
         parchi_no: [null],
         pbk_id: [null, Validators.required],
         date: [null, Validators.required],
         item_id: [null, Validators.required],
         subitem_id: [null],
         unit_id: [null, Validators.required],
         item_detail: [null],
         quantity: [null, [Validators.required, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]],
         rate: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")],
         amount: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")],
         aawak_itemtype: [null, Validators.required],
         jawak_detail: this.fb.array([this.fb.group({
            jawak_mm_id: [null],
            jawak_quantity: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]
         })]),
         aawak_mm_id: [null, Validators.required],
         desc: [null],
         active: ['true', Validators.required],
         hl: [null],
         // verified: false
      })
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
   }

   ngOnInit(): void {
      this.spinner.show();
      this.getEntryData();
      this.getMM();
      this.getItems();
      // this.getSubitems();
      this.getPbkData();
      this.getItemtypes();
      this.getUnitData();
      this.getState();
      this.getExcelData();

   }

   forminit() {
      this.entryForm = this.fb.group({
         parchi_no: [this.entryForm.value.parchi_no],
         pbk_id: [this.entryForm.value.pbk_id, Validators.required],
         date: [this.entryForm.value.date, Validators.required],
         aawak_mm_id: [this.entryForm.value.aawak_mm_id, Validators.required],
         item_id: [null, Validators.required],
         subitem_id: [null],
         unit_id: [null, Validators.required],
         item_detail: [null],
         quantity: [null, [Validators.required, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]],
         rate: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")],
         amount: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")],
         aawak_itemtype: [null, Validators.required],
         jawak_detail: this.fb.array([this.fb.group({
            jawak_mm_id: [null],
            jawak_quantity: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$")]
         })]),
         desc: [null],
         active: ['true', Validators.required],
         hl: [null],
         // verified: false
      })
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
   }

   getEntryData() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('ENTRY')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.entryFormData = data['result'];
            this.total_count = data['total_count'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getItems() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('ITEM')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.itemFormData = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getSubitems() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('SUBITEM')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.subitemFormData = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getPbkData() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('PBK')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.pbkList = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }


   getMM() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('MM')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.mmFormData = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getUnitData() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('UNIT')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.unitFormData = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getItemtypes() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('ITEMTYPE') + '/' + 'Aawak').subscribe((data) => {
         if (data['result'] && data['success']) {
            this.awakTypeData = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getState() {
      // this.isLoader = true;
      this.http.get(this.api.getUrl('STATE')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.states = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      })
   }

   entryFormSubmit() {
      if (this.entryForm.valid) {
         this.isLoader = true;
         let body = {
            parchi_no: this.entryForm.value.parchi_no,
            pbk_id: this.entryForm.value.pbk_id,
            date: this.entryForm.value.date,
            item_id: this.entryForm.value.item_id,
            subitem_id: this.entryForm.value.subitem_id,
            unit_id: this.entryForm.value.unit_id,
            item_detail: this.entryForm.value.item_detail,
            quantity: this.entryForm.value.quantity,
            rate: this.entryForm.value.rate,
            amount: this.entryForm.value.amount,
            aawak_itemtype: this.entryForm.value.aawak_itemtype,
            jawak_mm_id: this.entryForm.value.jawak_mm_id,
            aawak_mm_id: this.entryForm.value.aawak_mm_id,
            desc: this.entryForm.value.desc,
            active: this.entryForm.value.active,
            hl: this.entryForm.value.hl,
         };
         // console.log("this.entryForm.value", this.entryForm.value);
         this.http.put(this.api.getUrl('ENTRY'), this.entryForm.value).subscribe((data: any) => {
            if (data['result'] && data['success']) {
               this.entryFormData.unshift(data['result']);
               this.total_count += 1;
               this.qnt = null;
               this.rate = null;
               this.amnt = null;
               this.softclear();
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error(data['message']);
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });
      }
      else {
         this.gs.validationFireOnSubmit(this.entryForm);
         if (this.entryForm.controls.jawak_detail.invalid) {
            this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
            for (let i in this.jawak_detail.controls) {
               this.jawak_detail.controls[i].markAsTouched();
               this.gs.validationFireOnSubmit(<FormGroup>this.jawak_detail.controls[i]);
            }
         }
      }
   }

   edit(data: any) {
      this.getPbkData();
      $('#editEntry').modal('show');
      this.editId = data._id
      this.entryForm.patchValue({
         parchi_no: data.parchi_no,
         pbk_id: data.pbk_id,
         date: this.datepipe.transform(new Date(data.date), 'yyyy-MM-dd'),
         item_id: data.item_id,
         subitem_id: data.subitem_id,
         unit_id: data.unit_id,
         item_detail: data.item_detail,
         quantity: data.quantity,
         rate: data.rate,
         amount: data.amount,
         aawak_itemtype: data.aawak_itemtype,
         // jawak_detail: data.jawak_detail,
         aawak_mm_id: data.aawak_mm_id,
         desc: data.desc,
         active: data.active,
         hl: data.hl,
      });
      this.entryForm.setControl('jawak_detail', this.setJawakDetails(data.jawak_detail));
   }


   entryEditSubmit() {
      if (this.entryForm.valid) {
         this.isLoader = true;
         let body = {
            _id: this.editId,
            parchi_no: this.entryForm.value.parchi_no,
            pbk_id: this.entryForm.value.pbk_id,
            date: this.entryForm.value.date,
            item_id: this.entryForm.value.item_id,
            subitem_id: this.entryForm.value.subitem_id,
            unit_id: this.entryForm.value.unit_id,
            item_detail: this.entryForm.value.item_detail,
            quantity: this.entryForm.value.quantity,
            rate: this.entryForm.value.rate,
            amount: this.entryForm.value.amount,
            aawak_itemtype: this.entryForm.value.aawak_itemtype,
            jawak_detail: this.entryForm.value.jawak_detail,
            aawak_mm_id: this.entryForm.value.aawak_mm_id,
            desc: this.entryForm.value.desc,
            active: this.entryForm.value.active,
            hl: this.entryForm.value.hl
         };
         this.http.post(this.api.getUrl('ENTRY'), body).subscribe((data: any) => {
            if (data['success']) {
               this.getEntryData();
               $('#editEntry').modal('hide');
               this.qnt = null;
               this.rate = null;
               this.amnt = null;
               this.softclear();
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error(data['message']);
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });
      }
      else {
         this.gs.validationFireOnSubmit(this.entryForm);
         if (this.entryForm.controls.jawak_detail.invalid) {
            this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
            for (let i in this.jawak_detail.controls) {
               this.jawak_detail.controls[i].markAsTouched();
               this.gs.validationFireOnSubmit(<FormGroup>this.jawak_detail.controls[i]);
            }
         }
      }
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
            this.http.delete(this.api.getUrl('ENTRY') + '/' + id).subscribe((data: any) => {
               if (data['success']) {
                  this.isLoader = false;
                  this.entryFormData.splice(i, 1);
                  this.total_count -= 1;
                  this.toastr.success(data['message']);
               }
               else {
                  this.toastr.error(data['message']);
                  this.isLoader = false;
               }
               // Swal.fire(
               //    'Deleted!',
               //    'Your file has been deleted.',
               //    'success'
               // )
            });
         }
      })
   }

   patchUnit(event: any) {
      if (event) {
         let body = {
            item_id: event
         }
         this.http.post(this.api.getUrl('UNITBYITEM'), body).subscribe((data: any) => {
            if (data['result'] && data['success']) {
               this.entryForm.patchValue({
                  unit_id: data['result'].default_unit
               })
               this.isLoader = false;
            }
            this.isLoader = false;
         });
      }
   }

   pbkbystate(event: any) {
      let body = {
         state_id: event
      }
      this.http.post(this.api.getUrl('PBKBYSTATE'), body).subscribe((data: any) => {
         if (data['result'] && data['success']) {
            this.pbkList = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }


   qntclick() {
      if (this.qnt && this.rate) {
         let amount = this.qnt * this.rate
         this.entryForm.patchValue({
            amount: amount.toFixed(2)
         });
      }
      else if (this.qnt && this.amnt) {
         let rate = this.amnt / this.qnt
         this.entryForm.patchValue({
            rate: rate.toFixed(2)
         });
      }
   }

   rateclick() {
      if (this.qnt && this.rate) {
         let amount = this.qnt * this.rate;
         this.entryForm.patchValue({
            amount: amount.toFixed(2)
         });
      }
      else if (this.rate && this.amnt) {
         let quantity = this.amnt / this.rate;
         this.entryForm.patchValue({
            quantity: quantity.toFixed(2)
         });
         this.qnt = quantity;
      }
   }

   amntclick() {
      if (this.qnt && this.amnt) {
         let rate = this.amnt / this.qnt
         this.entryForm.patchValue({
            rate: rate.toFixed(2)
         });
      }
      else if (this.rate && this.amnt) {
         let quantity = this.amnt / this.rate
         this.entryForm.patchValue({
            quantity: quantity.toFixed(2)
         });
      }
   }

   clear() {
      this.qnt = null;
      this.rate = null;
      this.amnt = null;
   }

   patchSubitem(event: any) {
      if (event) {
         let body = {
            item_id: event
         }
         this.http.post(this.api.getUrl('SUBITEMBYITEM'), body).subscribe((data: any) => {
            if (data['result'] && data['success']) {
               this.subitemFormData = data['result'];
               this.isLoader = false;
            }
            this.isLoader = false;
         });
      }
   }

   patchItem(event: any, isCorrection: boolean, i: any) {
      if (event) {
         let body = {
            subitem_id: event
         }
         this.http.post(this.api.getUrl('ITEMBYSUBITEM'), body).subscribe((data: any) => {
            if (data['result'] && data['success']) {
               if (isCorrection) {
                  this.correctiondata[i].item_id = data['result'].item_id;
                  this.isLoader = false;
               }
               else {
                  this.entryForm.patchValue({
                     item_id: data['result'].item_id
                  });
                  this.isLoader = false;
               }
               this.isLoader = false;
            }
         });
      }
   }

   highlight(event: any, data: any) {
      if (event) {
         data.hl = event.currentTarget.checked
         this.http.post(this.api.getUrl('ENTRY'), data).subscribe((data: any) => {
            if (data['success']) {
               for (let i in this.entryFormData) {
                  if (this.entryFormData[i]._id == data._id) {
                     this.entryFormData[i].hl = !this.entryFormData[i].hl;
                  }
               }
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error(data['message']);
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });
      }
   }

   createJawakDetails(): FormGroup {
      return this.fb.group({
         jawak_mm_id: [null, Validators.required],
         jawak_quantity: [null, Validators.pattern("^[0-9]+(\.[0-9]{1,2})?$"), Validators.required]
      });
   }

   setJawakDetails(jawakdetailset: any): FormArray {
      const formArray = new FormArray([]);
      jawakdetailset.forEach((s: any, i: any) => {
         formArray.push(this.fb.group({
            jawak_mm_id: s.jawak_mm_id,
            jawak_quantity: s.jawak_quantity,
            jawak_mm_eng: s.jawak_mm_eng,
            jawak_mm_hin: s.jawak_mm_hin
         }));
         // this.jawakqnt = jawakdetailset[0].jawak_quantity
      });
      return formArray;
   }

   addJawakDetails(): void {
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
      this.jawak_detail.push(this.createJawakDetails());
   }

   get formJawakDetails() { return <FormArray>this.entryForm.get('jawak_detail'); }

   removeJawakDetails(index: any) {
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
      this.jawak_detail.removeAt(index);
   }

   softclear() {
      this.entryForm.reset(
         {
            active: true,
            parchi_no: this.entryForm.value.parchi_no,
            pbk_id: this.entryForm.value.pbk_id,
            date: this.entryForm.value.date,
            aawak_mm_id: this.entryForm.value.aawak_mm_id
         }
      );
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
      this.jawak_detail.clear();
      this.forminit();
      // this.jawak_detail.push(this.fb.array([this.fb.group({
      //    jawak_mm_id: [null],
      //    jawak_quantity: [null]
      // })]));
      // this.entryForm = this.fb.group({
      //    jawak_detail: this.fb.array([this.fb.group({
      //       jawak_mm_id: [null],
      //       jawak_quantity: [null]
      //    })]),
      // })
      // this.jawakqnt = null;
   }

   clearall() {
      this.entryForm.reset({ active: true });
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
      this.jawak_detail.clear();
      this.forminit();
   }

   jawakmmclick() {
      // this.jawakqnt = this.qnt;
      this.jawak_detail = this.entryForm.get('jawak_detail') as FormArray;
      this.jawak_detail.controls[0].value.jawak_quantity = this.qnt;
      this.jawak_detail.controls[0].patchValue({
         jawak_quantity: this.qnt
      })
      // console.log("fiii00", this.jawak_detail.controls[0]);
      // for (let i in this.jawak_detail.controls) { }
   }

   importEntryExcel(ev: any) {
      let workBooks: any = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
         const data = reader.result;
         workBooks = XLSX.read(data, { type: 'binary' });
         jsonData = workBooks.SheetNames.reduce((initial: any, name: any) => {
            const sheet = workBooks.Sheets[name];
            initial[name] = XLSX.utils.sheet_to_json(sheet);
            return initial;
         }, {});
         const dataString = JSON.stringify(jsonData);
         let exceldata = jsonData[workBooks.SheetNames[0]];
         console.log("exceldata", exceldata);
         this.http.put(this.api.getUrl('TEMPENTRY'), exceldata).subscribe((data: any) => {
            if (data['success']) {
               this.tempdata = data['result'];
               this.resultModal();
               this.correctionList();
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error(data['message']);
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });

      }
      reader.readAsBinaryString(file);
      ev = '';
   }

   resultModal() {
      $('#result').modal('show');
   }
   nexttab() {
      // $('.nav-item a[href="#exceldata"]').tab('hide');
      $('.nav-item a[href="#next"]').tab('show');
   }

   getExcelData() {
      this.isLoader = true;
      this.http.get(this.api.getUrl('TEMPENTRY')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.tempdata = data['result'];
            this.correctionList();
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   getDataToBeImported() {
      this.isLoader = true;
      this.http.get(this.api.getUrl('TEMPENTRYTOBEIMPORTED')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.datatobeimported = data['result'];
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   correctionList() {
      this.isLoader = true;
      this.http.get(this.api.getUrl('TEMPENTRYCORRECTION')).subscribe((data) => {
         if (data['result'] && data['success']) {
            this.correctiondata = data['result'];
            this.correctiondata.map((x: any) => x.isCorrected = false);
            this.isLoader = false;
         }
         this.isLoader = false;
      });
   }

   setAawakMM(aawakmm: any) {
      if (aawakmm) {
         let arr = aawakmm.split(':');
         this.http.post(this.api.getUrl('TEMPENTRYUPDATE'), { condition: {}, query: { aawak_mm: arr[0], aawak_mm_id: arr[1] } }).subscribe((data: any) => {
            if (data['success']) {
               this.getExcelData();
               this.getDataToBeImported();
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error(data['message']);
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });
      }
   }




















   subitemCorrection(event: any, data: any, i: any) {
      if (event) {
         let body = {
            Subitem: data.text,
            item_detail: data.detail ? data.detail.trim() : null,
            subitem_id: event,
            type: "Subitem"
         }
         this.http.post(this.api.getUrl('TEMPENTRYCORRECTION'), body).subscribe((data: any) => {
            if (data['success'] && data['result']['acknowledged']) {
               this.correctiondata[i].isCorrected = true;
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error("Data Update, Failed!");
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });
      }
   }

   makeCorrection(event: any, bodydata: any, i: any) {
      if (event) {
         let body = {}
         switch (bodydata.type) {

            case "Pbk":
               let arr = bodydata.text.split(':');
               body = {
                  Roll_no: arr[0].trim() == '-' ? null : arr[0].trim(),
                  Name: arr[1].trim(),
                  RelationName: arr[2].trim(),
                  pbk_id: event,
                  type: bodydata.type
               }
               break;

            case "Item":
               body = {
                  Item: bodydata.text,
                  item_detail: bodydata.detail ? bodydata.detail.trim() : null,
                  item_id: event,
                  type: bodydata.type
               }
               break;

            case "Aawak Type":
               body = {
                  aawak_itemtype: bodydata.text.trim(),
                  aawak_itemtype_id: event,
                  type: bodydata.type
               }
               break;

            case "Jawak MM":
               body = {
                  jawak_mm: bodydata.text.trim(),
                  jawak_mm_id: event,
                  type: bodydata.type
               }
               break;

            case "Unit":
               body = {
                  Unit: bodydata.text,
                  unit_id: event,
                  type: bodydata.type
               }
               break;

            default:
         }
         this.http.post(this.api.getUrl('TEMPENTRYCORRECTION'), body).subscribe((data: any) => {
            if (data['success'] && data['result']['acknowledged']) {
               if (bodydata.type != 'Item' || (bodydata.type == 'Item' && bodydata.text.split(':').length != 3)) {
                  this.correctiondata[i].isCorrected = true;
               }
               else {
                  this.correctiondata[i].itemverified = true;
               }
               this.isLoader = false;
               this.toastr.success(data['message']);
            } else {
               this.isLoader = false;
               this.toastr.error("Data Update, Failed!");
            }
         }, err => {
            this.toastr.error(err['message']);
            this.isLoader = false;
         });
      }
   }

   toggleDetailTag(i: any, tag: any) {
      this.entity = i;
   }

   tempEntryUpdate(ev: any, i: any, id: any, field: any) {
      if (ev) {

         if (ev.trim() != this.datatobeimported[i][field]) {
            this.http.post(this.api.getUrl('TEMPENTRYUPDATE'), { condition: { _id: id }, query: { [field]: ev } }).subscribe((data: any) => {
               if (data['success'] && field == 'item_detail') {
                  this.datatobeimported[i].item_detail = ev;
                  this.isLoader = false;
                  this.toastr.success(data['message']);
               }
               else if (data['success'] && field == 'desc') {
                  this.datatobeimported[i].desc = ev;
                  this.isLoader = false;
                  this.toastr.success(data['message']);
               }
               else if (data['success'] && field == 'Date') {
                  this.datatobeimported[i].Date = ev;
                  this.getDataToBeImported();
                  this.isLoader = false;
                  this.toastr.success(data['message']);
               }
               else {
                  this.isLoader = false;
                  this.toastr.error(data['message']);
               }
            }, err => {
               this.toastr.error(err['message']);
               this.isLoader = false;
            });
         }
      }
   }

   finalExcelImport() {
      this.isLoader = true;
      this.http.get(this.api.getUrl('ENTRYEXCELIMPORT')).subscribe((data: any) => {
         if (data['success'] && data['total']) {
            this.totaldata = data['total'];
            this.duplicatedata = data['duplicate'];
            this.skippeddata = data['skipped'];
            this.finaldata = data['final'];
            this.getEntryData();
            if (this.finaldata.length) {
               this.toastr.success(this.finaldata.length + " entries inserted from " + this.totaldata + " entries ");
            }
            else {
               this.toastr.error("No any entries inserted from " + this.totaldata + " entries ");
            }
            this.isLoader = false;
         }
         else {
            this.isLoader = false;
            this.toastr.error(data['message']);
         }
      });
   }

}








// this.http.post(this.api.getUrl('ENTRYEXCELIMPORT'), this.getExcelData).subscribe((data: any) => {
//    if (data['success']) {
//       this.skippeddata = data['skipped'];
//       console.log("this.skipped", this.skippeddata);

//       this.duplicatedata = data['duplicate'];
//       this.totaldata = data['total'];
//       this.getEntryData();
//       this.resultModal();
//       this.isLoader = false;
//       this.toastr.success(data['message']);
//    } else {
//       this.isLoader = false;
//       this.toastr.error(data['message']);
//    }
// }, err => {
//    this.toastr.error(err['message']);
//    this.isLoader = false;
// });



// $('.nav-tabs a[href="#samosas"]').tab('show');