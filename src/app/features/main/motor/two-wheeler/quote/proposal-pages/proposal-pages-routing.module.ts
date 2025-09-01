import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "godigit",
    loadChildren: () => import('./go-digit/go-digit.module').then(m => m.GoDigitModule)
  },
  {
    path: 'hdfcergo',
    loadChildren: () => import('./hdfc-ergo/hdfc-ergo.module').then(m => m.HdfcErgoModule)
  },
  {
    path: 'bajajallianz',
    loadChildren: () => import('./bajaj/bajaj.module').then(m => m.BajajModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalPagesRoutingModule { }
