import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KycComponent } from './kyc/kyc.component';
import { ZunoComponent } from './zuno/zuno.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: ZunoComponent,
      },
      {
        path: "kyc",
        component: KycComponent,
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ZunoRoutingModule { }
