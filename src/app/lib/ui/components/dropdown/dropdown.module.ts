import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { TableListModule } from '../table-list/table-list.module';



@NgModule({
  declarations: [
    DropdownComponent
  ],
  imports: [
    CommonModule,
    TableListModule
  ],
  exports: [
    DropdownComponent
  ]
})
export class DropdownModule { }
