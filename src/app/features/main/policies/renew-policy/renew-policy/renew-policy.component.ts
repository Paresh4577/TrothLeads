import { Component, OnInit } from '@angular/core';
import { authService } from '../../../../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-renew-policy',
  standalone: false,
  templateUrl: './renew-policy.component.html',
  styleUrl: './renew-policy.component.scss'
})
export class RenewPolicyComponent {
  policies: any[] = [];
  isLoading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  itemsPerPageOptions: number[] = [10, 20, 50, 100];
  searchPolicyNumber: string = '';
    currentPolicy: any = {
    PolicyId: null,
    InsurerName: '',
    PolicyHolder: '',
    ResponseNo: '',
    PolicyNo: '',
    RegistrationNo: '',
    MobileNo: '',
    ODEndDate: null,
    TPEndDate: null,
    IDV: null,
    PaymentAmount: null,
    PolicyType: '',
    TransactionNo: '',
    TransactionDate: null,
    Status: '',
    IsActive: true,
    CreatedBy: '',
    DateCreated: null,
    UpdatedBy: '',
    DateUpdated: null,
  };
 

    constructor(
    private authService: authService,
    private router: Router,
  ) { }
  
  ngOnInit(): void { 
    this.loadPolicies();
  }

  // loadPolicies(): void {
  //   this.isLoading = true;
  //   this.authService.RenewgetPolicies().subscribe({
  //     next: (data) => {
        
  //       this.policies = data[0].PolicyNo;
  //       console.log('API Renew Policy is  Response1:', data[0].PolicyNo ); 
  //       this.totalItems = this.policies.length;
       
  //     }
  //   });
  // }

  editPolicy(policyId: any): void {
    const policy = this.policies.find((p) => p.PolicyId === policyId);
    console.log('polsy', policy);
    if (policy) {
      this.currentPolicy = {
        ...policy,

        DateUpdated: new Date(),
        UpdatedBy: this.authService.getCurrentUser() || 'admin',
      };
      
      this.router.navigate(['viewpolicy', policyId]);
    }
  }

  loadPolicies(): void {
  this.isLoading = true;
  this.authService.RenewgetPolicies().subscribe({
    next: (data) => {
      this.policies = data; // ✅ now it's array of policy objects
      console.log('API Renew Policy Response:', this.policies); 
      this.totalItems = this.policies.length;
    },
    error: (err) => {
      console.error('Error loading policies', err);
    },
    complete: () => {
      this.isLoading = false;
    }
  });
  }
  
  viewPolicy(policyNo: string): void {
  Swal.fire({
  title: 'Proceed with Policy Renewal?',
  showCancelButton: true,
  confirmButtonText: 'Yes, proceed',
  cancelButtonText: 'Cancel'
})
.then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.authService.setPolicyRenew(policyNo).subscribe({
        next: (data) => {
          this.loadPolicies();

          // Show success alert
          Swal.fire({
            title: 'Success!',
            text: 'Policy has been processed successfully.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error loading setpolicies', err);
          Swal.fire({
            title: 'Error!',
            text: 'Something went wrong while processing the policy.',
            icon: 'error'
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  });
}

}
