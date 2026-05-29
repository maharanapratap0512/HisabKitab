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

  imageName: any[] = [];
  imageFolder: string = "";
  selectedImages: Set<string> = new Set();
  apiName: string = "IMAGE";
  baseUrl: string = "";
  isLoader: boolean = false;
  docForm: FormGroup;
  
  @Input() getData: any;
  @Input() type: any;
  @Input() isEdit: any;
  @Output() response = new EventEmitter<string[]>();

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private toastr: ToastrService,
    private api: ApiService,
    private gs: GlobalService,
    private spinner: NgxSpinnerService
  ) {
    this.docForm = this.fb.group({
      file: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.type) {
      this.baseUrl = this.api.getUrl('BASE');
    }
    if (changes.getData && changes.getData.currentValue) {
      const docs = changes.getData.currentValue;
      const images = docs.images || [];
      this.selectedImages = new Set(images);
      this.syncSelectionToImages();
    }
  }

  ngOnInit(): void {
    this.baseUrl = this.api.getUrl('BASE');
    this.getImages();
  }

  getImages() {
    this.isLoader = true;
    this.http.put(this.api.getUrl('IMAGE'), { type: this.type }).subscribe((data: any) => {
      this.isLoader = false;
      if (data['result'] && data['success']) {
        this.imageName = data['result'];
        this.imageFolder = data['dirpath'] || '';
        this.syncSelectionToImages();
      }
    }, () => this.isLoader = false);
  }

  syncSelectionToImages() {
    if (!this.imageName) return;
    this.imageName.forEach(img => {
      const fullPath = this.imageFolder + img.doc;
      img.isChecked = this.selectedImages.has(fullPath);
    });
  }

  toggleSelection(file: any) {
    const fullPath = this.imageFolder + file.doc;
    if (this.selectedImages.has(fullPath)) {
      this.selectedImages.delete(fullPath);
      file.isChecked = false;
    } else {
      this.selectedImages.add(fullPath);
      file.isChecked = true;
    }
  }

  changeDocument(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.isLoader = true;
    const formData = new FormData();
    formData.append('type', this.type);
    formData.append('image', file);

    this.http.postFormData(this.api.getUrl(this.apiName), formData).subscribe((data: any) => {
      this.isLoader = false;
      if (data && data.file) {
        this.toastr.success("Image uploaded successfully.");
        this.getImages(); // Refresh the list
      } else {
        this.toastr.error(data?.message || "Upload failed");
      }
    }, err => {
      this.isLoader = false;
      this.toastr.error(err?.error || "Error uploading image");
    });
  }

  imageSubmit() {
    const paths = Array.from(this.selectedImages);
    this.response.emit(paths);
    this.toastr.success("Images selected successfully.");
  }

  imageDelete(name: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "This image will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5d59f0',
      cancelButtonColor: '#f1556c',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoader = true;
        this.http.delete(this.api.getUrl(this.apiName), { filename: name, type: this.type }).subscribe((data: any) => {
          this.isLoader = false;
          if (data['success']) {
            this.toastr.success("Image deleted successfully.");
            this.getImages();
            // Also remove from selection if deleted
            const fullPath = this.imageFolder + name;
            this.selectedImages.delete(fullPath);
          }
        }, () => this.isLoader = false);
      }
    });
  }

  previewImage(file: any) {
    const url = this.baseUrl + this.imageFolder + file.doc;
    Swal.fire({
      imageUrl: url,
      imageAlt: file.doc,
      showCloseButton: true,
      showConfirmButton: false,
      background: 'rgba(0,0,0,0.8)',
      customClass: {
        image: 'img-fluid rounded shadow'
      }
    });
  }


}
