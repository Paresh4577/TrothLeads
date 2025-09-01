import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageUnderConstructionComponent } from './page-under-construction.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    PageUnderConstructionComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    PageUnderConstructionComponent
  ]
})
export class PageUnderConstructionModule { }
