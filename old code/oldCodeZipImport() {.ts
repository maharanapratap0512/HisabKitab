oldCodeZipImport() {
   let zip: any;
   let fileNames: any = [];
   let i: any;
   //accept only files that listed below, other ignore.
   switch (fileNames[i]) {
     case 'category.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let catData: any = JSON.parse(data);
           if (catData && catData.length > 0) {
             for (let i in catData) {
               // matching through list of categories
               for (let cat of this.categories) {
                 if (cat._id == catData[i]._id && cat.created_at == catData[i].created_at) {
                   if (cat.category_hin == catData[i].category_hin && cat.category_eng == catData[i].category_eng) {
                     catData[i].found = true;
                   }
                   else {
                     catData[i].update = true;
                   }
                   break;
                 }
                 else {
                   if (cat.category_hin == catData[i].category_hin || cat.category_eng == catData[i].category_eng) {
                     catData[i].alt_found = true;
                     catData[i].new_id = cat._id
                   }
                 }
               }
               catData[i].insert = (catData[i].found || catData[i].update || catData[i].alt_found) ? false : true;
             }
             if (catData && catData.length > 0)
               this.importData.category = { columns: Object.keys(catData[0]), data: catData };
           }
         }
       });
       break;

     case 'city.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let cityData: any = JSON.parse(data);
           if (cityData.length > 0)
             this.importData.city = { columns: Object.keys(cityData[0]), data: cityData }
         }
       });
       break;

     case 'country.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let countryData: any = JSON.parse(data);
           if (countryData && countryData.length > 0) {
             for (let i in countryData) {
               // matching through list of categories
               for (let cnt of this.countries) {
                 if (cnt._id == countryData[i]._id && cnt.created_at == countryData[i].created_at) {
                   if (cnt.country_hin == countryData[i].country_hin && cnt.country_eng == countryData[i].country_eng) {
                     countryData[i].found = true;
                   }
                   else {
                     countryData[i].update = true;
                   }
                   break;
                 }
                 else {
                   if (cnt.country_hin == countryData[i].country_hin || cnt.country_eng == countryData[i].country_eng) {
                     countryData[i].alt_found = true;
                     countryData[i].new_id = cnt._id
                   }
                 }
               }
               countryData[i].insert = (countryData[i].found || countryData[i].update || countryData[i].alt_found) ? false : true;
             }
             if (countryData && countryData.length > 0)
               this.importData.country = { columns: Object.keys(countryData[0]), data: countryData };
           }
         }
       });
       break;

     case 'item.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let itemData = JSON.parse(data);
           if (itemData.length > 0) {
             this.importData.item = { columns: Object.keys(itemData[0]), data: itemData }
             if (this.importData.subitem && this.importData.subitem.data) {
               this.combinedItemSubitem();
             }
           }

         }
       });
       break;

     case 'mm.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let mmData = JSON.parse(data);
           if (mmData.length > 0)
             this.importData.mm = { columns: Object.keys(mmData[0]), data: mmData };
         }
       });
       break;

     case 'pbk.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let pbk = JSON.parse(data);
           // console.log("pbk", pbk);

         }
         else {
           this.toastr.error('can not read pbk file from zip');
         }
       });
       break;

     case 'product.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let product = JSON.parse(data);
           // console.log("product", product);

         }
         else {
           this.toastr.error('can not read product file from zip');
         }
       });
       break;

     case 'state.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let stateData = JSON.parse(data);
           if (stateData.length > 0) {
             this.importData.state = { columns: Object.keys(stateData[0]), data: stateData }
           }
         }
       });
       break;

     case 'subitem.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let subitemData = JSON.parse(data);
           if (subitemData.length > 0) {
             this.importData.subitem = { columns: Object.keys(subitemData[0]), data: subitemData }
             if (this.importData.item && this.importData.item.data) {
               this.combinedItemSubitem();
             }
           }
         }
       });
       break;

     case 'subitem_list.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let siListData: any = JSON.parse(data);
           if (siListData && siListData.length > 0) {
             for (let i in siListData) {
               // matching through list of categories
               for (let si of this.subitem_lists) {
                 if (si._id == siListData[i]._id && si.created_at == siListData[i].created_at) {
                   console.log(si, siListData[i]);
                   if (si.subitem_hin == siListData[i].subitem_hin && (!si.subitem_eng || si.subitem_eng == siListData[i].subitem_eng)) {
                     siListData[i].found = true;
                   }
                   else {
                     siListData[i].update = true;
                   }
                   break;
                 }
                 else {
                   if (si.subitem_hin == siListData[i].subitem_hin || (si.subitem_eng && si.subitem_eng == siListData[i].subitem_eng)) {
                     siListData[i].alt_found = true;
                     siListData[i].new_id = si._id
                   }
                   else if ((siListData[i].subitem_eng && si.subitem_hin.replace(/\s/g, "") == siListData[i].subitem_eng.replace(/\s/g, "")) || (si.subitem_eng && si.subitem_eng.replace(/\s/g, "") == siListData[i].subitem_hin.replace(/\s/g, ""))) {
                     siListData[i].alt_found = true;
                     siListData[i].new_id = si._id
                   }
                 }
               }
               siListData[i].insert = (siListData[i].found || siListData[i].update || siListData[i].alt_found) ? false : true;
             }
             if (siListData && siListData.length > 0)
               this.importData.subitem_list = { columns: Object.keys(siListData[0]), data: siListData };
           }
         }
       });
       break;

     case 'support_list.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let splistData: any = JSON.parse(data);
           if (splistData && splistData.length > 0) {
             for (let i in splistData) {
               // matching through list of categories
               for (let sl of this.support_lists) {
                 if (sl._id == splistData[i]._id && sl.created_at == splistData[i].created_at) {
                   if (sl.list_type == splistData[i].list_type && sl.list_name_hin == splistData[i].list_name_hin && sl.list_name_eng == splistData[i].list_name_eng) {
                     splistData[i].found = true;
                   }
                   else {
                     splistData[i].update = true;
                   }
                   break;
                 }
                 else {
                   if (sl.list_type == splistData[i].list_type && (sl.list_name_hin == splistData[i].list_name_hin || sl.list_name_eng == splistData[i].list_name_eng)) {
                     splistData[i].alt_found = true;
                     splistData[i].new_id = sl._id
                   }
                 }
               }
               splistData[i].insert = (splistData[i].found || splistData[i].update || splistData[i].alt_found) ? false : true;
             }
             if (splistData && splistData.length > 0)
               this.importData.support_list = { columns: Object.keys(splistData[0]), data: splistData };
           }
         }
       });
       break;

     case 'unit.json':
       zip.file(fileNames[i]).async("string").then((data: any) => {
         if (data) {
           let unitData: any = JSON.parse(data);
           if (unitData && unitData.length > 0) {
             for (let i in unitData) {
               // matching through list of categories
               for (let ut of this.units) {
                 if (ut._id == unitData[i]._id && ut.created_at == unitData[i].created_at) {
                   if (ut.unit_short == unitData[i].unit_short && ut.unit_full == unitData[i].unit_full) {
                     unitData[i].found = true;
                   }
                   else {
                     unitData[i].update = true;
                   }
                   break;
                 }
                 else {
                   if (ut.unit_full == unitData[i].unit_full || ut.unit_short == unitData[i].unit_short) {
                     unitData[i].alt_found = true;
                     unitData[i].new_id = ut._id
                   }
                 }
               }
               unitData[i].insert = (unitData[i].found || unitData[i].update || unitData[i].alt_found) ? false : true;
             }
             if (unitData && unitData.length > 0)
               this.importData.unit = { columns: Object.keys(unitData[0]), data: unitData };
           }
         }
       });
       break;
   }
 }


 <!-- MM Pane -->
          <div class="tab-pane show" id="mm" style="overflow: auto;"
            *ngIf="importData.mm && importData.mm.data.length > 0">
            <table id="datatable-buttons" class="table table-hover dt-responsive" *ngIf="importData.mm.matched">
              <thead>
                <tr>
                  <th style="width: 50px;">No.</th>
                  <th style="width: 150px;">Operation</th>
                  <th style="width: 250px;">Binding</th>
                  <ng-container *ngFor="let key of importData.mm.columns">
                    <th
                      *ngIf="!['active', '_id',  'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                      {{key}}</th>
                  </ng-container>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let data of importData.mm.data; let i = index;">
                  <tr class="main-row" *ngIf="!data.found">
                    <td>{{i+1}} </td>
                    <td>
                      <ng-container *ngIf="!data.done">
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.update">Update</button>
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.insert"
                          (click)="insertImportData('MM', i)">Insert</button>
                        <button class="btn btn-sm btn-danger" (click)="deleteData(i, 'MM')"><i
                            class="uil-trash"></i></button>
                      </ng-container>
                    </td>
                    <td>
                      <ng-select class="custom" style="width: 100%;" placeholder="Select MM" [clearable]="true"
                        [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                        [ngModel]="importData.mm.data[i].new_id">
                        <ng-option *ngFor="let item of mms" [value]="item._id">{{item.mm_hin}} :
                          {{item.mm_eng}} ({{item.state_hin}})</ng-option>
                      </ng-select>
                    </td>
                    <ng-container *ngFor="let key of importData.mm.columns">
                      <td
                        *ngIf="!['active', '_id', 'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                        {{data[key] ? data[key] : ''}}</td>
                    </ng-container>
                  </tr>
                </ng-container>

              </tbody>
              <tfoot>
                <tr>
                  <td>*</td>
                  <td>
                    <button class="btn btn-success" (click)="submitImportData('MM')">Submit</button>
                  </td>
                  <td colspan="2"
                    [ngClass]="{'text-warning':!importData.mm.result, 'text-success':importData.mm.result}">
                    {{importData.mm.msg ? importData.mm.msg : 'take action on all data and press submit button'}}
                  </td>
                </tr>
              </tfoot>
            </table>
            <div class="row" *ngIf="!importData.mm.matched">
              <div>
                Found <b>{{importData.mm.data.length}}</b> States.
              </div>
              <span class="text-warning">Please submit "State" data first.</span>
            </div>
          </div>
          <!-- Unit Pane -->
          <div class="tab-pane show" id="unit" style="overflow: auto;"
            *ngIf="importData.unit && importData.unit.data.length > 0">
            <table id="datatable-buttons" class="table table-hover dt-responsive">
              <thead>
                <tr>
                  <th style="width: 50px;">No.</th>
                  <th style="width: 150px;">Operation</th>
                  <th style="width: 250px;">Binding</th>
                  <ng-container *ngFor="let key of importData.unit.columns">
                    <th
                      *ngIf="!['active', '_id',  'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                      {{key}}</th>
                  </ng-container>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let data of importData.unit.data; let i = index;">
                  <tr class="main-row" *ngIf="!data.found">
                    <td>{{i+1}} </td>
                    <td>
                      <ng-container *ngIf="!data.done">
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.update">Update</button>
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.insert"
                          (click)="insertImportData('UNIT', i)">Insert</button>
                        <button class="btn btn-sm btn-danger" (click)="deleteData(i, 'UNIT')"><i
                            class="uil-trash"></i></button>
                      </ng-container>
                    </td>
                    <td>
                      <ng-select class="custom" style="width: 100%;" placeholder="Select Unit" [clearable]="true"
                        [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                        [ngModel]="importData.unit.data[i].new_id">
                        <ng-option *ngFor="let item of units" [value]="item._id">{{item.unit_full}} :
                          {{item.unit_short}}</ng-option>
                      </ng-select>
                    </td>
                    <ng-container *ngFor="let key of importData.unit.columns">
                      <td
                        *ngIf="!['active', '_id', 'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                        {{data[key] ? data[key] : ''}}</td>
                    </ng-container>
                  </tr>
                </ng-container>

              </tbody>
              <tfoot>
                <tr>
                  <td>*</td>
                  <td>
                    <button class="btn btn-success" (click)="submitImportData('UNIT')">Submit</button>
                  </td>
                  <td colspan="2"
                    [ngClass]="{'text-warning':!importData.unit.result, 'text-success':importData.unit.result}">
                    {{importData.unit.msg ? importData.unit.msg : 'take action on all data and press submit button'}}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- Support List Pane -->
          <div class="tab-pane show" id="support_list" style="overflow: auto;"
            *ngIf="importData.support_list && importData.support_list.data.length > 0">
            <table id="datatable-buttons" class="table table-hover dt-responsive">
              <thead>
                <tr>
                  <th style="width: 50px;">No.</th>
                  <th style="width: 150px;">Operation</th>
                  <th style="width: 250px;">Binding</th>
                  <ng-container *ngFor="let key of importData.support_list.columns">
                    <th
                      *ngIf="!['active', '_id',  'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                      {{key}}</th>
                  </ng-container>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let data of importData.support_list.data; let i = index;">
                  <tr class="main-row" *ngIf="!data.found">
                    <td>{{i+1}} </td>
                    <td>
                      <ng-container *ngIf="!data.done">
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.update">Update</button>
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.insert"
                          (click)="insertImportData('support_list', i)">Insert</button>
                        <button class="btn btn-sm btn-danger" (click)="deleteData(i, 'support_list')"><i
                            class="uil-trash"></i></button>
                      </ng-container>
                    </td>
                    <td>
                      <ng-select class="custom" style="width: 100%;" placeholder="Select Support List"
                        [clearable]="true" [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                        [ngModel]="importData.support_list.data[i].new_id">
                        <ng-option *ngFor="let item of support_lists" [value]="item._id">{{item.list_name_hin}} :
                          {{item.list_name_eng}} ({{item.list_type}})</ng-option>
                      </ng-select>
                    </td>
                    <ng-container *ngFor="let key of importData.support_list.columns">
                      <td
                        *ngIf="!['active', '_id', 'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                        {{data[key] ? data[key] : ''}}</td>
                    </ng-container>
                  </tr>
                </ng-container>

              </tbody>
              <tfoot>
                <tr>
                  <td>*</td>
                  <td>
                    <button class="btn btn-success" (click)="submitImportData('support_list')">Submit</button>
                  </td>
                  <td colspan="2"
                    [ngClass]="{'text-warning':!importData.support_list.result, 'text-success':importData.support_list.result}">
                    {{importData.support_list.msg ? importData.support_list.msg : 'take action on all data and press
                    submit button'}}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- Subitem List Pane -->
          <div class="tab-pane show" id="subitem_list" style="overflow: auto;"
            *ngIf="importData.subitem_list && importData.subitem_list.data.length > 0">
            <table id="datatable-buttons" class="table table-hover dt-responsive">
              <thead>
                <tr>
                  <th style="width: 50px;">No.</th>
                  <th style="width: 150px;">Operation</th>
                  <th style="width: 250px;">Binding</th>
                  <ng-container *ngFor="let key of importData.subitem_list.columns">
                    <th
                      *ngIf="!['active', '_id',  'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                      {{key}}</th>
                  </ng-container>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let data of importData.subitem_list.data; let i = index;">
                  <tr class="main-row" *ngIf="!data.found">
                    <td>{{i+1}} </td>
                    <td>
                      <ng-container *ngIf="!data.done">
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.update">Update</button>
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.insert"
                          (click)="insertImportData('subitem_list', i)">Insert</button>
                        <button class="btn btn-sm btn-danger" (click)="deleteData(i, 'subitem_list')"><i
                            class="uil-trash"></i></button>
                      </ng-container>
                    </td>
                    <td>
                      <ng-select class="custom" style="width: 100%;" placeholder="Select Subitem List"
                        [clearable]="true" [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                        [ngModel]="importData.subitem_list.data[i].new_id">
                        <ng-option *ngFor="let item of subitem_lists" [value]="item._id">{{item.subitem_hin}} :
                          {{item.subitem_eng}}</ng-option>
                      </ng-select>
                    </td>
                    <ng-container *ngFor="let key of importData.subitem_list.columns">
                      <td
                        *ngIf="!['active', '_id', 'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update'].includes(key)">
                        {{data[key] ? data[key] : ''}}</td>
                    </ng-container>
                  </tr>
                </ng-container>

              </tbody>
              <tfoot>
                <tr>
                  <td>*</td>
                  <td>
                    <button class="btn btn-success" (click)="submitImportData('subitem_list')">Submit</button>
                  </td>
                  <td colspan="2"
                    [ngClass]="{'text-warning':!importData.subitem_list.result, 'text-success':importData.subitem_list.result}">
                    {{importData.subitem_list.msg ? importData.subitem_list.msg : 'take action on all data and press
                    submit button'}}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <!-- Item Pane -->
          <div class="tab-pane show" id="item" style="overflow: auto;"
            *ngIf="importData.item && importData.item.data.length > 0">
            <table id="datatable-buttons" class="table table-hover dt-responsive">
              <thead>
                <tr>
                  <th style="width: 50px;">No.</th>
                  <th style="width: 150px;">Operation</th>
                  <th style="width: 250px;">Binding</th>
                  <ng-container *ngFor="let key of importData.item.columns">
                    <th
                      *ngIf="!['active', '_id',  'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update', 'subitems', 'item_roman'].includes(key)">
                      {{key}}</th>
                  </ng-container>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let data of importData.item.data; let i = index;">
                  <tr class="main-row" *ngIf="!data.found || !data.sfound">
                    <td>{{i+1}} </td>
                    <td>
                      <ng-container *ngIf="!data.done">
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.update">Update</button>
                        <button class="btn btn-sm btn-warning mr-1" *ngIf="data.insert"
                          (click)="insertImportData('item', i)">Insert</button>
                        <button class="btn btn-sm btn-danger" (click)="deleteData(i, 'item')"><i
                            class="uil-trash"></i></button>
                      </ng-container>
                    </td>
                    <td>
                      <ng-select class="custom" style="width: 100%;" placeholder="Select Item" [clearable]="true"
                        [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                        [ngModel]="importData.item.data[i].new_item">
                        <ng-option *ngFor="let item of itemmix" [value]="item">{{item.item_hin}} :
                          {{item.item_eng}}</ng-option>
                      </ng-select>
                      <ng-select class="custom" style="width: 100%;" placeholder="Select Subitem" [clearable]="true"
                        [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                        [ngModel]="importData.item.data[i].new_sid">
                        <ng-container *ngIf="importData.item.data[i].new_item">
                          <ng-option *ngFor="let item of importData.item.data[i].new_item.subitems" [value]="item._id">
                            {{item.subitem_hin}} : {{item.subitem_eng}}</ng-option>
                        </ng-container>
                      </ng-select>
                    </td>
                    <ng-container *ngFor="let key of importData.item.columns">
                      <td
                        *ngIf="!['active', '_id', 'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update','subitems', 'item_roman'].includes(key)">
                        {{data[key] ? data[key] : ''}}</td>
                    </ng-container>
                  </tr>
                  <ng-container *ngFor="let sdata of data.subitems; let j = index">
                    <tr class="main-row" *ngIf="!sdata.found">
                      <td>
                        <i class="uil-corner-down-right"></i>
                        <span class="mx-1">{{j+1}}</span>
                      </td>
                      <td>
                        <ng-container>
                          <button class="btn btn-sm btn-warning mr-1" *ngIf="data.update">Update</button>
                          <button class="btn btn-sm btn-warning mr-1" *ngIf="data.insert">Insert</button>
                          <button class="btn btn-sm btn-danger"><i class="uil-trash"></i></button>
                        </ng-container>
                      </td>
                      <td>
                        <ng-select class="custom" style="width: 100%;" placeholder="Select Item" [clearable]="true"
                          [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                          [ngModel]="importData.item.data[i].subitems[j].new_item">
                          <ng-option *ngFor="let item of itemmix" [value]="item">{{item.item_hin}} :
                            {{item.item_eng}}</ng-option>
                        </ng-select>
                        <ng-select class="custom" style="width: 100%;" placeholder="Select Subitem" [clearable]="true"
                          [virtualScroll]="true" [ngModelOptions]="{standalone: true}"
                          [ngModel]="importData.item.data[i].new_sid">
                          <ng-container *ngIf="importData.item.data[i].subitems[j].new_item">
                            <ng-option *ngFor="let item of importData.item.data[i].subitems[j].new_item.subitems"
                              [value]="item._id">
                              {{item.subitem_hin}} : {{item.subitem_eng}}</ng-option>
                          </ng-container>
                        </ng-select>
                      </td>
                      <ng-container *ngFor="let key of importData.item.scolumns">
                        <td
                          *ngIf="!['active', '_id', 'created_at', 'updated_at', 'found', 'alt_found', 'insert', 'update','subitems', 'item_roman'].includes(key)">
                          {{data[key] ? data[key] : ''}}</td>
                      </ng-container>
                    </tr>
                  </ng-container>


                </ng-container>

              </tbody>
              <tfoot>
                <tr>
                  <td>*</td>
                  <td>
                    <button class="btn btn-success" (click)="submitImportData('subitem_list')">Submit</button>
                  </td>
                  <td colspan="2"
                    [ngClass]="{'text-warning':!importData.subitem_list.result, 'text-success':importData.subitem_list.result}">
                    {{importData.subitem_list.msg ? importData.subitem_list.msg : 'take action on all data and press
                    submit button'}}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>