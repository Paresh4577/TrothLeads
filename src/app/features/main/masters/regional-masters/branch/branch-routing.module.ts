import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BranchComponent } from './branch/branch.component';
import { BranchListComponent } from './branch-list/branch-list.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: BranchListComponent,
    data: { title: "Branch", authKey: "Branch-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: BranchComponent,
    data: { title: "Add Branch", mode: "Create", authKey: "Branch-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: BranchComponent,
     data: { title: "View Branch", apiEndPoint: API_ENDPOINTS.Branch.Base, mode: "View", authKey: "Branch-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: BranchComponent,
     data: { title: "Edit Branch", apiEndPoint: API_ENDPOINTS.Branch.Base, mode: "Edit", authKey: "Branch-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BranchRoutingModule { }
