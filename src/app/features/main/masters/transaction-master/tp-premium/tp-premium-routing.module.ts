import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TpPremiumListComponent } from './tp-premium-list/tp-premium-list.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { TpPremiumComponent } from './tp-premium/tp-premium.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: TpPremiumListComponent,
    data: { title: "TP Premiums", authKey: "TPPremium-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: TpPremiumComponent,
    data: { title: "Add TP Premium", mode: "Create", authKey: "TPPremium-create" }
  },
  {
    path: 'view/:Id',
    component: TpPremiumComponent,
    data: { title: "View TP Premium", apiEndPoint: API_ENDPOINTS.TPPremium.Base, mode: "View", authKey: "TPPremium-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: TpPremiumComponent,
    data: { title: "Edit TP Premium", apiEndPoint: API_ENDPOINTS.TPPremium.Base, mode: "Edit", authKey: "TPPremium-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TpPremiumRoutingModule { }
