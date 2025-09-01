import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubCategoryListComponent } from './sub-category-list/sub-category-list.component';
import { SubCategoryComponent } from './sub-category/sub-category.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: SubCategoryListComponent,
    data: { title: "Sub Category" , authKey: "SubCategory-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: SubCategoryComponent,
    data: { title: "Add Sub Category", mode: "Create" , authKey: "SubCategory-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: SubCategoryComponent,
    data: { title: "View Sub Category", apiEndPoint: API_ENDPOINTS.SubCategory.Base, mode: "View" , authKey: "SubCategory-get"},
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id', 
    component: SubCategoryComponent,
    data: { title: "Edit Sub Category", apiEndPoint: API_ENDPOINTS.SubCategory.Base, mode: "Edit", authKey: "SubCategory-update" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubCategoryRoutingModule { }
