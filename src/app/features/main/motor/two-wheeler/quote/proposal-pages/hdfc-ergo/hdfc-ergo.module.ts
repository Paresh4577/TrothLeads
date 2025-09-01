import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HdfcErgoRoutingModule } from './hdfc-ergo-routing.module';
import { HdfcErgoComponent } from './hdfc-ergo/hdfc-ergo.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';


@NgModule({
  declarations: [
    HdfcErgoComponent
  ],
  imports: [
    CommonModule,
    HdfcErgoRoutingModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    ReactiveFormsModule,
    DatemaskModule,
  ]
})
export class HdfcErgoModule { }
