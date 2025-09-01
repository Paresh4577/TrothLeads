import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuccessComponent } from './success/success.component';
import { FailedComponent } from './failed/failed.component';

const routes: Routes = [
  {
    path: 'success',
    pathMatch: 'full',
    component: SuccessComponent,
    data: { title: 'payment success' },
  },
  {
    path: 'failed',
    pathMatch: 'full',
    component: FailedComponent,
    data: { title: 'payment failed' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MotorPaymentRoutingModule { }
