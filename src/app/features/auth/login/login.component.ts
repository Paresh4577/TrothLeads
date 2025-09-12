import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { authService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form = {
    Name: '',
    Password: '',
  };
  loading: boolean = false;

  Name: string = '';
  showPassword: boolean = false;
  errorMessage: string = ''; // Store error message
  successMessage: string = '';

  tokenAvailable: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private http: HttpClient,
    private router: Router
  ) {
    this.tokenAvailable = false; // Initialize in constructor
  }

  // Toggle Password Visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.tokenAvailable = !!token;
    if (token != null || token == ' ') {
      this.router.navigate(['landing-home']);
    }
  }

  // onClick() {
  //   this.loading = true; // Show loader

  //   this.authService.login(this.form).subscribe({
  //     next: (response: any) => {
  //       if (response.status === 'success' && (response.type === 'Admin/SuperAdmin')) {
  //         const responseData = JSON.parse(response.responseData);

  //         localStorage.setItem('authtoken', response.token);
  //         localStorage.setItem('token', responseData[0].UserName);
  //         localStorage.setItem('UserId', responseData[0].UserId);

  //         this.successMessage = 'Login successful!';
  //         this.errorMessage = '';

  //         // Wait 500ms to show the loader, then navigate
  //         setTimeout(() => {
  //           this.loading = false;
  //           this.router.navigate(['landing-home']);
  //         }, 500);

  //       } else {
  //         this.loading = false;
  //         this.errorMessage = 'Invalid username or password!';
  //         this.successMessage = '';
  //       }
  //     },
  //     error: (error: any) => {
  //       this.loading = false;
  //       this.errorMessage = 'Invalid username or password!';
  //       this.successMessage = '';
  //     },
  //   });
  // }

  onClick() {
    this.loading = true; // Show loader
    console.log('clicked');
    this.authService.login(this.form).subscribe({
      next: (response: any) => {
        const responseData = JSON.parse(response.responseData);

        if (response.status === 'success') {
          const responseData = JSON.parse(response.responseData);
          const permissions = responseData[0].RoleModulePermissions;
          console.log('login data is ', responseData);
          console.log('modulepermisison is ', JSON.stringify(permissions));
          localStorage.setItem('authtoken', response.token);
          localStorage.setItem('token', responseData[0].Name);
          localStorage.setItem('companyid', responseData[0].CompanyId);
          localStorage.setItem('policyno', responseData[0].PolicyNo);
          localStorage.setItem('isteamlead', responseData[0].IsTeamLead);
          localStorage.setItem('ISHR',responseData[0].ISHR);
           localStorage.setItem('RoleMasterId',responseData[0].RoleMasterId);
          localStorage.setItem('HrMobile',responseData[0].HrMobile);
           localStorage.setItem('HrId',responseData[0].HrId);
           localStorage.setItem('IsEmployee',responseData[0].isEmployee);
             localStorage.setItem('Employeecode',responseData[0].Employeecode);
          localStorage.setItem(
            'modulePermissions',
            JSON.stringify(permissions)
          );
         // localStorage.setItem('UserId', responseData[0].RoleMasterId);
          localStorage.setItem('UserId', responseData[0].UserAdminId);

          this.successMessage = 'Login successful!';
          this.errorMessage = '';

          // Wait 500ms to show the loader, then navigate
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['leadlist']);
          }, 500);
        } else {
          this.loading = false;
          this.errorMessage = 'Invalid username or password!';
          this.successMessage = '';
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = 'Invalid username or password!';
        this.successMessage = '';
      },
    });
  }

  navigateToForgotPassword() {
    this.router.navigate(['/forgotpassword']);
  }
}
