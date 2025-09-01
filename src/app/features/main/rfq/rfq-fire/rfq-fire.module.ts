import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqFireRoutingModule } from './rfq-fire-routing.module';
import { RfqFireListComponent } from './rfq-fire-list/rfq-fire-list.component';
import { FireRaiseComponent } from './fire-raise/fire-raise.component';
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
import { FireQnByUwComponent } from './fire-qn-by-uw/fire-qn-by-uw.component';
import { FireQnSelectionSpComponent } from './fire-qn-selection-sp/fire-qn-selection-sp.component';
import { FirePaymentLinkUwComponent } from './fire-payment-link-uw/fire-payment-link-uw.component';
import { FirePaymentProofSpComponent } from './fire-payment-proof-sp/fire-payment-proof-sp.component';
import { FireProposalSubmissionUwComponent } from './fire-proposal-submission-uw/fire-proposal-submission-uw.component';
import { FirePolicyIssueUwComponent } from './fire-policy-issue-uw/fire-policy-issue-uw.component';


@NgModule({
  declarations: [
    RfqFireListComponent,
    FireRaiseComponent,
    FireQnByUwComponent,
    FireQnSelectionSpComponent,
    FirePaymentLinkUwComponent,
    FirePaymentProofSpComponent,
    FireProposalSubmissionUwComponent,
    FirePolicyIssueUwComponent
  ],
  imports: [
    CommonModule,
    RfqFireRoutingModule,
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
export class RfqFireModule { }
