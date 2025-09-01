import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HealthInsurancePlansComponent } from '../quote/health-insurance-plans/health-insurance-plans.component';
import { PlanListingComponent } from '../quote/plan-listing/plan-listing.component';
import { PlanCompareComponent } from '../quote/plan-compare/plan-compare.component';

const routes: Routes = [
  {
    path: 'quote',
    loadChildren : () => import('../quote/quote.module').then((m) => m.QuoteModule),
    data: { title: "Health Insurance Plans" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MediclaimRoutingModule { }
