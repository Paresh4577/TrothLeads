import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CityListComponent } from './city-list/city-list.component';
import { CityComponent } from './city/city.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: CityListComponent,
    data: { title: "City" , authKey: "City-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: CityComponent,
    data: { title: "Add City", mode: "Create" , authKey: "City-create"}
  },
  {
    path: 'view/:Id',
    component: CityComponent,
    data: { title: "View City", apiEndPoint: API_ENDPOINTS.City.Base, mode: "View" , authKey: "City-get"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: CityComponent,
    data: { title: "Edit City", apiEndPoint: API_ENDPOINTS.City.Base, mode: "Edit" , authKey: "City-update"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CityRoutingModule { }
