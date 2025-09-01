import { createComponent, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Feature Components
import { LandingHomeComponent } from './features/landing/landing-home/landing-home.component';
import { HospitalsComponent } from './features/main/hospitals/hospital.component';
import { GaragesComponent } from './features/main/garages/garages.component';
import { CompaniesComponent } from './features/main/companies/companies.component';
import { CityComponent } from './features/main/city/city.component';
import { StateComponent } from './features/main/state/state.component';
import { SettingsHomeComponent } from './features/main/settings/settings-home/settings-home.component';
import { BannerComponent } from './features/main/banner/banner.component';
import { ForgetPasswordComponent } from './features/auth/forget-password/forget-password.component';
import { AddHospitalComponent } from './features/main/hospitals/add-hospital/add-hospital.component';
import { AddGarageComponent } from './features/main/garages/add-garage/add-garage.component';
import { PoliciesComponent } from './features/main/policies/policies.component';
import { ClaimsComponent } from './features/main/claims/claims.component';
import { UsersComponent } from './features/main/users/users.component';
import { AddCompanyComponent } from './features/main/companies/add-company/add-company.component';
import { ViewClaimComponent } from './features/main/claims/view-claim/view-claim.component';
import { ProductsComponent } from './features/main/products/products.component';
import { VehiclesComponent } from './features/main/vehicles/vehicles.component';

// Guards
import { AuthGuard } from './features/auth/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { ReportsComponent } from './features/main/reports/reports.component';
import { AddBannerComponent } from './features/main/banner/add-banner/add-banner.component';

import { AddProductComponent } from './features/main/products/add-product/add-product.component';
import { ShowVehiclesComponent } from './features/main/vehicles/show-vehicles.component';
import { PrivacyPolicyComponent } from './features/main/privacy-policy/privacy-policy.component';
import { SMSLogsComponent } from './features/main/smslogs/smslogs.component';
import { ViewUserComponent } from './features/main/users/view-user/view-user.component';
import { AddClaimComponent } from './features/main/claims/add-claim/add-claim.component';
import { EmployeesComponent } from './features/main/employees/employees.component';
import { AddEmployeeComponent } from './features/main/employees/add-employee/add-employee.component';
import { AssignClaimComponent } from './features/main/claims/assign-claim/assign-claim.component';
import { ForwardClaimComponent } from './features/main/claims/forward-claim/forward-claim.component';
import { AddForwardClaimComponent } from './features/main/claims/forward-claim/add-forward-claim/add-forward-claim.component';
import { ViewAssignClaimComponent } from './features/main/claims/assign-claim/view-assign-claim/view-assign-claim.component';
import { ClaimDecisionComponent } from './features/main/claims/claim-decision/claim-decision.component';
import { AddClaimDecisionComponent } from './features/main/claims/claim-decision/add-claim-decision/add-claim-decision.component';
import { ViewDocumentsComponent } from './features/main/claims/view-documents/view-documents.component';
import { ProductFormsComponent } from './features/main/product-forms/product-forms.component';

import { ModifyComponent } from './features/main/modify/modify.component';
import { CreateroleComponent } from './features/main/settings/createrole/createrole.component';
import { ListadminComponent } from './features/main/settings/listadmin/listadmin.component';
import { CreateadminComponent } from './features/main/settings/createadmin/createadmin.component';

import { ClaimListComponent } from './features/main/claims/claim-list/claim-list.component';
import { AddAssignEmployeeComponent } from './features/main/claims/assign-claim/add-assign-employee/add-assign-employee.component';
import { ForwardToCompanyComponent } from './features/main/claims/forward-claim/forward-to-company/forward-to-company.component';
import { ViewPolicyComponent } from './features/main/policies/view-policy/view-policy.component';
import { RenewPolicyComponent } from './features/main/policies/renew-policy/renew-policy/renew-policy.component';
import { GrouppolicyComponent } from './features/main/grouppolicy/grouppolicy.component';
import { ViewemployeeComponent } from './features/main/grouppolicy/viewemployee/viewemployee.component';
import { AddempfamilyComponent } from './features/main/grouppolicy/addempfamily/addempfamily.component';
import { ViewfamilyComponent } from './features/main/grouppolicy/viewfamily/viewfamily.component';
import { LeadsComponent } from './features/main/leads/leads.component';
import { LeadviewComponent } from './features/main/leads/leadview/leadview.component';
import { AddleadComponent } from './features/main/leads/addlead/addlead.component';
import { DashboardComponent } from './features/main/leads/dashboard/dashboard.component';
import { SettingLeadComponent } from './features/main/leads/settinglead/settinglead.component';
import { ProductHeaderComponent } from './features/main/product-header/product-header.component';
import { GetsupportComponent } from './features/main/getsupport/getsupport.component';
import { AddProductHeaderComponent } from './features/main/product-header/add-product-header/add-product-header.component';
import { ViewcompanyemployeeComponent } from './features/main/grouppolicy/viewcompanyemployee/viewcompanyemployee.component';
import { GrouppolicydashboardComponent } from './features/main/grouppolicy/grouppolicydashboard/grouppolicydashboard.component';
import { AddcompanyComponent } from './features/main/grouppolicy/addcompany/addcompany.component';
import { AddempComponent } from './features/main/grouppolicy/addemp/addemp.component';
import { AddHrComponent } from './features/main/grouppolicy/add-hr/add-hr.component';
import { AssignGroupPolicyComponent } from './features/main/grouppolicy/assign-group-policy/assign-group-policy.component';
import { EmployeeManageComponent } from './features/main/grouppolicy/employee-manage/employee-manage.component';
import { EnrollementComponent } from './features/main/grouppolicy/enrollement/enrollement.component';
import { CompanydetaiComponent } from './features/main/grouppolicy/companydetai/companydetai.component';
import { PolicydetailComponent } from './features/main/grouppolicy/policydetail/policydetail.component';
import { HradminportalComponent } from './features/main/grouppolicy/hradminportal/hradminportal.component';
import { Router } from '@angular/router';

/**
 * Main application routes configuration
 * Routes are grouped under 'app' for authenticated users.
 */

/**
 * Main application routes configuration
 * Routes are organized by feature and access level
 */
const routes: Routes = [
  // Auth Module Routes (Lazy Loaded)

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.authModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.authModule),
  },

  // Public Routes
  {
    path: 'forgotpassword',
    component: ForgetPasswordComponent,
  },

  // Protected Routes (Grouped under '/app')
  {
    path: '',
    canActivate: [AuthGuard], // Enforce authentication for all child routes
    children: [
      { path: 'landing-home', component: LandingHomeComponent },
      { path: 'hospitals', component: HospitalsComponent },
      { path: 'addHospital', component: AddHospitalComponent },
      { path: 'addHospital/:hospitalId', component: AddHospitalComponent },
      { path: 'garages', component: GaragesComponent },
      { path: 'addGarage', component: AddGarageComponent },
      { path: 'addGarage/:garageId', component: AddGarageComponent },
      { path: 'companies', component: CompaniesComponent },
      { path: 'addCompany', component: AddCompanyComponent },
      { path: 'addCompany/:companyId', component: AddCompanyComponent },
      { path: 'city', component: CityComponent },
      { path: 'state', component: StateComponent },
      { path: 'Policies', component: PoliciesComponent },
      { path: 'RenewPolicy', component: RenewPolicyComponent },
      { path: 'GroupPolicy', component: GrouppolicyComponent },
      { path: 'Claims', component: ClaimsComponent },
      { path: 'viewClaim/:claimId', component: ViewClaimComponent },
      { path: 'viewEmployee/:employeeId', component: ViewemployeeComponent },
      { path: 'addHr', component: AddHrComponent },
      { path: 'addcompany', component: AddcompanyComponent },
      { path: 'addemp/:CompanyId', component: AddempComponent },
        { path: 'AssignGroupPolicy', component: AssignGroupPolicyComponent },
      {
        path: 'grouppolicydashboard',
        component: GrouppolicydashboardComponent,
      },
      {path:'enrollment',component:EnrollementComponent},

      { path: 'viewClaim', component: ViewClaimComponent },
      { path: 'settings', component: SettingsHomeComponent },
      { path: 'adminlist', component: ListadminComponent },
      { path: 'createadmin', component: CreateadminComponent },
      { path: 'createadmin/:id', component: CreateadminComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'addProduct', component: AddProductComponent },
      { path: 'addProduct/:productId', component: AddProductComponent },
      { path: 'banner', component: BannerComponent },
      { path: 'addBanner', component: AddBannerComponent },
      { path: 'addBanner/:bannerId', component: AddBannerComponent },
      { path: 'users', component: UsersComponent },
      { path: 'viewUser/:userId', component: ViewUserComponent },
      { path: 'addfamily', component: AddempfamilyComponent },
      { path: 'addfamily/:EmpId', component: AddempfamilyComponent },
      { path: 'companydetails/:companyId', component: CompanydetaiComponent },
      { path: 'policydetails/:policyId', component: PolicydetailComponent },
      {path:'hrportal',component:HradminportalComponent},
      {path:'addemp/:EmpId',component:AddempComponent},
      {path:'addemp',component:AddempComponent}, 
      {path:'manageemployee',component:EmployeeManageComponent},
      { path: 'viewempfamily/:EmpId', component: ViewfamilyComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'vehicles', component: VehiclesComponent },
      { path: 'show-vehicles/:vehicleNo', component: ShowVehiclesComponent },
      { path: 'privacyPolicy', component: PrivacyPolicyComponent },
      { path: 'SMSLogs', component: SMSLogsComponent },
      { path: 'addClaim', component: AddClaimComponent },
      { path: 'addClaim/:claimId', component: AddClaimComponent },
      { path: 'leadlist', component: LeadsComponent },
      { path: 'leadview/:id', component: LeadviewComponent },
      { path: 'addview', component: AddleadComponent },
      {
        path: 'viewcompanyemployee/:CompanyId',
        component: ViewcompanyemployeeComponent,
      },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'setting', component: SettingLeadComponent },
      { path: 'getEmployees', component: EmployeesComponent },
    
      { path: 'getClaimAssignment', component: ViewAssignClaimComponent },
      { path: 'addClaimAssignment', component: AssignClaimComponent },
      { path: 'procut-header', component: ProductHeaderComponent },
      { path: 'getSupport', component: GetsupportComponent },
      { path: 'addProductHeader', component: AddProductHeaderComponent },
      {
        path: 'addClaimAssignment/:assignmentId',
        component: AssignClaimComponent,
      },
      { path: 'ClaimForward', component: ForwardClaimComponent },
      { path: 'addClaimForward', component: AddForwardClaimComponent },
      {
        path: 'addClaimForward/:reviewId',
        component: AddForwardClaimComponent,
      },
      { path: 'addForward/:ClaimId', component: ForwardToCompanyComponent },
      { path: 'ClaimDecision', component: ClaimDecisionComponent },
      { path: 'addClaimDecision', component: AddClaimDecisionComponent },
      {
        path: 'addClaimDecision/:decisionId',
        component: AddClaimDecisionComponent,
      },
      { path: 'ClaimList', component: ClaimListComponent },
      { path: 'ProductCards', component: ProductFormsComponent },
      { path: 'ViewDocument/:claimId', component: ViewDocumentsComponent },
      { path: 'modify', component: ModifyComponent },

      { path: 'createrole', component: CreateroleComponent },
      { path: 'createrole/:id', component: CreateroleComponent },

      { path: 'assignEmp/:claimId', component: AddAssignEmployeeComponent },
      { path: 'createrole', component: CreateroleComponent },
      { path: 'viewpolicy/:policyId', component: ViewPolicyComponent },

      { path: '', redirectTo: 'app/landing-home', pathMatch: 'full' },
      { path: '**', redirectTo: 'app/landing-home' },
    ],
  },

  // Protected Routes (Require Authentication)
  // {
  //   path: 'landing-home',
  //   component: LandingHomeComponent,
  //   canActivate: [AuthGuard],
  // },

  // // Main Feature Routes
  // {
  //   path: 'hospitals',
  //   component: HospitalsComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'addHospital',
  //   component: AddHospitalComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'addHospital/:hospitalId',
  //   component: AddHospitalComponent,
  //   canActivate: [AuthGuard],
  // },

  // {
  //   path: 'garages',
  //   component: GaragesComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'addGarage',
  //   component: AddGarageComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'addGarage/:garageId',
  //   component: AddGarageComponent,
  //   canActivate: [AuthGuard],
  // },

  // {
  //   path: 'companies',
  //   component: CompaniesComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'addCompany',
  //   component: AddCompanyComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'addCompany/:companyId',
  //   component: AddCompanyComponent,
  //   canActivate: [AuthGuard],
  // },

  // // Location Management Routes
  // {
  //   path: 'city',
  //   component: CityComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'state',
  //   component: StateComponent,
  //   canActivate: [AuthGuard],
  // },

  // // Insurance Management Routes
  // {
  //   path: 'Policies',
  //   component: PoliciesComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'Claims',
  //   component: ClaimsComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'viewClaim/:claimId',
  //   component: ViewClaimComponent,
  //   canActivate: [AuthGuard],
  // },

  // // System Management Routes
  // {
  //   path: 'settings',
  //   component: SettingsHomeComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'products',
  //   component: ProductsComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'banner',
  //   component: BannerComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'Users',
  //   component: UsersComponent,
  //   canActivate: [AuthGuard],
  // },

  // // Vehicles Route
  // {
  //   path: 'vehicles',
  //   component: VehiclesComponent,
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: 'show-vehicles/:vehicleNo',
  //   component: ShowVehiclesComponent,
  //   canActivate: [AuthGuard],
  // }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
      useHash: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
