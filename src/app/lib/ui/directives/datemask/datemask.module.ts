import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatemaskDirective } from './datemask.directive';



@NgModule({
  declarations: [
    DatemaskDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DatemaskDirective
  ]
})
export class DatemaskModule { }
