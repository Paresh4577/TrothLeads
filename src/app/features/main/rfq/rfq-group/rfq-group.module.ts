import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqGroupRoutingModule } from './rfq-group-routing.module';
import { GroupRfqListComponent } from './group-rfq-list/group-rfq-list.component';
import { GroupRaiseComponent } from './group-raise/group-raise.component';
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
import { GroupQnByUwComponent } from './group-qn-by-uw/group-qn-by-uw.component';
import { GroupQnSelectionSpComponent } from './group-qn-selection-sp/group-qn-selection-sp.component';
import { GroupPaymentLinkUwComponent } from './group-payment-link-uw/group-payment-link-uw.component';
import { GroupPaymentProofSpComponent } from './group-payment-proof-sp/group-payment-proof-sp.component';
import { GroupProposalSubmissionUwComponent } from './group-proposal-submission-uw/group-proposal-submission-uw.component';
import { GroupPolicyIssueUwComponent } from './group-policy-issue-uw/group-policy-issue-uw.component';


@NgModule({
  declarations: [
    GroupRfqListComponent,
    GroupRaiseComponent,
    GroupQnByUwComponent,
    GroupQnSelectionSpComponent,
    GroupPaymentLinkUwComponent,
    GroupPaymentProofSpComponent,
    GroupProposalSubmissionUwComponent,
    GroupPolicyIssueUwComponent
  ],
  imports: [
    CommonModule,
    RfqGroupRoutingModule,
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
export class RfqGroupModule { }
