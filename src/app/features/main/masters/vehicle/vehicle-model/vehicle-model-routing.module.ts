import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleModelComponent } from './vehicle-model/vehicle-model.component';
import { VehicleModelListComponent } from './vehicle-model-list/vehicle-model-list.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: VehicleModelListComponent,
    data: { title: "Vehicle Model", authKey: "VehicleModel-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: VehicleModelComponent,
    data: { title: "Add Vehicle Model", mode: "Create", authKey: "VehicleModel-create" },
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Id',
    component: VehicleModelComponent,
    data: { title: "View Vehicle Model", apiEndPoint: API_ENDPOINTS.VehicleModel.Base, mode: "View", authKey: "VehicleModel-get" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: VehicleModelComponent,
    data: { title: "Edit Vehicle Model", apiEndPoint: API_ENDPOINTS.VehicleModel.Base, mode: "Edit", authKey: "VehicleModel-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleModelRoutingModule { }
