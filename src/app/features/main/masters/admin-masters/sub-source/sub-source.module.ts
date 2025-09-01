import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubSourceRoutingModule } from './sub-source-routing.module';
import { SubSourceComponent } from './sub-source/sub-source.component';
import { SubSourceListComponent } from './sub-source-list/sub-source-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    SubSourceComponent,
    SubSourceListComponent
  ],
  imports: [
    CommonModule,
    SubSourceRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    MatAutocompleteModule,
    AlphabetOnlyModule
  ]
})
export class SubSourceModule { }
