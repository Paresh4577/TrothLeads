import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-createrole',
  templateUrl: './createrole.component.html',
  styleUrls: ['./createrole.component.scss'],
   imports: [CommonModule,FormsModule]
})
export class CreateroleComponent {

  roleName: string = '';
  roles: any[] = [];
  RoleMasterId: any;
isEditing: boolean = false;

  modulePermissions:any = {
    master: {
      read: false,
      create: false,
      delete: false
    },
    product: {
      read: false,
      create: false,
      delete: false
    },
    policies: {
      read: false,
      create: false,
      delete: false
    },
    claims: {
      read: false,
      create: false,
      delete: false
    },
    reports: {
      read: false,
      create: false,
      delete: false
    },
    userAccess: {
      read: false,
      create: false,
      delete: false
    },
    grouppolicy: {
       read: false,
      create: false,
      delete: false
    }
  };

  constructor(
    private authService: authService,
    private router: Router,
         private route: ActivatedRoute
   
  ) { }

  ngOnInit(): void {
     this.route.paramMap.subscribe((params) => {
      const Admminid = Number(params.get('id'));
      if (Admminid) {
        this.loadRoleData(Admminid);
        this.isEditing = true;
      } else {
        console.warn('No id found in the route.');
      }
    });
    
  }

  onCheckboxChange(module: string, type: string, event: any): void {
    this.modulePermissions[module as keyof typeof this.modulePermissions][type as keyof typeof this.modulePermissions.master] = event.target.checked;
    console.log("Module Permissions Now: ", this.modulePermissions);
  }

  back()
  {
    this.router.navigate(['/settings']);
  }

  loadRoleData(id: any)
  {
     this.authService.getRoleById(id).subscribe({
      next: (role) => {
        console.log('Fetched Admin Data:', role);
         if (role) {
           console.log("Role Name is ",role.Role)
           this.roleName = role.Role;
           this.RoleMasterId = role.RoleMasterId;
           
           // Set permissions for all modules
           if (role.RoleModulePermissions && role.RoleModulePermissions.length > 0) {
             role.RoleModulePermissions.forEach((permission: any) => {
               const moduleName = permission.ModuleName.toLowerCase();
               if (this.modulePermissions[moduleName]) {
                 this.modulePermissions[moduleName].read = permission.CanRead;
                 this.modulePermissions[moduleName].create = permission.CanWrite;
                 this.modulePermissions[moduleName].delete = permission.CanDelete;
               }
             });
           }
           
           console.log('Module Permissions:', this.modulePermissions);
        } else {
          console.warn('No admin data found for ID:', id);
          this.router.navigate(['rolelist']);
        }
      },
      error: (err) => {
        console.error('Failed to load role:', err);
        this.router.navigate(['rolelist']);
      },
    });
  }


  saveRole(): void {
  const roleData = {
    Role: this.roleName,
    RoleModulePermissions: this.preparePermissionsArray(),
    RoleMasterId: this.isEditing ? this.RoleMasterId : 0
  };

  console.log("✅ Role data to send:", roleData);

  if (this.isEditing) {
    this.authService.UpdateRole(this.RoleMasterId, roleData).subscribe({
      next: () => {
        this.router.navigate(['settings']);
      },
      error: (err) => {
        console.error('Failed to update role:', err);
      },
    });
  } else {
    this.authService.saveRole(roleData).subscribe({
      next: (response) => {
        console.log('✅ Role saved successfully:', response);

        if (response.responseData) {
          try {
            const roleId = JSON.parse(response.responseData)[0].RoleMasterId;
            this.RoleMasterId = roleId;
          } catch (e) {
            console.error('❌ Error parsing response:', e);
          }
        }

        // Reset inputs
        this.roleName = '';
        this.modulePermissions = {
          master: { read: false, create: false, delete: false },
          product: { read: false, create: false, delete: false },
          policies: { read: false, create: false, delete: false },
          claims: { read: false, create: false, delete: false },
          reports: { read: false, create: false, delete: false },
          userAccess: { read: false, create: false, delete: false },
          grouppolicy:{read: false, create: false, delete: false }
        };

        this.router.navigate(['/settings']);
      },
      error: (error) => {
        console.error('❌ Error saving role:', error);
      }
    });
  }
}

preparePermissionsArray() {
  const modules = ['master', 'product', 'policies', 'claims', 'reports', 'userAccess','grouppolicy'];

  return modules.map(mod => ({
    ModuleName: mod,
    CanRead: this.modulePermissions[mod].read,
    CanWrite: this.modulePermissions[mod].create,
    CanDelete: this.modulePermissions[mod].delete
  }));
}


}
