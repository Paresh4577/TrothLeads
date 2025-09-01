import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  // {
  //   path: 'car',
  //   loadChildren: () => import('./car/car.module').then((m) => m.CarModule)
  // },
  // {
  //   path: 'twoWheeler',
  //   loadChildren: () => import('./two-wheeler/two-wheeler.module').then((m) => m.TwoWheelerModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalAccidentRoutingModule { }
