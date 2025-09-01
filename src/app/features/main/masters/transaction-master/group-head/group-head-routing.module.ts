import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupHeadListComponent } from './group-head-list/group-head-list.component';
import { GroupHeadComponent } from './group-head/group-head.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: GroupHeadListComponent,
    data: { title: "Group Heads", authKey: "GroupHead-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: GroupHeadComponent,
    data: { title: "Add Group Head", mode: "Create", authKey: "GroupHead-create" }
  },
  {
    path: 'view/:Id',
    component: GroupHeadComponent,
    data: { title: "View Group Head", apiEndPoint: API_ENDPOINTS.GroupHead.Base, mode: "View", authKey: "GroupHead-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: GroupHeadComponent,
    data: { title: "Edit Group Head", apiEndPoint: API_ENDPOINTS.GroupHead.Base, mode: "Edit", authKey: "GroupHead-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupHeadRoutingModule { }
