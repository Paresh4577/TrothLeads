import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { authService } from '../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listadmin',
  standalone: true,
  templateUrl: './listadmin.component.html',
  styleUrl: './listadmin.component.scss',
  imports: [CommonModule, FormsModule]
})
export class ListadminComponent {


users: any[] = [];

  constructor(
    private authService: authService,
    private router: Router
  ) { }
  

ngOnInit(): void {
    
    this.loadAdminUsers();
  }

createAdmin() {
  this.router.navigate(['createadmin'])
}

  loadAdminUsers(): void {
    
    this.authService.getAdminUsers().subscribe({
      next: (users) => {
         this.users = users.filter(user => user.RoleMasterId !== null);
        users.forEach(user => {
          console.log(`Name: ${user.Name}, Email: ${user.Email}, Role:${user.Role}`);
        });
      },
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });
  }

  deleteAdmin(id: any)
  {
    console.log("id is ", id);
    this.authService.deleteAdmin(id).subscribe({
      next: (res) => {
        console.log("deleted")
        this.loadAdminUsers();
      }
    })
  }

  editAdmin(id: any)
  {
    console.log("id is ", id);
    const Admin = this.users.find((h) => h.UserAdminId === id);
    console.log('Admin', Admin);
    if (Admin) {
      this.router.navigate(['/createadmin', id], { state: { Admin } });
    }
  }

}
