import { filter } from 'rxjs';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { authService } from '../../auth/auth.service';
import { MessageService } from '../../../services/message.service';
import { GroupPolicyService } from './services/group-policy.service';
@Component({
  selector: 'app-grouppolicy',
  standalone: false,
  templateUrl: './grouppolicy.component.html',
  styleUrl: './grouppolicy.component.scss',
})
export class GrouppolicyComponent {
  employees: any[] = [];
   company: any;
  paginatedEmployees: any[] = [];
  currentEmployee: any = {
    UserAdminId: null,
    FirstName: '',
    MidName: '',
    LastName: '',
    Email: '',
    IsHr: false,
  };

  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  searchFirstName: string = '';
  noRecord: string = '';
  companyid: any;
  constructor(
    private groupservice: GroupPolicyService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getCompanyList()
  }


  getCompanyList(): void {
    console.log("get company called");
    this.groupservice.getAllCompanies().subscribe({
      next: (res) => {
        console.log("Company list:", res);
  
        if (res.responseData) {
          this.company = JSON.parse(res.responseData);
  
          this.company.forEach((comp: any) => {
            this.groupservice.getAllEmployeescount(comp.CompanyId).subscribe({
              next: (countRes) => {
                let allEmployees: any[] = [];
  
                if (typeof countRes.responseData === 'string') {
                  try {
                    allEmployees = JSON.parse(countRes.responseData);
                  } catch (err) {
                    console.error("JSON parse error:", err);
                    allEmployees = [];
                  }
                } else if (Array.isArray(countRes.responseData)) {
                  allEmployees = countRes.responseData;
                }
  
                // ✅ Filter: CompanyId match kare aur EmpId ho (null na ho)
                const matchedEmployees = allEmployees.filter(emp =>
                  emp.CompanyId === comp.CompanyId && emp.EmpId
                );
  
                comp.EmployeeCount = matchedEmployees.length;
                console.log(`CompanyId ${comp.CompanyId} has ${comp.EmployeeCount} employees.`);
              },
              error: (err) => {
                console.error(`Error fetching employees for company ${comp.CompanyId}:`, err);
                comp.EmployeeCount = 0;
              }
            });
          });
  
          console.log("Updated company list with employee counts:", this.company);
        }
      },
      error: (err) => {
        console.error("Failed to fetch companies:", err);
      }
    });
  }
  

//   getCompanyList(): void {
//   console.log("get company called");
//   this.groupservice.getAllCompanies().subscribe({
//     next: (res) => {
//       console.log("Company list:", res);
      
//       // Parse JSON string inside responseData
//       if (res.responseData) {
      
//         this.company = JSON.parse(res.responseData);
//           console.log("oompany",this.company)
//       }
//     },
//     error: (err) => {
//       console.error("Failed to fetch companies:", err);
//     }
//   });
// }

 

 

  navigatetoAddEmployee() {
    console.log('working');
    this.router.navigate(['addcompany']);
  }
  navigatetoDashBoard() {
    this.router.navigate(['grouppolicydashboard']);
  }

  addClaim(claimId: number) {
    console.log('claim emp id is ', claimId);
    this.router.navigate(['addClaim', claimId]);
  }

  viewCompanyDetails(companyId: number) {
    console.log('Viewing company details for ID:', companyId);
    this.router.navigate(['companydetails', companyId]);
  }
  viewCompany(companyId: number): void {
    console.log('Viewing company with ID:', companyId);
    if (companyId) {
      this.router.navigate(['/companydetails', companyId]);
    } else {
      console.error('No company ID provided for viewing');
    }
  }
    

  editCompany(companyId: number) {
    console.log('Editing company with ID:', companyId);
    this.router.navigate(['addcompany', companyId]);
  }

  deleteCompany(companyId: number) {
    if (confirm('Are you sure you want to delete this company?')) {
      console.log('Deleting company with ID:', companyId);
      // Implement delete functionality here
      // You can call the service method to delete the company
    }
  }
}
