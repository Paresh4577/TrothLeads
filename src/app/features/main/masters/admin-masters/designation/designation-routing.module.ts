import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DesignationComponent } from './designation/designation.component';
import { DesignationListComponent } from './designation-list/designation-list.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: DesignationListComponent,
    data: { title: "Designations", authKey: "Designation-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: DesignationComponent,
    data: { title: "Add Designation", mode: "Create" ,authKey: "Designation-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: DesignationComponent,
    data: { title: "View Designation", apiEndPoint: API_ENDPOINTS.Designation.Base, mode: "View" , authKey: "Designation-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: DesignationComponent,
    data: { title: "Edit Designation", apiEndPoint: API_ENDPOINTS.Designation.Base, mode: "Edit" , authKey: "Designation-update"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesignationRoutingModule { }
