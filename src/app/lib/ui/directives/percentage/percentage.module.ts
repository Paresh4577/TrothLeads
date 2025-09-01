import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PercentageDirective } from './percentage.directive';

@NgModule({
  declarations: [PercentageDirective],
  imports: [CommonModule],
  exports: [PercentageDirective],
})
export class PercentageModule {}
