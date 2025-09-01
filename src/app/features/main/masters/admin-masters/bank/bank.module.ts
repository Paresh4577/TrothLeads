import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BankRoutingModule } from './bank-routing.module';
import { BankComponent } from './bank/bank.component';
import { BankListComponent } from './bank-list/bank-list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';


@NgModule({
  declarations: [
    BankComponent,
    BankListComponent
  ],
  imports: [
    CommonModule,
    BankRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    TableListModule,
    MatSlideToggleModule,
    MatIconModule,
    AlphabetOnlyModule
  ]
})
export class BankModule { }
