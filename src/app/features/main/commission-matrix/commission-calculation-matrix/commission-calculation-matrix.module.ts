import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommissionCalculationMatrixRoutingModule } from './commission-calculation-matrix-routing.module';
import { CommissionCalculationMatrixComponent } from './commission-calculation-matrix/commission-calculation-matrix.component';
import { CommissionCalculationMatrixListComponent } from './commission-calculation-matrix-list/commission-calculation-matrix-list.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { RecalculateCommissionComponent } from './recalculate-commission/recalculate-commission.component';


@NgModule({
  declarations: [
    CommissionCalculationMatrixComponent,
    CommissionCalculationMatrixListComponent,
    RecalculateCommissionComponent
  ],
  imports: [
    CommonModule,
    CommissionCalculationMatrixRoutingModule,
    TableListModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    DatemaskModule,
    SharedPipesModule,
  ]
})
export class CommissionCalculationMatrixModule { }
