import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainEntryComponent } from './main-entry/main-entry.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { NewComponent } from './new/new.component';

import { CountryEntryComponent } from './ENTRY__FORMS/country-entry/country-entry.component';
import { MmEntryComponent } from './ENTRY__FORMS/mm-entry/mm-entry.component';
import { StateEntryComponent } from './ENTRY__FORMS/state-entry/state-entry.component';
import { PbkEntryComponent } from './ENTRY__FORMS/pbk-entry/pbk-entry.component';
import { CityEntryComponent } from './ENTRY__FORMS/city-entry/city-entry.component';
import { ItemEntryComponent } from './ENTRY__FORMS/item-entry/item-entry.component';
import { SubitemEntryComponent } from './ENTRY__FORMS/subitem-entry/subitem-entry.component';
import { CategoryEntryComponent } from './ENTRY__FORMS/category-entry/category-entry.component';
import { UnitEntryComponent } from './ENTRY__FORMS/unit-entry/unit-entry.component';
import { ProductEntryComponent } from './ENTRY__FORMS/product-entry/product-entry.component';

import { FilesViewComponent } from './views/files-view/files-view.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AawakComponent } from './aawak/aawak.component';
import { PbkComponent } from './ADD__EDIT/pbk/pbk.component';
import { MmComponent } from './ADD__EDIT/mm/mm.component';
import { CategoryComponent } from './ADD__EDIT/category/category.component';
import { ItemComponent } from './ADD__EDIT/item/item.component';
import { CityComponent } from './ADD__EDIT/city/city.component';
import { SupportListEntryComponent } from './ENTRY__FORMS/support-list-entry/support-list-entry.component';
import { SubitemComponent } from './ADD__EDIT/subitem/subitem.component';
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
