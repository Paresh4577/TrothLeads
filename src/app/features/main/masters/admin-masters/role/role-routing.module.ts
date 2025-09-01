import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleComponent } from './role/role.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { RoleResolverService } from './role-resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: RoleListComponent,
    data: { title: "Roles", authKey: "Role-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: RoleComponent,
    data: { title: "Add Role", mode: "Create", authKey: "Role-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: RoleComponent,
    data: { title: "View Role", apiEndPoint: API_ENDPOINTS.Role.Base, mode: "View", authKey: "Role-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  //REMOVE IN TI-700
  // {
  //   path: 'edit/:Id',
  //   component: RoleComponent,
  //   data: { title: "Edit Role", apiEndPoint: API_ENDPOINTS.Role.Base, mode: "Edit" , authKey: "Role-update"},
  //   resolve: { data: ResolverService },
  //   canActivate: [RoleGuard]
  // },
  {
    path: "role-permission/:Id",
    component: RolePermissionComponent,
    data: { title: "Role Permission", mode: "permission", authKey: "Role-update" },
    resolve: { rolefeatureactivity: RoleResolverService },
    canActivate: [RoleGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
