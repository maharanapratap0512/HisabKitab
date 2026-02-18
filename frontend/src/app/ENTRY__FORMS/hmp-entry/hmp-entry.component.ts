import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { HmpFormService } from 'src/app/services/hmp-form.service';
import { error } from 'console';

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

  async onRecipeSelect(event: any) {
    if (event && event.label) {
      this.fs.hmpBatchForm.recipe_name = event.label;
      this.fs.hmpBatchForm.recipe_id = null;
      // this.fs.hmpBatchForm.update_recipe = true; // New recipe likely
    }
    else if (event) {
      let recipe = this.recipes.find((x: any) => x._id == event);
      this.fs.hmpBatchForm.recipe_name = recipe.recipe_name;
      this.fs.hmpBatchForm.recipe_id = event;
      console.log('recipe', recipe);



      if (recipe) {
        this.fs.hmpBatchForm.inputs = [{ ...this.fs.inputFormTemplate }];
        this.fs.hmpBatchForm.outputs = [{ ...this.fs.outputFormTemplate }];
        for (let i = 0; i < recipe.inputs.length; i++) {
          let item_subitem_id = recipe.inputs[i].item_id + ":" + recipe.inputs[i].subitem_id || null;
          await this.itemSubitemSelected(item_subitem_id, i, 'inputs');
          this.fs.hmpBatchForm.inputs[i].qty = recipe.inputs[i].qty;
          this.fs.hmpBatchForm.inputs[i].rate = recipe.inputs[i].rate;
          this.fs.hmpBatchForm.inputs[i].condition_id = recipe.inputs[i].condition_id;
          this.fs.hmpBatchForm.inputs[i].unit_id = recipe.inputs[i].unit_id;
          // this.fs.formStatusChanges();
        }
        for (let i = 0; i < recipe.outputs.length; i++) {
          let item_subitem_id = recipe.outputs[i].item_id + ":" + recipe.outputs[i].subitem_id || null;
          await this.itemSubitemSelected(item_subitem_id, i, 'outputs');
          this.fs.hmpBatchForm.outputs[i].qty = recipe.outputs[i].qty;
          this.fs.hmpBatchForm.outputs[i].rate = recipe.outputs[i].rate;
          this.fs.hmpBatchForm.outputs[i].condition_id = recipe.outputs[i].condition_id;
          this.fs.hmpBatchForm.outputs[i].unit_id = recipe.outputs[i].unit_id;
          // this.fs.formStatusChanges();

        }
        console.log(this.fs.hmpBatchForm);

      } else {
        this.fs.reset();
      }
    } else {
      this.fs.reset();
    }
    // this.fs.formStatusChanges();


  }

  // --- Input Table Logic ---

  async itemSubitemSelected(ev: any, i: number, type: string) {
    if (ev) {
      let item_id = parseInt(ev.split(':')[0]);
      let subitem_id = ev.split(':')[1] ? parseInt(ev.split(':')[1]) : null;

      let item = await this.items.find((x: any) => x._id == item_id);
      let subitem = await item?.subitems?.find((x: any) => x._id == subitem_id);


      this.fs.hmpBatchForm[type][i].item_subitem_id = item_id + ":" + subitem_id || null;
      this.fs.hmpBatchForm[type][i].item_id = item_id;
      this.fs.hmpBatchForm[type][i].subitem_id = subitem_id;
      this.fs.hmpBatchForm[type][i].unit_id = subitem ? subitem.unit_id : item.unit_id;

      // Filter Lot Nos
      // this.lotNos = this.lotNoAll.filter((l: any) => l.item_id == item_id && (!subitem_id || l.subitem_id == subitem_id));

    } else {
      this.fs.hmpBatchForm[type][i].item_id = null;
      this.fs.hmpBatchForm[type][i].subitem_id = null;
      this.fs.hmpBatchForm[type][i].unit_id = null;
      // this.lotNos = this.lotNoAll;
    }
    this.fs.formStatusChanges();
  }

  onSubmit() {
    console.log(this.fs.hmpBatchForm);
    if (this.fs.valid()) {
      this.http.post(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, this.fs.hmpBatchForm).subscribe((data: any) => {
        console.log(data);
        this.fs.reset();
        this.toastr.success('Batch created successfully');
        this.response.emit(data);
      },
        error => {
          this.fs.reset();
          console.log(error);
        });
    }
  }

  deleteRow(type: string, index: number) {
    // Remove row from inputs or outputs array
    if (type === 'inputs' && this.fs.hmpBatchForm.inputs.length > 1) {
      this.fs.hmpBatchForm.inputs.splice(index, 1);
    } else if (type === 'outputs' && this.fs.hmpBatchForm.outputs.length > 1) {
      this.fs.hmpBatchForm.outputs.splice(index, 1);
    }
  }

  closeModal() {
    // Close logic handled by parent or jquery
    $('#hmpEntryModal').modal('hide'); // Assuming ID
  }
}
