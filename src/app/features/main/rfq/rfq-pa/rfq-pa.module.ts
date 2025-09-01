import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqPaRoutingModule } from './rfq-pa-routing.module';
import { PaRaiseComponent } from './pa-raise/pa-raise.component';
import { RfqPaListComponent } from './rfq-pa-list/rfq-pa-list.component';
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
import { PaQnByUwComponent } from './pa-qn-by-uw/pa-qn-by-uw.component';
import { PaQnSelectionSpComponent } from './pa-qn-selection-sp/pa-qn-selection-sp.component';
import { PaPaymentLinkUwComponent } from './pa-payment-link-uw/pa-payment-link-uw.component';
import { PaPaymentProofSpComponent } from './pa-payment-proof-sp/pa-payment-proof-sp.component';
import { PaProposalSubmissionUwComponent } from './pa-proposal-submission-uw/pa-proposal-submission-uw.component';
import { PaPolicyIssueUwComponent } from './pa-policy-issue-uw/pa-policy-issue-uw.component';


@NgModule({
  declarations: [
    PaRaiseComponent,
    RfqPaListComponent,
    PaQnByUwComponent,
    PaQnSelectionSpComponent,
    PaPaymentLinkUwComponent,
    PaPaymentProofSpComponent,
    PaProposalSubmissionUwComponent,
    PaPolicyIssueUwComponent,
  ],
  imports: [
    CommonModule,
    RfqPaRoutingModule,
    SharedMaterialModule,
    DatemaskModule,
    ReactiveFormsModule,
    MatButtonModule,
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
export class RfqPaModule { }
