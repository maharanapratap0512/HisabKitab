import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

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
  @Input() item: any;
  @Input() subitem: any;
  @Input() aawak: any;
  @Input() jawak: any;
  @Input() pbk: any;
  @Input() bachat: any;
  @Output() response = new EventEmitter();
  isEditingImages: boolean = false;
  editDoc: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService,
    public auth: AuthService,
    private toastr: ToastrService
  ) {
    this.baseUrl = this.api.getUrl('BASE');
  }

  ngOnChanges(changes: SimpleChanges) {    
    if (changes.getData && changes.getData.currentValue) {
      this.product = changes.getData.currentValue;
      this.getAawakData();
    }
    if (changes.item && changes.item.currentValue) {
      this.item = changes.item.currentValue;
    }
    if (changes.subitem && changes.subitem.currentValue) {
      this.subitem = changes.subitem.currentValue;
    }
    if (changes.aawak && changes.aawak.currentValue) {
      this.aawak = changes.aawak.currentValue;
    }
    if (changes.jawak && changes.jawak.currentValue) {
      this.jawak = changes.jawak.currentValue;
    }
    if (changes.pbk && changes.pbk.currentValue) {
      this.pbk = changes.pbk.currentValue;
    }
    if (changes.bachat && changes.bachat.currentValue) {
      this.bachat = changes.bachat.currentValue;
    }

    this.updateEditDoc();
    this.updateMainImage();
  }

  updateMainImage() {
    if (this.editDoc && this.editDoc.document?.images?.length > 0) {
      if (!this.editDoc.image || !this.editDoc.document.images.includes(this.editDoc.image)) {
        this.editDoc.image = this.editDoc.document.images[0];
      }
    } else if (this.editDoc) {
      this.editDoc.image = null;
    }
  }

  updateEditDoc() {
    if (this.product) this.editDoc = this.product;
    else if (this.item) this.editDoc = this.item;
    else if (this.subitem) this.editDoc = this.subitem;
    else if (this.aawak) this.editDoc = this.aawak;
    else if (this.jawak) this.editDoc = this.jawak;
    else if (this.pbk) this.editDoc = this.pbk;
    else if (this.bachat) this.editDoc = this.bachat;
  }

  toggleImageEdit() {
    this.isEditingImages = !this.isEditingImages;
  }

  handleImagesResponse(images: any) {
    if (!images) return;
    this.saveImages(images);
  }

  removeImage(index: number) {
    Swal.fire({
      title: 'Remove Image?',
      text: "Do you want to delete the actual file or just remove it from this entry?",
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Delete Permanently',
      denyButtonText: 'Remove from Entry',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#f1556c',
      denyButtonColor: '#727cf5',
    }).then((result) => {
      if (result.isConfirmed) {
        // Permanent Delete
        this.deleteFilePermanently(this.editDoc.document.images[index], index);
      } else if (result.isDenied) {
        // Just remove from array
        const updatedImages = [...this.editDoc.document.images];
        updatedImages.splice(index, 1);
        this.saveImages(updatedImages);
      }
    });
  }

  deleteFilePermanently(filename: string, index: number) {
    this.isLoader = true;
    let type = this.product ? 'product' : (this.item ? 'item' : (this.subitem ? 'item' : (this.aawak ? 'aawak' : (this.jawak ? 'jawak' : 'pbk'))));
    
    this.http.delete(this.api.getUrl('IMAGE'), { filename: filename, type: type }).subscribe((data: any) => {
      if (data && data.success) {
        const updatedImages = [...this.editDoc.document.images];
        updatedImages.splice(index, 1);
        this.saveImages(updatedImages);
      } else {
        this.toastr.error('Failed to delete file from server');
        this.isLoader = false;
      }
    }, err => {
      this.toastr.error('Error deleting file');
      this.isLoader = false;
    });
  }

  saveImages(images: any) {
    this.isLoader = true;
    let url = '';
    let body: any = { query: {}, set: {} };

    if (this.product) {
      url = this.api.getUrl('PRODUCT');
      body = { query: { _id: this.product._id }, set: { ...this.product, document: { images: images } } };
    } else if (this.item) {
      url = this.api.getUrl('ITEM');
      body = { query: { _id: this.item._id }, set: { ...this.item, document: { images: images } } };
    } else if (this.subitem) {
      url = this.api.getUrl('SUBITEM');
      body = { query: { _id: this.subitem._id }, set: { ...this.subitem, document: { images: images } } };
    } else if (this.aawak) {
      url = this.api.getUrl('AAWAK') + 'update-row';
      body = { _id: this.aawak._id, document: { images: images } };
    } else if (this.jawak) {
      url = this.api.getUrl('JAWAK') + 'update-row';
      body = { _id: this.jawak._id, document: { images: images } };
    } else if (this.pbk) {
      url = this.api.getUrl('PBK');
      body = { query: { _id: this.pbk._id }, set: { ...this.pbk, document: { images: images } } };
    }

    this.http.put(url, body).subscribe((data: any) => {
      if (data && data.success) {
        this.toastr.success('Images updated successfully');
        if (this.editDoc && this.editDoc.document) {
          this.editDoc.document.images = images;
        }
        this.updateMainImage();
        this.isEditingImages = false;
      } else {
        this.toastr.error(data?.message || 'Failed to update images');
      }
      this.isLoader = false;
    }, err => {
      this.toastr.error('Error updating images');
      this.isLoader = false;
    });
  }

  ngOnInit(): void {
  }

  getAawakData() {
    this.isLoader = true;
    let body = {
      product_id: [this.product._id],
      orderBy: `date desc`
    }
    this.http.put(this.api.getUrl('AAWAK') + 'filter/' + this.auth.webUser.dept_id, body).subscribe((data: any) => {
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
          this.product.tracking_detail.push(trk);
          for (let j = 0; j < data['result'][i].jawak_detail.length; j++) {
            if (j == 0) {
              this.product.tracking_detail[i].jdate = data['result'][i].jawak_detail[j].date;
              this.product.tracking_detail[i].jpkt_num = data['result'][i].jawak_detail[j].pkt_num;
              this.product.tracking_detail[i].jawak_mm_hin = data['result'][i].jawak_detail[j].jawak_mm_hin;
            } else {
              trk = {
                date: null,
                pkt_num: null,
                mm_hin: null,
                aawak_mm_hin: null,
                jdate: data['result'][i].jawak_detail[j].date,
                jpkt_num: data['result'][i].jawak_detail[j].pkt_num,
                jawak_mm_hin: data['result'][i].jawak_detail[j].jawak_mm_hin
              }
              this.product.tracking_detail.push(trk);
            }
          }
        }

      }
    });
    this.isLoader = false;
  }
}
