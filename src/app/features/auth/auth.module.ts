import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { authRoutingModule } from './auth-routing.module';
import { authComponent } from './auth.component';

@NgModule({
  declarations: [authComponent],
  imports: [authRoutingModule],
})
export class authModule {}
