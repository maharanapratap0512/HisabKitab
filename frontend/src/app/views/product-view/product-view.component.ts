import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api.service';
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
    private spinner: NgxSpinnerService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    console.log("change", changes);

    if (changes.getData.currentValue) {
      this.product = changes.getData.currentValue;
      // this.baseUrl = this.api.getUrl('BASE');
      let imgs = JSON.parse(this.product.document);
      if (imgs.images) {
        for (let i = 0; i < imgs.images.length; i++) {
          this.product['image'+(i+1)] = imgs.images[i] ? this.api.getUrl('BASE') + imgs.images[i] : null;
        }
      }
    }
    console.log("prdt", this.product);
  }

  ngOnInit(): void {
  }

  changeImage(i:any){
    let img = this.product['image1'];
    this.product.image1 = this.product['image'+i];
    this.product['image'+i] = img;

  }
}
