import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqPackageRoutingModule } from './rfq-package-routing.module';
import { PackageRaiseComponent } from './package-raise/package-raise.component';
import { PackageQnByUwComponent } from './package-qn-by-uw/package-qn-by-uw.component';
import { PackageQnSelectionSpComponent } from './package-qn-selection-sp/package-qn-selection-sp.component';
import { PackagePaymentLinkUwComponent } from './package-payment-link-uw/package-payment-link-uw.component';
import { PackagePaymentProofSpComponent } from './package-payment-proof-sp/package-payment-proof-sp.component';
import { PackageProposalSubmissionUwComponent } from './package-proposal-submission-uw/package-proposal-submission-uw.component';
import { PackagePolicyIssueUwComponent } from './package-policy-issue-uw/package-policy-issue-uw.component';
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
import { PackageRfqListComponent } from './package-rfq-list/package-rfq-list.component';


@NgModule({
  declarations: [
    PackageRaiseComponent,
    PackageQnByUwComponent,
    PackageQnSelectionSpComponent,
    PackagePaymentLinkUwComponent,
    PackagePaymentProofSpComponent,
    PackageProposalSubmissionUwComponent,
    PackagePolicyIssueUwComponent,
    PackageRfqListComponent
  ],
  imports: [
    CommonModule,
    RfqPackageRoutingModule,
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
export class RfqPackageModule { }
