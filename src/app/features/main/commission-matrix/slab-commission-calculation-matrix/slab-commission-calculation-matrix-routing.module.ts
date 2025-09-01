import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { SlabCommissionCalculationMatrixListComponent } from './slab-commission-calculation-matrix-list/slab-commission-calculation-matrix-list.component';
import { SlabCommissionCalculationMatrixComponent } from './slab-commission-calculation-matrix/slab-commission-calculation-matrix.component';

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
        component: SlabCommissionCalculationMatrixListComponent,
        data: { title: "Commission Calculation Matrix - (Slab wise)", mode: "list", authKey: "CommissionCalMatrix-list" },
        canActivate: [RoleGuard],
      },
      {
        path: "upload",
        component: SlabCommissionCalculationMatrixComponent,
        data: { title: "Upload Matrix - (Slab wise)", mode: "add", authKey: "CommissionCalMatrix-create" },
        canActivate: [RoleGuard],
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SlabCommissionCalculationMatrixRoutingModule { }
