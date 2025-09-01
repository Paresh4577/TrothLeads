import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { authService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: false,
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  form = {
    userName: '',
    password: '',
  };
  username: string = '';
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

  onClick() {
    console.log('Data entered: ', this.form);
  
    this.authService.login(this.form).subscribe({
      next: (response: any) => {
        console.log('✅ Login response:', response);
  
        if (response.status === 'success' && (response.type === 'Admin/SuperAdmin')) {
          const responseData = JSON.parse(response.responseData);
          console.log('Token is: ', response.token);
  
          localStorage.setItem('authtoken', response.token);
          localStorage.setItem('token', responseData[0].UserName);
          localStorage.setItem('UserId', responseData[0].UserId);
  
          this.successMessage = 'Login successful!';
          this.errorMessage = '';
  
          this.router.navigate(['landing-home']);
  
        } else if (response.status === 'danger' && response.message.includes('Access restricted')) {
          this.errorMessage = 'Access denied: You are not allowed to log in.';
          this.successMessage = '';
        } else {
          this.errorMessage = 'Invalid username or password!';
          this.successMessage = '';
        }
      },
      error: (error: any) => {
        console.error('❌ Login failed:', error);
        this.errorMessage = 'Invalid username or password!';
        this.successMessage = '';
      },
    });
  }
  

  navigateToForgotPassword() {
    this.router.navigate(['/forgotpassword']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
