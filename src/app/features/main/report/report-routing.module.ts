import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { MisReportComponent } from './mis-report/mis-report.component';
import { ROUTING_PATH } from '@config/routingPath.config';
import { PolicyRegisterReportComponent } from './policy-register-report/policy-register-report.component';
import { PospPolicyRegisterReportComponent } from './posp-policy-register-report/posp-policy-register-report.component';
import { UserTypeEnum } from 'src/app/shared/enums';
import { RoleGuard } from 'src/app/shared/guards/role.guard';
import { RfqReportComponent } from './rfq-report/rfq-report.component';
import { FyGrowthReportComponent } from './fy-growth-report/fy-growth-report.component';
import { ComparativeGrowthReportComponent } from './comparative-growth-report/comparative-growth-report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportDetailComponent,
    data: { title: 'Reports' },
  },
  {
    path: 'MIS',
    component: MisReportComponent,
    data: { title: 'MIS Report' },
  },
  {
    path: 'PolicyRegister',
    component: PolicyRegisterReportComponent,
    data: { title: 'Policy Register Report', authKey: "StandardUserRegisterReport-export" },
    canActivate: [RoleGuard]
  },
  {
    path: 'POSPPolicyRegister',
    component: PospPolicyRegisterReportComponent,
    data: { title: 'Policy Register Report', authKey: "AgentRegisterReport-export" },
    canActivate: [RoleGuard]
  },
  {
    path: 'rfq',
    component: RfqReportComponent,
    data: { title: 'RFQ Report', authKey: "RFQReport-export" },
    canActivate: [RoleGuard]
  },
  {
    path: 'fy-growth',
    component: FyGrowthReportComponent,
    data: { title: 'Policy Type - FY Growth Report', authKey: "FYGrowthReport-export" },
    canActivate: [RoleGuard]
  },
  {
    path: 'ComparativeGrowth',
    component: ComparativeGrowthReportComponent,
    data: { title: 'Policy Type - Comparative Growth Report', authKey: "ComparativeGrowthReport-export" },
    canActivate: [RoleGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule { }


export interface ReportType {
  title: string;
  target: string;
  items: {
    title: string;
    target: string;
    authkey: string;
  }[];
}


export let reportMenu: ReportType[] = [
  {
    title: 'Management Reports',
    target: 'management-report',
    items: [
      {
        title: 'MIS Report',
        target: ROUTING_PATH.Report.MIS,
        authkey: "MISReport-list",
      },
      {
        title: 'Policy Type - FY Growth Report',
        target: ROUTING_PATH.Report.fyGrowth,
        authkey: "FYGrowthReport-export",
      },
      {
        title: 'Policy Type - Comparative Growth Report',
        target: ROUTING_PATH.Report.comparativeGrowth,
        authkey: "ComparativeGrowthReport-export",
      }
    ],
  },
  {
    title: 'General Reports',
    target: 'general-reports',
    items: [

    ],
  },
  {
    title: 'Register Reports',
    target: 'register-report',
    items: [
      {
        title: 'Policy Register Report',
        target: ROUTING_PATH.Report.PolicyRegister,
        authkey: "StandardUserRegisterReport-export",
      },
      {
        title: 'Policy Register Report',
        target: ROUTING_PATH.Report.POSPPolicyRegister,
        authkey: "AgentRegisterReport-export",
      }
    ],
  },
  {
    title: 'RFQ Reports',
    target: 'rfq-report',
    items: [
      {
        title: 'RFQ Report',
        target: ROUTING_PATH.Report.RFQ,
        authkey: "RFQReport-export",
      }
    ],
  },
];
