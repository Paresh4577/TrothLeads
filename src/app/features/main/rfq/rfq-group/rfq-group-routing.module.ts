import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupRfqListComponent } from './group-rfq-list/group-rfq-list.component';
import { GroupRaiseComponent } from './group-raise/group-raise.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { GroupQnByUwComponent } from './group-qn-by-uw/group-qn-by-uw.component';
import { GroupQnSelectionSpComponent } from './group-qn-selection-sp/group-qn-selection-sp.component';
import { GroupPaymentLinkUwComponent } from './group-payment-link-uw/group-payment-link-uw.component';
import { GroupPaymentProofSpComponent } from './group-payment-proof-sp/group-payment-proof-sp.component';
import { GroupProposalSubmissionUwComponent } from './group-proposal-submission-uw/group-proposal-submission-uw.component';
import { GroupPolicyIssueUwComponent } from './group-policy-issue-uw/group-policy-issue-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: GroupRfqListComponent,
    data: { title: "Policy Register - Group", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: GroupRaiseComponent,
    data: { title: "RFQ (Requisition for Quotation) - Group", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: GroupRaiseComponent,
    data: { title: "RFQ (Request For Quotation) - Group", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: GroupQnByUwComponent,
    data: { title: "Group Quotation (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: GroupQnSelectionSpComponent,
    data: { title: "Group Quotation Selection (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    pathMatch: "full",
    component: GroupPaymentLinkUwComponent,
    data: { title: "Group Payment Link (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    pathMatch: "full",
    component: GroupPaymentProofSpComponent,
    data: { title: "Group Payment Proof (SP)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    pathMatch: "full",
    component: GroupProposalSubmissionUwComponent,
    data: { title: "Group Proposal Submission (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    pathMatch: "full",
    component: GroupPolicyIssueUwComponent,
    data: { title: "Group Policy Issue (UW)", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: GroupPolicyIssueUwComponent,
    data: { title: "View Group Policy Issue (UW)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: GroupRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: GroupRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Group", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqGroupRoutingModule { }
