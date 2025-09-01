import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRoutingModule } from './role-routing.module';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleComponent } from './role/role.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { PageHeaderModule } from '@lib/ui/components/page-header/page-header.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    RoleListComponent,
    RoleComponent,
    RolePermissionComponent
  ],
  imports: [
    CommonModule,
    RoleRoutingModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    SharedMaterialModule,
    PageHeaderModule,
    FlexLayoutModule,
    SharedPipesModule,
    AlphabetOnlyModule
    
  ]
})
export class RoleModule { }
