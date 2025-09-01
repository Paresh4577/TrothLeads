import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubSourceListComponent } from './sub-source-list/sub-source-list.component';
import { SubSourceComponent } from './sub-source/sub-source.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: SubSourceListComponent,
    data: { title: "Sub Source", authKey: "SubSource-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: SubSourceComponent,
    data: { title: "Add Sub Source", mode: "Create", authKey: "SubSource-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: SubSourceComponent,
    data: { title: "View Source", apiEndPoint: API_ENDPOINTS.SubSource.Base, mode: "View", authKey: "SubSource-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: SubSourceComponent,
    data: { title: "Edit Source", apiEndPoint: API_ENDPOINTS.SubSource.Base, mode: "Edit", authKey: "SubSource-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubSourceRoutingModule { }
