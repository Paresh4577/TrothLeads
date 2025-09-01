import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { UserComponent } from './user/user.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: UserListComponent,
    data: { title: "Users", authKey:"User-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: UserComponent,
    data: { title: "Add User", mode: "Create", authKey:"User-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: UserComponent,
    data: { title: "View User",apiEndPoint: API_ENDPOINTS.User.Base, mode: "View", authKey: "User-get"}, resolve: { data: ResolverService},
    canActivate:[RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: UserComponent,
    data: { title: "Edit User",apiEndPoint: API_ENDPOINTS.User.Base, mode: "Edit", authKey: "User-update"},resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
