import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoDigitComponent } from './go-digit/go-digit.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: GoDigitComponent,
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
export class GoDigitRoutingModule { }
