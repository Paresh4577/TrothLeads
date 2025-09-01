import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../main-layout.component';
import { HospitalsComponent } from './../../main/hospitals/hospital.component';
import { GaragesComponent } from '../../main/garages/garages.component';
import { CompaniesComponent } from '../../main/companies/companies.component';
import { VehiclesComponent } from '../../main/vehicles/vehicles.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'hospitals',
        component: HospitalsComponent
      },
      {
        path: 'garages',
        component: GaragesComponent
      },
      {
        path: 'companies',
        component: CompaniesComponent
      },
      {
        path: 'vehicles',
        loadChildren: () => import('../../main/vehicles/vehicles.module').then(m => m.VehiclesModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainLayoutRoutingModule { }
