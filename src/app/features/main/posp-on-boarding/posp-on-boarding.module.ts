import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PospOnBoardingRoutingModule } from './posp-on-boarding-routing.module';
import { PospOnBoardingListComponent } from './posp-on-boarding-list/posp-on-boarding-list.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { PospOnBoardingComponent } from './posp-on-boarding/posp-on-boarding.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';


@NgModule({
  declarations: [
    PospOnBoardingListComponent,
    PospOnBoardingComponent
  ],
  imports: [
    CommonModule,
    PospOnBoardingRoutingModule,
    SharedMaterialModule,
    TableListModule,
    ReactiveFormsModule,
    SharedPipesModule,
    DatemaskModule,
    OnlynumberModule
  ]
})
export class PospOnBoardingModule { }
