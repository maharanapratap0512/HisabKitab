import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss']
})
export class ProductViewComponent implements OnInit {

  imageFolder: any = [];
  baseUrl: any;
  isLoader: any;
  product: any = null;
  renameFileName: any;
  @Input() getData: any;
  // @Input() isEdit: any;
  @Output() response = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService
  ) {
    this.baseUrl = this.api.getUrl('BASE');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("change", changes);

    if (changes.getData.currentValue) {
      this.product = changes.getData.currentValue;
    }
    this.getAawakData();
    if (this.product.document && this.product.document.images && this.product.document.images.length > 0) {
      this.product.image = this.product.document.images[0];
    }
    console.log("prdt", this.product);
  }

  ngOnInit(): void {
  }

  getAawakData() {
    this.isLoader = true;
    let body = {
      product_id: [this.product._id],
      orderBy: `date desc`
    }
    this.http.put(this.api.getUrl('AAWAK') + this.auth.webUser.dept_id, body).subscribe((data: any) => {
      if (data['result']) {
        this.product.tracking_detail = [];
        for (let i in data['result']) {
          let trk = {
            date: data['result'][i].date,
            pkt_num: data['result'][i].pkt_num,
            mm_hin: data['result'][i].mm_hin,
            aawak_mm_hin: data['result'][i].aawak_mm_hin,
            jdate: null,
            jpkt_num: null,
            jawak_mm_hin: null
          };
          for (let j = 0; j < data['result'][i].jawak_detail.length; j++) {
            if (j == 0) {
              trk.jdate = data['result'][i].jawak_detail[j].date;
              trk.jpkt_num = data['result'][i].jawak_detail[j].pkt_num;
              trk.jawak_mm_hin = data['result'][i].jawak_detail[j].jawak_mm_hin;
              this.product.tracking_detail.push(trk);
            } else {
              trk = {
                date:null,
                pkt_num:null,
                mm_hin:null,
                aawak_mm_hin:null,
                jdate: data['result'][i].jawak_detail[j].date,
                jpkt_num: data['result'][i].jawak_detail[j].pkt_num,
                jawak_mm_hin: data['result'][i].jawak_detail[j].jawak_mm_hin
              }
              this.product.tracking_detail.push(trk);
            }
          }
          console.log(this.product.tracking_detail);
          
        }

      }
    });
    this.isLoader = false;
  }
}
