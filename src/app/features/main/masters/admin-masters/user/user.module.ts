import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserComponent } from './user/user.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { UploadFilesModule } from '@lib/ui/components/upload-files/upload-files.module';
import { AccordionModule } from '@lib/ui/components/accordion/accordion.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import {MatTableModule} from '@angular/material/table';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';

@NgModule({
  declarations: [
    UserListComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    TableListModule,
    OnlynumberModule,
    UploadFilesModule,
    AccordionModule,
    SharedMaterialModule,
    MatTableModule,
    DatemaskModule,
    AlphabetOnlyModule
  ]
})
export class UserModule { }
