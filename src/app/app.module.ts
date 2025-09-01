import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { authComponent } from './features/auth/auth.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './features/auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HospitalsComponent } from './features/main/hospitals/hospital.component';
import { GaragesComponent } from './features/main/garages/garages.component';
import { CompaniesComponent } from './features/main/companies/companies.component';
import { MainLayoutComponent } from './features/main-layout/main-layout.component';
import { CityComponent } from './features/main/city/city.component';
import { StateComponent } from './features/main/state/state.component';
import { BannerComponent } from './features/main/banner/banner.component';
import { AddHospitalComponent } from './features/main/hospitals/add-hospital/add-hospital.component';
import { AddGarageComponent } from './features/main/garages/add-garage/add-garage.component';
import { UsersComponent } from './features/main/users/users.component';
import { PoliciesComponent } from './features/main/policies/policies.component';
import { ClaimsComponent } from './features/main/claims/claims.component';
import { AddCompanyComponent } from './features/main/companies/add-company/add-company.component';
import { ViewClaimComponent } from './features/main/claims/view-claim/view-claim.component';
import { ProductsComponent } from './features/main/products/products.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { ReportsComponent } from './features/main/reports/reports.component';
import { FindPipe } from './shared/pipes/find.pipe';
import { AddBannerComponent } from './features/main/banner/add-banner/add-banner.component';
import { AuthInterceptor } from './features/auth/auth.interceptor';
import { AddProductComponent } from './features/main/products/add-product/add-product.component';
import { PrivacyPolicyComponent } from './features/main/privacy-policy/privacy-policy.component';
import { SMSLogsComponent } from './features/main/smslogs/smslogs.component';
import { ViewUserComponent } from './features/main/users/view-user/view-user.component';
import { ExtraOptions, RouterModule } from '@angular/router';
import { AddClaimComponent } from './features/main/claims/add-claim/add-claim.component';
import { EmployeesComponent } from './features/main/employees/employees.component';
import { AddEmployeeComponent } from './features/main/employees/add-employee/add-employee.component';
import { AssignClaimComponent } from './features/main/claims/assign-claim/assign-claim.component';
import { ForwardClaimComponent } from './features/main/claims/forward-claim/forward-claim.component';
import { AddForwardClaimComponent } from './features/main/claims/forward-claim/add-forward-claim/add-forward-claim.component';
import { ViewAssignClaimComponent } from './features/main/claims/assign-claim/view-assign-claim/view-assign-claim.component';
import { ClaimDecisionComponent } from './features/main/claims/claim-decision/claim-decision.component';
import { AddClaimDecisionComponent } from './features/main/claims/claim-decision/add-claim-decision/add-claim-decision.component';
import { ForgetPasswordComponent } from './features/auth/forget-password/forget-password.component';
import { ViewDocumentsComponent } from './features/main/claims/view-documents/view-documents.component';
import { ProductFormsComponent } from './features/main/product-forms/product-forms.component';

import { RolesComponent } from './features/main/useraccess/roles/roles.component';
import { MainLayoutModule } from './features/main-layout/main-layout/main-layout.module';

import { ClaimListComponent } from './features/main/claims/claim-list/claim-list.component';
import { CanWriteDirective } from './directives/can-write.directive';
import { CanReadDirective } from './directives/can-write.directive';
import { CanDeleteDirective } from './directives/can-write.directive';
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
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProductHeaderComponent } from './features/main/product-header/product-header.component';
import { GetsupportComponent } from './features/main/getsupport/getsupport.component';
import { AddProductHeaderComponent } from './features/main/product-header/add-product-header/add-product-header.component';
import { AddempComponent } from './features/main/grouppolicy/addemp/addemp.component';
import { AddcompanyComponent } from './features/main/grouppolicy/addcompany/addcompany.component';
import { ViewcompanyemployeeComponent } from './features/main/grouppolicy/viewcompanyemployee/viewcompanyemployee.component';
import { AddHrComponent } from './features/main/grouppolicy/add-hr/add-hr.component';
import { GrouppolicydashboardComponent } from './features/main/grouppolicy/grouppolicydashboard/grouppolicydashboard.component';
import { AssignGroupPolicyComponent } from './features/main/grouppolicy/assign-group-policy/assign-group-policy.component';
import { EmployeeManageComponent } from './features/main/grouppolicy/employee-manage/employee-manage.component';
import { EnrollementComponent } from './features/main/grouppolicy/enrollement/enrollement.component';
import { CompanydetaiComponent } from './features/main/grouppolicy/companydetai/companydetai.component';
import { PolicydetailComponent } from './features/main/grouppolicy/policydetail/policydetail.component';
import { HradminportalComponent } from './features/main/grouppolicy/hradminportal/hradminportal.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AddProductHeaderComponent,
    AddempComponent,
    AddcompanyComponent,
    HospitalsComponent,
    MainLayoutComponent,
    ForgetPasswordComponent,
    StateComponent,
    BannerComponent,
    AddHospitalComponent,
    AddGarageComponent,
    PoliciesComponent,
    ClaimsComponent,
    AddCompanyComponent,
    ViewClaimComponent,
    ProductsComponent,
    ReportsComponent,
    AddBannerComponent,
    AddProductComponent,
    PrivacyPolicyComponent,
    SMSLogsComponent,
    ViewUserComponent,
    AddClaimComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    AssignClaimComponent,
    ForwardClaimComponent,
    AddForwardClaimComponent,
    ViewAssignClaimComponent,
    ClaimDecisionComponent,
    AddClaimDecisionComponent,
    ViewDocumentsComponent,
    ProductFormsComponent,
    RolesComponent,
    AddAssignEmployeeComponent,
    ForwardToCompanyComponent,
    ViewPolicyComponent,
    RenewPolicyComponent,
    GrouppolicyComponent,
    GrouppolicydashboardComponent,
    ViewemployeeComponent,
    AddempfamilyComponent,
    ViewfamilyComponent,
    LeadsComponent,
    LeadviewComponent,
    AddleadComponent,
    ProductHeaderComponent,
    ViewcompanyemployeeComponent,
    GetsupportComponent,
    AddHrComponent,
    AssignGroupPolicyComponent,
    EmployeeManageComponent,
    EnrollementComponent,
    CompanydetaiComponent,
    PolicydetailComponent,
    HradminportalComponent,
  ],
  imports: [
    CommonModule,
    NgxChartsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatIconModule,
    FormsModule,
    RouterModule,
    NgSelectModule,
    PaginationComponent,
    FindPipe,
    MainLayoutModule,
    CanWriteDirective,
    CanReadDirective,
    CanDeleteDirective,
    ReactiveFormsModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
