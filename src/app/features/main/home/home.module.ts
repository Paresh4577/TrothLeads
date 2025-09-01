import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { AppHomeComponent } from './app-home/app-home.component';
import { BuynowComponent } from './buynow/buynow.component';
import { ReactiveFormsModule } from '@angular/forms';
import { QuotationComponent } from './quotation/quotation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { NgChartsModule } from 'ng2-charts';
import { SalesDashboardComponent } from './sales-dashboard/sales-dashboard.component';


@NgModule({
  declarations: [
    AppHomeComponent,
    BuynowComponent,
    QuotationComponent,
    DashboardComponent,
    SalesDashboardComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ReactiveFormsModule,
    SharedMaterialModule,
    SharedPipesModule,
    NgChartsModule,
  ]
})
export class HomeModule { }
