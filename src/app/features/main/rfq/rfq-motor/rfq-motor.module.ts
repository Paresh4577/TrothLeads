import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqMotorRoutingModule } from './rfq-motor-routing.module';
import { MotorRaiseComponent } from './motor-raise/motor-raise.component';
import { MotorQnByUwComponent } from './motor-qn-by-uw/motor-qn-by-uw.component';
import { MotorQnSelectionSpComponent } from './motor-qn-selection-sp/motor-qn-selection-sp.component';
import { MotorPaymentLinkUwComponent } from './motor-payment-link-uw/motor-payment-link-uw.component';
import { MotorPaymentProofSpComponent } from './motor-payment-proof-sp/motor-payment-proof-sp.component';
import { MotorProposalSubmissionUwComponent } from './motor-proposal-submission-uw/motor-proposal-submission-uw.component';
import { MotorCounterOfferComponent } from './motor-counter-offer/motor-counter-offer.component';
import { MotorLoadingPaymentLinkUwComponent } from './motor-loading-payment-link-uw/motor-loading-payment-link-uw.component';
import { MotorLoadingPaymentProofSpComponent } from './motor-loading-payment-proof-sp/motor-loading-payment-proof-sp.component';
import { MotorPolicyIssueUwComponent } from './motor-policy-issue-uw/motor-policy-issue-uw.component';
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
import { RfqMotorListComponent } from './rfq-motor-list/rfq-motor-list.component';


@NgModule({
  declarations: [
    MotorRaiseComponent,
    MotorQnByUwComponent,
    MotorQnSelectionSpComponent,
    MotorPaymentLinkUwComponent,
    MotorPaymentProofSpComponent,
    MotorProposalSubmissionUwComponent,
    MotorCounterOfferComponent,
    MotorLoadingPaymentLinkUwComponent,
    MotorLoadingPaymentProofSpComponent,
    MotorPolicyIssueUwComponent,
    RfqMotorListComponent
  ],
  imports: [
    CommonModule,
    RfqMotorRoutingModule,
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
export class RfqMotorModule { }
