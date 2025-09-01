import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoDigitRoutingModule } from './go-digit-routing.module';
import { GoDigitComponent } from './go-digit/go-digit.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    GoDigitComponent
  ],
  imports: [
    CommonModule,
    GoDigitRoutingModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    ReactiveFormsModule,
  ]
})
export class GoDigitModule { }
