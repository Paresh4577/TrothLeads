import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupHeadRoutingModule } from './group-head-routing.module';
import { GroupHeadListComponent } from './group-head-list/group-head-list.component';
import { GroupHeadComponent } from './group-head/group-head.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';


@NgModule({
  declarations: [
    GroupHeadListComponent,
    GroupHeadComponent
  ],
  imports: [
    CommonModule,
    GroupHeadRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    DatemaskModule,
    OnlynumberModule,
    SharedPipesModule
  ],
  exports: [GroupHeadComponent]
})
export class GroupHeadModule { }
