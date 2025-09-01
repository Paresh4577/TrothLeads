import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupPolicyService } from '../services/group-policy.service';

@Component({
  selector: 'app-companydetai',
  standalone: false,
  templateUrl: './companydetai.component.html',
  styleUrl: './companydetai.component.scss'
})
export class CompanydetaiComponent implements OnInit {
  companyId: number | null = null;
  companyDetails: any = null;
  hrList: any[] = [];
  policyList: any[] = [];
  employeeList: any[] = [];
 
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupPolicyService: GroupPolicyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const companyIdParam = params.get('companyId');
      if (companyIdParam) {
        this.companyId = Number(companyIdParam);
        this.loadCompanyDetails(this.companyId);
      } else {
        this.errorMessage = 'Company ID not provided';
      
      }
    });
  }

  loadCompanyDetails(companyId: number): void {
   
    this.errorMessage = '';

    this.groupPolicyService.getCompany(companyId).subscribe({
      next: (response) => {
        console.log('Company details response:', response.responseData);
        
       
          const data = JSON.parse(response.responseData);
          console.log("data isss",data)
         
            this.companyDetails = data;
            this.hrList = data.HrList || [];
            this.policyList = data.PolicyList || [];
            this.employeeList = data.EmployeeList || [];

            
            console.log('Company details loaded:', this.companyDetails);
            console.log('HR Listss:', this.hrList);
            console.log('Policy List:', this.policyList);
            console.log('Employee List:', this.employeeList);
         
        
       
      },
      error: (error) => {
        console.error('Error fetching company details:', error);
        this.errorMessage = 'Failed to load company details. Please try again.';
       
      }
    });
  }
  goToEmployeeDetail(employeeId: number): void {
    this.router.navigate(['/viewEmployee', employeeId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  editCompany(): void {
    if (this.companyId) {
      this.router.navigate(['/addcompany', this.companyId]);
    }
  }

  deleteCompany(): void {
    if (confirm('Are you sure you want to delete this company?')) {
      // Implement delete functionality here
      console.log('Delete company:', this.companyId);
    }
  }

  goBack(): void {
    this.router.navigate(['/GroupPolicy']);
  }
}
