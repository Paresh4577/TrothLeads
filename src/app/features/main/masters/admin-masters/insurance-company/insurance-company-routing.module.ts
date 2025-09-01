import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResolverService } from '@lib/services/http/resolver.service';
import { InsuranceCompanyListComponent } from './insurance-company-list/insurance-company-list.component';
import { InsuranceCompanyComponent } from './insurance-company/insurance-company.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: InsuranceCompanyListComponent,
    data: { title: "Insurance Company" , authKey: "InsuranceCompany-list" }
  },
  {
    path: 'create',
    component: InsuranceCompanyComponent,
    data: { title: "Add Insurance Company", mode: "Create" , authKey: ""}
  },
  {
    path: 'view/:Id',
    component: InsuranceCompanyComponent,
    data: { title: "View Insurance Company", apiEndPoint: API_ENDPOINTS.InsuranceCompany.get, mode: "View" , authKey: "InsuranceCompany-get" },
    resolve: { data: ResolverService }
  },
  {
    path: 'edit/:Id',
    component: InsuranceCompanyComponent,
    data: { title: "Edit Insurance Company", apiEndPoint: API_ENDPOINTS.InsuranceCompany.get, mode: "Edit" , authKey: "InsuranceCompany-update" },
    resolve: { data: ResolverService }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsuranceCompanyRoutingModule { }
