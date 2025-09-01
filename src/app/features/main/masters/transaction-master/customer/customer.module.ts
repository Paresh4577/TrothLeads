import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer/customer.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReactiveFormsModule } from '@angular/forms';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';


@NgModule({
  declarations: [
    CustomerComponent,
    CustomerListComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    SharedMaterialModule,
    AlphabetOnlyModule,
    DatemaskModule,
    OnlynumberModule
  ]
})
export class CustomerModule { }
