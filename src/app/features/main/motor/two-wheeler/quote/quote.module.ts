import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuoteRoutingModule } from './quote-routing.module';
import { MotorInsurancePlanComponent } from './motor-insurance-plan/motor-insurance-plan.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { MotorPlanListComponent } from './motor-plan-list/motor-plan-list.component';
import { MotorAddOnPopUpComponent } from './motor-add-on-pop-up/motor-add-on-pop-up.component';
import { PlanCompareComponent } from './plan-compare/plan-compare.component';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';


@NgModule({
  declarations: [
    MotorInsurancePlanComponent,
    MotorPlanListComponent,
    MotorPlanListComponent,
    MotorAddOnPopUpComponent,
    PlanCompareComponent
  ],
  imports: [
    CommonModule,
    QuoteRoutingModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    SharedPipesModule,
    DatemaskModule,
    OnlynumberModule
  ]
})
export class QuoteModule { }
