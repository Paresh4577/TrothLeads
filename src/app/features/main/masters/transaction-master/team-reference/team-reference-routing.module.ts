import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { TeamReferenceListComponent } from './team-reference-list/team-reference-list.component';
import { TeamReferenceComponent } from './team-reference/team-reference.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: TeamReferenceListComponent,
    data: { title: "Team Reference", authKey: "TeamReference-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: TeamReferenceComponent,
    data: { title: "Add Team Reference", mode: "Create", authKey: "TeamReference-create" },
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Id',
    component: TeamReferenceComponent,
    data: { title: "View Team Reference", apiEndPoint: API_ENDPOINTS.TeamRef.Base, mode: "View", authKey: "TeamReference-get" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
  { 
    path: 'edit/:Id',
    component: TeamReferenceComponent,
    data: { title: "Edit Team Reference", apiEndPoint: API_ENDPOINTS.TeamRef.Base, mode: "Edit", authKey: "TeamReference-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamReferenceRoutingModule { }
