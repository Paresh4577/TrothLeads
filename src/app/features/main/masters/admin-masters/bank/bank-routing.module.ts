import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BankListComponent } from './bank-list/bank-list.component';
import { BankComponent } from './bank/bank.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: BankListComponent,
    data: { title: "Bank" , authKey: "Bank-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: BankComponent,
    data: { title: "Add Bank", mode: "Create", authKey: "Bank-create" },
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: BankComponent,
     data: { title: "View Bank", apiEndPoint: API_ENDPOINTS.Bank.Base, mode: "View",authKey: "Bank-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: BankComponent,
     data: { title: "Edit Bank", apiEndPoint: API_ENDPOINTS.Bank.Base, mode: "Edit", authKey: "Bank-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankRoutingModule { }
