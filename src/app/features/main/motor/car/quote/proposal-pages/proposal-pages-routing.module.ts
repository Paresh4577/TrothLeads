import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'zuno',
    loadChildren: () => import('./zuno/zuno.module').then(m => m.ZunoModule)
  },
  {
    path: 'hdfcergo',
    loadChildren: () => import('./hdfc-ergo/hdfc-ergo.module').then(m => m.HdfcErgoModule)
  },
  {
    path: 'tataaia',
    loadChildren: () => import('./tata-aia/tata-aia.module').then(m => m.TataAiaModule)
  },
  {
    path: 'bajajallianz',
    loadChildren: () => import('./bajaj/bajaj.module').then(m => m.BajajModule)
  },
  {
    path: 'godigit',
    loadChildren: () => import('./go-digit/go-digit.module').then(m => m.GoDigitModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProposalPagesRoutingModule { }
