import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RtoListComponent } from './rto-list/rto-list.component';
import { RtoComponent } from './rto/rto.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component:RtoListComponent,
    data: { title: "RTO" }
  },
  {
    path: 'create',
    component: RtoComponent,
    data: { title: "Add RTO", mode: "Create" }
  },
  {
    path: 'view/:Id',
    component: RtoComponent,
    data: { title: "View RTO", apiEndPoint: API_ENDPOINTS.RTO.Base, mode: "View" },
    resolve: { data: ResolverService }
  },
  {
    path: 'edit/:Id',
    component: RtoComponent,
    data: { title: "Edit RTO", apiEndPoint: API_ENDPOINTS.RTO.Base, mode: "Edit" },
    resolve: { data: ResolverService }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RTORoutingModule { }
