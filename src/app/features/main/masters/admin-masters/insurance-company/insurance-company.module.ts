import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InsuranceCompanyRoutingModule } from './insurance-company-routing.module';
import { InsuranceCompanyComponent } from './insurance-company/insurance-company.component';
import { InsuranceCompanyListComponent } from './insurance-company-list/insurance-company-list.component';
import { TableListModule } from '@lib/ui/components/table-list/table-list.module';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import { SharedMaterialModule } from 'src/app/shared/shared-material';


@NgModule({
  declarations: [
    InsuranceCompanyComponent,
    InsuranceCompanyListComponent
  ],
  imports: [
    CommonModule,
    InsuranceCompanyRoutingModule,
    TableListModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatIconModule,
    OnlynumberModule,
    AlphabetOnlyModule,
    SharedMaterialModule,
  ]
})
export class InsuranceCompanyModule { }
