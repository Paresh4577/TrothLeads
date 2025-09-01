import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

import { AlertComponent } from "./alert.component";



@NgModule({
  declarations: [
    AlertComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    AlertComponent
  ]
})
export class GnxAlertModule { }
