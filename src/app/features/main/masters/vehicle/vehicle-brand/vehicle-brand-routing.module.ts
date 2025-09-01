import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleBrandListComponent } from './vehicle-brand-list/vehicle-brand-list.component';
import { VehicleBrandComponent } from './vehicle-brand/vehicle-brand.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: VehicleBrandListComponent,
    data: { title: "Vehicle Brand", authKey: "VehicleBrand-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: VehicleBrandComponent,
    data: { title: "Add Vehicle Brand", mode: "Create" , authKey: "VehicleBrand-create"},
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Id',
    component: VehicleBrandComponent,
    data: { title: "View Vehicle Brand", apiEndPoint: API_ENDPOINTS.VehicleBrand.Base, mode: "View", authKey: "VehicleBrand-get" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: VehicleBrandComponent,
    data: { title: "Edit Vehicle Brand", apiEndPoint: API_ENDPOINTS.VehicleBrand.Base, mode: "Edit", authKey: "VehicleBrand-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleBrandRoutingModule { }
