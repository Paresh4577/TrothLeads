import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryComponent } from './category/category.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: CategoryListComponent,
    data: { title: "Category" ,authKey: "Category-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: CategoryComponent,
    data: { title: "Add Category", mode: "Create", authKey: "Category-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: CategoryComponent,
     data: { title: "View Category", apiEndPoint: API_ENDPOINTS.Category.Base, mode: "View",authKey: "Category-get"  },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: CategoryComponent,
    data: { title: "Edit Category", apiEndPoint: API_ENDPOINTS.Category.Base, mode: "Edit" , authKey: "Category-update"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule { }
