import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleTypeRoutingModule } from './vehicle-type-routing.module';
import { VehicleTypeComponent } from './vehicle-type/vehicle-type.component';
import { VehicleTypeListComponent } from './vehicle-type-list/vehicle-type-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { VehicleTypeImportComponent } from './vehicle-type-import/vehicle-type-import.component';


@NgModule({
  declarations: [
    VehicleTypeComponent,
    VehicleTypeListComponent,
    VehicleTypeImportComponent
  ],
  imports: [
    CommonModule,
    VehicleTypeRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    AlphabetOnlyModule
  ]
})
export class VehicleTypeModule { }
