import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EndorsementRoutingModule } from './endorsement-routing.module';
import { EndorsementTransactionListComponent } from './endorsement-transaction-list/endorsement-transaction-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyInputModule } from '@lib/ui/components/currency-input/currency-input.module';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetNumberOnlyModule } from '@lib/ui/directives/alphabet-number-only/alphabet-number-only.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { PercentageModule } from '@lib/ui/directives/percentage/percentage.module';
import { UppercaseInputModule } from '@lib/ui/directives/uppercase-input/uppercase-input.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { EndorsementConfirmDialogComponent } from './endorsement-confirm-dialog/endorsement-confirm-dialog.component';


@NgModule({
  declarations: [
    EndorsementTransactionListComponent,
    EndorsementConfirmDialogComponent
  ],
  imports: [
    CommonModule,
    EndorsementRoutingModule,
    SharedMaterialModule,
    DatemaskModule,
    ReactiveFormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    SharedPipesModule,
    OnlynumberModule,
    TableListModule,
    DecimalModule,
    PercentageModule,
    AlphabetNumberOnlyModule,
    UppercaseInputModule,
    CurrencyInputModule
  ]
})
export class EndorsementModule { }
