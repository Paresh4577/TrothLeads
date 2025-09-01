import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphabetNumberOnlyDirective } from './alphabet-number-only.directive';



@NgModule({
  declarations: [
    AlphabetNumberOnlyDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[
    AlphabetNumberOnlyDirective
  ]
})
export class AlphabetNumberOnlyModule { }
