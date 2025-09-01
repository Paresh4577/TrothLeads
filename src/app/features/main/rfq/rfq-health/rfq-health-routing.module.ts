import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
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
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [

  {
    path: '',
    component: RFQListComponent,
    data: { title: "Policy Register - Health", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    pathMatch: "full",
    component: RfqHealthComponent,
    data: { title: "RFQ (Request For Quotation)", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    pathMatch: "full",
    component: RfqHealthComponent,
    data: { title: "RFQ (Request For Quotation)", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    pathMatch: "full",
    component: QuotationNoteComponent,
    data: { title: "QN by UW", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    pathMatch: "full",
    component: QuotationBySalesPersonComponent,
    resolve: { data: ResolverService },
    canActivate: [RoleGuard],
    data: { title: "Quotation Selection by Sales Person", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" }
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: PaymentLinkComponent,
    data: { title: "Payment Link by UW", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: PaymentProofComponent,
    data: { title: "Payment Proof by Sales Person", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: ProposalSubmissionInfoComponent,
    data: { title: "Proposal Submission Information by UW", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'CounterOffer/:Id',
    pathMatch: "full",
    component: CounterOfferInfoComponent,
    data: { title: "Counter Offer by Insurance Company", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentLink/:Id',
    pathMatch: "full",
    component: LoadingPaymentLinkComponent,
    data: { title: "Loading Payment Link by UW", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentProof/:Id',
    pathMatch: "full",
    component: LoadingPaymentProofComponent,
    data: { title: "Loading Payment Proof by Sales Person", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: PolicyIssueInfoComponent,
    data: { title: "Policy Issue Information by UW", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'transactionhealth/:Id',
    component: TransactionHealthComponent,
    data: { title: "Transaction", apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'transactionlist',
    component: TransactionListComponent,
  },


  // for Approval request routing
  {
    path: ':StageCode',
    pathMatch: "full",
    component: RFQListComponent
  },

  // for view mode in RFQ Health
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: RfqHealthComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'quotationNote/View/:Id',
    pathMatch: "full",
    component: QuotationNoteComponent,
    data: { title: "View QN by UW", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'quotationbysalesperson/View/:Id',
    pathMatch: "full",
    component: QuotationBySalesPersonComponent,
    resolve: { data: ResolverService },
    data: { title: "View Quotation Selection by Sales Person", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base }
  },
  {
    path: 'paymentlink/View/:Id',
    pathMatch: "full",
    component: PaymentLinkComponent,
    data: { title: "View Payment Link by UW", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'Paymentproof/View/:Id',
    component: PaymentProofComponent,
    data: { title: "View Payment Proof by Sales Person", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'proposalsubmissioninfo/View/:Id',
    pathMatch: "full",
    component: ProposalSubmissionInfoComponent,
    data: { title: "View Proposal Submission Information by UW", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'counterOffer/View/:Id',
    pathMatch: "full",
    component: CounterOfferInfoComponent,
    data: { title: "View Counter Offer by Insurance Company", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'loadingPaymentlink/View/:Id',
    pathMatch: "full",
    component: LoadingPaymentLinkComponent,
    data: { title: "View Loading Payment Link by UW", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'loadingPaymentProof/View/:Id',
    pathMatch: "full",
    component: LoadingPaymentProofComponent,
    data: { title: "View Loading Payment Proof by Sales Person", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: PolicyIssueInfoComponent,
    data: { title: "View Policy Issue Information by UW", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: RfqHealthComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Health", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqHealthRoutingModule { }
