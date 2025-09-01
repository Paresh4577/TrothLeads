import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RfqListComponent } from './rfq-list/rfq-list.component';

const routes: Routes = [
  {
    path: 'motor',
    loadChildren: () => import('./rfq-motor/rfq-motor.module').then(m => m.RfqMotorModule)
  },
  {
    path: 'life',
    loadChildren: () => import('./rfq-life/rfq-life.module').then(m => m.RfqLifeModule)
  },
  {
    path: 'health',
    loadChildren: () => import('./rfq-health/rfq-health.module').then(m => m.RfqHealthModule)
  },
  {
    path: 'travel',
    loadChildren: () => import('./rfq-travel/rfq-travel.module').then(m => m.RfqTravelModule)
  },
  {
    path: 'fire',
    loadChildren: () => import('./rfq-fire/rfq-fire.module').then(m => m.RfqFireModule)
  },
  {
    path: 'marine',
    loadChildren: () => import('./rfq-marine/rfq-marine.module').then(m => m.RfqMarineModule)
  },
  {
    path: 'wc',
    loadChildren: () => import('./rfq-wc/rfq-wc.module').then(m => m.RfqWcModule)
  },
  {
    path: 'pa',
    loadChildren: () => import('./rfq-pa/rfq-pa.module').then(m => m.RfqPaModule)
  },
  {
    path: 'engineering',
    loadChildren: () => import('./rfq-engineering/rfq-engineering.module').then(m => m.RfqEngineeringModule)
  },
  {
    path: 'group',
    loadChildren: () => import('./rfq-group/rfq-group.module').then(m => m.RfqGroupModule)
  },
  {
    path: 'miscellaneous',
    loadChildren: () => import('./rfq-miscellaneous/rfq-miscellaneous.module').then(m => m.RfqMiscellaneousModule)
  },
  {
    path: 'package',
    loadChildren: () => import('./rfq-package/rfq-package.module').then(m => m.RfqPackageModule)
  },
  {
    path: 'liability',
    loadChildren: () => import('./rfq-liability/rfq-liability.module').then(m => m.RfqLiabilityModule)
  },
  // for Approval request routing
  {
    path: ':StageCode',
    pathMatch: "full",
    component: RfqListComponent
  },
  {
    path: '',
    pathMatch: "full",
    component: RfqListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqRoutingModule { }
