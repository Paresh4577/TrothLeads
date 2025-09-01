import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MyPoliciesComponent } from './my-policies/my-policies.component';
import { OptionComponent } from './option/option.component';

const routes: Routes = [
  {
    path: '',
    component: OptionComponent
  },
  {
    path: 'mediclaim',
    loadChildren: () => import('./mediclaim/mediclaim.module').then((m) => m.MediclaimModule)
  },
  {
    path: 'topup',
    loadChildren: () => import('./topup/topup.module').then((m) => m.TopupModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then((m) => m.PaymentModule)
  },
  {
    path: 'policy',
    component: MyPoliciesComponent,
  },
  {
    path: 'policy/download',
    component: MyPoliciesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HealthRoutingModule { }
