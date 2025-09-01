import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { EndorsementTransactionListComponent } from './endorsement-transaction-list/endorsement-transaction-list.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "transaction-list",
    pathMatch: "full"
  },
  {
    path: 'transaction-list',
    component: EndorsementTransactionListComponent,
    data: { title: "Transaction Entries", authKey: "OfflineTransaction-list" },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EndorsementRoutingModule { }
