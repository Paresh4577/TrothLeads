import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryListComponent } from './country-list/country-list.component';
import { CountryComponent } from './country/country.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: CountryListComponent,
    data: { title: "Countries", authKey: "Country-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: CountryComponent,
    data: { title: "Add Country", mode: "Create" , authKey: "Country-create"}
  },
  {
    path: 'view/:Id',
    component: CountryComponent,
       data: { title: "View Country", apiEndPoint: API_ENDPOINTS.Country.Base, mode: "View", authKey: "Country-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: CountryComponent,
       data: { title: "Edit Country", apiEndPoint: API_ENDPOINTS.Country.Base, mode: "Edit", authKey: "Country-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CountryRoutingModule { }
