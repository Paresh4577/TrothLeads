import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ODPremiumListComponent } from './odpremium-list/odpremium-list.component';
import { ODPremiumComponent } from './odpremium/odpremium.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: ODPremiumListComponent,
    data: { title: "OD Premium", authKey: "ODPremium-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: ODPremiumComponent,
    data: { title: "Add OD Premium", mode: "Create", authKey: "ODPremium-create" },
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Id',
    component: ODPremiumComponent,
    data: { title: "View OD Premium", apiEndPoint: API_ENDPOINTS.ODPremium.Base, mode: "View", authKey: "ODPremium-get" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
  { 
    path: 'edit/:Id',
    component: ODPremiumComponent,
    data: { title: "Edit OD Premium", apiEndPoint: API_ENDPOINTS.ODPremium.Base, mode: "Edit", authKey: "ODPremium-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ODPremiumRoutingModule { }
