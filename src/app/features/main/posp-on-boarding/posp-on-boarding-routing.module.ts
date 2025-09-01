import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PospOnBoardingListComponent } from './posp-on-boarding-list/posp-on-boarding-list.component';
import { PospOnBoardingComponent } from './posp-on-boarding/posp-on-boarding.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: "list",
    component: PospOnBoardingListComponent,
    data: { title: "POSP OnBoarding", authKey: "AgentOnBoard-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'becomeAPoSP',
    component: PospOnBoardingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PospOnBoardingRoutingModule { }
