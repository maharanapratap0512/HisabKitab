import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import { FileSaverModule } from 'ngx-filesaver';
import { NetdropModule } from './modules/netdrop/netdrop.module';

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
import { UpdateDetailComponent } from './layout/update-detail/update-detail.component';
import { ProductTransferEntryComponent } from './ENTRY__FORMS/product-transfer-entry/product-transfer-entry.component';
import { ReportsComponent } from './reports/reports.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { VehicleEntryComponent } from './ENTRY__FORMS/vehicle-entry/vehicle-entry.component';

import { FilterByDatePipe } from './pipe/filter-by-date.pipe';
import { FilterAawakPipe } from './pipe/filter-aawak.pipe';
import { FilterItemCatPipe } from './pipe/filter-item-cat.pipe';
import { ExcelImportComponent } from './excel-import/excel-import.component';
import { ClosingComponent } from './closing/closing.component';
import { BachatNewComponent } from './bachat-new/bachat-new.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SearchPipe } from './pipe/search.pipe';
import { AuthService } from './services/auth.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ReportAwkTypeSaarComponent } from './reports/report-awk-type-saar/report-awk-type-saar.component';
import { ReportJwkTypeSaarComponent } from './reports/report-jwk-type-saar/report-jwk-type-saar.component';
import { ReportStoreStockComponent } from './reports/report-store-stock/report-store-stock.component';
import { ReportKhSaarComponent } from './reports/report-kh-saar/report-kh-saar.component';
import { ReportKhItemwiseComponent } from './reports/report-kh-itemwise/report-kh-itemwise.component';
import { ReportKhAjsaarComponent } from './reports/report-kh-ajsaar/report-kh-ajsaar.component';
import { ThemeService } from './services/theme.service';
import { ZoneEntryComponent } from './ENTRY__FORMS/zone-entry/zone-entry.component';
import { AawakEntryNewComponent } from './ENTRY__FORMS/aawak-entry-new/aawak-entry-new.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { AawakNewComponent } from './aawak-new/aawak-new.component';
import { RepairingComponent } from './repairing/repairing.component';
import { ReportAjCheckComponent } from './reports/report-aj-check/report-aj-check.component';
import { ReportLotNoComponent } from './reports/report-lot-no/report-lot-no.component';
import { DistrictEntryComponent } from './ENTRY__FORMS/district-entry/district-entry.component';
import { FltByCatPipe } from './pipe/flt-by-cat.pipe';
import { BachatImportComponent } from './bachat-import/bachat-import.component';
import { DeleteComponent } from './views/delete/delete.component';
import { PopoverFilterComponent } from './SHARED/popover-filter/popover-filter.component';
import { PopoverYearComponent } from './SHARED/popover-year/popover-year.component';
import { HorizontalScrollWithArrowsDirective } from './SHARED/horizontal-scroll-with-arrows.directive';
import { ContextMenuDirective } from './SHARED/context-menu.directive';
import { JawakEntryNewComponent } from './ENTRY__FORMS/jawak-entry-new/jawak-entry-new.component';
import { JawakNewComponent } from './jawak-new/jawak-new.component';
import { MysqlComponent } from './MySQL/mysql.component';
import { HmpComponent } from './hmp/hmp.component';
import { PbkClosingComponent } from './pbk-closing/pbk-closing.component';
import { PbkClosingEntryComponent } from './ENTRY__FORMS/pbk-closing-entry/pbk-closing-entry.component';
import { PbkBachatComponent } from './pbk-bachat/pbk-bachat.component';
import { HmpEntryComponent } from './ENTRY__FORMS/hmp-entry/hmp-entry.component';
import { SelectionService } from './services/selection.service';
import { TableSmartCheckboxDirective } from './SHARED/table-smart-checkbox.directive';
import { PrastavComponent } from './prastav/prastav.component';
import { PrastavEntryComponent } from './ENTRY__FORMS/prastav-entry/prastav-entry.component';
import { ChangelogPanelComponent } from './layout/changelog-panel/changelog-panel.component';
import { ContextSettingsPanelComponent } from './layout/context-settings-panel/context-settings-panel.component';
import { SmartFocusDirective } from './SHARED/smart-focus.directive';
import { JoinObjPipe } from './pipe/formatter/join-obj.pipe';
import { ItemDropdownComponent } from './SHARED/item-dropdown/item-dropdown.component';
import { AawakRefDropdownComponent } from './SHARED/aawak-ref-dropdown/aawak-ref-dropdown.component';


import { VariantComponent }               from './CHILD_TABLES/variant/variant.component';
import { VariantGeneratorEntryComponent } from './ENTRY__FORMS/variant-generator-entry/variant-generator-entry.component';
import { VariantEditEntryComponent }      from './ENTRY__FORMS/variant-edit-entry/variant-edit-entry.component';
import { AttributeEntryComponent }        from './ENTRY__FORMS/attribute-entry/attribute-entry.component';
import { ItemAliasEntryComponent }        from './ENTRY__FORMS/item-alias-entry/item-alias-entry.component';
import { VariantEntryComponent } from './ENTRY__FORMS/variant-entry/variant-entry.component';
import { VariantNewComponent } from './CHILD_TABLES/variant-new/variant-new.component';
import { DbGenerateComponent } from './department/db-generate/db-generate.component';
import { P2pFeedbackComponent } from './p2p-feedback/p2p-feedback.component';


// import { FilterPipeModule } from 'ngx-filter-pipe';
// import { MultiSearchPipeModule } from 'multi-search-pipe';

// import { DropdownModule } from 'primeng/dropdown';

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
    ReportsComponent,
    VehicleComponent,
    VehicleEntryComponent,
    FilterByDatePipe,
    FilterAawakPipe,
    FilterItemCatPipe,
    ExcelImportComponent,
    ClosingComponent,
    BachatNewComponent,
    AdminDashboardComponent,
    SearchPipe,
    ReportAwkTypeSaarComponent,
    ReportJwkTypeSaarComponent,
    ReportStoreStockComponent,
    ReportKhSaarComponent,
    ReportKhItemwiseComponent,
    ReportKhAjsaarComponent,
    ZoneEntryComponent,
    AawakEntryNewComponent,
    AawakNewComponent,
    RepairingComponent,
    ReportAjCheckComponent,
    ReportLotNoComponent,
    DistrictEntryComponent,
    FltByCatPipe,
    BachatImportComponent,
    DeleteComponent,
    PopoverFilterComponent,
    PopoverYearComponent,
    HorizontalScrollWithArrowsDirective,
    ContextMenuDirective,
    JawakEntryNewComponent,
    JawakNewComponent,
    MysqlComponent,
    HmpComponent,
    PbkClosingComponent,
    PbkClosingEntryComponent,
    PbkBachatComponent,
    HmpEntryComponent,
    TableSmartCheckboxDirective,
    PrastavComponent,
    PrastavEntryComponent,
    ChangelogPanelComponent,
    ContextSettingsPanelComponent,
    SmartFocusDirective,
    JoinObjPipe,
    VariantComponent,
    VariantGeneratorEntryComponent,
    VariantEditEntryComponent,
    AttributeEntryComponent,
    ItemAliasEntryComponent,
    VariantEntryComponent,
    VariantNewComponent,
    ItemDropdownComponent,
    AawakRefDropdownComponent,
    DbGenerateComponent,
    P2pFeedbackComponent,

  ],

  imports: [
    BrowserModule,
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
    FileSaverModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    AutocompleteLibModule,
    NetdropModule.forRoot({
      // Dynamically get the host IP and calculate backend port (Frontend Port - 1000)
      serverUrl: window.location.protocol + '//' + window.location.hostname + ':' + ((parseInt(window.location.port) || 5000) - 1000)
    })
  ],
  providers: [GlobalService, AuthService, ThemeService, SelectionService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {

}
