import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqPaListComponent } from './rfq-pa-list/rfq-pa-list.component';
import { PaRaiseComponent } from './pa-raise/pa-raise.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { PaPolicyIssueUwComponent } from './pa-policy-issue-uw/pa-policy-issue-uw.component';
import { PaProposalSubmissionUwComponent } from './pa-proposal-submission-uw/pa-proposal-submission-uw.component';
import { PaPaymentProofSpComponent } from './pa-payment-proof-sp/pa-payment-proof-sp.component';
import { PaPaymentLinkUwComponent } from './pa-payment-link-uw/pa-payment-link-uw.component';
import { PaQnSelectionSpComponent } from './pa-qn-selection-sp/pa-qn-selection-sp.component';
import { PaQnByUwComponent } from './pa-qn-by-uw/pa-qn-by-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: RfqPaListComponent,
    data: { title: "Policy Register - Personal Accident", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: PaRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Personal Accident", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: PaRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Personal Accident", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: PaQnByUwComponent,
    data: { title: "QN By UW - Personal Accident", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: PaQnSelectionSpComponent,
    data: { title: "Quotation Selection by Sales Person - Personal Accident", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    component: PaPaymentLinkUwComponent,
    data: { title: "Payment Link by UW - Personal Accident", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: PaPaymentProofSpComponent,
    data: { title: "Payment Proof by Sales Person - Personal Accident", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    component: PaProposalSubmissionUwComponent,
    data: { title: "Proposal Submission by UW-Personal Accident", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: PaPolicyIssueUwComponent,
    data: { title: "Policy Issue by UW - Personal Accident", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: PaPolicyIssueUwComponent,
    data: { title: "View Policy Issue by UW - Personal Accident", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: PaRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: PaRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Personal Accident", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqPaRoutingModule { }
