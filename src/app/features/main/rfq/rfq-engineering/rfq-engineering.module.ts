import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqEngineeringRoutingModule } from './rfq-engineering-routing.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { PercentageModule } from '@lib/ui/directives/percentage/percentage.module';
import { AlphabetNumberOnlyModule } from '@lib/ui/directives/alphabet-number-only/alphabet-number-only.module';
import { UppercaseInputModule } from '@lib/ui/directives/uppercase-input/uppercase-input.module';
import { CurrencyInputModule } from '@lib/ui/components/currency-input/currency-input.module';
import { EngineeringRfqListComponent } from './engineering-rfq-list/engineering-rfq-list.component';
import { EngineeringRaiseComponent } from './engineering-raise/engineering-raise.component';
import { EngineeringQnByUwComponent } from './engineering-qn-by-uw/engineering-qn-by-uw.component';
import { EngineeringQnSelectionSpComponent } from './engineering-qn-selection-sp/engineering-qn-selection-sp.component';
import { EngineeringPaymentLinkUwComponent } from './engineering-payment-link-uw/engineering-payment-link-uw.component';
import { EngineeringPaymentProofSpComponent } from './engineering-payment-proof-sp/engineering-payment-proof-sp.component';
import { EngineeringProposalSubmissionUwComponent } from './engineering-proposal-submission-uw/engineering-proposal-submission-uw.component';
import { EngineeringPolicyIssueUwComponent } from './engineering-policy-issue-uw/engineering-policy-issue-uw.component';


@NgModule({
  declarations: [
    EngineeringRfqListComponent,
    EngineeringRaiseComponent,
    EngineeringQnByUwComponent,
    EngineeringQnSelectionSpComponent,
    EngineeringPaymentLinkUwComponent,
    EngineeringPaymentProofSpComponent,
    EngineeringProposalSubmissionUwComponent,
    EngineeringPolicyIssueUwComponent
  ],
  imports: [
    CommonModule,
    RfqEngineeringRoutingModule,
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
export class RfqEngineeringModule { }
