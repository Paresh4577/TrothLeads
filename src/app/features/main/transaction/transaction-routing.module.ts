import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionEntryComponent } from './transaction-entry/transaction-entry.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { RFQConvertResolverService } from '@lib/services/http/rfq-convert-resolver.service';
import { CustomResolverService } from '@lib/services/http/custom-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: TransactionListComponent,
    data: { title: "Transaction Entries", authKey: "OfflineTransaction-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'list',
    pathMatch: 'full',
    component: TransactionListComponent,
    data: { title: "Transaction Entries", authKey: "OfflineTransaction-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'add',
    component: TransactionEntryComponent,
    data: { title: "Add Transaction", mode: "Create", authKey: "OfflineTransaction-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: TransactionEntryComponent,
    data: { title: "View Transaction", apiEndPoint: API_ENDPOINTS.Transaction.Base, mode: "View", authKey: "OfflineTransaction-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: TransactionEntryComponent,
    data: { title: "Edit Transaction", apiEndPoint: API_ENDPOINTS.Transaction.Base, mode: "Edit", authKey: "OfflineTransaction-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'Convert/:Id',
    component: TransactionEntryComponent,
    data: { title: "Convert Transaction", apiEndPoint: API_ENDPOINTS.RFQ.rfqConvert, mode: "Convert", authKey: "OfflineTransaction-update" },
    resolve: { data: RFQConvertResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'RFQView/:Id',
    component: TransactionEntryComponent,
    data: { title: "Convert Transaction", apiEndPoint: API_ENDPOINTS.Transaction.Base, mode: "RFQView", authKey: "OfflineTransaction-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'Convert/:Id/:SubCategoryCode',
    component: TransactionEntryComponent,
    data: { title: "Convert Transaction", apiEndPoint: API_ENDPOINTS.RFQ.rfqTopUpConvert, mode: "Convert", authKey: "OfflineTransaction-update" },
    resolve: { data: RFQConvertResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'EndorsementTransaction/:Id',
    component: TransactionEntryComponent,
    data: { title: "Endorsement Transaction", apiEndPoint: API_ENDPOINTS.Transaction.Base, mode: "EndorsementConvert", authKey: "OfflineTransaction-create" },
    // resolve: { data: RFQConvertResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'RenewalConvert/:Id',
    component: TransactionEntryComponent,
    data: { title: "Renewal Transaction", apiEndPoint: API_ENDPOINTS.Transaction.RenewalTransaction, mode: "RenewalTransaction", authKey: "OfflineTransaction-create" },
    resolve: { data: RFQConvertResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'onlineHealthPolicy/:Id',
    component: TransactionEntryComponent,
    data: { title: "Health Policies Transaction", apiEndPoint: API_ENDPOINTS.Policy.convertTransaction, mode: "OnlineHealthPolicyConvert", authKey: "Agent-get" }, 
    resolve: { data: CustomResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'onlineMotorPolicy/:Id',
    component: TransactionEntryComponent,
    data: { title: "Motor Policies Transaction", apiEndPoint: API_ENDPOINTS.MotorList.convertTransaction, mode: "OnlineMotorPolicyConvert", authKey: "Agent-get" }, 
    resolve: { data: CustomResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRoutingModule { }
