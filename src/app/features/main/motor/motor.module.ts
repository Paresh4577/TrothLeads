import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MotorRoutingModule } from './motor-routing.module';
import { MotorPolicyComponent } from './motor-policy/motor-policy.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { OptionComponent } from './option/option.component';


@NgModule({
  declarations: [
    MotorPolicyComponent,
    OptionComponent
  ],
  imports: [
    CommonModule,
    MotorRoutingModule,
    TableListModule,
    SharedMaterialModule
  ]
})
export class MotorModule { }
