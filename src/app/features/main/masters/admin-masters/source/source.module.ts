import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SourceRoutingModule } from './source-routing.module';
import { SourceComponent } from './source/source.component';
import { SourceListComponent } from './source-list/source-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    SourceComponent,
    SourceListComponent
  ],
  imports: [
    CommonModule,
    SourceRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    AlphabetOnlyModule
  ]
})
export class SourceModule { }
