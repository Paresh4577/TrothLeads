import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Troth_Admin';
  isSidebarOpen: boolean = true;
  isMasterOpen = false;
  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authtoken'); 
    if (!token) {
      this.router.navigate(['/login']); 
    }
  }
  
  

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
 

  // This method checks if the current route is the login page
  isLoginPage(): boolean {
    return this.router.url === '/login'; // Adjust this if your login route is different
  }
  isFPPage(): boolean {
    return this.router.url === '/forgotpassword'; // Adjust this if your login route is different
  }

}
