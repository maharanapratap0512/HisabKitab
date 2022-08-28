import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FileSaverModule } from 'ngx-filesaver';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgtUniversalModule } from '@ng-toolkit/universal';
import { DropDownTreeModule } from '@syncfusion/ej2-angular-dropdowns';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';

import { MmEntryComponent } from './ENTRY__FORMS/mm-entry/mm-entry.component';
import { ItemEntryComponent } from './ENTRY__FORMS/item-entry/item-entry.component';
import { PbkEntryComponent } from './ENTRY__FORMS/pbk-entry/pbk-entry.component';
import { ProductComponent } from './CHILD_TABLES/product/product.component';
import { ProductEntryComponent } from './ENTRY__FORMS/product-entry/product-entry.component';
import { ProductViewComponent } from './views/product-view/product-view.component';
import { CountryEntryComponent } from './ENTRY__FORMS/country-entry/country-entry.component';
import { StateEntryComponent } from './ENTRY__FORMS/state-entry/state-entry.component';
import { CityEntryComponent } from './ENTRY__FORMS/city-entry/city-entry.component';
import { CategoryEntryComponent } from './ENTRY__FORMS/category-entry/category-entry.component';
import { SubitemEntryComponent } from './ENTRY__FORMS/subitem-entry/subitem-entry.component';
import { UnitEntryComponent } from './ENTRY__FORMS/unit-entry/unit-entry.component';
import { AawakEntryComponent } from './ENTRY__FORMS/aawak-entry/aawak-entry.component';
import { JawakEntryComponent } from './ENTRY__FORMS/jawak-entry/jawak-entry.component';

import { FilesViewComponent } from './views/files-view/files-view.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DataViewComponent } from './views/data-view/data-view.component';

import { AawakComponent } from './aawak/aawak.component';
import { JawakComponent } from './jawak/jawak.component';
import { PbkComponent } from './CHILD_TABLES/pbk/pbk.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryComponent } from './CHILD_TABLES/category/category.component';
import { CityComponent } from './CHILD_TABLES/city/city.component';
import { ItemComponent } from './CHILD_TABLES/item/item.component';
import { MmComponent } from './CHILD_TABLES/mm/mm.component';
import { SubitemComponent } from './CHILD_TABLES/subitem/subitem.component';
import { GlobalService } from './services/global.service';
import { SupportListEntryComponent } from './ENTRY__FORMS/support-list-entry/support-list-entry.component';
import { SubitemListEntryComponent } from './ENTRY__FORMS/subitem-list-entry/subitem-list-entry.component';
import { DepartmentComponent } from './department/department.component';
import { DepartmentEntryComponent } from './ENTRY__FORMS/department-entry/department-entry.component';
import { BachatComponent } from './bachat/bachat.component';
import { PointEntryComponent } from './ENTRY__FORMS/point-entry/point-entry.component';
import { PointComponent } from './CHILD_TABLES/point/point.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportComponent } from './import/import.component';
import { NimittComponent } from './CHILD_TABLES/nimitt/nimitt.component';
import { NimittEntryComponent } from './ENTRY__FORMS/nimitt-entry/nimitt-entry.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { UpdateDetailComponent } from './layout/update-detail/update-detail.component';
import { ProductTransferEntryComponent } from './ENTRY__FORMS/product-transfer-entry/product-transfer-entry.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ProductComponent,
    MmEntryComponent,
    ItemEntryComponent,
    PbkEntryComponent,
    ProductEntryComponent,
    ProductViewComponent,
    CountryEntryComponent,
    StateEntryComponent,
    CityEntryComponent,
    CategoryEntryComponent,
    SubitemEntryComponent,
    UnitEntryComponent,
    FilesViewComponent,
    ImportExportComponent,
    DataViewComponent,
    AawakEntryComponent,
    JawakEntryComponent,
    AawakComponent,
    JawakComponent,
    PbkComponent,
    DashboardComponent,
    CategoryComponent,
    CityComponent,
    ItemComponent,
    MmComponent,
    SubitemComponent,
    SupportListEntryComponent,
    SubitemListEntryComponent,
    DepartmentComponent,
    DepartmentEntryComponent,
    BachatComponent,
    PointEntryComponent,
    PointComponent,
    ImportComponent,
    NimittComponent,
    NimittEntryComponent,
    UpdateDetailComponent,
    ProductTransferEntryComponent,
  ],
  imports: [
    BrowserModule,
    DropDownTreeModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      progressBar: true,
      progressAnimation: 'increasing',
      easing: 'ease-in'
    }),
    NgSelectModule,
    Ng2SearchPipeModule,
    FileSaverModule,
    NgxSpinnerModule,
    NgtUniversalModule,
    NgxPaginationModule,
    AutocompleteLibModule

  ],
  providers: [GlobalService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { 
  
}
