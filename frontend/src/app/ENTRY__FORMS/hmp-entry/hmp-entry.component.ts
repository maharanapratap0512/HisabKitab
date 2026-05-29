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

  // Jawak Modal State
  editOutputIndex: number | null = null;
  editJawakIndex: number | null = null;
  editData: any = {};

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

  async ngOnChanges(changes: SimpleChanges) {
    if (changes.getData && changes.getData.currentValue) {
      let data = structuredClone(changes.getData.currentValue);

      this.isLoader = true;
      if (data.outputs && data.outputs.length > 0) {
        for (let i = 0; i < data.outputs.length; i++) {
          if (data.outputs[i].aawak_ref_id) {
            try {
              const filterBody = { _id: data.outputs[i].aawak_ref_id };
              const res: any = await new Promise((resolve, reject) => {
                this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.auth.webUser.dept_id, filterBody)
                  .subscribe((res: any) => resolve(res), (err: any) => reject(err));
              });

              if (res.result && res.result.length > 0 && res.result[0].jawak_detail) {
                data.outputs[i].jawak_detail = res.result[0].jawak_detail;
              }
            } catch (e) {
              console.error('Failed to fetch jawak details for aawak: ', data.outputs[i].aawak_ref_id);
            }
          }
        }
      }
      this.isLoader = false;

      this.fs.patchForm(data);
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
      // IDs are already present in recipe inputs/outputs

      if (recipe) {
        this.fs.hmpBatchForm.recipe_id = event;
        this.fs.hmpBatchForm.recipe_name = recipe.recipe_name;
        this.fs.hmpBatchForm.description = recipe.description;
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
    const row = this.fs.hmpBatchForm[type][i];
    if (ev) {
      const item_id = ev.item_id || row.item_id;
      const subitem_id = ev.subitem_id || row.subitem_id;
      
      let item = this.items.find((x: any) => x._id == item_id);
      if (item) {
        let subitem = item.subitems?.find((x: any) => x._id == subitem_id);
        row.item_id = item_id;
        row.subitem_id = subitem_id;
        row.unit_id = subitem ? subitem.unit_id : item.unit_id;
      }
    } else {
      row.item_id = null;
      row.subitem_id = null;
      row.unit_id = null;
    }
  }

  onSubmit() {
    if (this.fs.valid()) {
      if (this.isEdit) {
        // Update existing batch
        const id = this.fs.hmpBatchForm._id;
        this.http.put(this.api.getUrl('HMP') + id, this.fs.hmpBatchForm).subscribe((data: any) => {
          this.fs.reset();
          this.toastr.success('Batch updated successfully');
          this.getRecipes();
          this.response.emit(data);
        }, err => {
          console.log(err);
          this.toastr.error('Failed to update batch');
        });
      } else {
        // Create new batch
        this.http.post(this.api.getUrl('HMP') + 'batch/' + this.auth.webUser.dept_id, this.fs.hmpBatchForm).subscribe((data: any) => {
          this.fs.reset();
          this.toastr.success('Batch created successfully');
          this.getRecipes();
          this.response.emit(data);
        }, err => {
          console.log(err);
          this.toastr.error('Failed to create batch');
        });
      }
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

  getJawakQty(i: any) {
    let row = this.fs.hmpBatchForm.outputs[i];
    if (row.jawak_detail && row.jawak_detail.length > 0) {
      return row.jawak_detail.reduce((acc: any, curr: any) => acc + Number(curr.qty), 0);
    }
    return 0;
  }

  // --- Jawak Distribution Logic ---
  addJawakToOutput(index: number) {
    this.editOutputIndex = index;
    const output = this.fs.hmpBatchForm.outputs[index];

    if (!output.item_id || !output.qty) {
      this.toastr.warning('Please select item and quantity first.');
      return;
    }

    const item = this.items.find((i: any) => i._id === output.item_id);
    const mm = this.mms.find((m: any) => m._id === this.fs.hmpBatchForm.mm_id);
    const unit = this.units.find((u: any) => u._id === output.unit_id);

    this.editData = {
      date: this.fs.hmpBatchForm.date,
      mm_id: this.fs.hmpBatchForm.mm_id,
      mm_hin: mm ? (mm.mm_hin || mm.mm_eng) : '',
      item_id: output.item_id,
      item_hin: item ? (item.item_hin || item.item_eng) : '',
      subitem_id: output.subitem_id,
      product_id: output.product_id,
      condition_id: output.condition_id,
      remaining_qty: 0,
      unit_id: output.unit_id,
      unit_short: unit ? unit.unit_short : '',
      aawak_source_id: output.aawak_source_id || null,
      dept_id: this.fs.hmpBatchForm.dept_id,
      jawak_type_id: 27,
      description: `HMP Batch Production`
    };

    // Lookup subitem name if present
    if (output.subitem_id) {
      const subitem = this.items.find((i: any) => i._id === output.subitem_id);
      this.editData.subitem_hin = subitem ? (subitem.subitem_hin || subitem.subitem_eng) : '';
    }

    // Calculate remaining quantity
    let usedQty = 0;
    if (output.jawak_detail && output.jawak_detail.length > 0) {
      usedQty = output.jawak_detail.reduce((sum: number, j: any) => sum + Number(j.qty || 0), 0);
    }
    this.editData.remaining_qty = output.qty - usedQty;

    this.showModal = 'Add Jawak';
    $('#jawakOffcanvas').offcanvas('show');
  }

  editJawakOfOutput(outIndex: number, jwkIndex: number) {
    this.editOutputIndex = outIndex;
    this.editJawakIndex = jwkIndex;
    this.editData = this.fs.hmpBatchForm.outputs[outIndex].jawak_detail[jwkIndex];
    this.showModal = 'Edit Jawak';
    $('#jawakOffcanvas').offcanvas('show');
  }

  removeJawak(outIndex: number, jwkIndex: number, id: any = null) {
    if (id) {
      if (confirm('Are you sure you want to delete this Jawak?')) {
        this.isLoader = true;
        this.http.delete(this.api.getUrl('JAWAK') + '/' + id).subscribe((data: any) => {
          if (data['success']) {
            this.fs.hmpBatchForm.outputs[outIndex].jawak_detail.splice(jwkIndex, 1);
            this.toastr.success('Jawak Deleted Successfully');
          } else {
            this.toastr.error(data['message']);
          }
          this.isLoader = false;
        });
      }
    } else {
      this.fs.hmpBatchForm.outputs[outIndex].jawak_detail.splice(jwkIndex, 1);
    }
  }

  addJawakResponse(ev: any) {
    if (ev) {
      if (!this.fs.hmpBatchForm.outputs[this.editOutputIndex!].jawak_detail) {
        this.fs.hmpBatchForm.outputs[this.editOutputIndex!].jawak_detail = [];
      }
      this.fs.hmpBatchForm.outputs[this.editOutputIndex!].jawak_detail.push(ev);
      this.closeJawakModal();
    }
  }

  editJawakResponse(ev: any) {
    if (ev) {
      this.fs.hmpBatchForm.outputs[this.editOutputIndex!].jawak_detail.splice(this.editJawakIndex!, 1, ev);
      this.editOutputIndex = null;
      this.editJawakIndex = null;
      this.editData = {};
      this.closeJawakModal();
    }
  }

  closeJawakModal() {
    this.showModal = '';
    $('#jawakOffcanvas').offcanvas('hide');
  }
}
