import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TataAiaComponent } from './tata-aia/tata-aia.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: TataAiaComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TataAiaRoutingModule { }
