import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsHomeComponent } from './settings-home/settings-home.component';
import { CreateroleComponent } from './createrole/createrole.component';
import { CreateadminComponent } from './createadmin/createadmin.component';
import { ListadminComponent } from './listadmin/listadmin.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CreateadminComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    ReactiveFormsModule,
    SettingsHomeComponent,
    CreateroleComponent,
    ListadminComponent
  ]
})
export class SettingsModule { }
