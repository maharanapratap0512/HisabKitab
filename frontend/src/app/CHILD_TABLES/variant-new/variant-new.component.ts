
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
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';

declare var $: any;

@Component({
  selector: 'app-variant-new',
  templateUrl: './variant-new.component.html',
  styleUrls: ['./variant-new.component.scss']
})
export class VariantNewComponent implements OnInit {

  settings: any = {};
  menuItems: any[] = [];

  delID: any;
  delType: string = '';

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
  allItems: any[] = [];

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
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    this.settings = this.auth.webUser.settings?.variant ?? {};
    this.gs.observeList().subscribe((r: any) => {
      this.categories = r.category || [];
      this.units = r.unit || [];
      this.allItems = r.itemmix || [];
    });
    this.getItemData(1);
    this.loadAttributes();
    this.setupContextMenu();
  }

  setupContextMenu() {
    this.menuItems = [
      {
        label: 'Edit Item',
        icon: 'uil uil-pen',
        action: (item: any) => this.openEditItem(item),
        disabled: !this.auth.webUser.settings?.item?.edit
      },
      {
        label: 'Add Alias',
        icon: 'uil uil-plus-circle',
        action: (item: any) => this.openAliasManager(item)
      },
      {
        label: 'Generate Variants',
        icon: 'uil uil-layers',
        action: (item: any) => this.openGenerator(item)
      },
      {
        label: 'Lock Item',
        icon: 'uil uil-lock-alt',
        action: (item: any) => this.lockItem(item._id),
        disabled: (item: any) => item.restrict_year
      },
      {
        label: 'Unlock Item',
        icon: 'uil uil-unlock-alt',
        action: (item: any) => this.unlockItem(item._id),
        disabled: (item: any) => !item.restrict_year
      },
      {
        label: 'Delete Item',
        icon: 'uil uil-trash',
        action: (item: any) => this.deleteItem(item),
        disabled: !this.auth.webUser.settings?.item?.delete
      }
    ];
  }

  // ════════════════════════════════════════════════════════════════════════
  //  ITEM TABLE
  // ════════════════════════════════════════════════════════════════════════

  getItemData(pageNo: number) {
    this.isLoader = true;
    this.conditionObj.pageNo = pageNo;
    this.http.put(this.api.getUrl('VARIANT') + 'items/' + this.auth.webUser.dept_id, this.conditionObj)
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

  applyFilter() {
    this.getItemData(1);
  }

  async exportToExcel() {
    this.spinner.show();
    const body = { ...this.conditionObj, limit: -1, offset: 0 };
    this.http.put(this.api.getUrl('VARIANT') + 'items/' + this.auth.webUser.dept_id, body)
      .subscribe(async (d: any) => {
        const fullData = d.result || [];
        // parse JSON if needed (same as getItemData)
        for (const item of fullData) {
          try { item.categories = typeof item.categories === 'string' ? JSON.parse(item.categories) : (item.categories || []); }
          catch { item.categories = []; }
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Variants Data');

        const borderThin: Partial<ExcelJS.Borders> = {
          top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF203764' } }; // Dark Blue
        const boldWhite: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };

        ws.columns = [
          { header: 'Sr', key: 'sr', width: 5 },
          { header: 'Item Name', key: 'item', width: 25 },
          { header: 'Code', key: 'code', width: 10 },
          { header: 'Categories', key: 'cats', width: 20 },
          { header: 'Unit', key: 'unit', width: 10 },
          { header: 'Variant Name', key: 'v_name', width: 25 },
          { header: 'SKU', key: 'sku', width: 15 },
          { header: 'Attributes', key: 'attrs', width: 30 },
          { header: 'Rate', key: 'rate', width: 10 },
          { header: 'Type', key: 'type', width: 10 }
        ];

        ws.getRow(1).eachCell(cell => {
          cell.font = boldWhite;
          cell.fill = headerFill;
          cell.border = borderThin;
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        fullData.forEach((item: any, iIdx: number) => {
          const cats = (item.categories || []).map((c: any) => c.category_hin).join(', ');

          // Variants
          if (item.variants && item.variants.length > 0) {
            item.variants.forEach((v: any, vIdx: number) => {
              const attrs = (v.attributes || []).map((a: any) => `${a.attribute_hin}: ${a.value_hin}`).join(', ');
              ws.addRow({
                sr: vIdx === 0 ? iIdx + 1 : '',
                item: vIdx === 0 ? item.item_hin : '',
                code: vIdx === 0 ? item.item_code : '',
                cats: vIdx === 0 ? cats : '',
                unit: vIdx === 0 ? item.unit_short : '',
                v_name: v.display_name,
                sku: v.sku,
                attrs: attrs,
              }).eachCell(cell => cell.border = borderThin);
            });
          } else {
            ws.addRow({
              sr: iIdx + 1,
              item: item.item_hin,
              code: item.item_code,
              cats: cats,
              unit: item.unit_short,
              v_name: '—',
              sku: '—',
              attrs: '—',
              rate: item.min_rate || '',
              type: 'Item Only'
            }).eachCell(cell => cell.border = borderThin);
          }
        });

        const buffer = await wb.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Variants_Report_${new Date().getTime()}.xlsx`);
        this.spinner.hide();
      }, err => {
        this.spinner.hide();
        this.toastr.error('Export failed!');
      });
  }

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

    // Use embedded data if available to avoid API call
    if (item.variants !== undefined) {
      this.expandedVariants = item.variants || [];
      this.expandedUnlinked = item.unlinked_subitems || [];
      this.expandedLoading = false;
      return;
    }

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

  openEditItem(item: any) {
    this.editData = item;
    this.isEdit = true;
    this.openModal('Edit Item');
  }

  lockItem(id: any) {
    this.app.appModal$ = new Subject();
    this.app.appModal$.subscribe((result: any) => {
      if (result) this.toggleLock({ _id: id, ...result });
    });
    this.app.openModal('lockModal');
  }

  unlockItem(id: any) {
    this.toggleLock({ _id: id, restrict_month: null, restrict_year: null });
  }

  toggleLock(row: any) {
    this.http.put(this.api.getUrl('ITEM') + 'lock/', row).subscribe((data: any) => {
      this.toastr.success(data['result'].restrict_year ? "Locked Successfully" : "Unlocked Successfully");
      const idx = this.itemData.findIndex(i => i._id === data['result']._id);
      if (idx > -1) {
        this.itemData[idx].restrict_month = data['result'].restrict_month;
        this.itemData[idx].restrict_year = data['result'].restrict_year;
      }
    });
  }

  deleteItem(item: any) {
    this.delID = item._id;
    this.delType = 'item';
    this.openModal('delete_item');
  }

  deleteResponse(ev: any) {
    if (ev) {
      this.closeModal();
      this.toastr.success((this.delType || 'Item') + " deleted successfully.");
      this.getItemData(this.page);
    }
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
    if (result?.refreshAttributes) {
      this.loadAttributes();
      return;
    }
    if (!result?.reload) return;
    
    if (result.createdCount > 0) {
      this.toastr.success(`${result.createdCount} variant(s) create ho gaye!`);
    }
    
    if (result.skippedCount > 0) {
      this.toastr.warning(`${result.skippedCount} variant(s) already exist karte hain (skipped).`);
    }

    this.closeModal();
    // Refresh the specific item to show new variants
    this.refreshItemData(this.activeItem._id);
  }

  refreshItemData(itemId: number) {
    // We fetch the updated list but only update the specific item to maintain state
    this.http.put(this.api.getUrl('VARIANT') + 'items/' + this.auth.webUser.dept_id, { ...this.conditionObj, item_ids: [itemId] })
      .subscribe((d: any) => {
        if (d.success && d.result?.[0]) {
          const updated = d.result[0];
          const idx = this.itemData.findIndex(i => i._id === itemId);
          if (idx > -1) {
            this.itemData[idx] = updated;
            this.itemData = [...this.itemData]; // Force refresh for pipes (like paginate)
            
            // Force refresh of the expanded accordion
            if (this.expandedItemId === itemId) {
              this.expandedItemId = null;
              setTimeout(() => {
                this.expandedItemId = itemId;
              }, 50);
            }
          }
        }
      });
  }

  onVariantEdited(result: any) {
    if (!result?.reload) return;
    this.toastr.success('Variant update ho gaya!');
    this.closeModal();
    if (this.activeItem) this.refreshItemData(this.activeItem._id);
  }

  onItemEdited(result: any) {
    if (!result?._id) return;
    this.toastr.success('Item updated!');
    this.closeModal();
    this.refreshItemData(result._id);
  }

  onAttributeSaved(result: any) {
    if (result?.reload) { this.loadAttributes(); }
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

  onAliasSaved(result: any) {
    if (!result?.reload) return;
    if (this.activeItem) this.refreshItemData(this.activeItem._id);
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

  subitemCount(item: any): number { return item.subitem_count ?? item.subitems?.length ?? 0; }
  variantCount(item: any): number { return item.variant_count ?? item.subitems?.filter((s: any) => s.variant_id)?.length ?? 0; }
  aliasDisplay(item: any): string {
    const aliases = item.item_aliases;
    if (!Array.isArray(aliases) || aliases.length === 0) return '';
    return aliases.map((a: any) => a.alias).filter(Boolean).join(', ');
  }
  trackById(_: any, item: any) { return item._id; }
}