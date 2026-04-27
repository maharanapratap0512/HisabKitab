
// CHILD_TABLES/variant/variant.component.ts  — v3 COMPLETE REDESIGN
// Main page: Full-width accordion table (item row → expand → variants + subitems)
// Generator: Single-page, ng-select multi dropdowns, live combination preview

import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-variant-new',
  templateUrl: './variant-new.component.html',
  styleUrls: ['./variant-new.component.scss']
})
export class VariantNewComponent implements OnInit {

  settings: any = {};

  // ── Item table data ─────────────────────────────────────────────────────
  itemData: any[] = [];
  total_count = 0;
  page = 1;
  itemsPerPage = 50;
  isLoader = false;
  conditionObj: any = {};
  expandAll = false;

  // ── Expanded item (accordion open) ──────────────────────────────────────
  expandedItemId: number | null = null;
  expandedVariants: any[] = [];
  expandedUnlinked: any[] = [];
  expandedAliases: any[] = [];
  expandedLoading = false;

  // ── Master lists ─────────────────────────────────────────────────────────
  categories: any[] = [];
  units: any[] = [];
  allAttributes: any[] = [];
  attrValueMap: any = {};   // attribute_id → values[]

  // ── Modal state ──────────────────────────────────────────────────────────
  showModal = '';
  editData: any = null;
  isEdit = false;
  activeItem: any = null;   // item context for generator/alias modals

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
    this.gs.observeList().subscribe((r: any) => {
      this.categories = r.category || [];
      this.units = r.unit || [];
    });
    this.getItemData(1);
    this.loadAttributes();
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ITEM TABLE
  // ════════════════════════════════════════════════════════════════════════

  getItemData(pageNo: number) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('ITEMMIX') + this.auth.webUser.dept_id, this.conditionObj)
      .subscribe((d: any) => {
        if (d.success) {
          this.itemData = d.result || [];
          this.total_count = d.total_count || 0;
          this.page = pageNo;
          // parse subitems JSON if string
          for (const item of this.itemData) {
            try { item.subitems = typeof item.subitems === 'string' ? JSON.parse(item.subitems) : (item.subitems || []); }
            catch { item.subitems = []; }
            try { item.categories = typeof item.categories === 'string' ? JSON.parse(item.categories) : (item.categories || []); }
            catch { item.categories = []; }
          }
        }
        this.isLoader = false;
      });
  }

  onSearch(term: string) { this.conditionObj.search = term || undefined; this.getItemData(1); }
  onCatFilter(v: any) { this.conditionObj.categories = v || undefined; this.getItemData(1); }

  // ── Toggle accordion row ────────────────────────────────────────────────
  toggleAccordion(item: any) {
    if (this.expandedItemId === item._id) {
      this.expandedItemId = null;
      return;
    }
    this.expandedItemId = item._id;
    this.expandedVariants = [];
    this.expandedUnlinked = [];
    this.expandedAliases = [];
    this.expandedLoading = true;

    this.http.get(this.api.getUrl('VARIANT') + 'item/' + item._id)
      .subscribe((d: any) => {
        this.expandedLoading = false;
        if (d.success && d.result) {
          this.expandedVariants = d.result.variants || [];
          this.expandedUnlinked = d.result.unlinked_subitems || [];
          this.expandedAliases = d.result.item_aliases || [];
          this.attrValueMap = d.result.attr_value_map || {};
          this.allAttributes = d.result.all_attributes || [];
        }
      });
  }

  isExpanded(item: any): boolean { return this.expandedItemId === item._id; }

  loadAttributes() {
    this.http.get(this.api.getUrl('VARIANT') + 'attributes')
      .subscribe((d: any) => {
        if (d.success) this.allAttributes = d.result || [];
      });
    this.http.get(this.api.getUrl('VARIANT') + 'attribute-values')
      .subscribe((d: any) => {
        if (d.success) {
          this.attrValueMap = {};
          for (const av of (d.result || [])) {
            if (!this.attrValueMap[av.attribute_id]) this.attrValueMap[av.attribute_id] = [];
            this.attrValueMap[av.attribute_id].push(av);
          }
        }
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  MODAL CONTROL
  // ════════════════════════════════════════════════════════════════════════

  openModal(type: string) { this.showModal = type; $('#showModal').modal('show'); }

  closeModal() {
    $('#showModal').modal('hide');
    this.showModal = '';
    this.editData = null;
    this.isEdit = false;
    this.activeItem = null;
  }

  openGenerator(item: any) {
    this.activeItem = item;
    this.isEdit = false;
    this.editData = null;
    this.openModal('Generate Variants');
  }

  openEditVariant(v: any, item: any) {
    this.activeItem = item;
    this.isEdit = true;
    this.editData = v;
    this.openModal('Edit Variant');
  }

  openAttributeManager(mode: 'attributes' | 'attr_values') {
    this.editData = { mode };
    this.openModal(mode === 'attributes' ? 'Manage Attributes' : 'Manage Attribute Values');
  }

  openAliasManager(item: any) {
    this.activeItem = item;
    this.editData = item;
    this.openModal('Manage Item Aliases');
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RESPONSE HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  onVariantsGenerated(result: any) {
    if (!result?.reload) return;
    this.toastr.success(`${result.created} variant${result.created > 1 ? 's' : ''} create ho gaye!`);
    this.closeModal();
    // refresh expanded accordion
    if (this.expandedItemId) this.toggleAccordion({ _id: -1 }); // collapse
    const item = this.itemData.find((i: any) => i._id === this.activeItem?._id);
    if (item) setTimeout(() => this.toggleAccordion(item), 100);
    this.getItemData(this.page);
  }

  onVariantEdited(result: any) {
    if (!result?.reload) return;
    this.toastr.success('Variant update ho gaya!');
    this.closeModal();
    if (this.expandedItemId) {
      const item = this.itemData.find((i: any) => i._id === this.expandedItemId);
      if (item) { this.expandedItemId = null; setTimeout(() => this.toggleAccordion(item), 50); }
    }
  }

  onAttributeSaved(result: any) {
    if (result?.reload) { this.loadAttributes(); }
  }

  onAliasSaved(result: any) {
    if (!result?.reload) return;
    if (this.expandedItemId) {
      const item = this.itemData.find((i: any) => i._id === this.expandedItemId);
      if (item) { this.expandedItemId = null; setTimeout(() => this.toggleAccordion(item), 50); }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  //  DELETE
  // ════════════════════════════════════════════════════════════════════════

  deleteVariant(v: any) {
    Swal.fire({
      title: 'Delete Variant?', text: `"${v.display_name}" aur iska subitem delete hoga.`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Haan', cancelButtonText: 'Nahi'
    })
      .then(r => {
        if (!r.isConfirmed) return;
        this.http.delete(this.api.getUrl('VARIANT') + v._id)
          .subscribe((d: any) => {
            if (d.success) {
              this.toastr.success('Deleted!');
              this.expandedVariants = this.expandedVariants.filter((x: any) => x._id !== v._id);
              this.getItemData(this.page);
            }
          });
      });
  }

  // ════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ════════════════════════════════════════════════════════════════════════

  subitemCount(item: any): number { return item.subitems?.length || 0; }
  variantCount(item: any): number { return item.subitems?.filter((s: any) => s.variant_id)?.length || 0; }
  aliasDisplay(item: any): string {
    try {
      const aliases = typeof item.aliases === 'string' ? JSON.parse(item.aliases) : (item.aliases || []);
      return aliases.map((a: any) => a.alias || a).join(', ');
    } catch { return ''; }
  }
  trackById(_: any, item: any) { return item._id; }
}