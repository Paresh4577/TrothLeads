import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubCategoryRoutingModule } from './sub-category-routing.module';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { SubCategoryListComponent } from './sub-category-list/sub-category-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    SubCategoryComponent,
    SubCategoryListComponent
  ],
  imports: [
    CommonModule,
    SubCategoryRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    MatAutocompleteModule,
    AlphabetOnlyModule
  ]
})
export class SubCategoryModule { }
