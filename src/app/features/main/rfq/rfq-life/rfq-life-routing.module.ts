import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LifeRfqListComponent } from './life-rfq-list/life-rfq-list.component';
import { LifeRaiseComponent } from './life-raise/life-raise.component';
import { LifeQnByUwComponent } from './life-qn-by-uw/life-qn-by-uw.component';
import { LifeQnSelectionSpComponent } from './life-qn-selection-sp/life-qn-selection-sp.component';
import { LifePaymentLinkUwComponent } from './life-payment-link-uw/life-payment-link-uw.component';
import { LifePaymentProofSpComponent } from './life-payment-proof-sp/life-payment-proof-sp.component';
import { LifeProposalSubmissionUwComponent } from './life-proposal-submission-uw/life-proposal-submission-uw.component';
import { LifeCounterOfferComponent } from './life-counter-offer/life-counter-offer.component';
import { LifeLoadingPaymentLinkUwComponent } from './life-loading-payment-link-uw/life-loading-payment-link-uw.component';
import { LifeLoadingPaymentProofSpComponent } from './life-loading-payment-proof-sp/life-loading-payment-proof-sp.component';
import { LifePolicyIssueUwComponent } from './life-policy-issue-uw/life-policy-issue-uw.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: LifeRfqListComponent,
    data: { title: "Policy Register - Life", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: LifeRaiseComponent,
    data: { title: "RFQ (Request For Quotation) - Life", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: LifeRaiseComponent,
    data: { title: "RFQ (Request For Quotation) - Life", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: LifeQnByUwComponent,
    data: { title: "Life Quotation (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: LifeQnSelectionSpComponent,
    data: { title: "Life Quotation Selection (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: LifePaymentLinkUwComponent,
    data: { title: "Life Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    pathMatch: "full",
    component: LifePaymentProofSpComponent,
    data: { title: "Life Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: LifeProposalSubmissionUwComponent,
    data: { title: "Life Proposal Submission (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'CounterOffer/:Id',
    pathMatch: "full",
    component: LifeCounterOfferComponent,
    data: { title: "Life Counter Offer", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentLink/:Id',
    pathMatch: "full",
    component: LifeLoadingPaymentLinkUwComponent,
    data: { title: "Life Loading Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentProof/:Id',
    pathMatch: "full",
    component: LifeLoadingPaymentProofSpComponent,
    data: { title: "Life Loading Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    pathMatch: "full",
    component: LifePolicyIssueUwComponent,
    data: { title: "Life Policy Issue (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: LifePolicyIssueUwComponent,
    data: { title: "View Life Policy Issue (UW)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: LifeRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: LifeRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Life", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqLifeRoutingModule { }
