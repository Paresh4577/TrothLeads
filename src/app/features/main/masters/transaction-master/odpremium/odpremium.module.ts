import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ODPremiumRoutingModule } from './odpremium-routing.module';
import { ODPremiumListComponent } from './odpremium-list/odpremium-list.component';
import { ODPremiumComponent } from './odpremium/odpremium.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';


@NgModule({
  declarations: [
    ODPremiumListComponent,
    ODPremiumComponent
  ],
  imports: [
    CommonModule,
    ODPremiumRoutingModule,
    TableListModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    OnlynumberModule
  ]
})
export class ODPremiumModule { }
