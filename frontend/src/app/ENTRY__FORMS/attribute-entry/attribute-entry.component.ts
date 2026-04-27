import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-attribute-entry',
    templateUrl: './attribute-entry.component.html',
    styleUrls: ['./attribute-entry.component.scss'],
})
export class AttributeEntryComponent implements OnInit {

    @Input()  mode:          'attributes' | 'attr_values' = 'attributes';
    @Input()  allAttributes: any[] = [];
    @Output() response = new EventEmitter<any>();

    // Attribute form
    attrForm = { attribute_hin: '', attribute_eng: '', attribute_roman: '' };

    // Attribute value form
    attrValForm = {
        attribute_id: null as any,
        attribute_value_hin: '', attribute_value_eng: '', attribute_value_roman: ''
    };
    attrValFilter: any = null;   // filter table by attribute

    rows:     any[] = [];
    isLoader = false;

    constructor(
        private http:   HttpService,
        private api:    ApiService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void { this.loadRows(); }

    loadRows() {
        const url = this.mode === 'attributes'
            ? this.api.getUrl('VARIANT') + 'attributes'
            : (this.attrValFilter
                ? this.api.getUrl('VARIANT') + 'attributes/' + this.attrValFilter + '/values'
                : this.api.getUrl('VARIANT') + 'attribute-values');

        this.http.get(url).subscribe((d: any) => {
            this.rows = d.success ? d.result : [];
        });
    }

    saveAttr() {
        if (!this.attrForm.attribute_hin.trim()) { this.toastr.warning('Hindi name required'); return; }
        this.isLoader = true;
        this.http.post(this.api.getUrl('VARIANT') + 'attributes', this.attrForm)
            .subscribe((d: any) => {
                this.isLoader = false;
                if (d.success) {
                    this.toastr.success('Attribute add ho gaya!');
                    this.attrForm = { attribute_hin: '', attribute_eng: '', attribute_roman: '' };
                    this.loadRows();
                    this.response.emit({ reload: true });
                }
            });
    }

    deleteAttr(row: any) {
        Swal.fire({ title: 'Delete?', text: 'Iske sab values bhi delete honge.', icon: 'warning',
                    showCancelButton: true, confirmButtonText: 'Haan' }).then(r => {
            if (r.isConfirmed) {
                this.http.delete(this.api.getUrl('VARIANT') + 'attributes/' + row._id)
                    .subscribe((d: any) => {
                        if (d.success) { this.loadRows(); this.response.emit({ reload: true }); }
                    });
            }
        });
    }

    saveAttrVal() {
        if (!this.attrValForm.attribute_id || !this.attrValForm.attribute_value_hin.trim()) {
            this.toastr.warning('Attribute aur Hindi value required hai');
            return;
        }
        this.isLoader = true;
        this.http.post(this.api.getUrl('VARIANT') + 'attribute-values', this.attrValForm)
            .subscribe((d: any) => {
                this.isLoader = false;
                if (d.success) {
                    this.toastr.success('Value add ho gayi!');
                    this.attrValForm = { attribute_id: this.attrValForm.attribute_id,
                        attribute_value_hin: '', attribute_value_eng: '', attribute_value_roman: '' };
                    this.loadRows();
                    this.response.emit({ reload: true });
                }
            });
    }

    deleteAttrVal(row: any) {
        this.http.delete(this.api.getUrl('VARIANT') + 'attribute-values/' + row._id)
            .subscribe((d: any) => {
                if (d.success) { this.loadRows(); this.response.emit({ reload: true }); }
            });
    }

    onAttrValFilter(id: any) {
        this.attrValFilter = id || null;
        this.loadRows();
    }
}
