import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProposalPagesRoutingModule } from './proposal-pages-routing.module';
import { GoDigitComponent } from './go-digit/go-digit.component';
import { ICICIHealthComponent } from './icicihealth/icicihealth.component';

import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from "@angular/material/datepicker";
import {MatRadioModule} from '@angular/material/radio';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { BajajComponent } from './bajaj/bajaj.component';
import { CareComponent } from './care/care.component';
import { HdfcergoComponent } from './hdfcergo/hdfcergo.component';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { AdityaBirlaHealthComponent } from './aditya-birla-health/aditya-birla-health.component';
import { TATAAIGComponent } from './tata-aig/tata-aig.component';
import { IFFCOTOKIOComponent } from './iffco-tokio/iffco-tokio.component';
import { SBIGENERALComponent } from './sbi-general/sbi-general.component';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { IffcoTokioKycPopUpComponent } from './iffco-tokio-kyc-pop-up/iffco-tokio-kyc-pop-up.component';
import { mmyyyyModule } from '@lib/ui/directives/mmyyyy/mmyyyy.module';
import { HealthModule } from '../../health.module';

@NgModule({
  declarations: [
    GoDigitComponent,
    ICICIHealthComponent,
    BajajComponent,
    CareComponent,
    HdfcergoComponent,
    AdityaBirlaHealthComponent,
    TATAAIGComponent,
    IFFCOTOKIOComponent,
    SBIGENERALComponent,
    IffcoTokioKycPopUpComponent
  ],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
  imports: [
    CommonModule,
    ProposalPagesRoutingModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSliderModule,
    MatDatepickerModule,
    MatRadioModule, MatIconModule,
    SharedPipesModule,
    SharedMaterialModule,
    DatemaskModule,
    OnlynumberModule,
    AlphabetOnlyModule,
    mmyyyyModule,
    HealthModule
  ]
})
export class ProposalPagesModule { }
