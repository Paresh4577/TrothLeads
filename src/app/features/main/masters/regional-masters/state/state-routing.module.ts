import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StateListComponent } from './state-list/state-list.component';
import { StateComponent } from './state/state.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: StateListComponent,
    data: { title: "States", authKey: "State-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: StateComponent,
    data: { title: "Add State", mode: "Create", authKey: "State-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: StateComponent,
    data: { title: "View State", apiEndPoint: API_ENDPOINTS.State .Base, mode: "View" , authKey: "State-get"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: StateComponent,
    data: { title: "Edit State", apiEndPoint: API_ENDPOINTS.State.Base, mode: "Edit" , authKey: "State-update"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StateRoutingModule { }
