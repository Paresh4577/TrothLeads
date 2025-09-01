import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqWcRoutingModule } from './rfq-wc-routing.module';
import { WcRaiseComponent } from './wc-raise/wc-raise.component';
import { WcQnByUwComponent } from './wc-qn-by-uw/wc-qn-by-uw.component';
import { WcQnSelectionSpComponent } from './wc-qn-selection-sp/wc-qn-selection-sp.component';
import { WcPaymentLinkUwComponent } from './wc-payment-link-uw/wc-payment-link-uw.component';
import { WcPaymentProofSpComponent } from './wc-payment-proof-sp/wc-payment-proof-sp.component';
import { WcProposalSubmissionUwComponent } from './wc-proposal-submission-uw/wc-proposal-submission-uw.component';
import { WcCounterOfferComponent } from './wc-counter-offer/wc-counter-offer.component';
import { WcLoadingPaymentLinkUwComponent } from './wc-loading-payment-link-uw/wc-loading-payment-link-uw.component';
import { WcLoadingPaymentProofSpComponent } from './wc-loading-payment-proof-sp/wc-loading-payment-proof-sp.component';
import { WcPolicyIssueUwComponent } from './wc-policy-issue-uw/wc-policy-issue-uw.component';
import { RfqWcListComponent } from './rfq-wc-list/rfq-wc-list.component';
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
    WcRaiseComponent,
    WcQnByUwComponent,
    WcQnSelectionSpComponent,
    WcPaymentLinkUwComponent,
    WcPaymentProofSpComponent,
    WcProposalSubmissionUwComponent,
    WcCounterOfferComponent,
    WcLoadingPaymentLinkUwComponent,
    WcLoadingPaymentProofSpComponent,
    WcPolicyIssueUwComponent,
    RfqWcListComponent
  ],
  imports: [
    CommonModule,
    RfqWcRoutingModule,
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
export class RfqWcModule { }
