import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentRoutingModule } from './agent-routing.module';
import { AgentComponent } from './agent/agent.component';
import { AgentListComponent } from './agent-list/agent-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { MatIconModule } from '@angular/material/icon';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';

@NgModule({
  declarations: [
    AgentComponent,
    AgentListComponent
  ],
  imports: [
    CommonModule,
    AgentRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    DatemaskModule,
    SharedMaterialModule,
    MatIconModule,
    OnlynumberModule,
    AlphabetOnlyModule,
    DecimalModule,
    SharedPipesModule
  ]
})
export class AgentModule { }
