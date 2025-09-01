import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableListComponent } from './table-list.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SharedPipesModule } from "../../../../shared/pipes/shared-pipes.module";
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatemaskModule } from '@lib/ui/directives/datemask/datemask.module';
import { OnlynumberModule } from '@lib/ui/directives/onlynumber/onlynumber.module';
import { DecimalModule } from '@lib/ui/directives/decimal/decimal.module';
import { TableComponent } from './table/table.component';

@NgModule({
    declarations: [
        TableListComponent,
        TableComponent
    ],
    exports: [
        TableListComponent,
        TableComponent
    ],
    providers: [],
    imports: [
        CommonModule,
        RouterModule,
        HttpClientModule,
        FormsModule,
        MatRadioModule,
        SharedPipesModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatDatepickerModule,
        DatemaskModule,
        OnlynumberModule,
        DecimalModule
    ]
})
export class TableListModule { }
