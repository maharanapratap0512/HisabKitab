import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-variant-edit-entry',
    templateUrl: './variant-edit-entry.component.html',
    styleUrls: ['./variant-edit-entry.component.scss'],
})
export class VariantEditEntryComponent implements OnInit, OnChanges {

    @Input() getData: any = null;
    @Input() isEdit: boolean = false;
    @Input() units: any[] = [];
    @Input() categories: any[] = [];
    @Output() response = new EventEmitter<any>();

    formData: any = {
        display_name_hin: '',
        display_name_eng: '',
        display_name_roman: '',
        sku: '',
        unit_id: null,
        min_rate: 0,
        max_rate: 0,
        extra_note: '',
        category_ids: [],
        aliases: [],
    };

    newAlias = '';
    isLoader = false;

    constructor(
        private http: HttpService,
        private api: ApiService,
        public gs: GlobalService,
        public auth: AuthService,
        private toastr: ToastrService,
    ) { }

    ngOnInit(): void { this.patchForm(); }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['getData']) this.patchForm();
    }

    patchForm() {
        if (!this.getData) return;
        const v = this.getData;
        this.formData = {
            display_name_hin: v.display_name || '',
            display_name_eng: v.subitem?.subitem_eng || '',
            display_name_roman: v.subitem?.subitem_roman || '',
            sku: v.sku || '',
            unit_id: v.subitem?.unit_id || null,
            min_rate: v.subitem?.min_rate || 0,
            max_rate: v.subitem?.max_rate || 0,
            extra_note: v.subitem?.extra_note || '',
            category_ids: (v.categories || []).map((c: any) => c.category_id),
            aliases: (v.aliases || []).map((a: any) => ({ alias: a.alias })),
        };
    }

    addAlias() {
        const a = this.newAlias.trim();
        if (!a) return;
        if (!this.formData.aliases) this.formData.aliases = [];
        this.formData.aliases.push({ alias: a });
        this.newAlias = '';
    }

    removeAlias(i: number) { this.formData.aliases.splice(i, 1); }

    toggleCategory(cat_id: number) {
        const idx = this.formData.category_ids.indexOf(cat_id);
        if (idx >= 0) this.formData.category_ids.splice(idx, 1);
        else this.formData.category_ids.push(cat_id);
    }

    isCatSelected(cat_id: number): boolean {
        return this.formData.category_ids.includes(cat_id);
    }

    save() {
        if (!this.formData.display_name_hin?.trim()) {
            this.toastr.warning('Hindi display name required hai');
            return;
        }

        this.isLoader = true;
        this.http.put(this.api.getUrl('VARIANT') + this.getData._id, this.formData)
            .subscribe((d: any) => {
                this.isLoader = false;
                if (d.success) this.response.emit({ reload: true });
            });
    }

    deleteVariant() {
        if (!this.getData?._id) return;
        Swal.fire({
            title: 'Delete Variant?',
            text: `"${this.formData.display_name_hin || 'This variant'}" aur iska subitem delete hoga.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Haan, delete karo',
            cancelButtonText: 'Cancel'
        }).then(r => {
            if (!r.isConfirmed) return;
            this.isLoader = true;
            this.http.delete(this.api.getUrl('VARIANT') + this.getData._id)
                .subscribe({
                    next: (d: any) => {
                        this.isLoader = false;
                        if (d.success) {
                            this.toastr.success('Variant delete ho gaya!');
                            this.response.emit({ reload: true, closeModal: true });
                        } else {
                            this.toastr.error(d.message || 'Failed to delete variant.');
                        }
                    },
                    error: (err: any) => {
                        this.isLoader = false;
                        this.toastr.error(err?.error?.message || err?.error || 'Failed to delete variant.');
                    }
                });
        });
    }
}
