import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialYearListComponent } from './financial-year-list/financial-year-list.component';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { FinancialYearComponent } from './financial-year/financial-year.component';
import { ResolverService } from '@lib/services/http/resolver.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: FinancialYearListComponent,
    data: { title: "Financial Year", authKey: "FinancialYear-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: FinancialYearComponent,
    data: { title: "Add Financial Year", mode: "Create", authKey: "FinancialYear-create" },
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Id',
    component: FinancialYearComponent,
    data: { title: "View Financial Year", apiEndPoint: API_ENDPOINTS.FinancialYear.Base, mode: "View", authKey: "FinancialYear-get" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
  { 
    path: 'edit/:Id',
    component: FinancialYearComponent,
    data: { title: "Edit Financial Year", apiEndPoint: API_ENDPOINTS.FinancialYear.Base, mode: "Edit", authKey: "FinancialYear-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinancialYearRoutingModule { }
