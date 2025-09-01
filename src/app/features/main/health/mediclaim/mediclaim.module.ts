import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediclaimRoutingModule } from './mediclaim-routing.module';
import { QuoteModule } from '../quote/quote.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MediclaimRoutingModule,
    QuoteModule
  ]
})
export class MediclaimModule { }
