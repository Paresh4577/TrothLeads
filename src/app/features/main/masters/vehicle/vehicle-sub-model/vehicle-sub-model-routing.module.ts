import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { VehicleSubModelListComponent } from './vehicle-sub-model-list/vehicle-sub-model-list.component';
import { VehicleSubModelComponent } from './vehicle-sub-model/vehicle-sub-model.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: VehicleSubModelListComponent,
    data: { title: "Vehicle Sub-Model", authKey: "VehicleSubModel-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: VehicleSubModelComponent,
    data: { title: "Add Vehicle Sub Model", mode: "Create", authKey: "VehicleSubModel-create" },
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Id',
    component: VehicleSubModelComponent,
    data: { title: "View Vehicle Sub Model", apiEndPoint: API_ENDPOINTS.VehicleSubModel.Base, mode: "View", authKey: "VehicleSubModel-get" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
  { 
    path: 'edit/:Id',
    component: VehicleSubModelComponent,
    data: { title: "Edit Vehicle Sub Model", apiEndPoint: API_ENDPOINTS.VehicleSubModel.Base, mode: "Edit", authKey: "VehicleSubModel-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleSubModelRoutingModule { }
