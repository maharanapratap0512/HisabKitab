import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { HmpFormService } from 'src/app/services/hmp-form.service';
import { error } from 'console';
import { NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-hmp-entry',
  templateUrl: './hmp-entry.component.html',
  styleUrls: ['./hmp-entry.component.scss']
})
export class HmpEntryComponent implements OnInit {

  @ViewChild('f') f!: NgForm;
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

    setTimeout(() => {
      if (this.f) {
        this.f.statusChanges?.pipe(debounceTime(100)).subscribe(() => {
          this.fs.formStatusChanges();
        });
      }
    }, 500);
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
      for (let i in this.recipes) {
        for (let j in this.recipes[i].inputs) {
          this.recipes[i].inputs[j].item_subitem_id = this.recipes[i].inputs[j].subitem_id ? this.recipes[i].inputs[j].item_id + ":" + this.recipes[i].inputs[j].subitem_id : this.recipes[i].inputs[j].item_id;
        }
        for (let j in this.recipes[i].outputs) {
          this.recipes[i].outputs[j].item_subitem_id = this.recipes[i].outputs[j].subitem_id ? this.recipes[i].outputs[j].item_id + ":" + this.recipes[i].outputs[j].subitem_id : this.recipes[i].outputs[j].item_id;
        }
      }

      if (recipe) {
        this.fs.hmpBatchForm.recipe_id = event;
        this.fs.hmpBatchForm.recipe_name = recipe.recipe_name;
        this.fs.hmpBatchForm.recipe_description = recipe.recipe_description;
        this.fs.hmpBatchForm.inputs = structuredClone(recipe.inputs);
        this.fs.hmpBatchForm.outputs = structuredClone(recipe.outputs);
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
      let item_id: any = null, subitem_id: any = null;
      if (typeof ev == 'number') {
        item_id = ev;
        subitem_id = null;
      } else {
        item_id = parseInt(ev.split(':')[0]);
        subitem_id = parseInt(ev.split(':')[1]) || null;
      }

      let item = await this.items.find((x: any) => x._id == item_id);
      let subitem = await item?.subitems?.find((x: any) => x._id == subitem_id);


      this.fs.hmpBatchForm[type][i].item_subitem_id = subitem_id ? item_id + ":" + subitem_id : item_id;
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
  }

  onSubmit() {
    console.log(this.fs.hmpBatchForm);
    if (this.fs.valid()) {
      this.http.post(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, this.fs.hmpBatchForm).subscribe((data: any) => {
        console.log(data);
        this.fs.reset();
        this.toastr.success('Batch created successfully');
        this.getRecipes();
        this.response.emit(data);
      },
        error => {
          this.fs.reset();
          console.log(error);
        });
    }
  }

  deleteRow(type: string, index: number) {
    // Remove row and reassign array reference so Angular fully re-renders all ngModelGroup rows
    if (type === 'inputs' && this.fs.hmpBatchForm.inputs.length > 1) {
      this.fs.hmpBatchForm.inputs.splice(index, 1);
      this.fs.hmpBatchForm.inputs = [...this.fs.hmpBatchForm.inputs];
    } else if (type === 'outputs' && this.fs.hmpBatchForm.outputs.length > 1) {
      this.fs.hmpBatchForm.outputs.splice(index, 1);
      this.fs.hmpBatchForm.outputs = [...this.fs.hmpBatchForm.outputs];
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  closeModal() {
    // Close logic handled by parent or jquery
    $('#hmpEntryModal').modal('hide'); // Assuming ID
  }
}
