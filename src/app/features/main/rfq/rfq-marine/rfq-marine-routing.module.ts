import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarineRaiseComponent } from './marine-raise/marine-raise.component';
import { RfqMarineListComponent } from './rfq-marine-list/rfq-marine-list.component';
import { MarineQnByUwComponent } from './marine-qn-by-uw/marine-qn-by-uw.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { MarineQnSelectionSpComponent } from './marine-qn-selection-sp/marine-qn-selection-sp.component';
import { MarinePaymentLinkUwComponent } from './marine-payment-link-uw/marine-payment-link-uw.component';
import { MarinePaymentProofSpComponent } from './marine-payment-proof-sp/marine-payment-proof-sp.component';
import { MarineProposalSubmissionUwComponent } from './marine-proposal-submission-uw/marine-proposal-submission-uw.component';
import { MarineCounterOfferComponent } from './marine-counter-offer/marine-counter-offer.component';
import { MarinePolicyIssueUwComponent } from './marine-policy-issue-uw/marine-policy-issue-uw.component';
import { MarineLoadingPaymentLinkUwComponent } from './marine-loading-payment-link-uw/marine-loading-payment-link-uw.component';
import { MarineLoadingPaymentProofSpComponent } from './marine-loading-payment-proof-sp/marine-loading-payment-proof-sp.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqMarineListComponent,
    data: { title: "Policy Register - Marine", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: MarineRaiseComponent,
    data: { title: "RFQ (Requisition for Quotation) - Marine", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: MarineRaiseComponent,
    data: { title: "RFQ (Request For Quotation) - Marine", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: MarineQnByUwComponent,
    data: { title: "Marine Quotation (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: MarineQnSelectionSpComponent,
    data: { title: "Marine Quotation Selection (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: MarinePaymentLinkUwComponent,
    data: { title: "Marine Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    pathMatch: "full",
    component: MarinePaymentProofSpComponent,
    data: { title: "Marine Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: MarineProposalSubmissionUwComponent,
    data: { title: "Marine Proposal Submission (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'CounterOffer/:Id',
    pathMatch: "full",
    component: MarineCounterOfferComponent,
    data: { title: "Marine Counter Offer", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentLink/:Id',
    pathMatch: "full",
    component: MarineLoadingPaymentLinkUwComponent,
    data: { title: "Marine Loading Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentProof/:Id',
    pathMatch: "full",
    component: MarineLoadingPaymentProofSpComponent,
    data: { title: "Marine Loading Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    pathMatch: "full",
    component: MarinePolicyIssueUwComponent,
    data: { title: "Marine Policy Issue (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: MarinePolicyIssueUwComponent,
    data: { title: "View Marine Policy Issue (UW)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: MarineRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: MarineRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Marine", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqMarineRoutingModule { }
