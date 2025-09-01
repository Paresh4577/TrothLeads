import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CountryRoutingModule } from './country-routing.module';
import { CountryComponent } from './country/country.component';
import { CountryListComponent } from './country-list/country-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';


@NgModule({
  declarations: [
    CountryComponent,
    CountryListComponent
  ],
  imports: [
    CommonModule,
    CountryRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    AlphabetOnlyModule
  ]
})
export class CountryModule { }
