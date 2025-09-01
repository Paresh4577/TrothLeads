import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MotorPolicyComponent } from './motor-policy/motor-policy.component';
import { OptionComponent } from './option/option.component';

const routes: Routes = [
  {
    path: "",
    component: OptionComponent
  },
  {
    path: 'car',
    loadChildren: () => import('./car/car.module').then((m) => m.CarModule)
  },
  {
    path: 'twoWheeler',
    loadChildren: () => import('./two-wheeler/two-wheeler.module').then((m) => m.TwoWheelerModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./motor-payment/motor-payment.module').then((m) => m.MotorPaymentModule)
  },
  {
    path:'policy',
    component: MotorPolicyComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MotorRoutingModule { }
