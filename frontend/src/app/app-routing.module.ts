import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';


import { FilesViewComponent } from './views/files-view/files-view.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AawakComponent } from './aawak/aawak.component';
import { PbkComponent } from './CHILD_TABLES/pbk/pbk.component';
import { MmComponent } from './CHILD_TABLES/mm/mm.component';
import { CategoryComponent } from './CHILD_TABLES/category/category.component';
import { ItemComponent } from './CHILD_TABLES/item/item.component';
import { CityComponent } from './CHILD_TABLES/city/city.component';
import { SubitemComponent } from './CHILD_TABLES/subitem/subitem.component';
import { DepartmentComponent } from './department/department.component';
import { ProductComponent } from './CHILD_TABLES/product/product.component';

import { AuthGuard } from './services/auth.guard';
import { JawakComponent } from './jawak/jawak.component';
import { BachatComponent } from './bachat/bachat.component';
import { PointComponent } from './CHILD_TABLES/point/point.component';
import { NimittComponent } from './CHILD_TABLES/nimitt/nimitt.component';
import { ReportsComponent } from './reports/reports.component';
import { VehicleComponent } from './vehicle/vehicle.component';

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
         { path: "point", component: PointComponent },
         { path: "nimitt", component: NimittComponent },
         { path: "report", component: ReportsComponent},
         { path: "vehicle", component: VehicleComponent},

         { path: "files", component: FilesViewComponent },
         { path: "import_export", component: ImportExportComponent },
      ]
   }
];

@NgModule({
   imports: [RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking', scrollPositionRestoration: 'enabled' })],
   exports: [RouterModule]
})
export class AppRoutingModule { }
