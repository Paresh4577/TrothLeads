import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BranchRoutingModule } from './branch-routing.module';
import { BranchComponent } from './branch/branch.component';
import { BranchListComponent } from './branch-list/branch-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';

@NgModule({
  declarations: [
    BranchComponent,
    BranchListComponent
  ],
  imports: [
    CommonModule,
    BranchRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    MatIconModule,
    AlphabetOnlyModule
  ]
})
export class BranchModule { }
