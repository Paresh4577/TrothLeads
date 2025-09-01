import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleTypeListComponent } from './vehicle-type-list/vehicle-type-list.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { VehicleTypeComponent } from './vehicle-type/vehicle-type.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { VehicleTypeImportComponent } from './vehicle-type-import/vehicle-type-import.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: VehicleTypeListComponent,
    data: { title: "Vehicle Type", authKey: "Country-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: VehicleTypeComponent,
    data: { title: "Add Vehicle Type (Mapping)", mode: "Create", authKey: "Country-create" }
  },
  {
    path: 'view/:Id',
    component: VehicleTypeComponent,
    data: { title: "View Vehicle Type (Mapping)", apiEndPoint: API_ENDPOINTS.Country.Base, mode: "View", authKey: "Country-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: VehicleTypeComponent,
    data: { title: "Edit Vehicle Type (Mapping)", apiEndPoint: API_ENDPOINTS.Country.Base, mode: "Edit", authKey: "Country-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'import',
    component: VehicleTypeImportComponent,
    data: { title: "Import Vehicle Type", authKey: "Country-update" },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleTypeRoutingModule { }
