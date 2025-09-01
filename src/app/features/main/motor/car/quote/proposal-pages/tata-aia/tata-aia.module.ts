import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TataAiaRoutingModule } from './tata-aia-routing.module';
import { TataAiaComponent } from './tata-aia/tata-aia.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { KYCPopUpComponent } from './kycpop-up/kycpop-up.component';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    TataAiaComponent,
    KYCPopUpComponent
  ],
  imports: [
    CommonModule,
    TataAiaRoutingModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    AlphabetOnlyModule
  ]
})
export class TataAiaModule { }
