import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqFireListComponent } from './rfq-fire-list/rfq-fire-list.component';
import { FireRaiseComponent } from './fire-raise/fire-raise.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { FireQnByUwComponent } from './fire-qn-by-uw/fire-qn-by-uw.component';
import { FireQnSelectionSpComponent } from './fire-qn-selection-sp/fire-qn-selection-sp.component';
import { FirePaymentLinkUwComponent } from './fire-payment-link-uw/fire-payment-link-uw.component';
import { FirePaymentProofSpComponent } from './fire-payment-proof-sp/fire-payment-proof-sp.component';
import { FireProposalSubmissionUwComponent } from './fire-proposal-submission-uw/fire-proposal-submission-uw.component';
import { FirePolicyIssueUwComponent } from './fire-policy-issue-uw/fire-policy-issue-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqFireListComponent,
    data: { title: "Policy Register - Fire", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: FireRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)- Fire", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: FireRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)- Fire", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: FireQnByUwComponent,
    data: { title: "QN By UW - Fire", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: FireQnSelectionSpComponent,
    data: { title: "Quotation selection by Sales Person - Fire", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    component: FirePaymentLinkUwComponent,
    data: { title: "Payment Link by UW - Fire", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: FirePaymentProofSpComponent,
    data: { title: "Payment Proof by Sales Person - Fire", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    component: FireProposalSubmissionUwComponent,
    data: { title: "Proposal Submission by UW-Fire", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: FirePolicyIssueUwComponent,
    data: { title: "Policy Issue by UW - Fire", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: FirePolicyIssueUwComponent,
    data: { title: "View Policy Issue by UW - Fire", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: FireRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: FireRaiseComponent,
    data: { title: "Renewal - RFQ (Requition for Quotation) - Fire", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqFireRoutingModule { }
