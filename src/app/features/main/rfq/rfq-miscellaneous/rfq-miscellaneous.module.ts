import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqMiscellaneousRoutingModule } from './rfq-miscellaneous-routing.module';
import { MiscellaneousRaiseComponent } from './miscellaneous-raise/miscellaneous-raise.component';
import { MiscellaneousQnByUwComponent } from './miscellaneous-qn-by-uw/miscellaneous-qn-by-uw.component';
import { MiscellaneousQnSelectionSpComponent } from './miscellaneous-qn-selection-sp/miscellaneous-qn-selection-sp.component';
import { MiscellaneousPaymentLinkUwComponent } from './miscellaneous-payment-link-uw/miscellaneous-payment-link-uw.component';
import { MiscellaneousPaymentProofSpComponent } from './miscellaneous-payment-proof-sp/miscellaneous-payment-proof-sp.component';
import { MiscellaneousProposalSubmissionUwComponent } from './miscellaneous-proposal-submission-uw/miscellaneous-proposal-submission-uw.component';
import { MiscellaneousPolicyIssueUwComponent } from './miscellaneous-policy-issue-uw/miscellaneous-policy-issue-uw.component';
import { RfqMiscellaneousListComponent } from './rfq-miscellaneous-list/rfq-miscellaneous-list.component';
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


@NgModule({
  declarations: [
    MiscellaneousRaiseComponent,
    MiscellaneousQnByUwComponent,
    MiscellaneousQnSelectionSpComponent,
    MiscellaneousPaymentLinkUwComponent,
    MiscellaneousPaymentProofSpComponent,
    MiscellaneousProposalSubmissionUwComponent,
    MiscellaneousPolicyIssueUwComponent,
    RfqMiscellaneousListComponent
  ],
  imports: [
    CommonModule,
    RfqMiscellaneousRoutingModule,
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
export class RfqMiscellaneousModule { }
