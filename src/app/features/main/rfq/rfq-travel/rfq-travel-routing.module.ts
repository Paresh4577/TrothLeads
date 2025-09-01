import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { TravelRfqListComponent } from './travel-rfq-list/travel-rfq-list.component';
import { TravelRaiseComponent } from './travel-raise/travel-raise.component';
import { TravelQnByUwComponent } from './travel-qn-by-uw/travel-qn-by-uw.component';
import { TravelQnSelectionSPComponent } from './travel-qn-selection-sp/travel-qn-selection-sp.component';
import { TravelPaymentLinkUWComponent } from './travel-payment-link-uw/travel-payment-link-uw.component';
import { TravelPaymentProofSPComponent } from './travel-payment-proof-sp/travel-payment-proof-sp.component';
import { TravelCounterOfferComponent } from './travel-counter-offer/travel-counter-offer.component';
import { TravelLoadingPaymentLinkUWComponent } from './travel-loading-payment-link-uw/travel-loading-payment-link-uw.component';
import { TravelLoadingPaymentProofSPComponent } from './travel-loading-payment-proof-sp/travel-loading-payment-proof-sp.component';
import { TravelPolicyIssueUWComponent } from './travel-policy-issue-uw/travel-policy-issue-uw.component';
import { TravelProposalSubmissionUWComponent } from './travel-proposal-submission-uw/travel-proposal-submission-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: TravelRfqListComponent,
    data: { title: "Policy Register - travel", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: TravelRaiseComponent,
    data: { title: "RFQ (Request For Quotation)-Travel", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: TravelRaiseComponent,
    data: { title: "RFQ (Request For Quotation)-Travel", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: TravelQnByUwComponent,
    data: { title: "Travel Quotation (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: TravelQnSelectionSPComponent,
    data: { title: "Travel Quotation Selection (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: TravelPaymentLinkUWComponent,
    data: { title: "Travel Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    pathMatch: "full",
    component: TravelPaymentProofSPComponent,
    data: { title: "Travel Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: TravelProposalSubmissionUWComponent,
    data: { title: "Travel Proposal Submission (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'CounterOffer/:Id',
    pathMatch: "full",
    component: TravelCounterOfferComponent,
    data: { title: "Travel Counter Offer", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentLink/:Id',
    pathMatch: "full",
    component: TravelLoadingPaymentLinkUWComponent,
    data: { title: "Travel Loading Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentProof/:Id',
    pathMatch: "full",
    component: TravelLoadingPaymentProofSPComponent,
    data: { title: "Travel Loading Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    pathMatch: "full",
    component: TravelPolicyIssueUWComponent,
    data: { title: "Travel Policy Issue (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: TravelPolicyIssueUWComponent,
    data: { title: "View Travel Policy Issue (UW)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: TravelRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: TravelRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Travel", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqTravelRoutingModule { }
