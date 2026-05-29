import { NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, Form, NgForm } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2'

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
	itemsAll: any = [];
	units: any = [];
	mms: any = [];
	conditions: any = [];
	subitems: any = [];
	subitemsAll: any = [];
	pbks: any = [];
	aawak_types: any = [];
	aawak_sources: any = [];
	usage_lists: any = [];
	jawak_types: any = [];
	products: any = [];
	categories: any = [];
	isCondition: any = false;
	productsAll: any = [];
	editData: any = {};
	jmm: any = null;
	jqty: any = null;
	jpbk: any = null;
	jdate: any = null;
	jtype: any = null;
	nimitts: any = [];
	categoryAll: any;
	itemAll: any;
	selDept_id: any;
	awkfg: any = {
		pkt_num: null,
		lot_no: null,
		voucher_no: null,
		date: null,
		mm_id: this.auth.webUser.settings.defaultMM,
		aawak_mm_id: null,
		dept_id: this.auth.webUser.dept_id,
		pbk_id: null,
		aawak_type_id: null,
		aawak_source_id: null,
		item_id: null,
		subitem_id: null,
		usage_list_id: null,
		company_name: null,
		product_id: null,
		unit_id: null,
		condition_id: null,
		qty: null,
		rate: null,
		actual_amt: null,
		nimitt_id: null,
		item_detail: null,
		description: null,
		remaining_qty: null,
		isbill: null,
		document: null,
		is_xl: 0,
		hl: 0,
		is_auto_pd: 0,
		is_auto: 0,
		is_variable_qty: 0,
		is_process: 0,
		enz: {
			container_aawak_source_id: null,
			container_enz_no: null,
			container_capacity: null,
			container_qty: null
		},
		jawak_detail: []
	}
	// jwkArr: any = [];
	settings: any = {};
	imagepath: any;
	editDoc: any = {};
	editIndex: any = null;

	constructor(private fb: FormBuilder,
		private http: HttpService,
		public api: ApiService,
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
			// this.departments = result.department ? result.department : [];
			this.pbks = result.pbk ? result.pbk : [];
			this.aawak_types = result.aawak_type ? result.aawak_type : [];
			this.aawak_sources = result.aawak_source ? result.aawak_source : [];
			this.jawak_types = result.jawak_type ? result.jawak_type : [];
			this.nimitts = result.nimitt ? result.nimitt : [];
			this.usage_lists = result.usage_list ? result.usage_list : [];
		});
		this.settings = this.auth.webUser.settings;
		console.log("this.settings", this.settings);
		this.getDepartments();
		this.getProductData(null);
	}

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
		console.log(this.awkfg);

		this.response.emit(this.awkfg);
	}

	ngOnChanges(changes: SimpleChanges) {
		// console.log("changes.getData.currentValue", changes.getData.currentValue);
		if (changes.isEdit && changes.isEdit.currentValue) {
		}

		if (changes.getData.currentValue && Object.keys(changes.getData.currentValue).length > 0) {
			if (changes.getData.currentValue.item_id) {
				this.gs.observeList().subscribe(result => {
					this.itemsAll = result.itemmix ? result.itemmix : [];
					this.items = result.itemmix ? result.itemmix : [];
					this.categories = result.category ? result.category : [];
					this.units = result.unit ? result.unit : [];
				});
			}
			this.getData = changes.getData.currentValue;
			this.awkfg.pkt_num = changes.getData.currentValue.pkt_num ? changes.getData.currentValue.pkt_num : null
			this.awkfg.lot_no = changes.getData.currentValue.lot_no ? changes.getData.currentValue.lot_no : null
			this.awkfg.date = changes.getData.currentValue.date
			this.awkfg.mm_id = changes.getData.currentValue.mm_id
			this.awkfg.aawak_mm_id = changes.getData.currentValue.aawak_mm_id ? changes.getData.currentValue.aawak_mm_id : null
			this.awkfg.dept_id = this.auth.webUser.dept_id
			this.awkfg.pbk_id = changes.getData.currentValue.pbk_id ? changes.getData.currentValue.pbk_id : null
			this.awkfg.aawak_type_id = changes.getData.currentValue.aawak_type_id
			this.awkfg.aawak_source_id = changes.getData.currentValue.aawak_source_id
			this.awkfg.item_id = changes.getData.currentValue.item_id
			this.awkfg.subitem_id = changes.getData.currentValue.subitem_id ? changes.getData.currentValue.subitem_id : null
			this.awkfg.usage_list_id = changes.getData.currentValue.usage_list_id ? changes.getData.currentValue.usage_list_id : null
			this.awkfg.product_id = changes.getData.currentValue.product_id ? changes.getData.currentValue.product_id : null
			this.awkfg.unit_id = changes.getData.currentValue.unit_id
			this.awkfg.condition_id = changes.getData.currentValue.condition_id ? changes.getData.currentValue.condition_id : null
			this.awkfg.qty = changes.getData.currentValue.qty
			this.awkfg.rate = changes.getData.currentValue.rate ? changes.getData.currentValue.rate : null
			this.awkfg.actual_amt = changes.getData.currentValue.actual_amt ? changes.getData.currentValue.actual_amt : null
			this.awkfg.nimitt_id = changes.getData.currentValue.nimitt_id ? changes.getData.currentValue.nimitt_id : null
			this.awkfg.item_detail = changes.getData.currentValue.item_detail ? changes.getData.currentValue.item_detail : null
			this.awkfg.description = changes.getData.currentValue.description ? changes.getData.currentValue.description : null
			this.awkfg.remaining_qty = changes.getData.currentValue.remaining_qty
			this.awkfg.company_name = changes.getData.currentValue.company_name ? changes.getData.currentValue.company_name : null
			this.awkfg.isbill = changes.getData.currentValue.isbill ? changes.getData.currentValue.isbill : false;
			const doc = changes.getData.currentValue.document || { images: [] };
			this.awkfg.document = doc;
			this.awkfg.is_xl = changes.getData.currentValue.is_xl ? changes.getData.currentValue.is_xl : 0
			this.awkfg.hl = changes.getData.currentValue.hl ? changes.getData.currentValue.hl : 0
			this.awkfg.is_auto_pd = changes.getData.currentValue.is_auto_pd ? changes.getData.currentValue.is_auto_pd : 0
			this.awkfg.is_auto = changes.getData.currentValue.is_auto ? changes.getData.currentValue.is_auto : 0
			this.awkfg.is_variable_qty = changes.getData.currentValue.is_variable_qty ? changes.getData.currentValue.is_variable_qty : 0
			this.awkfg.is_process = changes.getData.currentValue.is_process ? changes.getData.currentValue.is_process : 0
			this.awkfg.jawak_detail = changes.getData.currentValue.jawak_detail ? changes.getData.currentValue.jawak_detail : []

			this.selDept_id = changes.getData.currentValue.dept_id;
			this.oldQty = changes.getData.currentValue.qty;
			this.imagepath = doc.images || [];
			this.editDoc = doc;

			// this.itemSelected(changes.getData.currentValue.item_id);
			this.itemSubitemSelected(this.awkfg);
		}
	}

	getDepartments() {
		this.http.get(this.api.getUrl('DEPT') + this.auth.webUser.dept_id).subscribe((data: any) => {
			this.departments = data['result'] || [];
		})
	}

	dateChange() {
		this.jdate = this.awkfg.date;
	}

	itemSubitemSelected(ev: any) {
		if (ev) {
			const item_id = ev.item_id || this.awkfg.item_id;
			const subitem_id = ev.subitem_id || this.awkfg.subitem_id;
			this.awkfg.item_id = item_id;
			this.awkfg.subitem_id = subitem_id;

			let item: any = this.items.find((i: { _id: any; }) => i._id == item_id);
			if (item) {
				let subitem: any = item.subitems?.find((i: { _id: any; }) => i._id == subitem_id);
				this.getProductData(item_id);
				this.awkfg.subitems = item.subitems || [];

				if (!this.isEdit) {
					this.awkfg.unit_id = subitem ? subitem.unit_id : item.unit_id;
				}
			}
		}
		else {
			this.subitems = [];
			this.awkfg.unit_id = null
			this.awkfg.item_id = null
			this.awkfg.subitem_id = null
			this.awkfg.lot_no = null;
		}
	}

	jwkmmChanged(ev: any) {
		if (ev && ev.id == this.awkfg.mm_id) {
			let jwk_type = this.jawak_types.find((j: { _id: number; }) => j._id == 27);
			if (jwk_type) {
				this.jtype = { id: jwk_type._id, list_name_hin: jwk_type.list_name_hin };
			}
		}
		else {
			let jwk_type = this.jawak_types.find((j: { _id: number; }) => j._id == 28);
			if (jwk_type) {
				this.jtype = { id: jwk_type._id, list_name_hin: jwk_type.list_name_hin };
			}
		}

	}

	async addJawakResponse(ev: any) {
		if (ev) {
			if (ev.jawak_mm_id) {
				let mm = await this.mms.find((m: { _id: any; }) => m._id == ev.jawak_mm_id);
				ev.jawak_mm_hin = mm?.mm_hin || null;
			}
			if (ev.pbk_id) {
				let pbk = await this.pbks.find((p: { _id: any; }) => p._id == ev.pbk_id);
				ev.pbk_hin = pbk.pbk_hin || null;
				ev.roll_no = pbk.roll_no || null;
			}
			if (ev.item_id) {
				let item = await this.items.find((i: { _id: any; }) => i._id == ev.item_id);
				ev.item_hin = item.item_hin || null;
			}
			if (ev.subitem_id) {
				let subitem = await this.subitems.find((s: { _id: any; }) => s._id == ev.subitem_id);
				ev.subitem_hin = subitem.subitem_hin || null;
			}
			if (ev.condition_id) {
				let condition = await this.conditions.find((c: { _id: any; }) => c._id == ev.condition_id);
				ev.condition_hin = condition.list_name_hin || null;
			}
			if (ev.unit_id) {
				let unit = await this.units.find((u: { _id: any; }) => u._id == ev.unit_id);
				ev.unit_short = unit.unit_short || null;
			}
			if (ev.aawak_source_id) {
				let aawak_source = await this.aawak_sources.find((a: { _id: any; }) => a._id == ev.aawak_source_id);
				ev.aawak_source_hin = aawak_source.list_name_hin || null;
			}
			if (ev.jawak_type_id) {
				let jawak_type = await this.jawak_types.find((j: { _id: any; }) => j._id == ev.jawak_type_id);
				ev.jawak_type_hin = jawak_type.list_name_hin || null;
			}
			if (ev.usage_list_id) {
				let usage_list = await this.usage_lists.find((u: { _id: any; }) => u._id == ev.usage_list_id);
				ev.usage_list_hin = usage_list.list_name_hin || null;
			}
			this.awkfg.jawak_detail.push(ev);
			this.awkfg.remaining_qty -= ev.qty;
			this.closeModal();
		}

	}

	async editJawakResponse(ev: any) {
		if (ev) {
			if (!ev._id) {
				if (ev.jawak_mm_id) {
					let mm = await this.mms.find((m: { _id: any; }) => m._id == ev.jawak_mm_id);
					ev.jawak_mm_hin = mm.mm_hin || null;
				}
				if (ev.pbk_id) {
					let pbk = await this.pbks.find((p: { _id: any; }) => p._id == ev.pbk_id);
					ev.pbk_hin = pbk.pbk_hin || null;
					ev.roll_no = pbk.roll_no || null;
				}
				if (ev.item_id) {
					let item = await this.items.find((i: { _id: any; }) => i._id == ev.item_id);
					ev.item_hin = item.item_hin || null;
				}
				if (ev.subitem_id) {
					let subitem = await this.subitems.find((s: { _id: any; }) => s._id == ev.subitem_id);
					ev.subitem_hin = subitem.subitem_hin || null;
				}
				if (ev.condition_id) {
					let condition = await this.conditions.find((c: { _id: any; }) => c._id == ev.condition_id);
					ev.condition_hin = condition.list_name_hin || null;
				}
				if (ev.unit_id) {
					let unit = await this.units.find((u: { _id: any; }) => u._id == ev.unit_id);
					ev.unit_short = unit.unit_short || null;
				}
				if (ev.aawak_source_id) {
					let aawak_source = await this.aawak_sources.find((a: { _id: any; }) => a._id == ev.aawak_source_id);
					ev.aawak_source_hin = aawak_source.list_name_hin || null;
				}
				if (ev.jawak_type_id) {
					let jawak_type = await this.jawak_types.find((j: { _id: any; }) => j._id == ev.jawak_type_id);
					ev.jawak_type_hin = jawak_type.list_name_hin || null;
				}
				if (ev.usage_list_id) {
					let usage_list = await this.usage_lists.find((u: { _id: any; }) => u._id == ev.usage_list_id);
					ev.usage_list_hin = usage_list.list_name_hin || null;
				}
			}
			this.awkfg.jawak_detail.splice(this.editIndex, 1, ev);
			this.awkfg.remaining_qty -= (ev.qty - this.awkfg.jawak_detail[this.editIndex].qty)
			this.editIndex = null;
			this.editData = null;
			this.closeModal();
		}

	}

	addJawak() {
		if (this.awkfg.mm_id && !this.awkfg.mm_hin) {
			let mm = this.mms.find((m: any) => m._id == this.awkfg.mm_id);
			this.awkfg.mm_hin = mm ? (mm.mm_hin || mm.mm_eng) : '';
		}
		if (this.awkfg.aawak_mm_id && !this.awkfg.aawak_mm_hin) {
			let mm = this.mms.find((m: any) => m._id == this.awkfg.aawak_mm_id);
			this.awkfg.aawak_mm_hin = mm ? (mm.mm_hin || mm.mm_eng) : '';
		}
		if (this.awkfg.item_id && !this.awkfg.item_hin) {
			let item = this.items.find((i: any) => i._id == this.awkfg.item_id);
			this.awkfg.item_hin = item ? (item.item_hin || item.item_eng) : '';
		}
		if (this.awkfg.subitem_id && !this.awkfg.subitem_hin) {
			let subitem = this.subitems.find((s: any) => s._id == this.awkfg.subitem_id);
			this.awkfg.subitem_hin = subitem ? (subitem.subitem_hin || subitem.subitem_eng) : '';
		}
		if (this.awkfg.unit_id && !this.awkfg.unit_short) {
			let unit = this.units.find((u: any) => u._id == this.awkfg.unit_id);
			this.awkfg.unit_short = unit ? unit.unit_short : '';
		}
		if (this.awkfg.aawak_type_id && !this.awkfg.aawak_type_hin) {
			let type = this.aawak_types.find((t: any) => t._id == this.awkfg.aawak_type_id);
			this.awkfg.aawak_type_hin = type ? type.list_name_hin : '';
		}

		this.editData = this.awkfg;
		this.openModal("Add Jawak");
	}

	editJawak(i: any) {
		this.editData = this.awkfg.jawak_detail[i];
		this.editIndex = i;
		this.openModal("Edit Jawak")
	}

	add_jwk() {
		let jwk_type;
		if (this.jmm.id == this.awkfg.mm_id) {
			jwk_type = this.jawak_types.find((j: { _id: number; }) => j._id == 27);
			if (jwk_type) {
				this.jtype = { id: jwk_type._id, list_name_hin: jwk_type.list_name_hin };
			}
		}
		else {
			jwk_type = this.jawak_types.find((j: { _id: number; }) => j._id == 28);
			if (jwk_type) {
				this.jtype = { id: jwk_type._id, list_name_hin: jwk_type.list_name_hin };
			}
			else {
				this.jtype = null;
			}
		}

		let jwkfg: any = {
			jawak_mm_id: (this.jmm ? this.jmm.id : null),
			nimitt_id: this.awkfg.nimitt_id,
			qty: this.jqty,
			date: this.jdate,
			date_sent: this.jdate,
			pkt_num: null,
			mm_id: this.awkfg.mm_id,
			pbk_id: (this.jpbk ? this.jpbk.id : null),
			item_id: this.awkfg.item_id,
			subitem_id: this.awkfg.subitem_id,
			usage_list_id: null,
			item_detail: null,
			description: null,
			company_name: null,
			product_id: this.awkfg.product_id,
			condition_id: this.awkfg.condition_id,
			aawak_source_id: this.awkfg.aawak_source_id,
			jawak_type_id: (this.jtype ? this.jtype.id : (jwk_type ? jwk_type._id : null)),
			jawak_type_hin: (this.jtype ? this.jtype.list_name_hin : (jwk_type ? jwk_type.list_name_hin : null)),
			unit_id: this.awkfg.unit_id,
			dept_id: this.awkfg.dept_id,
			is_xl: 0,
			hl: 0,
			jawak_mm_hin: (this.jmm ? this.jmm.mm_hin : ''),
			pbk_hin: (this.jpbk ? this.jpbk.pbk_hin : ''),
			pbk_state_hin: (this.jpbk ? this.jpbk.state_hin : ''),
			pbk_roll_no: (this.jpbk ? this.jpbk.roll_no : ''),
		}

		this.awkfg.jawak_detail.push(jwkfg);
		console.log("addjawak", this.awkfg);

		// this.jwkArr.push(jwkfg2);
		this.jmm = null;
		this.jqty = null;
		this.jpbk = null;
		this.jtype = null;
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
							// this.jwkArr.splice(i, 1);
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
			// this.jwkArr.splice(i, 1);
		}
	}

	openModal(name: any) {
		this.showModal = name;
		$('#aawakEntryComponent > #showModal').modal('show')
	}

	closeModal() {
		this.showModal = '';
		$('#aawakEntryComponent > #showModal').modal('hide')
	}

	clearItemFilters() {
		this.selDept_id = null;
		this.cat = null;
		this.items = this.itemAll;
		this.categories = this.categoryAll;
	}

	imagesSelectResponse(ev: any) {
		if (ev) {
			this.isLoader = true;
			this.closeModal();
			this.imagepath = ev;
			this.awkfg.document = { images: ev }
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
		}
	}

	aawakFormSubmit(awkform: NgForm) {
		console.log("awkfg", this.awkfg);
		if (awkform.valid) {
			this.isLoader = true;
			// this.awkfg.remaining_qty = this.awkfg.qty;
			this.http.post(this.api.getUrl('AAWAK') + 'new/' + this.auth.webUser.dept_id, this.awkfg).subscribe((data: any) => {
				if (data['result'] && data['success']) {
					this.jmm = null;
					this.jqty = null;
					this.jpbk = null;
					this.jtype = null;
					this.imagepath = null;
					this.isLoader = false;
					this.toastr.success('Aawak Added Successfully.');
					awkform.resetForm({
						pkt_num: this.awkfg.pkt_num,
						pbk_id: this.awkfg.pbk_id,
						date: this.awkfg.date,
						mm_id: this.awkfg.mm_id,
						aawak_mm_id: this.awkfg.aawak_mm_id,
						nimitt_id: this.awkfg.nimitt_id,
					});
					this.awkfg.jawak_detail = []

					// this.jwkArr = [];
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
			body.set = { _id: this.getData._id, ...this.awkfg };
			this.http.put(this.api.getUrl('AAWAK') + 'new/', body).subscribe((data: any) => {
				if (data && data['success']) {
					this.jmm = null;
					this.jqty = null;
					this.jpbk = null;
					this.imagepath = null;
					this.isLoader = false;
					this.toastr.success('Aawak Updated Successfully.');
					updtawkform.resetForm();
					this.awkfg.jawak_detail = []
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
			// this.subitems.unshift(ev);
			this.awkfg.item_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}
	nimittAddResponse(ev: any) {
		this.isLoader = true;
		if (ev._id) {
			this.closeModal();
			// this.states.unshift(ev);
			this.awkfg.nimitt_id = ev._id;
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
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
			this.closeModal();
			this.awkfg.aawak_type_id = ev._id;
			this.isLoader = false;
		}
		else {
			this.isLoader = false;
			console.log("err", ev);
		}
	}

	aawakSourceAddResponse(ev: any) {
		if (ev._id) {
			this.isLoader = true;
			this.closeModal();
			this.awkfg.aawak_source_id = ev._id;
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
			case 'aawak_source':
				this.viewData = this.gs.Lists.aawak_source;
				$('#aawakEntryComponent > #dataView').modal('show');
				break;
		}
	}

	qtyclick() {
		if (this.awkfg.qty && this.awkfg.rate) {
			let actual_amt = this.awkfg.qty * this.awkfg.rate
			this.awkfg.actual_amt = actual_amt.toFixed(2);
		}
		else if (this.awkfg.qty && this.awkfg.actual_amt) {
			let rate = this.awkfg.actual_amt / this.awkfg.qty
			this.awkfg.rate = rate.toFixed(2);
		}
		this.jqty = this.awkfg.qty;
	}

	rateclick() {
		if (!this.awkfg.actual_amt && this.awkfg.qty && this.awkfg.rate) {
			let actual_amt = this.awkfg.qty * this.awkfg.rate;
			this.awkfg.actual_amt = actual_amt.toFixed(2)
		}
		else if (!this.awkfg.actual_amt && this.awkfg.rate && this.awkfg.actual_amt) {
			let quantity = this.awkfg.actual_amt / this.awkfg.rate;
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
			this.items = this.itemAll.filter((i: { categories: any, subitems: any[] }) => i.categories.includes(ev) || (i.subitems.filter((s: { categories: any }) => s.categories.includes(ev)).length));
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
			console.log("item", item);

			// this.products = this.productsAll.filter((p: { item_id: any; }) => p.item_id == ev);
			this.getProductData(ev);
			if (this.cat) {
				this.subitems = item.subitems?.filter((s: { categories: any; }) => s.categories.includes(this.cat));
			}
			else {
				this.subitems = item.subitems || [];
			}

			// this.filterSubitemByDate();
			if (this.cat && !item.categories.includes(this.cat)) {
				// this.aawakForm.setControl('subitem_id', this.fb.control(null, [Validators.required]));
				this.awkfg.subitem_id = this.subitems[0]._id;
			}
			if (!this.isEdit)
				this.awkfg.unit_id = item.unit_id;
		}
		else {
			this.subitems = [];
			this.awkfg.unit_id = null
			this.awkfg.subitem_id = null
		}
	}

	subitemSelected(ev: any) {
		if (ev) {
			let subitem = this.subitems.find((i: { _id: any; }) => i._id == ev);
			this.products = this.productsAll.filter((p: { subitem_id: any; }) => p.subitem_id == ev);
			if (!this.isEdit)
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
		this.awkfg.item_id = product.item_id;
		this.awkfg.subitem_id = product.subitem_id;
		this.awkfg.qty = 1;
		this.awkfg.unit_id = 1;
		this.awkfg.rate = product.price ? product.price : null;
		this.rateclick();
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
		let body = {};
		if (item_id && item_id != undefined) {
			body = {
				item_id: item_id
			}

		}
		this.http.put(this.api.getUrl('PRODUCT') + 'unique/' + this.auth.webUser.dept_id, body).subscribe((data: any) => {
			if (data['result']) {
				// this.productsAll = data['result'];
				this.products = data['result'];
			}
		});
	}

}
