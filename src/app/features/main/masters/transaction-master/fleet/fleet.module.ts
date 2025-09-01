import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FleetComponent } from './fleet/fleet.component';
import { FleetListComponent } from './fleet-list/fleet-list.component';
import { FleetRoutingModule } from './fleet-routing.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    FleetListComponent,
    FleetComponent
  ],
  imports: [
    CommonModule,
    FleetRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    DatemaskModule,
    OnlynumberModule,
    SharedPipesModule,
    MatDialogModule
  ],
  exports: [FleetComponent]
})
export class FleetModule { }
