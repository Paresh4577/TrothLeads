import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppHomeComponent } from "./app-home/app-home.component";
import { BuynowComponent } from './buynow/buynow.component';
import { ProfileComponent } from '../../auth/profile/profile.component';
import { ChangePasswordComponent } from '../../auth/change-password/change-password.component';
import { QuotationComponent } from './quotation/quotation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'salesdashboard',
    component: SalesDashboardComponent
  },
  {
    path: 'home',
    component: AppHomeComponent
  },
  {
    path: 'buynow',
    component: BuynowComponent
  },
  {
    path: 'quotation',
    component: QuotationComponent
  },
  {
    path: 'Profile',
    component: ProfileComponent
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
