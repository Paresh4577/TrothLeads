import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { MotorPolicyIssueUwComponent } from './motor-policy-issue-uw/motor-policy-issue-uw.component';
import { MotorLoadingPaymentProofSpComponent } from './motor-loading-payment-proof-sp/motor-loading-payment-proof-sp.component';
import { MotorLoadingPaymentLinkUwComponent } from './motor-loading-payment-link-uw/motor-loading-payment-link-uw.component';
import { MotorCounterOfferComponent } from './motor-counter-offer/motor-counter-offer.component';
import { MotorProposalSubmissionUwComponent } from './motor-proposal-submission-uw/motor-proposal-submission-uw.component';
import { MotorPaymentProofSpComponent } from './motor-payment-proof-sp/motor-payment-proof-sp.component';
import { MotorPaymentLinkUwComponent } from './motor-payment-link-uw/motor-payment-link-uw.component';
import { MotorQnSelectionSpComponent } from './motor-qn-selection-sp/motor-qn-selection-sp.component';
import { MotorRaiseComponent } from './motor-raise/motor-raise.component';
import { MotorQnByUwComponent } from './motor-qn-by-uw/motor-qn-by-uw.component';
import { RfqMotorListComponent } from './rfq-motor-list/rfq-motor-list.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqMotorListComponent,
    data: { title: "Policy Register - motor", authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    pathMatch: "full",
    component: MotorRaiseComponent,
    data: { title: "RFQ (Request For Quotation)-Motor", mode: 'create', authKey: "RFQ-get" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    pathMatch: "full",
    component: MotorRaiseComponent,
    data: { title: "RFQ (Request For Quotation)-Motor", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    pathMatch: "full",
    component: MotorQnByUwComponent,
    data: { title: "Motor Quotation (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    pathMatch: "full",
    component: MotorQnSelectionSpComponent,
    data: { title: "Motor Quotation Selection (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: MotorPaymentLinkUwComponent,
    data: { title: "Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    pathMatch: "full",
    component: MotorPaymentProofSpComponent,
    data: { title: "Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: MotorProposalSubmissionUwComponent,
    data: { title: "Proposal Submission (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'CounterOffer/:Id',
    component: MotorCounterOfferComponent,
    data: { title: "Counter Offer", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentLink/:Id',
    component: MotorLoadingPaymentLinkUwComponent,
    data: { title: "Loading Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'LoadingPaymentProof/:Id',
    component: MotorLoadingPaymentProofSpComponent,
    data: { title: "Loading Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: MotorPolicyIssueUwComponent,
    data: { title: "Policy Issue (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: MotorPolicyIssueUwComponent,
    data: { title: "View Policy Issue (UW)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: MotorRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: MotorRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Motor", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqMotorRoutingModule { }
