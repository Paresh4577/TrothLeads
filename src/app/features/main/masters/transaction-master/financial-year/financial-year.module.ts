import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinancialYearRoutingModule } from './financial-year-routing.module';
import { FinancialYearListComponent } from './financial-year-list/financial-year-list.component';
import { FinancialYearComponent } from './financial-year/financial-year.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';


@NgModule({
  declarations: [
    FinancialYearListComponent,
    FinancialYearComponent
  ],
  imports: [
    CommonModule,
    FinancialYearRoutingModule,
    TableListModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    DatemaskModule,
  ]
})
export class FinancialYearModule { }
