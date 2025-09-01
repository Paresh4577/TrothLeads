import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CityRoutingModule } from './city-routing.module';
import { CityComponent } from './city/city.component';
import { CityListComponent } from './city-list/city-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';


@NgModule({
  declarations: [
    CityComponent,
    CityListComponent
  ],
  imports: [
    CommonModule,
    CityRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    OnlynumberModule,
    AlphabetOnlyModule
  ]
})
export class CityModule { }
