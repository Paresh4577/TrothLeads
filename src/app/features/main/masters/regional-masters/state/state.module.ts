import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateRoutingModule } from './state-routing.module';
import { StateListComponent } from './state-list/state-list.component';
import { StateComponent } from './state/state.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    StateListComponent,
    StateComponent
  ],
  imports: [
    CommonModule,
    StateRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    MatAutocompleteModule,
    AlphabetOnlyModule
  ]
})
export class StateModule { }
