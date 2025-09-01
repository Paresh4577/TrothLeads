import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authComponent } from './auth.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    component: authComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirect to login by default
      { path: 'login', component: LoginComponent }, // Define login route
    ],
  },

  {
    path: 'main',
    loadChildren: () =>
      import('../main-layout/main-layout/main-layout.module').then(
        (m) => m.MainLayoutModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class authRoutingModule {}
