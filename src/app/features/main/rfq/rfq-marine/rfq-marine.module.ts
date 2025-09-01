import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqMarineRoutingModule } from './rfq-marine-routing.module';
import { RfqMarineListComponent } from './rfq-marine-list/rfq-marine-list.component';
import { MarineRaiseComponent } from './marine-raise/marine-raise.component';
import { MarineQnByUwComponent } from './marine-qn-by-uw/marine-qn-by-uw.component';
import { AlphabetNumberOnlyModule } from '@lib/ui/directives/alphabet-number-only/alphabet-number-only.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { PercentageModule } from '@lib/ui/directives/percentage/percentage.module';
import { UppercaseInputModule } from '@lib/ui/directives/uppercase-input/uppercase-input.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyInputModule } from '@lib/ui/components/currency-input/currency-input.module';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MarineQnSelectionSpComponent } from './marine-qn-selection-sp/marine-qn-selection-sp.component';
import { MarinePaymentLinkUwComponent } from './marine-payment-link-uw/marine-payment-link-uw.component';
import { MarinePaymentProofSpComponent } from './marine-payment-proof-sp/marine-payment-proof-sp.component';
import { MarineProposalSubmissionUwComponent } from './marine-proposal-submission-uw/marine-proposal-submission-uw.component';
import { MarineCounterOfferComponent } from './marine-counter-offer/marine-counter-offer.component';
import { MarinePolicyIssueUwComponent } from './marine-policy-issue-uw/marine-policy-issue-uw.component';
import { MarineLoadingPaymentLinkUwComponent } from './marine-loading-payment-link-uw/marine-loading-payment-link-uw.component';
import { MarineLoadingPaymentProofSpComponent } from './marine-loading-payment-proof-sp/marine-loading-payment-proof-sp.component';


@NgModule({
  declarations: [
    RfqMarineListComponent,
    MarineRaiseComponent,
    MarineQnByUwComponent,
    MarineQnSelectionSpComponent,
    MarinePaymentLinkUwComponent,
    MarinePaymentProofSpComponent,
    MarineProposalSubmissionUwComponent,
    MarineCounterOfferComponent,
    MarinePolicyIssueUwComponent,
    MarineLoadingPaymentLinkUwComponent,
    MarineLoadingPaymentProofSpComponent
  ],
  imports: [
    CommonModule,
    RfqMarineRoutingModule,
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
export class RfqMarineModule { }
