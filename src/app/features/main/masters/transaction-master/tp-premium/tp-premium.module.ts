import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TpPremiumRoutingModule } from './tp-premium-routing.module';
import { TpPremiumListComponent } from './tp-premium-list/tp-premium-list.component';
import { TpPremiumComponent } from './tp-premium/tp-premium.component';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';


@NgModule({
  declarations: [
    TpPremiumListComponent,
    TpPremiumComponent
  ],
  imports: [
    CommonModule,
    TpPremiumRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    OnlynumberModule
  ]
})
export class TpPremiumModule { }
