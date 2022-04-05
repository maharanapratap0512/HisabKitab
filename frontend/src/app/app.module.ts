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
import { MainEntryComponent } from './main-entry/main-entry.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { NewComponent } from './new/new.component';

import { MmEntryComponent } from './entryForms/mm-entry/mm-entry.component';
import { ItemEntryComponent } from './entryForms/item-entry/item-entry.component';
import { PbkEntryComponent } from './entryForms/pbk-entry/pbk-entry.component';
import { ProductComponent } from './product/product.component';
import { ProductEntryComponent } from './entryForms/product-entry/product-entry.component';
import { ProductViewComponent } from './views/product-view/product-view.component';
import { CountryEntryComponent } from './entryForms/country-entry/country-entry.component';
import { StateEntryComponent } from './entryForms/state-entry/state-entry.component';
import { CityEntryComponent } from './entryForms/city-entry/city-entry.component';
import { CategoryEntryComponent } from './entryForms/category-entry/category-entry.component';
import { SubitemEntryComponent } from './entryForms/subitem-entry/subitem-entry.component';
import { UnitEntryComponent } from './entryForms/unit-entry/unit-entry.component';
import { AawakEntryComponent } from './entryForms/aawak-entry/aawak-entry.component';
import { JawakEntryComponent } from './entryForms/jawak-entry/jawak-entry.component';

import { FilesViewComponent } from './views/files-view/files-view.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DataViewComponent } from './views/data-view/data-view.component';

import { AawakComponent } from './aawak/aawak.component';
import { JawakComponent } from './jawak/jawak.component';
import { PbkComponent } from './addEdit/pbk/pbk.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryComponent } from './addEdit/category/category.component';
import { CityComponent } from './addEdit/city/city.component';
import { CountryComponent } from './addEdit/country/country.component';
import { ItemComponent } from './addEdit/item/item.component';
import { AjTypeComponent } from './addEdit/aj-type/aj-type.component';
import { MmComponent } from './addEdit/mm/mm.component';
import { StateComponent } from './addEdit/state/state.component';
import { SubitemComponent } from './addEdit/subitem/subitem.component';
import { UnitComponent } from './addEdit/unit/unit.component';
import { GlobalService } from './services/global.service';
import { SupportListEntryComponent } from './entryForms/support-list-entry/support-list-entry.component';
import { SubitemListEntryComponent } from './entryForms/subitem-list-entry/subitem-list-entry.component';
import { DepartmentComponent } from './department/department.component';
import { DepartmentEntryComponent } from './entryForms/department-entry/department-entry.component';
import { BachatComponent } from './bachat/bachat.component';
import { FilterpipePipe } from './pipe/filterpipe.pipe';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    MainEntryComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NewComponent,
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
    CountryComponent,
    ItemComponent,
    AjTypeComponent,
    MmComponent,
    StateComponent,
    SubitemComponent,
    UnitComponent,
    SupportListEntryComponent,
    SubitemListEntryComponent,
    DepartmentComponent,
    DepartmentEntryComponent,
    BachatComponent,
    FilterpipePipe,
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
    NgtUniversalModule

  ],
  providers: [GlobalService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
