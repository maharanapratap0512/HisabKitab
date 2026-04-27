import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
    selector: 'app-item-alias-entry',
    templateUrl: './item-alias-entry.component.html',
    styleUrls: ['./item-alias-entry.component.scss'],
})
export class ItemAliasEntryComponent implements OnInit {

    @Input()  getData: any = null;   // the item object
    @Output() response = new EventEmitter<any>();

    aliasForm = { alias: '', language: 'hin' };
    rows:     any[] = [];

    constructor(
        private http:   HttpService,
        private api:    ApiService,
        private toastr: ToastrService,
    ) {}

    ngOnInit(): void { this.loadAliases(); }

    loadAliases() {
        if (!this.getData?._id) return;
        this.http.get(this.api.getUrl('VARIANT') + 'item-aliases/' + this.getData._id)
            .subscribe((d: any) => { this.rows = d.success ? d.result : []; });
    }

    save() {
        if (!this.aliasForm.alias.trim()) { this.toastr.warning('Alias required hai'); return; }
        const payload = { item_id: this.getData._id, ...this.aliasForm };
        this.http.post(this.api.getUrl('VARIANT') + 'item-aliases', payload)
            .subscribe((d: any) => {
                if (d.success) {
                    this.toastr.success('Alias add ho gaya!');
                    this.aliasForm.alias = '';
                    this.loadAliases();
                    this.response.emit({ reload: true });
                }
            });
    }

    delete(row: any) {
        this.http.delete(this.api.getUrl('VARIANT') + 'item-aliases/' + row._id)
            .subscribe((d: any) => {
                if (d.success) { this.loadAliases(); this.response.emit({ reload: true }); }
            });
    }
}
