import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthRoutingModule } from './health-routing.module';
import { MyPoliciesComponent } from './my-policies/my-policies.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { OptionComponent } from './option/option.component';
import { InfoHeaderComponent } from './info-header/info-header.component';
import { SharedPipesModule } from "../../../shared/pipes/shared-pipes.module";



@NgModule({
    declarations: [
        MyPoliciesComponent,
        OptionComponent,
        InfoHeaderComponent
    ],
    exports: [
        InfoHeaderComponent
    ],
    imports: [
        CommonModule,
        HealthRoutingModule,
        SharedMaterialModule,
        TableListModule,
        SharedPipesModule
    ]
})
export class HealthModule { }