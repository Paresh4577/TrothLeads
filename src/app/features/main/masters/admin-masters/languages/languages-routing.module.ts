import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LanguagesListComponent } from './languages-list/languages-list.component';
import { LanguagesComponent } from './languages/languages.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ResolverService } from '@lib/services/http/resolver.service';
import { RoleGuard } from 'src/app/shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: "full",
    component: LanguagesListComponent,
    data: { title: "Languages", authKey: "Language-list"},
    canActivate: [RoleGuard]
  },
  {
    path: 'create',
    component: LanguagesComponent,
    data: { title: "Add Language", mode: "Create", authKey: "Language-create"},
    canActivate: [RoleGuard]
  },
  {
    path: 'view/:Id',
    component: LanguagesComponent,
    data: { title: "View Language", apiEndPoint: API_ENDPOINTS.Language.Base, mode: "View",authKey: "Language-get" },
    resolve: { data: ResolverService },
    canActivate: [RoleGuard]
  },
  {
    path: 'edit/:Id',
    component: LanguagesComponent,
    data: { title: "Edit Language", apiEndPoint: API_ENDPOINTS.Language.Base, mode: "Edit", authKey: "Language-update" },
    resolve: { data: ResolverService },
    canActivate:[RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LanguagesRoutingModule { }
