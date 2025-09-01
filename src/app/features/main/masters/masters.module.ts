import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MastersRoutingModule } from './masters-routing.module';
import { ScrollBarMessageComponent } from './admin-masters/scroll-bar-message/scroll-bar-message.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
  
    ScrollBarMessageComponent
  ],
  imports: [
    CommonModule,
    MastersRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class MastersModule { }
