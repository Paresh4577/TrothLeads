import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from './accordion.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    AccordionComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    AccordionComponent
  ]
})
export class AccordionModule { }
