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
import Swal from 'sweetalert2';

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

  // --- Toggle between traditional and modern editors ---
  editorMode: 'traditional' | 'modern' = 'traditional';

  // --- Restructured Common Form State (Modern Mode) ---
  entryMode: 'inputs' | 'outputs' = 'inputs';
  formModel: any = {
    item_id: null,
    subitem_id: null,
    unit_id: null,
    condition_id: null,
    qty: null,
    rate: null,
    aawak_source_id: null,
    auto_jawak: false,
    auto_aawak: false,
    aawak_type_id: null,
    jawak_ref_id: null,
    aawak_ref_id: null,
    jawak_detail: []
  };
  isEditingItem: boolean = false;
  editingIndex: number | null = null;

  // Lists
  recipes: any = [];
  mms: any = [];
  items: any = [];
  units: any = [];
  conditions: any = [];
  aawak_sources: any = [];
  aawak_types: any = [];

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
      this.aawak_types = result.aawak_type || [];
      this.aawak_sources = result.aawak_source || [];
    });
    this.fs.reset();
  }

  ngOnInit(): void {
    this.getRecipes();
    this.getLotNo();

    setTimeout(() => {
      if (this.f) {
        this.f.statusChanges?.pipe(debounceTime(100)).subscribe(() => {
          this.fs.formStatusChanges(this.editorMode);
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

      // Filter out any blank template rows if loading into modern editor, otherwise preserve
      if (this.editorMode === 'modern') {
        if (data.inputs) data.inputs = data.inputs.filter((x: any) => x.item_id && x.qty);
        if (data.outputs) data.outputs = data.outputs.filter((x: any) => x.item_id && x.qty);
      }

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
    }
    else if (event) {
      let recipe = this.recipes.find((x: any) => x._id == event);

      if (recipe) {
        this.fs.hmpBatchForm.recipe_id = event;
        this.fs.hmpBatchForm.recipe_name = recipe.recipe_name;
        this.fs.hmpBatchForm.description = recipe.description;

        const cleanInputs = structuredClone(recipe.inputs || []).map((x: any) => {
          delete x._id;
          delete x.recipe_id;
          return x;
        });

        const cleanOutputs = structuredClone(recipe.outputs || []).map((x: any) => {
          delete x._id;
          delete x.recipe_id;
          return x;
        });

        if (this.editorMode === 'modern') {
          this.fs.hmpBatchForm.inputs = cleanInputs.filter((x: any) => x.item_id);
          this.fs.hmpBatchForm.outputs = cleanOutputs.filter((x: any) => x.item_id);
        } else {
          this.fs.hmpBatchForm.inputs = cleanInputs;
          this.fs.hmpBatchForm.outputs = cleanOutputs;
        }
      } else {
        this.fs.reset();
      }
    } else {
      this.fs.reset();
    }
    this.fs.formStatusChanges(this.editorMode);
  }

  // --- Traditional Input Table Logic ---
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

  // --- Modern Restructured Form Logic ---
  selectEntryMode(mode: 'inputs' | 'outputs') {
    this.entryMode = mode;
    this.resetFormModel();
  }

  resetFormModel() {
    this.formModel = {
      item_id: null,
      subitem_id: null,
      unit_id: null,
      condition_id: null,
      qty: null,
      rate: null,
      aawak_source_id: null,
      auto_jawak: false,
      auto_aawak: false,
      aawak_type_id: null,
      jawak_ref_id: null,
      aawak_ref_id: null,
      jawak_detail: []
    };
    this.isEditingItem = false;
    this.editingIndex = null;
  }

  commonFormItemSubitemSelected(ev: any) {
    if (ev) {
      const item_id = ev.item_id || this.formModel.item_id;
      const subitem_id = ev.subitem_id || this.formModel.subitem_id;

      let item = this.items.find((x: any) => x._id == item_id);
      if (item) {
        let subitem = item.subitems?.find((x: any) => x._id == subitem_id);
        this.formModel.item_id = item_id;
        this.formModel.subitem_id = subitem_id;
        this.formModel.unit_id = subitem ? subitem.unit_id : item.unit_id;
      }
    } else {
      this.formModel.item_id = null;
      this.formModel.subitem_id = null;
      this.formModel.unit_id = null;
    }
  }

  addOrUpdateItem() {
    if (!this.formModel.item_id || !this.formModel.qty) {
      this.toastr.warning('Please select item and fill quantity.');
      return;
    }

    if (!this.fs.hmpBatchForm.inputs) this.fs.hmpBatchForm.inputs = [];
    if (!this.fs.hmpBatchForm.outputs) this.fs.hmpBatchForm.outputs = [];

    let row: any;
    if (this.entryMode === 'inputs') {
      row = {
        _id: this.formModel._id || null,
        item_id: this.formModel.item_id,
        subitem_id: this.formModel.subitem_id,
        unit_id: this.formModel.unit_id,
        condition_id: this.formModel.condition_id,
        qty: this.formModel.qty,
        rate: this.formModel.rate,
        aawak_source_id: this.formModel.aawak_source_id,
        auto_jawak: this.formModel.auto_jawak,
        auto_aawak: this.formModel.auto_aawak,
        aawak_type_id: this.formModel.aawak_type_id || null,
        aawak_ref_id: this.formModel.aawak_ref_id || null,
        jawak_ref_id: this.formModel.jawak_ref_id || null,
        active: 1
      };
    } else {
      row = {
        _id: this.formModel._id || null,
        item_id: this.formModel.item_id,
        subitem_id: this.formModel.subitem_id,
        unit_id: this.formModel.unit_id,
        condition_id: this.formModel.condition_id,
        qty: this.formModel.qty,
        rate: this.formModel.rate,
        auto_aawak: this.formModel.auto_aawak,
        aawak_ref_id: this.formModel.aawak_ref_id || null,
        jawak_detail: this.formModel.jawak_detail || [],
        active: 1
      };
    }

    if (this.isEditingItem && this.editingIndex !== null) {
      this.fs.hmpBatchForm[this.entryMode][this.editingIndex] = row;
      this.toastr.success('Item updated successfully in batch');
    } else {
      this.fs.hmpBatchForm[this.entryMode].push(row);
      this.toastr.success('Item added successfully to batch');
    }

    this.resetFormModel();
  }

  editItem(type: 'inputs' | 'outputs', index: number) {
    const row = this.fs.hmpBatchForm[type][index];
    this.entryMode = type;
    this.isEditingItem = true;
    this.editingIndex = index;
    this.formModel = structuredClone(row);
  }

  deleteItem(type: 'inputs' | 'outputs', index: number) {
    const row = this.fs.hmpBatchForm[type][index];
    if (row && row._id) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will also delete the associated auto-generated Aawak/Jaway entries from the database!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoader = true;
          const urlType = type === 'inputs' ? 'input' : 'output';
          this.http.delete(this.api.getUrl('HMP') + urlType + '/' + row._id).subscribe((data: any) => {
            this.isLoader = false;
            if (data.success || data.result) {
              this.fs.hmpBatchForm[type].splice(index, 1);
              this.fs.hmpBatchForm[type] = [...this.fs.hmpBatchForm[type]];
              this.toastr.success('Item deleted successfully from database');
            } else {
              this.toastr.error('Failed to delete item');
            }
          }, err => {
            this.isLoader = false;
            this.toastr.error('Error occurred while deleting item');
          });
        }
      });
    } else {
      this.fs.hmpBatchForm[type].splice(index, 1);
      this.fs.hmpBatchForm[type] = [...this.fs.hmpBatchForm[type]];
      this.toastr.success('Item removed');
    }
  }

  toggleEditorMode(mode: 'traditional' | 'modern') {
    this.editorMode = mode;
    // Clean out or append template automatically depending on editor mode loaded
    if (mode === 'modern') {
      this.fs.hmpBatchForm.inputs = this.fs.hmpBatchForm.inputs.filter((x: any) => x.item_id);
      this.fs.hmpBatchForm.outputs = this.fs.hmpBatchForm.outputs.filter((x: any) => x.item_id);
    } else {
      this.fs.formStatusChanges(mode);
    }
    this.toastr.info('Switched editor view to ' + (mode === 'traditional' ? 'Traditional' : 'Modern Preview'));
  }

  getName(list: any[], id: any, field: string): string {
    if (!list || !id) return '';
    const item = list.find((x: any) => x._id === id);
    return item ? (item[field] || '') : '';
  }

  onSubmit() {
    if (this.fs.valid(this.editorMode)) {
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
    const arr = type === 'inputs' ? this.fs.hmpBatchForm.inputs : this.fs.hmpBatchForm.outputs;
    const row = arr[index];
    if (row && row._id) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will also delete the associated auto-generated Aawak/Jaway entries from the database!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoader = true;
          const urlType = type === 'inputs' ? 'input' : 'output';
          this.http.delete(this.api.getUrl('HMP') + urlType + '/' + row._id).subscribe((data: any) => {
            this.isLoader = false;
            if (data.success || data.result) {
              arr.splice(index, 1);
              if (type === 'inputs') {
                this.fs.hmpBatchForm.inputs = [...arr];
              } else {
                this.fs.hmpBatchForm.outputs = [...arr];
              }
              this.toastr.success('Item deleted successfully from database');
            } else {
              this.toastr.error('Failed to delete item');
            }
          }, err => {
            this.isLoader = false;
            this.toastr.error('Error occurred while deleting item');
          });
        }
      });
    } else {
      if (type === 'inputs' && this.fs.hmpBatchForm.inputs.length > 1) {
        this.fs.hmpBatchForm.inputs.splice(index, 1);
        this.fs.hmpBatchForm.inputs = [...this.fs.hmpBatchForm.inputs];
      } else if (type === 'outputs' && this.fs.hmpBatchForm.outputs.length > 1) {
        this.fs.hmpBatchForm.outputs.splice(index, 1);
        this.fs.hmpBatchForm.outputs = [...this.fs.hmpBatchForm.outputs];
      }
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  closeModal() {
    $('#hmpEntryComponent > #showModal').modal('hide');
    this.showModal = '';
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

  toggleAuto(rowOrModel: any, type: 'jawak' | 'aawak', isChecked: boolean) {
    if (!isChecked) {
      // User is turning OFF the checkbox
      const refId = type === 'jawak' ? rowOrModel.jawak_ref_id : rowOrModel.aawak_ref_id;
      if (refId) {
        // Record is already created in the DB!
        Swal.fire({
          title: 'Delete Reference Record?',
          text: type === 'jawak'
            ? 'Turning off Auto-Jawak will delete the already created Jawak record in the database! Are you sure?'
            : 'Turning off Auto-Aawak will delete the already created Aawak record AND all associated Jawak distribution entries in the database! Are you sure?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            this.isLoader = true;
            const urlPath = type === 'jawak' ? 'JAWAK' : 'AAWAK';
            this.http.delete(this.api.getUrl(urlPath) + '/' + refId).subscribe((data: any) => {
              this.isLoader = false;
              if (data.success || data.result) {
                if (type === 'jawak') {
                  rowOrModel.jawak_ref_id = null;
                  rowOrModel.auto_jawak = false;
                } else {
                  rowOrModel.aawak_ref_id = null;
                  rowOrModel.auto_aawak = false;
                  rowOrModel.jawak_detail = [];
                }
                this.toastr.success(`${type === 'jawak' ? 'Jawak' : 'Aawak'} record deleted successfully`);
              } else {
                this.toastr.error(`Failed to delete ${type === 'jawak' ? 'Jawak' : 'Aawak'} record`);
                // Revert check
                if (type === 'jawak') rowOrModel.auto_jawak = true;
                else rowOrModel.auto_aawak = true;
              }
            }, err => {
              this.isLoader = false;
              this.toastr.error(`Error occurred while deleting ${type === 'jawak' ? 'Jawak' : 'Aawak'} record`);
              // Revert check
              if (type === 'jawak') rowOrModel.auto_jawak = true;
              else rowOrModel.auto_aawak = true;
            });
          } else {
            // User cancelled, revert the checkbox
            if (type === 'jawak') rowOrModel.auto_jawak = true;
            else rowOrModel.auto_aawak = true;
          }
        });
        return;
      }
    }
    // Standard toggling for unsaved/new items
    if (type === 'jawak') {
      rowOrModel.auto_jawak = isChecked;
    } else {
      rowOrModel.auto_aawak = isChecked;
    }
  }

  openModal(title: string) {
    this.showModal = title;
    setTimeout(() => {
      $('#hmpEntryComponent > #showModal').modal('show');
    }, 100);
  }

  addMMResponse(ev: any) {
    if (ev && ev._id) {
      this.fs.hmpBatchForm.mm_id = ev._id;
    }
    this.closeModal();
  }
}
