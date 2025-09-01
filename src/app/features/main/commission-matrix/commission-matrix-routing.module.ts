import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatrixManagementComponent } from './matrix-management/matrix-management.component';

const routes: Routes = [
  {
    path: "",
    component: MatrixManagementComponent
  },
  {
    path: 'commissionCalculationMatrix',
    loadChildren: () => import('./commission-calculation-matrix/commission-calculation-matrix.module').then(m => m.CommissionCalculationMatrixModule)
  },
  {
    path: 'slabCommissionCalculationMatrix',
    loadChildren: () => import('./slab-commission-calculation-matrix/slab-commission-calculation-matrix.module').then(m => m.SlabCommissionCalculationMatrixModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommissionMatrixRoutingModule { }
