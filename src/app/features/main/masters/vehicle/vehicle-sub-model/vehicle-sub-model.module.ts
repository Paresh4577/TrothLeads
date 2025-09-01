import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleSubModelRoutingModule } from './vehicle-sub-model-routing.module';
import { VehicleSubModelComponent } from './vehicle-sub-model/vehicle-sub-model.component';
import { VehicleSubModelListComponent } from './vehicle-sub-model-list/vehicle-sub-model-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { PercentageModule } from '@lib/ui/directives/percentage/percentage.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';

@NgModule({
  declarations: [
    VehicleSubModelComponent,
    VehicleSubModelListComponent
  ],
  imports: [
    CommonModule,
    VehicleSubModelRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    MatAutocompleteModule,
    OnlynumberModule,
    SharedMaterialModule,
    DatemaskModule,
    SharedPipesModule,
    DecimalModule,
    PercentageModule,
  ]
})
export class VehicleSubModelModule { }
