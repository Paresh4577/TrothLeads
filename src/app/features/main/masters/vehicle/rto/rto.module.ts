import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RTORoutingModule } from './rto-routing.module';
import { RtoComponent } from './rto/rto.component';
import { RtoListComponent } from './rto-list/rto-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    RtoComponent,
    RtoListComponent
  ],
  imports: [
    CommonModule,
    RTORoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    MatAutocompleteModule,
    AlphabetOnlyModule
  ]
})
export class RTOModule { }
