import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqTravelRoutingModule } from './rfq-travel-routing.module';
import { TravelRfqListComponent } from './travel-rfq-list/travel-rfq-list.component';
import { TravelRaiseComponent } from './travel-raise/travel-raise.component';
import { TravelQnByUwComponent } from './travel-qn-by-uw/travel-qn-by-uw.component';
import { TravelQnSelectionSPComponent } from './travel-qn-selection-sp/travel-qn-selection-sp.component';
import { TravelPaymentLinkUWComponent } from './travel-payment-link-uw/travel-payment-link-uw.component';
import { TravelPaymentProofSPComponent } from './travel-payment-proof-sp/travel-payment-proof-sp.component';
import { TravelCounterOfferComponent } from './travel-counter-offer/travel-counter-offer.component';
import { TravelLoadingPaymentLinkUWComponent } from './travel-loading-payment-link-uw/travel-loading-payment-link-uw.component';
import { TravelLoadingPaymentProofSPComponent } from './travel-loading-payment-proof-sp/travel-loading-payment-proof-sp.component';
import { TravelPolicyIssueUWComponent } from './travel-policy-issue-uw/travel-policy-issue-uw.component';
import { TravelProposalSubmissionUWComponent } from './travel-proposal-submission-uw/travel-proposal-submission-uw.component';
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
    TravelRfqListComponent,
    TravelRaiseComponent,
    TravelQnByUwComponent,
    TravelQnSelectionSPComponent,
    TravelPaymentLinkUWComponent,
    TravelPaymentProofSPComponent,
    TravelCounterOfferComponent,
    TravelLoadingPaymentLinkUWComponent,
    TravelLoadingPaymentProofSPComponent,
    TravelPolicyIssueUWComponent,
    TravelProposalSubmissionUWComponent,
  ],
  imports: [
    CommonModule,
    RfqTravelRoutingModule,
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
export class RfqTravelModule { }
