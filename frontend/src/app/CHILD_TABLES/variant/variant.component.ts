// CHILD_TABLES/variant/variant.component.ts
// Pattern: exact same as item.component.ts + hmp.component.ts
//   - showModal string state
//   - openModal(type) / closeModal()
//   - jQuery $('#showModal').modal('show/hide')
//   - Entry forms are separate components used inside modal via *ngIf
//   - Reads from gs.observeList() for master data
//   - NO local styling → theme CSS classes (card, btn, form-control etc.)

import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

declare var $: any;

export const SEPARATORS = [
  { label: 'Space', value: ' ' },
  { label: '+', value: '+' },
  { label: '-', value: '-' },
  { label: '/', value: '/' },
  { label: '|', value: '|' },
];

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss'],
})
export class VariantComponent implements OnInit {

  // ── Settings (from dept config) ─────────────────────────────────────────
  settings: any = {};

  // ── Item list (left panel) ───────────────────────────────────────────────
  itemData: any[] = [];
  total_count = 0;
  page = 1;
  itemsPerPage = 100;
  isLoader = false;
  conditionObj: any = {};   // filter body sent to ITEMMIX API

  // ── Master lists (from resolver) ─────────────────────────────────────────
  categories: any[] = [];
  units: any[] = [];

  // ── Selected item context ────────────────────────────────────────────────
  selectedItem: any = null;
  itemVariants: any[] = [];
  unlinkedSubitems: any[] = [];
  itemAliases: any[] = [];
  allAttributes: any[] = [];
  attrValueMap: any = {};   // attribute_id → AttributeValue[]

  // ── Modal state — same pattern as item.component.ts ─────────────────────
  showModal = '';
  editData: any = null;
  isEdit = false;

  // ── Inline alias quick-add on right panel ────────────────────────────────
  newAliasText = '';
  newAliasLanguage = 'hin';

  separators = SEPARATORS;

  constructor(
    private http: HttpService,
    private api: ApiService,
    public gs: GlobalService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.settings = this.auth.webUser.settings?.variant ?? {};
    this.gs.observeList().subscribe((result: any) => {
      this.categories = result.category || [];
      this.units = result.unit || [];
    });
    this.getItemData(1);
    this.loadAttributes();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ITEM LIST
  // ════════════════════════════════════════════════════════════════════════

  getItemData(pageNo: number) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id, this.conditionObj)
      .subscribe((data: any) => {
        if (data.success) {
          this.itemData = data.result || [];
          this.total_count = data.total_count || 0;
          this.page = pageNo;
        }
        this.isLoader = false;
      });
  }

  onCatFilter(cat_id: any) {
    this.conditionObj.categories = cat_id || undefined;
    this.getItemData(1);
  }

  onSearch(term: string) {
    this.conditionObj.search = term || undefined;
    this.getItemData(1);
  }

  // ─── Select item → load variant data ─────────────────────────────────────
  selectItem(item: any) {
    this.selectedItem = item;
    this.itemVariants = [];
    this.unlinkedSubitems = [];
    this.itemAliases = [];
    this.loadItemVariantData(item._id);
  }

  loadItemVariantData(item_id: number) {
    this.spinner.show();
    this.http.get(this.api.getUrl('VARIANT') + 'item/' + item_id)
      .subscribe((d: any) => {
        this.spinner.hide();
        if (d.success && d.result) {
          this.itemVariants = d.result.variants || [];
          this.unlinkedSubitems = d.result.unlinked_subitems || [];
          this.itemAliases = d.result.item_aliases || [];
          this.attrValueMap = d.result.attr_value_map || {};
          this.allAttributes = d.result.all_attributes || [];
        }
      });
  }

  loadAttributes() {
    this.http.get(this.api.getUrl('VARIANT') + 'attributes')
      .subscribe((d: any) => {
        if (d.success) this.allAttributes = d.result || [];
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MODAL CONTROL — exact item.component.ts pattern
  // ════════════════════════════════════════════════════════════════════════

  openModal(type: string) {
    this.showModal = type;
    $('#showModal').modal('show');
  }

  closeModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
    this.editData = null;
    this.isEdit = false;
  }

  // ─── Open variant generator (fresh) ──────────────────────────────────────
  openGenerator() {
    if (!this.selectedItem) { this.toastr.warning('Pehle ek item select karo'); return; }
    this.isEdit = false;
    this.editData = null;
    this.openModal('Generate Variants');
  }

  // ─── Open edit variant modal ──────────────────────────────────────────────
  openEditVariant(v: any) {
    this.isEdit = true;
    this.editData = v;
    this.openModal('Edit Variant');
  }

  // ─── Open attribute manager modal ─────────────────────────────────────────
  openAttributeManager(mode: 'attributes' | 'attr_values') {
    this.editData = { mode };
    this.openModal(mode === 'attributes' ? 'Manage Attributes' : 'Manage Attribute Values');
  }

  // ─── Open item alias manager ──────────────────────────────────────────────
  openAliasManager() {
    if (!this.selectedItem) return;
    this.editData = this.selectedItem;
    this.openModal('Manage Item Aliases');
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RESPONSE HANDLERS  (called by entry-form components via (response) Output)
  // ════════════════════════════════════════════════════════════════════════

  onVariantsGenerated(result: any) {
    // result: { created: number } from variant-generator-entry
    if (result?.reload) {
      this.toastr.success(`${result.created || result.createdCount || ''} variant(s) create ho gaye!`);
      if (result.closeModal !== false) {
        this.closeModal();
      }
      if (this.selectedItem?._id) {
        this.loadItemVariantData(this.selectedItem._id);
      }
      this.getItemData(this.page);   // refresh subitem count in left panel
    }
  }

  onVariantEdited(result: any) {
    if (result?.reload) {
      this.toastr.success('Variant update ho gaya!');
      this.closeModal();
      if (this.selectedItem?._id) {
        this.loadItemVariantData(this.selectedItem._id);
      }
    }
  }

  onAttributeSaved(result: any) {
    if (result?.reload || result?.refreshAttributes) {
      this.loadAttributes();
      if (this.selectedItem?._id) {
        this.loadItemVariantData(this.selectedItem._id);
      }
    }
  }

  onAliasSaved(result: any) {
    if (result?.reload) {
      this.loadItemVariantData(this.selectedItem._id);
    }
  }

  itemAddResponse(ev: any) {
    this.closeModal();
    if (ev) {
      this.getItemData(1);
    }
  }

  subitemAddResponse(ev: any) {
    this.closeModal();
    if (ev) {
      this.getItemData(this.page);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DELETE VARIANT
  // ════════════════════════════════════════════════════════════════════════

  deleteVariant(v: any) {
    Swal.fire({
      title: 'Delete Variant?',
      text: `"${v.display_name}" aur iska linked subitem dono delete honge.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Haan, Delete Karo',
      cancelButtonText: 'Nahi',
    }).then(r => {
      if (r.isConfirmed) {
        this.http.delete(this.api.getUrl('VARIANT') + v._id)
          .subscribe((d: any) => {
            if (d.success) {
              this.toastr.success('Variant delete ho gaya!');
              this.loadItemVariantData(this.selectedItem._id);
              this.getItemData(this.page);
            }
          });
      }
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════════════════

  getSubitemCount(item: any): number {
    try { return JSON.parse(item.subitems || '[]').length; }
    catch { return item.subitems?.length || 0; }
  }

  trackById(_: any, item: any) { return item._id; }
}