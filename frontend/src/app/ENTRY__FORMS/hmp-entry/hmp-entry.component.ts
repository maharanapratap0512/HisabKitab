import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { HmpFormService } from 'src/app/services/hmp-form.service';

declare var $: any;

@Component({
  selector: 'app-hmp-entry',
  templateUrl: './hmp-entry.component.html',
  styleUrls: ['./hmp-entry.component.scss']
})
export class HmpEntryComponent implements OnInit {

  @Output() response = new EventEmitter();
  @Input() isEdit: any;
  @Input() getData: any;

  showModal = '';
  isLoader = false;

  // Lists
  recipes: any = [];
  mms: any = [];
  items: any = [];
  units: any = [];
  conditions: any = [];

  // Dropdown lists for Input/Output tables
  inputItems: any = [];
  outputItems: any = [];

  lotNos: any = [];
  lotNoAll: any = [];
  keyword: any = 'lot_no';

  products: any = [];

  constructor(
    public fs: HmpFormService,
    public api: ApiService,
    public http: HttpService,
    public gs: GlobalService,
    public auth: AuthService,
    private toastr: ToastrService
  ) {
    this.gs.observeList().subscribe((result: any) => {
      this.mms = result.mm || [];
      this.items = result.itemmix || [];
      this.units = result.unit || [];
      this.conditions = result.condition || [];
    });
    this.fs.reset();
  }

  ngOnInit(): void {
    this.getRecipes();
    this.getLotNo();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.getData && changes.getData.currentValue) {
      this.fs.patchForm(changes.getData.currentValue);
    }
  }

  getRecipes() {
    this.http.get(this.api.getUrl('HMP') + 'recipe/' + this.auth.webUser.dept_id)
      .subscribe((data: any) => {
        this.recipes = data.result || [];
      });
  }

  getLotNo() {
    this.http.get(this.api.getUrl('LIST') + 'lot_no/' + this.auth.webUser.dept_id).subscribe((data: any) => {
      this.lotNoAll = data['result'] || [];
      this.lotNos = data['result'] || [];
    })
  }

  onRecipeSelect(event: any) {
    if (event) {
      // Auto-fill from Recipe
      this.fs.hmpBatchForm.recipe_name = event.recipe_name;
      this.fs.hmpBatchForm.recipe_code = event.recipe_code;
      this.fs.hmpBatchForm.recipe_description = event.description;
      this.fs.hmpBatchForm.update_recipe = false; // Default false when selecting existing

      // Load Recipe Input/Output structure
      // Ideally fetched from API or included in recipe object
      // For now assuming recipe object has details or we fetch them
      if (event.inputs) {
        this.fs.hmpBatchForm.inputs = event.inputs.map((inp: any) => ({
          ...this.fs.inputFormTemplate,
          item_id: inp.item_id,
          subitem_id: inp.subitem_id,
          unit_id: inp.unit_id,
          condition_id: inp.condition_id,
          qty: inp.qty,
          item_subitem_id: inp.item_id + ':' + (inp.subitem_id || '')
        }));
      }
      if (event.outputs) {
        this.fs.hmpBatchForm.outputs = event.outputs.map((out: any) => ({
          ...this.fs.outputFormTemplate,
          item_id: out.item_id,
          subitem_id: out.subitem_id,
          unit_id: out.unit_id,
          condition_id: out.condition_id,
          qty: out.qty,
          item_subitem_id: out.item_id + ':' + (out.subitem_id || '')
        }));
      }

    } else {
      // Clear or reset fields
      this.fs.hmpBatchForm.recipe_name = null;
      this.fs.hmpBatchForm.recipe_code = null;
      this.fs.hmpBatchForm.recipe_description = null;
      this.fs.hmpBatchForm.update_recipe = true; // New recipe likely
    }
    this.fs.formStatusChanges();
  }

  onRecipeNameChange(event: any) {
    // If user types a new name not in list, check update_recipe
    // event can be the item object or string depending on version, usually helper returns {label, value} or just value
    // For safety, let's assume it might be providing the label
    let name = event.recipe_name || event.label || event;

    this.fs.hmpBatchForm.recipe_name = name;
    this.fs.hmpBatchForm.recipe_id = null; // New recipe
    this.fs.hmpBatchForm.update_recipe = true;
  }

  // --- Input Table Logic ---

  itemSubitemSelectedInput(ev: any, i: number) {
    if (ev) {
      let item_id = parseInt(ev.split(':')[0]);
      let subitem_id = ev.split(':')[1] ? parseInt(ev.split(':')[1]) : null;

      let item = this.items.find((x: any) => x._id == item_id);
      let subitem = item.subitems?.find((x: any) => x._id == subitem_id);

      this.fs.hmpBatchForm.inputs[i].item_id = item_id;
      this.fs.hmpBatchForm.inputs[i].subitem_id = subitem_id;
      this.fs.hmpBatchForm.inputs[i].unit_id = subitem ? subitem.unit_id : item.unit_id;

      // Filter Lot Nos
      this.lotNos = this.lotNoAll.filter((l: any) => l.item_id == item_id && (!subitem_id || l.subitem_id == subitem_id));

    } else {
      this.fs.hmpBatchForm.inputs[i].item_id = null;
      this.fs.hmpBatchForm.inputs[i].subitem_id = null;
      this.fs.hmpBatchForm.inputs[i].unit_id = null;
      this.lotNos = this.lotNoAll;
    }
    this.fs.formStatusChanges();
  }

  // Lot No Auto-complete Logic mimicking Jawak
  selectLotEvent(ev: any, i: number) {
    if (ev.lot_no) {
      this.fs.hmpBatchForm.inputs[i].item_subitem_id = ev.item_id + ':' + (ev.subitem_id || '');
      this.itemSubitemSelectedInput(this.fs.hmpBatchForm.inputs[i].item_subitem_id, i);

      this.fs.hmpBatchForm.inputs[i].lot_no = ev.lot_no;
      this.fs.hmpBatchForm.inputs[i].condition_id = ev.condition_id;
      this.fs.hmpBatchForm.inputs[i].rate = ev.rate;
      this.fs.hmpBatchForm.inputs[i].jawak_ref_id = null; // Ideally this links to Aawak of the lot

      // If we want to link consumption to specific Aawak (Jawak Ref), we need that ID from lot search
      // Assuming `ev` has enough info
    }
  }

  calculateAmountInput(i: number) {
    let row = this.fs.hmpBatchForm.inputs[i];
    if (row.qty && row.rate) {
      row.amount = (row.qty * row.rate).toFixed(2);
    }
  }

  // --- Output Table Logic ---
  itemSubitemSelectedOutput(ev: any, i: number) {
    if (ev) {
      let item_id = parseInt(ev.split(':')[0]);
      let subitem_id = ev.split(':')[1] ? parseInt(ev.split(':')[1]) : null;

      let item = this.items.find((x: any) => x._id == item_id);
      let subitem = item.subitems?.find((x: any) => x._id == subitem_id);

      this.fs.hmpBatchForm.outputs[i].item_id = item_id;
      this.fs.hmpBatchForm.outputs[i].subitem_id = subitem_id;
      this.fs.hmpBatchForm.outputs[i].unit_id = subitem ? subitem.unit_id : item.unit_id;
    } else {
      this.fs.hmpBatchForm.outputs[i].item_id = null;
      this.fs.hmpBatchForm.outputs[i].subitem_id = null;
      this.fs.hmpBatchForm.outputs[i].unit_id = null;
    }
    this.fs.formStatusChanges();
  }

  calculateAmountOutput(i: number) {
    let row = this.fs.hmpBatchForm.outputs[i];
    if (row.qty && row.rate) {
      row.amount = (row.qty * row.rate).toFixed(2);
    }
  }


  onSubmit() {
    console.log(this.fs.hmpBatchForm);
    if (this.fs.valid()) {
      this.http.post(this.api.getUrl('HMP') + 'batch', this.fs.hmpBatchForm).subscribe((data: any) => {
        console.log(data);
      });
    }
  }

  closeModal() {
    // Close logic handled by parent or jquery
    $('#hmpEntryModal').modal('hide'); // Assuming ID
  }
}
