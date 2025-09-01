import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqLifeRoutingModule } from './rfq-life-routing.module';
import { LifeRfqListComponent } from './life-rfq-list/life-rfq-list.component';
import { LifeRaiseComponent } from './life-raise/life-raise.component';
import { LifeQnByUwComponent } from './life-qn-by-uw/life-qn-by-uw.component';
import { LifeQnSelectionSpComponent } from './life-qn-selection-sp/life-qn-selection-sp.component';
import { LifePaymentLinkUwComponent } from './life-payment-link-uw/life-payment-link-uw.component';
import { LifePaymentProofSpComponent } from './life-payment-proof-sp/life-payment-proof-sp.component';
import { LifeProposalSubmissionUwComponent } from './life-proposal-submission-uw/life-proposal-submission-uw.component';
import { LifeCounterOfferComponent } from './life-counter-offer/life-counter-offer.component';
import { LifeLoadingPaymentLinkUwComponent } from './life-loading-payment-link-uw/life-loading-payment-link-uw.component';
import { LifeLoadingPaymentProofSpComponent } from './life-loading-payment-proof-sp/life-loading-payment-proof-sp.component';
import { LifePolicyIssueUwComponent } from './life-policy-issue-uw/life-policy-issue-uw.component';
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
    LifeRfqListComponent,
    LifeRaiseComponent,
    LifeQnByUwComponent,
    LifeQnSelectionSpComponent,
    LifePaymentLinkUwComponent,
    LifePaymentProofSpComponent,
    LifeProposalSubmissionUwComponent,
    LifeCounterOfferComponent,
    LifeLoadingPaymentLinkUwComponent,
    LifeLoadingPaymentProofSpComponent,
    LifePolicyIssueUwComponent,
  ],
  imports: [
    CommonModule,
    RfqLifeRoutingModule,
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
export class RfqLifeModule { }
