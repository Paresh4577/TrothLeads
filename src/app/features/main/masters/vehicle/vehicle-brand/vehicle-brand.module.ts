import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleBrandRoutingModule } from './vehicle-brand-routing.module';
import { VehicleBrandComponent } from './vehicle-brand/vehicle-brand.component';
import { VehicleBrandListComponent } from './vehicle-brand-list/vehicle-brand-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    VehicleBrandComponent,
    VehicleBrandListComponent
  ],
  imports: [
    CommonModule,
    VehicleBrandRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule
  ]
})
export class VehicleBrandModule { }
