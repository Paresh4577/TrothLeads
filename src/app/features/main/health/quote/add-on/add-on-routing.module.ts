import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddOnComponent } from './add-on/add-on.component';


const routes: Routes = [
  {
    path:'',
    component:AddOnComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddOnRoutingModule { }
