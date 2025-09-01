import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransactionRoutingModule } from './transaction-routing.module';
import { TransactionEntryComponent } from './transaction-entry/transaction-entry.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetNumberOnlyModule } from '@lib/ui/directives/alphabet-number-only/alphabet-number-only.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { PercentageModule } from '@lib/ui/directives/percentage/percentage.module';
import { UppercaseInputModule } from '@lib/ui/directives/uppercase-input/uppercase-input.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { PreviousPolicyDetailsComponent } from './previous-policy-details/previous-policy-details.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { CurrencyInputComponent } from '@lib/ui/components/currency-input/currency-input.component';
import { CurrencyInputModule } from '@lib/ui/components/currency-input/currency-input.module';
import { AttachmentModalComponent } from './attachment-modal/attachment-modal.component';
import { TransactionCancelDialogComponent } from './transaction-cancel-dialog/transaction-cancel-dialog.component';


@NgModule({
  declarations: [
    TransactionEntryComponent,
    PreviousPolicyDetailsComponent,
    TransactionListComponent,
    AttachmentModalComponent,
    TransactionCancelDialogComponent
  ],
  imports: [
    CommonModule,
    TransactionRoutingModule,
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
export class TransactionModule { }
