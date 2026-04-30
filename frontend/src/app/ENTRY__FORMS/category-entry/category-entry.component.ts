import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { GlobalService } from 'src/app/services/global.service';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-category-entry',
  templateUrl: './category-entry.component.html',
  styleUrls: ['./category-entry.component.scss']
})
export class CategoryEntryComponent implements OnInit {

  @Input() getData: any;
  @Output() response = new EventEmitter();
  @Input() isEdit: any;
  @Input() isVisible: any;
  categoryForm: FormGroup;
  isLoader: boolean = false;
  settings: any = null;
  categories: any[] = [];
  aliases: string[] = [];
  newAlias: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private api: ApiService,
    private gs: GlobalService,
    private toastr: ToastrService,
    public auth: AuthService
  ) {

    this.settings = auth.webUser.settings.category;
    this.categoryForm = this.fb.group({
      category_eng: [null],
      category_hin: [null, Validators.required],
      category_roman: [null],
      parent_id: [null],
      sort_order: [0]
    });
  }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.http.get(this.api.getUrl('CATEGORY') + '1').subscribe((data: any) => {
      if (data && data.success) {
        let list = data.result;
        if (this.isEdit && this.getData) {
          list = list.filter((c: any) => Number(c._id) !== Number(this.getData._id));
        }
        this.categories = this.buildTree(list);
      }
    });
  }

  buildTree(list: any[]) {
    const map = new Map();
    const roots: any[] = [];
    list.forEach(item => {
      item._id = Number(item._id);
      if (item.parent_id) item.parent_id = Number(item.parent_id);
      item.children = [];
      map.set(item._id, item);
    });
    list.forEach(item => {
      if (item.parent_id && map.has(item.parent_id)) {
        map.get(item.parent_id).children.push(item);
      } else {
        roots.push(item);
      }
    });
    const flattened: any[] = [];
    const traverse = (nodes: any[], level: number) => {
      nodes.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || a.category_hin.localeCompare(b.category_hin));
      nodes.forEach(node => {
        node.level = level;
        flattened.push(node);
        if (node.children && node.children.length > 0) {
          traverse(node.children, level + 1);
        }
      });
    };
    traverse(roots, 0);
    return flattened;
  }



  ngOnChanges(changes: SimpleChanges) {
    console.log("cat-changes", changes);
    if (changes.getData && changes.getData.currentValue) {
      this.categoryForm.patchValue({
        category_eng: changes.getData.currentValue.category_eng,
        category_hin: changes.getData.currentValue.category_hin ? changes.getData.currentValue.category_hin : null,
        category_roman: changes.getData.currentValue.category_roman ? changes.getData.currentValue.category_roman : null,
        parent_id: changes.getData.currentValue.parent_id,
        sort_order: changes.getData.currentValue.sort_order || 0
      });
      // Handle aliases
      try {
        const aliasData = changes.getData.currentValue.alias;
        this.aliases = (aliasData && aliasData != 'null' ? (typeof aliasData === 'string' ? JSON.parse(aliasData) : aliasData) : []);
      } catch (e) { this.aliases = []; }
    }
  }

  addAlias() {
    const alias = this.newAlias.trim();
    if (!alias) return;
    
    // Check for duplicates in the current list
    if (this.aliases.includes(alias)) {
      this.toastr.warning('Alias already added');
      return;
    }

    // NEW LOGIC: Validation against category names
    // This will be checked again on the server, but client-side check for current names:
    const currentHin = this.categoryForm.get('category_hin')?.value;
    const currentEng = this.categoryForm.get('category_eng')?.value;
    const currentRoman = this.categoryForm.get('category_roman')?.value;

    if (alias === currentHin || alias === currentEng || alias === currentRoman) {
      this.toastr.error('Alias cannot be the same as Category Name');
      return;
    }

    this.aliases.push(alias);
    this.newAlias = '';
  }

  removeAlias(index: number) {
    this.aliases.splice(index, 1);
  }


  categoryFormSubmit() {
    if (this.categoryForm.valid) {
      this.isLoader = true;
      this.http.post(this.api.getUrl('CATEGORY') + this.auth.webUser.dept_id, this.categoryForm.value).subscribe((data: any) => {
        if (data['result'] && data['success']) {
          this.gs.Lists.category.unshift(data['result']);
          this.categoryForm.reset({ active: true });
          this.isLoader = false;
          this.toastr.success('Category Added Successfully.');
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['message']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['error']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.categoryForm);
    }
  }

  categoryFormUpdate() {
    if (this.categoryForm.valid) {
      this.isLoader = true;
      let body = { query: {}, set: {} };
      body.query = {
        _id: this.getData._id
      }
      body.set = {
        ...this.categoryForm.value,
        alias: JSON.stringify(this.aliases)
      };
      this.http.put(this.api.getUrl('CATEGORY'), body).subscribe((data: any) => {
        if (data && data['success']) {
          this.gs.Lists.category.splice(this.gs.Lists.category.indexOf((i: { _id: any }) => i._id = this.getData._id), 1, data['result']);
          this.categoryForm.reset();
          this.isLoader = false;
          this.toastr.success("Category Updated Successfuly")
          this.response.emit(data['result']);
        } else {
          this.toastr.error(data['error']);
          this.isLoader = false;
        }
      }, err => {
        this.toastr.error(err['message']);
        this.isLoader = false;
      });
    }
    else {
      this.gs.validationFireOnSubmit(this.categoryForm);
    }
  }

}
