import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuoteRoutingModule } from './quote-routing.module';
import { HealthInsurancePlansComponent } from './health-insurance-plans/health-insurance-plans.component';

import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from "@angular/material/datepicker";
import {MatRadioModule} from '@angular/material/radio';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { SharedPipesModule } from "../../../../shared/pipes/shared-pipes.module";
import { ExistingIllnessDetailComponent } from './existing-illness-detail/existing-illness-detail.component';
import { SharedMaterialModule } from 'src/app/shared/shared-material';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { PopupComponent } from './popup/popup.component';
import { PlanCompareComponent } from './plan-compare/plan-compare.component';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { mmyyyyModule } from '@lib/ui/directives/mmyyyy/mmyyyy.module';
import { PopUpShareComponent } from './pop-up-share/pop-up-share.component';
import { PlanListingComponent } from './plan-listing/plan-listing.component';
import { AlphabetOnlyModule } from '@lib/ui/directives/aphabet-only/alphabet-only.module';
import {MatTabsModule} from '@angular/material/tabs';
import { InfoHeaderComponent } from '../info-header/info-header.component';
import { HealthModule } from '../health.module';

@NgModule({
    declarations: [
        HealthInsurancePlansComponent, 
        ExistingIllnessDetailComponent, 
        PopupComponent, 
        PlanCompareComponent, 
        PopUpShareComponent, 
        PlanListingComponent
    ],
    providers: [
        { 
            provide: MAT_DATE_FORMATS, 
            useValue: MY_DATE_FORMATS 
        }
    ],
    imports: [
        CommonModule,
        QuoteRoutingModule,
        MatButtonModule,
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSlideToggleModule,
        MatTableModule,
        MatSliderModule,
        MatDatepickerModule,
        MatRadioModule, MatIconModule,
        SharedPipesModule,
        SharedMaterialModule,
        DatemaskModule,
        OnlynumberModule,
        mmyyyyModule,
        AlphabetOnlyModule,
        MatTabsModule,
        HealthModule
    ]
})
export class QuoteModule {}
