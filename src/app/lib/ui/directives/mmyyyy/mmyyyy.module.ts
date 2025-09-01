import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { mmyyyyDirective } from './mmyyyy.directive';



@NgModule({
  declarations: [
    mmyyyyDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    mmyyyyDirective
  ]
})
export class mmyyyyModule { }
