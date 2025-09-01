import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlabCommissionCalculationMatrixRoutingModule } from './slab-commission-calculation-matrix-routing.module';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { SlabCommissionCalculationMatrixListComponent } from './slab-commission-calculation-matrix-list/slab-commission-calculation-matrix-list.component';
import { SlabCommissionCalculationMatrixComponent } from './slab-commission-calculation-matrix/slab-commission-calculation-matrix.component';


@NgModule({
  declarations: [
    SlabCommissionCalculationMatrixListComponent,
    SlabCommissionCalculationMatrixComponent
  ],
  imports: [
    CommonModule,
    SlabCommissionCalculationMatrixRoutingModule,
    TableListModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    DatemaskModule,
    SharedPipesModule,
  ]
})
export class SlabCommissionCalculationMatrixModule { }
