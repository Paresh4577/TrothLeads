import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BajajComponent } from './bajaj/bajaj.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: BajajComponent,
      },
      // {
      //   path: "kyc",
      //   component: KycComponent,
      // }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BajajRoutingModule { }