import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerComponent } from './customer/customer.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: CustomerListComponent,
    data: { title: "Customers", authKey: "Customer-list" },
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: CustomerComponent,
    data: { title: "Add Customer", mode: "Create", authKey: "Customer-create" }
  },
  {
    path: 'view/:Id',
    component: CustomerComponent,
    data: { title: "View Customer", apiEndPoint: API_ENDPOINTS.Customer.Base, mode: "View", authKey: "Customer-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: CustomerComponent,
    data: { title: "Edit Customer", apiEndPoint: API_ENDPOINTS.Customer.Base, mode: "Edit", authKey: "Customer-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
