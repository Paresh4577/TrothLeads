import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NavigationService } from '@lib/services/navigation/navigation.service';
import { ScrollBarMessageComponent } from './admin-masters/scroll-bar-message/scroll-bar-message.component';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { ScrollBarMessageResolverService } from './admin-masters/scroll-bar-message/scroll-bar-message-resolver.service';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'market-type'
  },
  // {
  //   path: 'area',
  //   loadChildren: () => import("../masters/regional-masters/area/area.module").then((m) => m.AreaModule),
  // },
  // {
  //   path: 'district',
  //   loadChildren: () => import("../masters/regional-masters/district/district.module").then((m) => m.DistrictModule),
  // },
  // {
  //   path: 'city-type',
  //   loadChildren: () => import("../masters/regional-masters/city-type/city-type.module").then((m) => m.CityTypeModule),
  // },
  {
    path: 'city',
    loadChildren: () => import("../masters/regional-masters/city/city.module").then((m) => m.CityModule),
  },
  {
    path: 'state',
    loadChildren: () => import("../masters/regional-masters/state/state.module").then((m) => m.StateModule),
  },
  {
    path: 'country',
    loadChildren: () => import("../masters/regional-masters/country/country.module").then((m) => m.CountryModule),
  },
  {
    path: 'user',
    loadChildren: () => import("../masters/admin-masters/user/user.module").then((m) => m.UserModule),
  },
  {
    path: 'role',
    loadChildren: () => import("../masters/admin-masters/role/role.module").then((m) => m.RoleModule),
  },
  {
    path: 'designation',
    loadChildren: () => import("../masters/admin-masters/designation/designation.module").then((m) => m.DesignationModule),
  },
  {
    path: "branch", loadChildren: () => import('./regional-masters/branch/branch.module').then(b => b.BranchModule)
  },
  {
    path: "agent", loadChildren: () => import('./admin-masters/agent/agent.module').then(m => m.AgentModule)
  },
  {
    path: "category", loadChildren: () => import('./admin-masters/category/category.module').then(m => m.CategoryModule)
  },
  {
    path: "subCategory", loadChildren: () => import('./admin-masters/sub-category/sub-category.module').then(m => m.SubCategoryModule)
  },
  {
    path: "source", loadChildren: () => import('./admin-masters/source/source.module').then(m => m.SourceModule)
  },
  {
    path: "subSource", loadChildren: () => import('./admin-masters/sub-source/sub-source.module').then(m => m.SubSourceModule)
  },
  {
    path: "bank", loadChildren: () => import('./admin-masters/bank/bank.module').then(m => m.BankModule)
  },
  {
    path: "Languages", loadChildren: () => import('./admin-masters/languages/languages.module').then(m => m.LanguagesModule)
  },
  {
    path: "InsuranceCompany", loadChildren: () => import('./admin-masters/insurance-company/insurance-company.module').then(m => m.InsuranceCompanyModule)
  },
  {
    path: "RTO", loadChildren: () => import('./vehicle/rto/rto.module').then(m => m.RTOModule)
  },
  {
    path: "vehicleBrand", loadChildren: () => import('./vehicle/vehicle-brand/vehicle-brand.module').then(m => m.VehicleBrandModule)
  },
  {
    path: "vehicleModel", loadChildren: () => import('./vehicle/vehicle-model/vehicle-model.module').then(m => m.VehicleModelModule)
  },
  {
    path: "vehicleSubModel", loadChildren: () => import('./vehicle/vehicle-sub-model/vehicle-sub-model.module').then(m => m.VehicleSubModelModule)
  },
  {
    path: "transactionMaster", loadChildren: () => import('./transaction-master/transaction-master.module').then(m => m.TransactionMasterModule)
  },
  {
    path: 'scrollBarMessage',
    component: ScrollBarMessageComponent,
    data: { title: "Scroll Bar Message", apiEndPoint: API_ENDPOINTS.ScrollBarMessage.Base, mode: "Edit", authKey: "Events-create" }, resolve: { data: ScrollBarMessageResolverService },
    canActivate: [RoleGuard]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ],
  providers: [
    NavigationService
  ]
})
export class MastersRoutingModule { }
