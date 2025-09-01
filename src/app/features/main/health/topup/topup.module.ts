import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopupRoutingModule } from './topup-routing.module';
import { QuoteModule } from '../quote/quote.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TopupRoutingModule,
    QuoteModule
  ]
})
export class TopupModule { }
