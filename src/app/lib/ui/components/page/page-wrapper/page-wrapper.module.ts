import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageWrapperComponent } from './page-wrapper.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    PageWrapperComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule
  ], 
  exports: [
    PageWrapperComponent
  ]
})
export class PageWrapperModule { }
