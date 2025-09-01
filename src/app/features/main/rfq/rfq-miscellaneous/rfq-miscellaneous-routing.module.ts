import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqMiscellaneousListComponent } from './rfq-miscellaneous-list/rfq-miscellaneous-list.component';
import { MiscellaneousRaiseComponent } from './miscellaneous-raise/miscellaneous-raise.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MiscellaneousQnSelectionSpComponent } from './miscellaneous-qn-selection-sp/miscellaneous-qn-selection-sp.component';
import { MiscellaneousPaymentLinkUwComponent } from './miscellaneous-payment-link-uw/miscellaneous-payment-link-uw.component';
import { MiscellaneousProposalSubmissionUwComponent } from './miscellaneous-proposal-submission-uw/miscellaneous-proposal-submission-uw.component';
import { MiscellaneousPolicyIssueUwComponent } from './miscellaneous-policy-issue-uw/miscellaneous-policy-issue-uw.component';
import { MiscellaneousQnByUwComponent } from './miscellaneous-qn-by-uw/miscellaneous-qn-by-uw.component';
import { MiscellaneousPaymentProofSpComponent } from './miscellaneous-payment-proof-sp/miscellaneous-payment-proof-sp.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqMiscellaneousListComponent,
    data: { title: "Policy Register - Miscellaneous" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: MiscellaneousRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Miscellaneous", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: MiscellaneousRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Miscellaneous", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: MiscellaneousQnByUwComponent,
    data: { title: "QN By UW - Miscellaneous", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: MiscellaneousQnSelectionSpComponent,
    data: { title: "Quotation Selection by Sales Person - Miscellaneous", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    component: MiscellaneousPaymentLinkUwComponent,
    data: { title: "Payment Link by UW - Miscellaneous", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: MiscellaneousPaymentProofSpComponent,
    data: { title: "Payment Proof by Sales Person - Miscellaneous", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    component: MiscellaneousProposalSubmissionUwComponent,
    data: { title: "Proposal Submission by UW-Miscellaneous", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: MiscellaneousPolicyIssueUwComponent,
    data: { title: "Policy Issue by UW - Miscellaneous", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: MiscellaneousPolicyIssueUwComponent,
    data: { title: "View Policy Issue by UW - Miscellaneous", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: MiscellaneousRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: MiscellaneousRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Miscellaneous", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqMiscellaneousRoutingModule { }
