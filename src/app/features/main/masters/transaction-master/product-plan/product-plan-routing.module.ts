import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { ProductPlanListComponent } from './product-plan-list/product-plan-list.component';
import { ProductPlanComponent } from './product-plan/product-plan.component';
import { ProductResolverService } from '@lib/services/http/product-resolver.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: ProductPlanListComponent,
    data: { title: "Product/Plan", authKey: "Product-list" },
    canActivate:[RoleGuard]
  },
  {
    path: 'create',
    component: ProductPlanComponent,
    data: { title: "Add Product/Plan", mode: "Create", authKey: "Product-create" },
    canActivate:[RoleGuard]
  },
  {
    path: 'view/:Code/:InsurerCode',
    component: ProductPlanComponent,
    data: { title: "View Product/Plan", apiEndPoint: API_ENDPOINTS.ProductPlan.Base, mode: "View", authKey: "Product-get" },
    resolve: { data: ProductResolverService },
    canActivate:[RoleGuard]
  },
  { 
    path: 'edit/:Code/:InsurerCode',
    component: ProductPlanComponent,
    data: { title: "Edit Product/Plan", apiEndPoint: API_ENDPOINTS.ProductPlan.Base, mode: "Edit", authKey: "Product-update" },
    resolve: { data: ProductResolverService },
    canActivate:[RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductPlanRoutingModule { }
