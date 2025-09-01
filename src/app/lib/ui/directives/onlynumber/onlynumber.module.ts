import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlynumberDirective } from './onlynumber.directive';



@NgModule({
  declarations: [
    OnlynumberDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    OnlynumberDirective
  ]
})
export class OnlynumberModule { }
