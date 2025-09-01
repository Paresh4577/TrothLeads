import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecimalDirective } from './decimal.directive';



@NgModule({
  declarations: [
    DecimalDirective
  ],
  imports: [
    CommonModule
  ],
  exports : [
    DecimalDirective
  ]
})
export class DecimalModule { }
