import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MotorInsurancePlanComponent } from './motor-insurance-plan/motor-insurance-plan.component';
import { MotorPlanListComponent } from './motor-plan-list/motor-plan-list.component';
import { PlanCompareComponent } from './plan-compare/plan-compare.component';

const routes: Routes = [
  {
    path: "",
    component: MotorInsurancePlanComponent
  },
  {
    path: "plans",
    component: MotorPlanListComponent
  },
  {
    path: 'compare',
    component: PlanCompareComponent,
    data: { title: "Compare Plans" }
  },
  {
    path: 'proposal',
    loadChildren: () => import('./proposal-pages/proposal-pages.module').then(m => m.ProposalPagesModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuoteRoutingModule { }
