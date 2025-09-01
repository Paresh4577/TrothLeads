import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentRoutingModule } from './payment-routing.module';
import { SuccessComponent } from './success/success.component';
import { FailedComponent } from './failed/failed.component';


@NgModule({
  declarations: [
    SuccessComponent,
    FailedComponent
  ],
  imports: [
    CommonModule,
    PaymentRoutingModule
  ]
})
export class PaymentModule { }
