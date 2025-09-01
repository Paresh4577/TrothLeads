import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingHomeComponent } from "./landing-home/landing-home.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: LandingHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
