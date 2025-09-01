import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MotorPaymentRoutingModule } from './motor-payment-routing.module';
import { SuccessComponent } from './success/success.component';
import { FailedComponent } from './failed/failed.component';


@NgModule({
  declarations: [
    SuccessComponent,
    FailedComponent
  ],
  imports: [
    CommonModule,
    MotorPaymentRoutingModule
  ]
})
export class MotorPaymentModule { }
