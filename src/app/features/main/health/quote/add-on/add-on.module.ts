import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddOnRoutingModule } from './add-on-routing.module';
import { AddOnComponent } from './add-on/add-on.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddOnDetailsPopUpComponent } from './add-on-details-pop-up/add-on-details-pop-up.component';
import { AddOnDataForChildComponent } from './add-on-data-for-child/add-on-data-for-child.component';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { HealthModule } from '../../health.module';


@NgModule({
  declarations: [
    AddOnComponent,
    AddOnDetailsPopUpComponent,
    AddOnDataForChildComponent
  ],
  imports: [
    CommonModule,
    AddOnRoutingModule,
    SharedMaterialModule,
    SharedPipesModule,
    FormsModule,
    ReactiveFormsModule,
    DecimalModule,
    DatemaskModule,
    HealthModule
  ]
})
export class AddOnModule { }
