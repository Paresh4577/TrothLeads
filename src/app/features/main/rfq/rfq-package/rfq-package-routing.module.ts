import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { PackageRfqListComponent } from './package-rfq-list/package-rfq-list.component';
import { PackageRaiseComponent } from './package-raise/package-raise.component';
import { PackageQnByUwComponent } from './package-qn-by-uw/package-qn-by-uw.component';
import { PackageQnSelectionSpComponent } from './package-qn-selection-sp/package-qn-selection-sp.component';
import { PackagePaymentLinkUwComponent } from './package-payment-link-uw/package-payment-link-uw.component';
import { PackagePaymentProofSpComponent } from './package-payment-proof-sp/package-payment-proof-sp.component';
import { PackageProposalSubmissionUwComponent } from './package-proposal-submission-uw/package-proposal-submission-uw.component';
import { PackagePolicyIssueUwComponent } from './package-policy-issue-uw/package-policy-issue-uw.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: 'list',
    component: PackageRfqListComponent,
    data: { title: "Policy Register - Package", authKey: "RFQ-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise',
    component: PackageRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Package", mode: 'create', authKey: "RFQ-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'raise/:Id',
    component: PackageRaiseComponent,
    data: { title: "RFQ (Requition for Quotation)-Package", mode: 'edit', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QN/:Id',
    component: PackageQnByUwComponent,
    data: { title: "QN By UW - Package", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'QNselection/:Id',
    component: PackageQnSelectionSpComponent,
    data: { title: "Quotation Selection by Sales Person - Package", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentLink/:Id',
    component: PackagePaymentLinkUwComponent,
    data: { title: "Payment Link by UW - Package", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PaymentProof/:Id',
    component: PackagePaymentProofSpComponent,
    data: { title: "Payment Proof by Sales Person - Package", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'ProposalSubmission/:Id',
    component: PackageProposalSubmissionUwComponent,
    data: { title: "Proposal Submission by UW-Package", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/:Id',
    component: PackagePolicyIssueUwComponent,
    data: { title: "Policy Issue by UW - Package", apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'PolicyIssue/View/:Id',
    component: PackagePolicyIssueUwComponent,
    data: { title: "View Policy Issue by UW - Package", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base, authKey: "RFQ-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

  // for view mode in RFQ 
  {
    path: 'raise/View/:Id',
    pathMatch: "full",
    component: PackageRaiseComponent,
    data: { title: "View RFQ (Request For Quotation)", mode: 'view', apiEndPoint: API_ENDPOINTS.RFQ.base },
    resolve: { data: ResolverService },
  },

  // for renewal transaction 
  {
    path: 'raise/RenewalRFQ/:Id',
    component: PackageRaiseComponent,
    data: { title: "Renewal - RFQ (Request For Quotation) - Package", mode: 'RenewalRFQ', apiEndPoint: API_ENDPOINTS.RFQ.ConvertTransaction, authKey: "RFQ-create" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqPackageRoutingModule { }
