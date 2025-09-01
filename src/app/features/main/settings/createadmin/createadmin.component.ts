import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-createadmin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './createadmin.component.html',
  styleUrl: './createadmin.component.scss'
})
export class CreateadminComponent {
  
  roles: any[] = [];
  hrCompanies: any[] = [];
  selectedRoleId: any | null = null;
  selectedHrCompanyId: any | null = null;
  currentUser: any = {
    Name: '',
    LastName: '',
    MidName: '',
    Password: '',
    Email: '',
    RoleMasterId: this.selectedRoleId,
    IsEmployee: false,
    IsHr: false,
   
    SumInsured: null,
    CompanyId: null,
    PolicyNo: '',
    birthdate: null,
    Employeecode: this.generateEmployeeCode()
  };
  isEditing: boolean = false;
  
  users: any[] = [];
  companies:any [] = [];
  selectedCompanyId: number | null = null;
  selectedFile: File | null = null;
  companyid: any = localStorage.getItem('companyid');
  constructor(
    private authService: authService,
    private router: Router, 
    private route: ActivatedRoute
  ) { }
  
  onRoleChange() {
    const selectedRole = this.roles.find(role => role.RoleMasterId === +this.selectedRoleId);
    console.log("Selected Role ID:", this.selectedRoleId);
    console.log("Selected Role Name:", selectedRole?.Role);
  }
  
  onCompanyChange() {
    this.currentUser.CompanyId = this.selectedCompanyId;
  }
  
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const Admminid = Number(params.get('id'));
      if (Admminid) {
        this.loadAdminData(Admminid);
        this.isEditing = true;
      } else {
        console.warn('No garageId found in the route.');
      }
    });
    this.loadCompanies();
    this.loadRoles();
   
    this.loadAdmin();
  }
  
 loadCompanies(): void {
   const company = localStorage.getItem('companyid')
   console.log("com id is ",company)
   this.authService.getCompanies().subscribe({
    
     next: (companies) => {
       if (company)
       {
         this.companies= companies.filter((c:any)=>c.CompanyId==company)
       }
       else
       {
         this.companies=companies
         }
       
        
      },
      error: (err) => {
       
        console.error('Error loading companies:', err);
      },
    });
  }

  loadAdminData(id: any) {
    this.authService.getAdminById(id).subscribe({
      next: (admin) => {
        console.log('Fetched Admin Data:', admin);
        if (admin) {
          this.currentUser = { ...admin };
          this.selectedRoleId = this.currentUser.RoleMasterId;
          console.log('Admin Name:', this.currentUser.Name);
          console.log('Is Employee:', this.currentUser.IsEmployee);
        } else {
          console.warn('No admin data found for ID:', id);
          this.router.navigate(['adminlist']);
        }
      },
      error: (err) => {
        console.error('Failed to load admin:', err);
        this.router.navigate(['adminlist']);
      },
    });
  }

  loadRoles() {
    this.authService.getRole().subscribe({
      next: (response) => {
        if (response && response.responseData) {
          this.roles = JSON.parse(response.responseData);
          console.log("Roles loaded:", this.roles);
        } else {
          this.roles = [];
        }
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.roles = [];
      }
    });
  }
  
  loadAdmin() {
    this.authService.getAdminUsers().subscribe({
      next: (users) => {
        this.users = users;
        users.forEach(user => {
          console.log(`Name: ${user.Name}, Email: ${user.Email}, Role:${user.Role}, IsEmployee:${user.IsEmployee}`);
        });
      },
      error: (err) => {
        console.error('Error loading users:', err);
      },
    });
  }
  
  loadHrCompanies() {
    const company = localStorage.getItem('companyid');
    this.authService.getHrCompanies().subscribe({
      next: (response) => {
        if (response && response.responseData) {
          this.hrCompanies = JSON.parse(response.responseData);
          console.log("Company is ",company)
          this.hrCompanies.filter((c:any)=>c.CompanyId==company)
          console.log("HR Companies loaded:", this.hrCompanies);
        } else {
          this.hrCompanies = [];
        }
      },
      error: (err) => {
        console.error('Error loading HR companies:', err);
        this.hrCompanies = [];
      }
    });
  }
  
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  saveAdmin() {
    let companyId:any;
    // Prepare the admin data
    if (!this.selectedCompanyId) {
      companyId = localStorage.getItem('companyid');
      if (companyId) {
        this.selectedCompanyId = +companyId;
        this.currentUser.CompanyId = +companyId;
      }
    }

    const adminReqDto = {
      ...this.currentUser,
      RoleMasterId: this.selectedRoleId,
      CompanyId: this.selectedCompanyId
    };

    // Create FormData
    const formData = new FormData();
    
    // Append each field from adminReqDto to FormData
    Object.keys(adminReqDto).forEach(key => {
      if (adminReqDto[key] !== null && adminReqDto[key] !== undefined) {
        // Convert dates to ISO string if they are Date objects
        if (adminReqDto[key] instanceof Date) {
          formData.append(key, adminReqDto[key].toISOString());
        } else {
          formData.append(key, adminReqDto[key]);
        }
      }
    });

    // Append the file if it exists
    if (this.selectedFile) {
      formData.append('document', this.selectedFile, this.selectedFile.name);
    }

    console.log('Sending form data:', {
      adminReqDto: adminReqDto,
      hasDocument: !!this.selectedFile,
      fileName: this.selectedFile?.name
    });
     
    if (this.isEditing) {
      console.log("inside edit", this.currentUser.AdminUserId);
      this.currentUser.DateUpdated = new Date();
     
      
      // Log the FormData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      this.authService
        .updateAdmin(this.currentUser.AdminUserId, formData)
        .subscribe({
          next: (response) => {
            console.log("Admin updated successfully:", response);
            if (this.companyid) {
              this.router.navigate(['adminlist']);
            } else {
              this.router.navigate(['adminlist']);
            }
          },
          error: (err) => {
            console.error('Failed to update admin:', err);
            // Log more detailed error information
            if (err.error) {
              console.error('Error details:', err.error);
            }
          },
        });
    } else {
      this.authService.createAdmin(formData).subscribe({
        next: (response) => {
          console.log("Admin created successfully:", response);
          if (companyId)
          {
             this.router.navigate(['/adminlist']);
          }
          else
          {
            this.router.navigate(['/adminlist']);
          }
          
        },
        error: (err) => {
          console.error('Failed to create admin:', err);
        }
      });
    }
  }
  
  back() {
     console.log("companoes is is ",this.companyid)
    if (this.companyid)
    {
     
      this.router.navigate(['/adminlist']);
    }
    else
    {
       this.router.navigate(['/adminlist']);
      }
   
  }

  // Add this new method to generate random employee code
  private generateEmployeeCode(): string {
    const prefix = 'EMP';
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit random number
    return `${prefix}${randomNum}`;
  }

  onEmployeeChange() {
  const companyId = localStorage.getItem('companyid');

  if (this.currentUser.IsEmployee && companyId) {
    this.currentUser.CompanyId = +companyId;
    this.selectedCompanyId = +companyId;
    console.log("Company ID set from localStorage:", this.currentUser.CompanyId);
  }
}
}