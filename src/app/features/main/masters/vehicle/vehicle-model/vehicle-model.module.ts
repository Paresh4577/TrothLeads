import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleModelRoutingModule } from './vehicle-model-routing.module';
import { VehicleModelComponent } from './vehicle-model/vehicle-model.component';
import { VehicleModelListComponent } from './vehicle-model-list/vehicle-model-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    VehicleModelComponent,
    VehicleModelListComponent
  ],
  imports: [
    CommonModule,
    VehicleModelRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    MatAutocompleteModule
  ]
})
export class VehicleModelModule { }
