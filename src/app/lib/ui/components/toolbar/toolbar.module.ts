import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar.component';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { UserModule } from '../user/user.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthRoutingModule } from 'src/app/features/auth/auth-routing.module';



@NgModule({
  declarations: [
    ToolbarComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    UserModule,
    MatTooltipModule,
    AuthRoutingModule
  ],
  exports: [
    ToolbarComponent
  ]
})
export class ToolbarModule { }
