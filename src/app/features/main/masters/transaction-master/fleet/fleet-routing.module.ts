import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FleetListComponent } from './fleet-list/fleet-list.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { FleetComponent } from './fleet/fleet.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: FleetListComponent,
    data: { title: "Fleet", authKey: "Fleet-list" },
    // canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: FleetComponent,
    data: { title: "ADD Fleet Details", mode: "Create", authKey: "Fleet-create" }
  },
  {
    path: 'view/:Id',
    component: FleetComponent,
    data: { title: "View Fleet", apiEndPoint: API_ENDPOINTS.Fleet.Base, mode: "View", authKey: "Fleet-get" },
    resolve: { data: ResolverService },
    // canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: FleetComponent,
    data: { title: "Edit Fleet", apiEndPoint: API_ENDPOINTS.Fleet.Base, mode: "Edit", authKey: "Fleet-update" },
    resolve: { data: ResolverService },
    // canActivate: [RoleGuard]
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleetRoutingModule { }
