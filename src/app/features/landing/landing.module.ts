import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingHomeComponent } from './landing-home/landing-home.component';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";


@NgModule({
  declarations: [
    LandingHomeComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    LandingHomeComponent,
    MatIconModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
