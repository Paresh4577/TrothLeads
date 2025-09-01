import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HealthInsurancePlansComponent } from './health-insurance-plans/health-insurance-plans.component';
import { PlanCompareComponent } from './plan-compare/plan-compare.component';
import { PlanListingComponent } from './plan-listing/plan-listing.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: HealthInsurancePlansComponent,
  },
  {
    path: 'proposal',
    loadChildren: () => import('../quote/proposal-pages/proposal-pages.module').then((m) => m.ProposalPagesModule)
  },
  {
    path: 'add-on',
    loadChildren: () => import('../quote/add-on/add-on.module').then((m) => m.AddOnModule)
  },
  {
    path: 'plans',
    pathMatch: "full",
    component: PlanListingComponent,
    data: { title: "Health Insurance Plans List" }
  },
  {
    path: 'car',
    pathMatch: "full",
    component: HealthInsurancePlansComponent,
    data: { title: "Health Insurance Plans" }
  },
  {
    path: 'family',
    pathMatch: "full",
    component: HealthInsurancePlansComponent,
    data: { title: "Health Insurance Plans" }
  },
  {
    path: 'compare',
    pathMatch: "full",
    component: PlanCompareComponent,
    data: { title: "Compare Plans" }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuoteRoutingModule { }
