import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HdfcErgoComponent } from './hdfc-ergo/hdfc-ergo.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: HdfcErgoComponent,
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
export class HdfcErgoRoutingModule { }
