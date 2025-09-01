import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './sidenav.component';
import { SidenavBasicItemComponent } from './sidenav-basic-item/sidenav-basic-item.component';
import { RouterModule } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SidenavGroupItemComponent } from './sidenav-group-item/sidenav-group-item.component';
import { SidenavCollapsibleItemComponent } from './sidenav-collapsible-item/sidenav-collapsible-item.component';



@NgModule({
  declarations: [
    SidenavComponent,
    SidenavBasicItemComponent,
    SidenavGroupItemComponent,
    SidenavCollapsibleItemComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule
  ],
  exports: [SidenavComponent]
})
export class SidenavModule { }
