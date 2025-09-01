import { CommonModule } from '@angular/common';
import { authService } from '../../../auth/auth.service';
// #region imports
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';


// #endregion imports

@Component({
  selector: 'gnx-settings-home',
  templateUrl: './settings-home.component.html',
  styleUrls: ['./settings-home.component.scss'],
  imports: [CommonModule,FormsModule]
})
export class SettingsHomeComponent {
  users: any[] = [];
constructor(
    private authService: authService,
    private router: Router,
   
  ) { }
  
  ngOnInit(): void {
    this.loadRole();
  }

loadRole(): void {
  console.log("loadRole() called");
  this.authService.getRole().subscribe({
    next: (res: any) => {
      if (res?.responseData) {
        try {
          const parsedData = JSON.parse(res.responseData);  // Parse JSON string
          this.users = parsedData;
          console.log("Parsed Role Data:", this.users);
        } catch (e) {
          console.error("Failed to parse responseData:", e);
        }
      } else {
        console.warn("No responseData found in API response.");
      }
    },
    error: (err) => {
      console.error('Error loading users:', err);
    },
  });
}

  editRole(id:any) {
  console.log("id is ", id);
    const role = this.users.find((h) => h.RoleMasterId === id);
    console.log('role', role);
    if (role) {
      this.router.navigate(['/createrole', id], { state: { role } });
    }
  }

  deleteRole(id: any)
  {
    console.log("id is ", id);
    this.authService.deleteRole(id).subscribe({
      next: (res) => {
        console.log("deleted")
        this.loadRole();
      }
    })
  }

  createRole()
  {
    console.log("Create role called")
    this.router.navigate(['createrole']);
  }


}
