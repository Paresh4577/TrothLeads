import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GoDigitComponent } from './go-digit/go-digit.component';
import { ICICIHealthComponent } from './icicihealth/icicihealth.component';
import { BajajComponent } from './bajaj/bajaj.component';
import { CareComponent } from './care/care.component';
import { HdfcergoComponent } from './hdfcergo/hdfcergo.component';
import { AdityaBirlaHealthComponent } from './aditya-birla-health/aditya-birla-health.component';
import { TATAAIGComponent } from './tata-aig/tata-aig.component';
import { IFFCOTOKIOComponent } from './iffco-tokio/iffco-tokio.component';
import { SBIGENERALComponent } from './sbi-general/sbi-general.component';

const routes: Routes = [
  {
    path: 'godigit',
    component: GoDigitComponent,
  },
  {
    path: 'icici',
    component: ICICIHealthComponent,
  },
  {
    path: 'bajajallianz',
    component: BajajComponent,
  },
  {
    path: 'hdfcergo',
    component: HdfcergoComponent,
  },
  {
    path: 'care',
    component: CareComponent,
  },
  {
    path: 'adityabirla',
    component: AdityaBirlaHealthComponent,
  },
  {
    path: 'tata',
    component: TATAAIGComponent,
  },
  {
    path: 'iffcotokio',
    component: IFFCOTOKIOComponent,
  },
  {
    path: 'sbigeneral',
    component: SBIGENERALComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProposalPagesRoutingModule {}
