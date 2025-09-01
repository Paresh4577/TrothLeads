import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommissionMatrixRoutingModule } from './commission-matrix-routing.module';
import { MatrixManagementComponent } from './matrix-management/matrix-management.component';
import { AccordionModule } from '@lib/ui/components/accordion/accordion.module';


@NgModule({
  declarations: [
    MatrixManagementComponent
  ],
  imports: [
    CommonModule,
    CommissionMatrixRoutingModule,
    AccordionModule
  ]
})
export class CommissionMatrixModule { }
