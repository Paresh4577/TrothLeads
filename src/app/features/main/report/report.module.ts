import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { ReportRoutingModule } from './report-routing.module';
import { ReportDetailComponent } from './report-detail/report-detail.component';
import { MisReportComponent } from './mis-report/mis-report.component';
import { AccordionModule } from '@lib/ui/components/accordion/accordion.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PolicyRegisterReportComponent } from './policy-register-report/policy-register-report.component';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { PospPolicyRegisterReportComponent } from './posp-policy-register-report/posp-policy-register-report.component';
import { RfqReportComponent } from './rfq-report/rfq-report.component';
import { FyGrowthReportComponent } from './fy-growth-report/fy-growth-report.component';
import { ComparativeGrowthReportComponent } from './comparative-growth-report/comparative-growth-report.component';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { MatButtonModule } from '@angular/material/button';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { SharedPipesModule } from 'src/app/shared/pipes/shared-pipes.module';

@NgModule({
  declarations: [
    ReportDetailComponent,
    MisReportComponent,
    PolicyRegisterReportComponent,
    PospPolicyRegisterReportComponent,
    RfqReportComponent,
    FyGrowthReportComponent,
    ComparativeGrowthReportComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    TableListModule,
    SharedMaterialModule,
    AccordionModule,
    ReactiveFormsModule,
    DecimalModule,
    DatemaskModule,
    MatButtonModule,
    SharedPipesModule,
    OnlynumberModule,
    DecimalModule,
  ]
})
export class ReportModule { }
