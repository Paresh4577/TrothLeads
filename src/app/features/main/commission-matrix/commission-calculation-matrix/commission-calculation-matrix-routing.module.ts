import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { CommissionCalculationMatrixListComponent } from './commission-calculation-matrix-list/commission-calculation-matrix-list.component';
import { CommissionCalculationMatrixComponent } from './commission-calculation-matrix/commission-calculation-matrix.component';
import { RecalculateCommissionComponent } from './recalculate-commission/recalculate-commission.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: "list",
        component: CommissionCalculationMatrixListComponent,
        data: { title: "Commission Calculation Matrix - (Std)", mode: "list", authKey: "CommissionCalMatrix-list" },
        canActivate: [RoleGuard],
      },
      {
        path: "upload",
        component: CommissionCalculationMatrixComponent,
        data: { title: "Upload Matrix - (Std)", mode: "add", authKey: "CommissionCalMatrix-create" },
        canActivate: [RoleGuard],
      },
      {
        path: "recalculate",
        component: RecalculateCommissionComponent,
        data: { title: "Recalculate Commission", mode: "add", authKey: "CommissionCalMatrix-list" },
        canActivate: [RoleGuard],
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommissionCalculationMatrixRoutingModule { }
