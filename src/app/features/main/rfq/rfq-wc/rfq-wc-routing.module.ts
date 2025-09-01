import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WcPolicyIssueUwComponent } from './wc-policy-issue-uw/wc-policy-issue-uw.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { WcLoadingPaymentProofSpComponent } from './wc-loading-payment-proof-sp/wc-loading-payment-proof-sp.component';
import { RfqWcListComponent } from './rfq-wc-list/rfq-wc-list.component';
import { WcRaiseComponent } from './wc-raise/wc-raise.component';
import { WcQnByUwComponent } from './wc-qn-by-uw/wc-qn-by-uw.component';
import { WcQnSelectionSpComponent } from './wc-qn-selection-sp/wc-qn-selection-sp.component';
import { WcPaymentLinkUwComponent } from './wc-payment-link-uw/wc-payment-link-uw.component';
import { WcPaymentProofSpComponent } from './wc-payment-proof-sp/wc-payment-proof-sp.component';
import { WcProposalSubmissionUwComponent } from './wc-proposal-submission-uw/wc-proposal-submission-uw.component';
import { WcCounterOfferComponent } from './wc-counter-offer/wc-counter-offer.component';
import { WcLoadingPaymentLinkUwComponent } from './wc-loading-payment-link-uw/wc-loading-payment-link-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqWcListComponent,
    data: { title: "Policy Register - Workmen Compensation", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: WcRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Workmen Compensation", mode: 'create', authKey: "RFQ-list" }
  },
  {
    path: 'raise/:Id',
    component: WcRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Workmen Compensation", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: WcQnByUwComponent,
    data: { title: "QN By UW - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: WcQnSelectionSpComponent,
    data: { title: "Quotation Selection by Sales Person - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    component: WcPaymentLinkUwComponent,
    data: { title: "Payment Link by UW - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: WcPaymentProofSpComponent,
    data: { title: "Payment Proof by Sales Person - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    component: WcProposalSubmissionUwComponent,
    data: { title: "Proposal Submission by UW-Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'CounterOffer/:Id',
    component: WcCounterOfferComponent,
    data: { title: "Counter Offer by Insurance Company - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentLink/:Id',
    component: WcLoadingPaymentLinkUwComponent,
    data: { title: "Loading Payment Link by UW - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentProof/:Id',
    component: WcLoadingPaymentProofSpComponent,
    data: { title: "Loading Payment Proof by Sales Person - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: WcPolicyIssueUwComponent,
    data: { title: "Policy Issue by UW - Workmen Compensation", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: WcPolicyIssueUwComponent,
    data: { title: "View Policy Issue by UW - Workmen Compensation", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-list" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: WcRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: WcRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Workmen Compensation", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqWcRoutingModule { }
