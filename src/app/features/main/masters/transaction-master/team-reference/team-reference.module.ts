import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamReferenceRoutingModule } from './team-reference-routing.module';
import { TeamReferenceComponent } from './team-reference/team-reference.component';
import { TeamReferenceListComponent } from './team-reference-list/team-reference-list.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';


@NgModule({
  declarations: [
    TeamReferenceComponent,
    TeamReferenceListComponent
  ],
  imports: [
    CommonModule,
    TeamReferenceRoutingModule,
    TableListModule,
    SharedMaterialModule,
    ReactiveFormsModule,
    OnlynumberModule,
    DatemaskModule,
    SharedPipesModule
  ]
})
export class TeamReferenceModule { }
