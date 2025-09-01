import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqLiabilityRoutingModule } from './rfq-liability-routing.module';
import { RfqLiabilityListComponent } from './rfq-liability-list/rfq-liability-list.component';
import { LiabilityRaiseComponent } from './liability-raise/liability-raise.component';
import { LiabilityQnByUwComponent } from './liability-qn-by-uw/liability-qn-by-uw.component';
import { LiabilityQnSelectionSpComponent } from './liability-qn-selection-sp/liability-qn-selection-sp.component';
import { LiabilityPaymentLinkUwComponent } from './liability-payment-link-uw/liability-payment-link-uw.component';
import { LiabilityPaymentProofSpComponent } from './liability-payment-proof-sp/liability-payment-proof-sp.component';
import { LiabilityProposalSubmissionUwComponent } from './liability-proposal-submission-uw/liability-proposal-submission-uw.component';
import { LiabilityPolicyIssueUwComponent } from './liability-policy-issue-uw/liability-policy-issue-uw.component';
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
    RfqLiabilityListComponent,
    LiabilityRaiseComponent,
    LiabilityQnByUwComponent,
    LiabilityQnSelectionSpComponent,
    LiabilityPaymentLinkUwComponent,
    LiabilityPaymentProofSpComponent,
    LiabilityProposalSubmissionUwComponent,
    LiabilityPolicyIssueUwComponent
  ],
  imports: [
    CommonModule,
    RfqLiabilityRoutingModule,
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
export class RfqLiabilityModule { }
