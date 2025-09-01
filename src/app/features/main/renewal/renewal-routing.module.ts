import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RenewalTransactionListComponent } from './renewal-transaction-list/renewal-transaction-list.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'transaction-list',
    pathMatch: 'full'
  },
  {
    path: 'transaction-list',
    component: RenewalTransactionListComponent,
    data: { title: "Transaction Entries", authKey: "OfflineTransaction-list" },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RenewalRoutingModule { }
