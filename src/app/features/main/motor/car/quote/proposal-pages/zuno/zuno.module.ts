import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZunoRoutingModule } from './zuno-routing.module';
import { KycComponent } from './kyc/kyc.component';
import { ZunoComponent } from './zuno/zuno.component';
import { MatIconModule } from '@angular/material/icon';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    KycComponent,
    ZunoComponent
  ],
  imports: [
    CommonModule,
    ZunoRoutingModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    AlphabetOnlyModule
  ]
})
export class ZunoModule { }
