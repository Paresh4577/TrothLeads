import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlphabetOnlyDirective } from './alphabet-only.directive';



@NgModule({
  declarations: [
    AlphabetOnlyDirective
  ],
  imports: [
    CommonModule
  ],
  exports:[
    AlphabetOnlyDirective
  ]
})
export class AlphabetOnlyModule { }
