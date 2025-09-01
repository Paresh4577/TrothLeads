import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsContainerComponent } from './alerts-container.component';
import { GnxAlertModule } from "../alert/alert.module";



@NgModule({
  declarations: [
    AlertsContainerComponent
  ],
  imports: [
    CommonModule,
    GnxAlertModule
  ],
  exports: [
    AlertsContainerComponent
  ]
})
export class GnxAlertsContainerModule { }
