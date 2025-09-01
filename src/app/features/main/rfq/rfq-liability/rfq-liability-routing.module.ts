import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RfqLiabilityListComponent } from './rfq-liability-list/rfq-liability-list.component';
import { LiabilityPaymentLinkUwComponent } from './liability-payment-link-uw/liability-payment-link-uw.component';
import { LiabilityPaymentProofSpComponent } from './liability-payment-proof-sp/liability-payment-proof-sp.component';
import { LiabilityPolicyIssueUwComponent } from './liability-policy-issue-uw/liability-policy-issue-uw.component';
import { LiabilityProposalSubmissionUwComponent } from './liability-proposal-submission-uw/liability-proposal-submission-uw.component';
import { LiabilityQnByUwComponent } from './liability-qn-by-uw/liability-qn-by-uw.component';
import { LiabilityQnSelectionSpComponent } from './liability-qn-selection-sp/liability-qn-selection-sp.component';
import { LiabilityRaiseComponent } from './liability-raise/liability-raise.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqLiabilityListComponent,
    data: { title: "Policy Register - Liability", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: LiabilityRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Liability", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: LiabilityRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Liability", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: LiabilityQnByUwComponent,
    data: { title: "QN By UW - Liability", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: LiabilityQnSelectionSpComponent,
    data: { title: "Quotation Selection by Sales Person - Liability", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    component: LiabilityPaymentLinkUwComponent,
    data: { title: "Payment Link by UW - Liability", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: LiabilityPaymentProofSpComponent,
    data: { title: "Payment Proof by Sales Person - Liability", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    component: LiabilityProposalSubmissionUwComponent,
    data: { title: "Proposal Submission by UW-Liability", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: LiabilityPolicyIssueUwComponent,
    data: { title: "Policy Issue by UW - Liability", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: LiabilityPolicyIssueUwComponent,
    data: { title: "View Policy Issue by UW - Liability", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: LiabilityRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: LiabilityRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Liability", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqLiabilityRoutingModule { }
