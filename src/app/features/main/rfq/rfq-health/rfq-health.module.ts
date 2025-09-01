import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqHealthRoutingModule } from './rfq-health-routing.module';
import { RFQListComponent } from './rfqlist/rfqlist.component';
import { RfqHealthComponent } from './rfq-health/rfq-health.component';
import { QuotationNoteComponent } from './quotation-note/quotation-note.component';
import { QuotationBySalesPersonComponent } from './quotation-by-sales-person/quotation-by-sales-person.component';
import { PaymentLinkComponent } from './payment-link/payment-link.component';
import { PaymentProofComponent } from './payment-proof/payment-proof.component';
import { ProposalSubmissionInfoComponent } from './proposal-submission-info/proposal-submission-info.component';
import { CounterOfferInfoComponent } from './counter-offer-info/counter-offer-info.component';
import { LoadingPaymentLinkComponent } from './loading-payment-link/loading-payment-link.component';
import { LoadingPaymentProofComponent } from './loading-payment-proof/loading-payment-proof.component';
import { PolicyIssueInfoComponent } from './policy-issue-info/policy-issue-info.component';
import { TransactionHealthComponent } from './transaction-health/transaction-health.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { RFQExistingIllnessDetailsComponent } from './rfqexisting-illness-details/rfqexisting-illness-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { mmyyyyModule } from '@lib/ui/directives/mmyyyy/mmyyyy.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { PercentageModule } from '@lib/ui/directives/percentage/percentage.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';


@NgModule({
  declarations: [
    RfqHealthComponent,
    QuotationNoteComponent,
    PaymentLinkComponent,
    PaymentProofComponent,
    ProposalSubmissionInfoComponent,
    PolicyIssueInfoComponent,
    TransactionHealthComponent,
    QuotationBySalesPersonComponent,
    RFQExistingIllnessDetailsComponent,
    RFQListComponent,
    TransactionListComponent,
    CounterOfferInfoComponent,
    LoadingPaymentLinkComponent,
    LoadingPaymentProofComponent,
  ],
  imports: [
    CommonModule,
    RfqHealthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedPipesModule,
    SharedMaterialModule,
    DatemaskModule,
    OnlynumberModule,
    mmyyyyModule,
    AlphabetOnlyModule,
    MatTabsModule,
    TableListModule,
    DecimalModule,
    PercentageModule
  ]
})
export class RfqHealthModule { }
