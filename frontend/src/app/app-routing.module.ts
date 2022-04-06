import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainEntryComponent } from './main-entry/main-entry.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NewComponent } from './new/new.component';

import { CountryEntryComponent } from './entryForms/country-entry/country-entry.component';
import { MmEntryComponent } from './entryForms/mm-entry/mm-entry.component';
import { StateEntryComponent } from './entryForms/state-entry/state-entry.component';
import { PbkEntryComponent } from './entryForms/pbk-entry/pbk-entry.component';
import { CityEntryComponent } from './entryForms/city-entry/city-entry.component';
import { ItemEntryComponent } from './entryForms/item-entry/item-entry.component';
import { SubitemEntryComponent } from './entryForms/subitem-entry/subitem-entry.component';
import { CategoryEntryComponent } from './entryForms/category-entry/category-entry.component';
import { UnitEntryComponent } from './entryForms/unit-entry/unit-entry.component';
import { ProductEntryComponent } from './entryForms/product-entry/product-entry.component';

import { FilesViewComponent } from './views/files-view/files-view.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AawakComponent } from './aawak/aawak.component';
import { PbkComponent } from './addEdit/pbk/pbk.component';
import { MmComponent } from './addEdit/mm/mm.component';
import { CategoryComponent } from './addEdit/category/category.component';
import { ItemComponent } from './addEdit/item/item.component';
import { CityComponent } from './addEdit/city/city.component';
import { SupportListEntryComponent } from './entryForms/support-list-entry/support-list-entry.component';
import { SubitemComponent } from './addEdit/subitem/subitem.component';
import { DepartmentComponent } from './department/department.component';
import { ProductComponent } from './product/product.component';

import { AuthGuard } from './services/auth.guard';
import { JawakComponent } from './jawak/jawak.component';
import { BachatComponent } from './bachat/bachat.component';

const routes: Routes = [
   {
      path: "", component: LoginComponent,
      children: [
         { path: "login", component: LoginComponent },
         { path: "", redirectTo: "login", pathMatch: 'full' }
      ]
   },
   {
      path: "", component: HomeComponent,
      canActivate: [AuthGuard],
      children: [

         { path: "dashboard", component: DashboardComponent },
         { path: "new", component: NewComponent },

         { path: "aawak", component: AawakComponent },
         { path: "jawak", component: JawakComponent },
         { path: "bachat", component: BachatComponent },
         { path: "pbk", component: PbkComponent },
         { path: "mm", component: MmComponent },
         { path: "category", component: CategoryComponent },
         { path: "item", component: ItemComponent },
         { path: "subitem", component: SubitemComponent },
         { path: "city", component: CityComponent },
         { path: "product", component: ProductComponent },
         { path: "department", component: DepartmentComponent },

         { path: "countryEntry", component: CountryEntryComponent },
         { path: "categoryEntry", component: CategoryEntryComponent },
         { path: "productEntry", component: ProductEntryComponent },
         { path: "stateEntry", component: StateEntryComponent },
         { path: "mmEntry", component: MmEntryComponent },
         { path: "unitEntry", component: UnitEntryComponent },
         { path: "cityEntry", component: CityEntryComponent },
         { path: "itemEntry", component: ItemEntryComponent },
         { path: "subitemEntry", component: SubitemEntryComponent },
         { path: "supportlistentry", component: SupportListEntryComponent },

         { path: "files", component: FilesViewComponent },
         { path: "import_export", component: ImportExportComponent },
      ]
   }
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabled', scrollPositionRestoration: 'enabled' })],
   exports: [RouterModule]
})
export class AppRoutingModule { }
