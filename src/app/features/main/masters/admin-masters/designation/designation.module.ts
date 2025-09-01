import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignationRoutingModule } from './designation-routing.module';
import { DesignationListComponent } from './designation-list/designation-list.component';
import { DesignationComponent } from './designation/designation.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    DesignationListComponent,
    DesignationComponent
  ],
  imports: [
    CommonModule,
    DesignationRoutingModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    AlphabetOnlyModule
  ]
})
export class DesignationModule { }
