import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EngineeringRfqListComponent } from './engineering-rfq-list/engineering-rfq-list.component';
import { EngineeringRaiseComponent } from './engineering-raise/engineering-raise.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { EngineeringQnByUwComponent } from './engineering-qn-by-uw/engineering-qn-by-uw.component';
import { EngineeringQnSelectionSpComponent } from './engineering-qn-selection-sp/engineering-qn-selection-sp.component';
import { EngineeringPaymentLinkUwComponent } from './engineering-payment-link-uw/engineering-payment-link-uw.component';
import { EngineeringPaymentProofSpComponent } from './engineering-payment-proof-sp/engineering-payment-proof-sp.component';
import { EngineeringProposalSubmissionUwComponent } from './engineering-proposal-submission-uw/engineering-proposal-submission-uw.component';
import { EngineeringPolicyIssueUwComponent } from './engineering-policy-issue-uw/engineering-policy-issue-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: EngineeringRfqListComponent,
    data: { title: "Policy Register - Engineering", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: EngineeringRaiseComponent,
    data: { title: "RFQ (Requisition for Quotation) - Engineering", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: EngineeringRaiseComponent,
    data: { title: "RFQ (Request For Quotation) - Engineering", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: EngineeringQnByUwComponent,
    data: { title: "Engineering Quotation (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: EngineeringQnSelectionSpComponent,
    data: { title: "Engineering Quotation Selection (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: EngineeringPaymentLinkUwComponent,
    data: { title: "Engineering Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    pathMatch: "full",
    component: EngineeringPaymentProofSpComponent,
    data: { title: "Engineering Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: EngineeringProposalSubmissionUwComponent,
    data: { title: "Engineering Proposal Submission (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    pathMatch: "full",
    component: EngineeringPolicyIssueUwComponent,
    data: { title: "Engineering Policy Issue (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: EngineeringPolicyIssueUwComponent,
    data: { title: "View Engineering Policy Issue (UW)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: EngineeringRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: EngineeringRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Engineering", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqEngineeringRoutingModule { }
