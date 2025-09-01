import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductPlanRoutingModule } from './product-plan-routing.module';
import { ProductPlanComponent } from './product-plan/product-plan.component';
import { ProductPlanListComponent } from './product-plan-list/product-plan-list.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProductPlanComponent,
    ProductPlanListComponent
  ],
  imports: [
    CommonModule,
    ProductPlanRoutingModule,
    TableListModule,
    SharedMaterialModule,
    ReactiveFormsModule
  ],
  exports: [ProductPlanComponent]
})
export class ProductPlanModule { }
