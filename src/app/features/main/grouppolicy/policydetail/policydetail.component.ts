import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupPolicyService } from '../services/group-policy.service';

@Component({
  selector: 'app-policydetail',
  standalone: false,
  templateUrl: './policydetail.component.html',
  styleUrl: './policydetail.component.scss'
})
export class PolicydetailComponent implements OnInit {
  policyId: number | null = null;
  policyDetails: any = null;
  companyDetails: any = null;
  enrolledEmployees: any[] = [];
  familyMembers: any[] = [];
  isLoading = true;
  errorMessage = '';
  CompanyName: string = '';
  ContactEmail: string = '';
  ContactNumber: string = '';
  Address: string = '';
  PolicyNo: string = '';
  PolicyName: string = '';
  SumInsured: number = 0;
  PolicyStartDate: string = '';
  PolicyEndDate: string = '';
  status: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupPolicyService: GroupPolicyService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const policyIdParam = params.get('policyId');
      if (policyIdParam) {
        this.policyId = Number(policyIdParam);
        this.loadPolicyDetails(this.policyId);
      } else {
        this.errorMessage = 'Policy ID not provided';
        this.isLoading = false;
      }
    });
  }

  loadPolicyDetails(policyId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.groupPolicyService.getGroupPolicyDetail(policyId).subscribe({
      next: (response) => {
        console.log('Policy details response:', response.responseData);
        
       
          const data = JSON.parse(response.responseData);
          console.log("Policy data:", data);
          
         
            this.policyDetails = data;
            this.PolicyNo=this.policyDetails[0].PolicyNo;
            this.PolicyName=this.policyDetails[0].PolicyName;
            this.SumInsured=this.policyDetails[0].SumInsured;
            this.PolicyStartDate=this.policyDetails[0].PolicyStartDate;
            this.PolicyEndDate=this.policyDetails[0].PolicyEndDate;
            this.status=this.policyDetails[0].status;
            console.log("Policy data ia:", this.policyDetails[0].PolicyNo);
            this.CompanyName = data[0].CompanyName||'';
            this.ContactEmail = data[0].ContactEmail||'';
            this.ContactNumber = data[0].ContactPhone||'';
            this.Address = data[0].CompanyAddress||'';
            this.enrolledEmployees = data[0].EnrolledEmployees || [];
            this.familyMembers = data[0].EnrolledEmployees[0].FamilyList || [];
            
            console.log('Policy details loaded:', this.policyDetails);
            console.log('Company details:', this.companyDetails);
            console.log('Enrolled employees:', this.enrolledEmployees);
            console.log('Family members:', this.familyMembers);
          
        
       
      },
      error: (error) => {
        console.error('Error fetching policy details:', error);
        this.errorMessage = 'Failed to load policy details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
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

  formatCurrency(amount: number): string {
    if (!amount) return '-';
    return '$' + amount.toLocaleString();
  }

  editPolicy(): void {
    if (this.policyId) {
      // Navigate to edit policy page if available
      console.log('Edit policy:', this.policyId);
    }
  }

  deletePolicy(): void {
    if (confirm('Are you sure you want to delete this policy?')) {
      // Implement delete functionality here
      console.log('Delete policy:', this.policyId);
    }
  }

  goBack(): void {
    this.router.navigate(['/AssignGroupPolicy']);
  }
}
