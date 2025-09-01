import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "financialYear", loadChildren: () => import('./financial-year/financial-year.module').then(m => m.FinancialYearModule)
  },
  {
    path: "product", loadChildren: () => import('./product-plan/product-plan.module').then(m => m.ProductPlanModule)
  },
  {
    path: "groupHead", loadChildren: () => import('./group-head/group-head.module').then(m => m.GroupHeadModule)
  },
  {
    path: "fleet", loadChildren: () => import('./fleet/fleet.module').then(m => m.FleetModule)
  },
  {
    path: "teamRef", loadChildren: () => import('./team-reference/team-reference.module').then(m => m.TeamReferenceModule)
  },
  {
    path: "tpPremium", loadChildren: () => import('./tp-premium/tp-premium.module').then(m => m.TpPremiumModule)
  },
  {
    path: "odPremium", loadChildren: () => import('./odpremium/odpremium.module').then(m => m.ODPremiumModule)
  },
  {
    path: "customer", loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule)
  },
  {
    path: "vehicletype", loadChildren: () => import('./vehicle-type/vehicle-type.module').then(m => m.VehicleTypeModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionMasterRoutingModule { }
