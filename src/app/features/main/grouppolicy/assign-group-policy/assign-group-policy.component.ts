import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GroupPolicyService } from '../services/group-policy.service';
import { NgForm } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-assign-group-policy',
  standalone: false,
  templateUrl: './assign-group-policy.component.html',
  styleUrl: './assign-group-policy.component.scss'
})
export class AssignGroupPolicyComponent {
  excelselectedFile: File | null = null;

 formData: any = {
    companyId: '',
    insurerId: '',
    policyType: '',
    policyNumber: '',
    sumInsured: null,
    policyStartDate: '',
    policyEndDate: '',
    document: '',
    features: '',
    policydetail: '',
    createdBy: 'admin',
    updatedBy: 'admin',
    isActive: true,
  };

  companyList: any[] = [];
  selectedFile: File | null = null;
  insurer: any[] = [];
  assignedPolicies: any[] = [];
  isLoading: boolean = false;
  constructor(
    private groupPolicyService: GroupPolicyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadinsurer();
    this.fetchAssignedPolicies();
  }

  AddExcel() {
    if (!this.excelselectedFile) {
      alert('Please select an Excel file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.excelselectedFile);

    this.groupPolicyService.UploadExcel(formData).subscribe({
      next: (res: any) => {
        alert('✅ Excel uploaded successfully!');
        console.log('Response:', res);
      },
        error: (err: HttpErrorResponse) => {
          alert('❌ Upload failed.');
          console.error('Error:', err);
        },
    });
  }


  fetchAssignedPolicies(companyId?: number): void {
    const policyId = 0; // Default if you're not filtering by specific policy
    this.isLoading = true;

    this.groupPolicyService.getAssignedPolicies(policyId, companyId).subscribe({
      next: (res) => {
        if (res.responseData) {
          this.assignedPolicies = JSON.parse(res.responseData);
          console.log("Fetched policies:", this.assignedPolicies);

          // Fetch employee counts per policy for the selected company
          if (companyId) {
            this.groupPolicyService.getAssignedPolicyEmpCount(policyId).subscribe({
              next: (countRes) => {
                console.log("Count Response:", countRes.responseData);
                if (countRes.responseData) {
                  const counts = JSON.parse(countRes.responseData);
                  console.log("Counts:", counts);
                  // counts should be an array of objects with policyId and count
                  this.assignedPolicies.forEach((policy: any) => {
                    // Try to match by GrPolicyId or PolicyId
                    const match = counts.find((c: any) => c.PolicyId === policy.GrPolicyId || c.PolicyId === policy.PolicyId);
                    policy.employeeCount = match ? match.Count : 0;
                  });
                } else {
                  this.assignedPolicies.forEach((policy: any) => {
                    policy.employeeCount = 0;
                  });
                }
                this.isLoading = false;
              },
              error: (err) => {
                console.error("Failed to fetch employee counts:", err);
                this.assignedPolicies.forEach((policy: any) => {
                  policy.employeeCount = 0;
                });
                this.isLoading = false;
              }
            });
          } else {
            // If no companyId, set all to 0
            this.assignedPolicies.forEach((policy: any) => {
              policy.employeeCount = 0;
            });
            this.isLoading = false;
          }
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error("Failed to fetch policies:", err);
        this.isLoading = false;
      }
    });
  }

  viewPolicyDetails(policyId: number): void {
    console.log('Viewing policy details for ID:', policyId);
    if (policyId) {
      this.router.navigate(['/policydetails', policyId]);
    } else {
      console.error('No policy ID provided for viewing details');
    }
  }

  editPolicy(policyId: number): void {
    console.log('Editing policy with ID:', policyId);
    if (policyId) {
      // Navigate to edit policy page if available
      // this.router.navigate(['/editpolicy', policyId]);
      console.log('Edit policy functionality to be implemented');
    } else {
      console.error('No policy ID provided for editing');
    }
  }

  deletePolicy(policyId: number): void {
    if (confirm('Are you sure you want to delete this policy?')) {
      console.log('Deleting policy with ID:', policyId);
      // Implement delete functionality here
      // You can call the service method to delete the policy
    }
  }

  loadAssignedGroupPolicies(){

  }

  loadinsurer():void
  {
     this.groupPolicyService.getInsurer().subscribe({
      next: (res:any) => {
        if (res) {
       
          this.insurer = res;
           console.log("Insurer",this.insurer)
        }
      },
      error: (err) => console.error('Company fetch failed:', err)
    });
    
    
    
  }
  loadCompanies(): void {
    this.groupPolicyService.getAllCompanies().subscribe({
      next: (res) => {
        if (res.responseData) {
          this.companyList = JSON.parse(res.responseData);
        }
      },
      error: (err) => console.error('Company fetch failed:', err)
    });
  }
  onexcelfileselet(event:any)
  {
    this.excelselectedFile = event.target.files[0];
   
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.formData.document = this.selectedFile.name;
    }
  }

  submitPolicyForm(form: NgForm): void {
    if (form.invalid) return;
  
    const formPayload = new FormData();
   
    formPayload.append('CompanyId', this.formData.companyId);
    formPayload.append('InsurerId', this.formData.insurerId);
    formPayload.append('PolicyType', this.formData.policyType);
    formPayload.append('PolicyNumber', this.formData.policyNumber);
    formPayload.append('SumInsured', this.formData.sumInsured);
    formPayload.append('PolicyStartDate', this.formData.policyStartDate);
    formPayload.append('PolicyEndDate', this.formData.policyEndDate);
    formPayload.append('Features', this.formData.features);
    formPayload.append('PolicyDetail', this.formData.policydetail);
    formPayload.append('IsActive', this.formData.isActive);
    formPayload.append('CreatedBy', this.formData.createdBy);
    formPayload.append('UpdatedBy', this.formData.updatedBy);
    formPayload.append('DateCreated', new Date().toISOString());
    formPayload.append('DateUpdated', new Date().toISOString());
  
    if (this.selectedFile) {
      formPayload.append('Document', this.selectedFile); // This is key
    }
  
    this.groupPolicyService.assignGroupPolicy(formPayload).subscribe({
      next: (res) => {
        alert('Policy assigned successfully');
        form.resetForm();
      },
      error: (err) => {
        console.error('Error submitting form:', err);
        alert('Something went wrong!');
      }
    });
  }
  
  resetForm(form: NgForm): void {
    form.resetForm();
    this.selectedFile = null;
    this.formData.isActive = true;
  }
  
  onCompanyChange(): void {
    // Refresh policies when company selection changes
    if (this.formData.companyId) {
      this.fetchAssignedPolicies(this.formData.companyId);
    } else {
      this.fetchAssignedPolicies();
    }
  }
  
  viewPolicy(policyId: number): void {
    console.log('Viewing policy with ID:', policyId);
    if (policyId) {
      this.router.navigate(['/policydetails', policyId]);
    } else {
      console.error('No policy ID provided for viewing');
    }
  }
}
