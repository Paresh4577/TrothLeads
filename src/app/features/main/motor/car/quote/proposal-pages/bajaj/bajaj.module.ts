import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BajajRoutingModule } from './bajaj-routing.module';
import { BajajComponent } from './bajaj/bajaj.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BajajComponent
  ],
  imports: [
    CommonModule,
    BajajRoutingModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    ReactiveFormsModule,
  ]
})
export class BajajModule { }
