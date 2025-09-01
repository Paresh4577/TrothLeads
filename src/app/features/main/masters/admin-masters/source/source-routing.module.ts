import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SourceListComponent } from './source-list/source-list.component';
import { SourceComponent } from './source/source.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: SourceListComponent,
    data: { title: "Source", authKey: "Source-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: SourceComponent,
    data: { title: "Add Source", mode: "Create" , authKey: "Source-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: SourceComponent,
    data: { title: "View Source", apiEndPoint: API_ENDPOINTS.Source.Base, mode: "View", authKey: "Source-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: SourceComponent,
    data: { title: "Edit Source", apiEndPoint: API_ENDPOINTS.Source.Base, mode: "Edit", authKey: "Source-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SourceRoutingModule { }
