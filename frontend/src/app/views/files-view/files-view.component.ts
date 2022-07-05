import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2'


@Component({
  selector: 'app-files-view',
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.scss']
})
export class FilesViewComponent implements OnInit {

  imageName: any = [];
  imageFolder: any = [];
  apiName: any = "IMAGE";
  baseUrl: any;
  isLoader: any;
  renameFileName: any;
  @Input() getData: any;
  @Input() type: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toastr: ToastrService,
    private api: ApiService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService
  ) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type) {
      this.type = changes.type.currentValue;
      this.baseUrl = this.api.getUrl('BASE');
      // switch (changes.type.currentValue) {
      //   case 'pbk': this.apiName = "PBKIMAGE";
      //     break;
      //   case 'product': this.apiName = "PRODUCTIMAGE";
      //     break;
      //   case 'aawak': this.apiName = "AAWAKIMAGE";
      //     break;
      //   case 'jawak': this.apiName = "JAWAKIMAGE";
      //     break;
      // }
    }
  }

  ngOnInit(): void {
    this.getImages();
    this.baseUrl = this.api.getUrl('BASE');
  }

  getImages() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('IMAGE'), {type:this.type}).subscribe((data:any) => {
      if (data['result'] && data['success']) {
        this.imageName = data['result'];
        this.imageFolder = data['dirpath'];
        this.isLoader = false;
      }
      this.isLoader = false;
    });
  }

  changeDocument(event: any): void {
    // this.doctfile = event.target.files[0];
    const formData = new FormData();
    console.log("base",this.baseUrl);
    console.log("image",this.imageFolder);
    
    formData.append('type', this.type);
    formData.append('image', event.target.files[0]);
    this.http.postFormData(this.api.getUrl(this.apiName), formData).subscribe((data: any) => {
      if (data) {
        this.toastr.success("IMAGE added successully.")
        this.imageName.unshift(data['file'].split('\\').at(-1));
      }
      else {
        this.toastr.error(data['message']);
      }
    }, err => {
      this.toastr.error(err['error'].message);
    });
  }


  imageClicked(path: any) {
    this.response.emit({ path: this.imageFolder + path, baseUrl: this.baseUrl });
  }

  imageDelete(name: any) {
    let body = {
      filename: name,
      type:this.type
    }
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true
        this.http.delete(this.api.getUrl(this.apiName), body).subscribe((data: any) => {
          if (data['success'] && data['result']) {
            this.toastr.success("IMAGE deleted Successfully.")
            this.imageName.splice(this.imageName.indexOf(name), 1);
            this.isLoader = false
          }
          this.isLoader = false
        }, err => {
          this.isLoader = false
          this.toastr.error(err);
        });
      }
    })

  }

}
