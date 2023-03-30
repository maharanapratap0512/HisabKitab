import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2'
declare var $: any;


@Component({
  selector: 'app-files-view',
  templateUrl: './files-view.component.html',
  styleUrls: ['./files-view.component.scss']
})
export class FilesViewComponent implements OnInit {

  imageName: any = [];
  imageFolder: any = [];
  selectedImges: any = [];
  apiName: any = "IMAGE";
  baseUrl: any;
  isLoader: any;
  renameFileName: any;
  docForm: FormGroup;
  @Input() getData: any;
  @Input() type: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter();
  editDoc: any = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toastr: ToastrService,
    private api: ApiService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService
  ) {
    this.docForm = new FormGroup({
      file: new FormArray([])
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log("changes.getData.currentValue_________", changes.getData.currentValue);

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
    if (changes.getData && changes.getData.currentValue) {
      this.editDoc = changes.getData.currentValue
    }
  }

  ngOnInit(): void {
    this.getImages();
    this.baseUrl = this.api.getUrl('BASE');
  }

  getImages() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('IMAGE'), { type: this.type }).subscribe((data: any) => {
      if (data['result'] && data['success']) {
        this.imageName = data['result'];
        // this.imageName.map((x: { isChecked: boolean; }) => (x.isChecked = false))
        // console.log("be4 ischecked imageName", this.imageName);
        this.patchDocForm(this.editDoc.images)
        for (let j in this.editDoc.images) {
          // console.log("this.editDoc", this.editDoc);
          let str = this.editDoc.images[j].toString().split('//');
          // console.log("str[str.length - 1]", str[str.length - 1]);
          for (let i in this.imageName) {
            // console.log("imgnm", this.imageName[i].doc);
            if (this.imageName[i].doc == str[str.length - 1]) {
              this.imageName[i].isChecked = true;
              // console.log("match");
            }
          }
        }
        this.imageFolder = data['dirpath'];
        this.isLoader = false;
      }
      // console.log("ischecked imageName", this.imageName);
      this.isLoader = false;
    });
  }

  changeDocument(event: any): void {
    // this.doctfile = event.target.files[0];
    const formData = new FormData();
    formData.append('type', this.type);
    formData.append('image', event.target.files[0]);
    this.http.postFormData(this.api.getUrl(this.apiName), formData).subscribe((data: any) => {
      if (data) {
        this.toastr.success("IMAGE added successully.")
        this.imageName.unshift({doc:data['file'].split('\\').at(-1), isChecked: false});
      }
      else {
        this.toastr.error(data['message']);
      }
    }, err => {
      this.toastr.error(err['error']);
    });
  }


  // imageClicked(path: any) {
  //   this.selectedImges.push({ path: this.imageFolder + path, baseUrl: this.baseUrl })
  //   console.log("this.selectedImges", this.selectedImges);
  // }

  imageSubmit() {
    console.log(this.docForm.value.file);
    
    this.response.emit(this.docForm.value.file);
    this.toastr.success("Images Selected Successfully.")
  }

  imageDelete(name: any) {
    let body = {
      filename: name,
      type: this.type
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
            this.toastr.success("Image Deleted Successfully.")
            this.imageName.splice(this.imageName.indexOf((i: { doc: any; })=>i.doc == name), 1);
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


  docArr(event: any, item: any) {
    const formArray: FormArray = this.docForm.get('file') as FormArray
    var obj = this.imageFolder + event.target.value;
    // obj = {
    //   path: this.imageFolder + event.target.value,
    //   baseUrl: this.baseUrl
    // }
    if (event.target.checked) {
      formArray.push(new FormControl(obj))
    }
    else {
      let i: number = 0
      formArray.controls.forEach((ctrl = new FormControl()) => {
        if (ctrl.value == this.imageFolder + event.target.value) {
          formArray.removeAt(i)
          return
        }
        i++;
      })
    }
  }

  patchDocForm(data: any) {
    if (data) {
      const formArray: FormArray = this.docForm.get('file') as FormArray;
      data.forEach((x: any) => {
        formArray.push(new FormControl(x));
        // formArray.push(this.fb.group({
        //   path: x,
        //   baseUrl: this.baseUrl
        // }));
      });
    }
  }

}
