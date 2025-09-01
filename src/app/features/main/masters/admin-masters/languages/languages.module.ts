import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LanguagesRoutingModule } from './languages-routing.module';
import { LanguagesComponent } from './languages/languages.component';
import { LanguagesListComponent } from './languages-list/languages-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    LanguagesComponent,
    LanguagesListComponent
  ],
  imports: [
    CommonModule,
    LanguagesRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    AlphabetOnlyModule
  ]
})
export class LanguagesModule { }
