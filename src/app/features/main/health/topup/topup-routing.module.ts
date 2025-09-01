import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'quote',
    loadChildren: () => import('../quote/quote.module').then((m) => m.QuoteModule),
    data: { title: "Health Insurance Top-up" , isTopup:true }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopupRoutingModule { }
