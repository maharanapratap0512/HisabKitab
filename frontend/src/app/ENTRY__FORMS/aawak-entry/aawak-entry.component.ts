import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, Form, NgForm } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
	selector: 'app-aawak-entry',
	templateUrl: './aawak-entry.component.html',
	styleUrls: ['./aawak-entry.component.scss']
})
export class AawakEntryComponent implements OnInit {

	@Input() getData: any;
	@Input() isEdit: any = false;
	@Output() response = new EventEmitter();
	// aawakForm: FormGroup;
	states: any = [];
	aawaks: any = [];
	departments: any = [];
	showModal: string = ''
	isLoader: boolean = false;
	viewType: any;
	parentAawak: any;
	viewData: any = [];
	oldQty: any;
	cat: any;
	items: any = [];
	units: any = [];
	mms: any = [];
	conditions: any = [];
	subitems: any = [];
	pbks: any = [];
	aawak_types: any = [];
	products: any = [];
	categories: any = [];
	isCondition: any = false;
	productsAll: any = [];
	jmm: any = null;
	jqty: any = null;
	jnimmit: any = null;
	nimmits: any = [];
	categoryAll: any;
	itemAll: any;
	selDept_id: any;
	awkfg: any = {
		pkt_num: null,
		date: null,
		mm_id: null,
		aawak_mm_id: null,
		dept_id: this.auth.webUser.dept_id,
		pbk_id: null,
		aawak_type_id: null,
		item_id: null,
		subitem_id: null,
		product_id: null,
		unit_id: null,
		condition_id: null,
		qty: null,
		rate: null,
		actual_amt: null,
		nimmit_id: null,
		item_detail: null,
		description: null,
		remaining_qty: null,
		jawak_detail: []
	}
	jwkArr: any = [];
	settings: any = {};

	constructor(private fb: FormBuilder,
		private http: HttpService,
		private api: ApiService,
		private gs: GlobalService,
		private toastr: ToastrService,
		private spinner: NgxSpinnerService,
		public auth: AuthService
	) {
		this.gs.observeList().subscribe(result => {
			this.items = result.itemmix && this.auth.webUser.dept_id > 2 ? result.itemmix : [];
			this.itemAll = result.itemmix && this.auth.webUser.dept_id > 2 ? result.itemmix : [];
			this.categories = result.category && this.auth.webUser.dept_id > 2 ? result.category : [];
			this.units = result.unit ? result.unit : [];
			this.states = result.state ? result.state : [];
			this.mms = result.mm ? result.mm : [];
			this.conditions = result.condition ? result.condition : [];
			this.departments = result.department ? result.department : [];
			this.pbks = result.pbk ? result.pbk : [];
			this.aawak_types = result.aawak_type ? result.aawak_type : [];
			this.nimmits = result.nimmit ? result.nimmit : [];
		});
		this.settings = this.auth.webUser.settings;

	}

	ngOnInit(): void { }

	ngOnChanges(changes: SimpleChanges) {
		console.log("changes.getData.currentValue", changes.getData.currentValue);
		if (changes.isEdit && changes.isEdit.currentValue) {
			this.gs.observeList().subscribe(result => {
				this.items = result.itemmix ? result.itemmix : [];
				this.categories = result.category ? result.category : [];
			});
		}
		if (changes.getData.currentValue) {
			this.awkfg = {
				pkt_num: changes.getData.currentValue.pkt_num,
				date: changes.getData.currentValue.date,
				mm_id: changes.getData.currentValue.mm_id,
				aawak_mm_id: changes.getData.currentValue.aawak_mm_id,
				dept_id: changes.getData.currentValue.dept_id,
				pbk_id: changes.getData.currentValue.pbk_id,
				aawak_type_id: changes.getData.currentValue.aawak_type_id,
				item_id: changes.getData.currentValue.item_id,
				subitem_id: changes.getData.currentValue.subitem_id,
				product_id: changes.getData.currentValue.product_id,
				unit_id: changes.getData.currentValue.unit_id,
				condition_id: changes.getData.currentValue.condition_id,
				qty: changes.getData.currentValue.qty,
				rate: changes.getData.currentValue.rate,
				actual_amt: changes.getData.currentValue.actual_amt,
				nimmit_id: changes.getData.currentValue.nimmit_id,
				item_detail: changes.getData.currentValue.item_detail,
				description: changes.getData.currentValue.description,
				remaining_qty: changes.getData.currentValue.remaining_qty,
				jawak_detail: changes.getData.currentValue.jawak_detail
			};
			this.selDept_id = changes.getData.currentValue.dept_id;
			this.jwkArr = changes.getData.currentValue.jawak_detail;
			this.oldQty = changes.getData.currentValue.qty;
			this.itemSelected(changes.getData.currentValue.item_id);
		}
	}

	add_jwk() {
		let jwkfg: any = {
			jawak_mm_id: (this.jmm ? this.jmm.id : null),
			nimmit_id: (this.jnimmit ? this.jnimmit.id : null),
			qty: this.jqty,
			date: this.awkfg.date,
			mm_id: this.awkfg.mm_id,
			item_id: this.awkfg.item_id,
			subitem_id: this.awkfg.subitem_id,
			product_id: this.awkfg.product_id,
			condition_id: this.awkfg.condition_id,
			jawak_type_id: (this.jmm.id == this.awkfg.mm_id) ? 27 : 28,
			unit_id: this.awkfg.unit_id,
			dept_id: this.awkfg.dept_id,
		}
		let jwkfg2: any = {
			jawak_mm_hin: (this.jmm ? this.jmm.mm_hin : ''),
			nimmit_hin: (this.jnimmit ? this.jnimmit.nimmit_hin : ''),
			nimmit_state_hin: (this.jnimmit ? this.jnimmit.nimmit_state_hin : ''),
			qty: this.jqty
		}
		this.awkfg.jawak_detail.push(jwkfg);
		this.jwkArr.push(jwkfg2);
		this.jmm = null;
		this.jqty = null;
		this.jnimmit = null;
	}

	remove(i: any, id: any = null) {
		if (id) {
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
							this.awkfg.jawak_detail.splice(i, 1);
							this.jwkArr.splice(i, 1);
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
		else {
			this.awkfg.jawak_detail.splice(i, 1);
			this.jwkArr.splice(i, 1);
		}
	}

	openModal(name: any) {
		this.showModal = name;
		$('#aawakEntryComponent > #showModal').modal('show')
	}

	closeModal(name: any) {
		this.showModal = name;
		$('#aawakEntryComponent > #showModal').modal('hide')
	}

	aawakFormSubmit(awkform: NgForm) {
		console.log("awkform", awkform);
		if (awkform.valid) {
			this.isLoader = true;
			this.awkfg.remaining_qty = this.awkfg.qty;
			this.http.post(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, this.awkfg).subscribe((data: any) => {
				if (data['result'] && data['success']) {
					this.jmm = null;
					this.jqty = null;
					this.jnimmit = null;
					this.isLoader = false;
					this.toastr.success('Aawak Added Successfully.');
					awkform.resetForm({
						parchi_no: this.awkfg.parchi_no,
						pbk_id: this.awkfg.pbk_id,
						date: this.awkfg.date,
						aawak_mm_id: this.awkfg.aawak_mm_id
					});
					this.jwkArr = [];
					this.response.emit(data['result']);
				} else {
					this.toastr.error(data['message']);
					this.isLoader = false;
				}
			}, err => {
				this.toastr.error(err['error']);
				this.isLoader = false;
			});
		}
		else {
			this.toastr.error("Form is Invalid.")
		}
	}

	aawakFormUpdate(updtawkform: NgForm) {
		console.log("out of if updtawkform", updtawkform);
		if (updtawkform.valid) {
			this.isLoader = true;
			let body = { query: {}, set: {} };
			body.query = { _id: this.getData._id };
			body.set = this.awkfg;
			this.http.put(this.api.getUrl('AAWAK'), body).subscribe((data: any) => {
				if (data && data['success']) {
					this.jmm = null;
					this.jqty = null;
					this.jnimmit = null;
					this.isLoader = false;
					this.toastr.success('Aawak Updated Successfully.');
					updtawkform.resetForm();
					this.response.emit(data['result']);
				} else {
					this.toastr.error(data['message']);
					this.isLoader = false;
				}
			}, err => {
				this.toastr.error(err['error']);
				this.isLoader = false;
			});
		}
		else {
			this.toastr.error("Form is Invalid.")
		}
	}

	stateAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.states.unshift(ev);
			this.awkfg.state_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	departmentAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.departments.unshift(ev);
			this.awkfg.dept_id = ev._id;
			this.isLoader = false;
		}
		else {
			console.log("err", ev);
			this.isLoader = false;
		}
	}

	mmAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.mms.unshift(ev);
			this.awkfg.mm_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	itemAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.subitems.unshift(ev);
			this.awkfg.item_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}
	nimmitAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.states.unshift(ev);
			this.awkfg.nimmit_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	subitemAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.subitems.unshift(ev);
			this.awkfg.subitem_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	conditionAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.conditions.unshift(ev);
			this.awkfg.condition_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	unitAddResponse(ev: any) {
		if (ev._id) {
			this.isLoader = true;
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			// this.units.unshift(ev);
			this.awkfg.unit_i = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	ammAddResponse(ev: any) {
		if (ev._id) {
			this.isLoader = true;
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			this.awkfg.aawak_mm_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	pbkAddResponse(ev: any) {
		if (ev._id) {
			this.isLoader = true;
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			this.awkfg.pbk_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	productAddResponse(ev: any) {
		if (ev._id) {
			this.isLoader = true;
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			this.awkfg.product_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	aawakTypeAddResponse(ev: any) {
		if (ev._id) {
			this.isLoader = true;
			$('#aawakEntryComponent > #showModal').modal('hide');
			this.showModal = '';
			this.awkfg.aawak_type_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}


	setView(type: string) {
		this.viewType = type;
		switch (type) {
			case 'Condition':
				this.viewData = this.gs.Lists.condition;
				$('#aawakEntryComponent > #dataView').modal('show');
				break;
			case 'Department':
				this.viewData = this.gs.Lists.department;
				$('#aawakEntryComponent > #dataView').modal('show');
				break;
			case 'Unit':
				this.viewData = this.gs.Lists.unit;
				$('#aawakEntryComponent > #dataView').modal('show');
				break;
			case 'aawak_type':
				this.viewData = this.gs.Lists.aawak_type;
				$('#aawakEntryComponent > #dataView').modal('show');
				break;
		}
	}

	parentAawakSelected(ev: any) {
		this.parentAawak = ev ? ev : '';
		let parentAawak = this.aawaks.find((i: { _id: any; }) => i._id == ev);
		this.awkfg = {
			aawak_hin: parentAawak ? parentAawak.aawak_hin : null,
			aawak_eng: parentAawak ? parentAawak.aawak_eng : null,
			aawak_code: parentAawak ? parentAawak.aawak_code : null,
			state_id: parentAawak ? parentAawak.state_id : null,
		};
	}

	qtyclick() {
		if (this.awkfg.qty && this.awkfg.rate) {
			let actual_amt = this.awkfg.qty * this.awkfg.rate
			this.awkfg.actual_amt = actual_amt.toFixed(2);
		}
		else if (this.awkfg.qty && this.awkfg.amnt) {
			let rate = this.awkfg.amnt / this.awkfg.qty
			this.awkfg.rate = rate.toFixed(2);
		}
		this.jqty = this.awkfg.qty;
	}

	rateclick() {
		if (!this.awkfg.actual_amt && this.awkfg.qty && this.awkfg.rate) {
			let actual_amt = this.awkfg.qty * this.awkfg.rate;
			this.awkfg.actual_amt = actual_amt.toFixed(2)
		}
		else if (!this.awkfg.actual_amt && this.awkfg.rate && this.awkfg.amnt) {
			let quantity = this.awkfg.amnt / this.awkfg.rate;
			this.awkfg.qty = quantity.toFixed(2)
		}
	}

	amntclick() {
		if (!this.awkfg.rate && this.awkfg.qty && this.awkfg.actual_amt) {
			let rate = this.awkfg.actual_amt / this.awkfg.qty
			this.awkfg.rate = rate.toFixed(2)
		}
		else if (!this.awkfg.qty && this.awkfg.rate && this.awkfg.actual_amt) {
			let quantity = this.awkfg.actual_amt / this.awkfg.rate
			this.awkfg.qty = quantity.toFixed(2)
		}
	}

	stateSelected(ev: any) {
		if (ev) {
			this.pbks = this.gs.Lists.pbk.filter((p: { state_id: any; }) => p.state_id == ev);
		}
		else {
			this.pbks = this.gs.Lists.pbk;
		}
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
		this.awkfg.item_id = null;
		this.awkfg.subitem_id = null;
		this.awkfg.unit_id = null;
		this.awkfg.product_id = null;
	}

	itemSelected(ev: any) {
		if (ev) {
			let item = this.items.find((i: { _id: any; }) => i._id == ev);
			let category_ids = this.categories.map((c: { _id: any; }) => c._id);
			console.log("item", item);
			console.log("category_ids", category_ids);

			// this.products = this.productsAll.filter((p: { item_id: any; }) => p.item_id == ev);
			this.getProductData(ev);
			if (this.cat) {
				this.subitems = item.subitems.filter((s: { category_id: any; }) => s.category_id == this.cat);
			}
			else {
				this.subitems = item.subitems.filter(((s: { category_id: any; }) => category_ids.includes(s.category_id)));
			}

			if (this.cat && this.cat != item.category_id) {
				// this.aawakForm.setControl('subitem_id', this.fb.control(null, [Validators.required]));
				this.awkfg.subitem_id = this.subitems[0]._id;
			} else if (!category_ids.includes(item.category_id) && this.subitems.length > 0) {
				this.awkfg.subitem_id = this.subitems[0]._id;
			}
			this.awkfg.unit_id = item.unit_id;
		}
		else {
			this.subitems = [];
			this.awkfg = {
				unit_id: null,
				subitem_id: null
			};
		}
	}

	subitemSelected(ev: any) {
		if (ev) {
			let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
			this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
			this.awkfg.unit_id = subitem.unit_id;
		}
		else {
			this.products = this.productsAll;
		}
	}

	productSelected(ev: any) {
		this.isCondition = true;
		let product = this.products.find((p: { _id: any; }) => p._id == ev);
		this.awkfg.condition_id = product ? product.condition_id : null;
	}

	deptSelected(ev: any) {
		if (ev) {
			this.getItemData(ev);
			this.getCategoryData(ev);
		} else {
			this.itemAll = [];
			this.items = [];
			this.categoryAll = [];
			this.categories = [];
			this.productsAll = [];
			this.products = [];
		}
	}

	getItemData(ev: any) {
		this.http.put(this.api.getUrl('ITEMMIX') + ev, {}).subscribe((data: any) => {
			if (data['result']) {
				this.itemAll = data['result'];
				this.items = this.itemAll;
			}
		});
	}

	getCategoryData(ev: any) {
		this.http.get(this.api.getUrl('CATEGORY') + ev).subscribe((data) => {
			if (data['result']) {
				this.categoryAll = data['result'];
				this.categories = this.categoryAll;
			}
		});
	}

	getProductData(item_id: any) {
		let body = {
			item_id: item_id
		}
		this.http.put(this.api.getUrl('PRODUCT') + this.selDept_id, body).subscribe((data: any) => {
			if (data['result']) {
				this.productsAll = data['result'];
				this.products = this.productsAll;
			}
		});
	}

}
