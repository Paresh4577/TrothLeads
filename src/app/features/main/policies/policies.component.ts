import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-policies',
  standalone: false,
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.scss',
})
export class PoliciesComponent implements OnInit {
  policies: any[] = [];
  paginatedPolicies: any[] = [];
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

  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  searchPolicyNo: string = '';
  searchPolicyType: string = '';
  searchInsurerName: string = '';
  searchPolicyHolder: string = '';
  searchMobile: string = '';
  itemsPerPageOptions: number[] = [];

  constructor(private authService: authService, private router: Router) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getPolicies().subscribe({
      next: (data) => {
        this.policies = data;
        this.totalItems = data.length;
        this.generateItemsPerPageOptions(this.totalItems);
        this.isLoading = false;
        this.searchPolicies();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load policies. Please try again later.';
        this.isLoading = false;
        console.error('Error loading policies:', err);
      },
    });
  }

  generateItemsPerPageOptions(total: number): void {
  const baseOptions = [10, 25, 50, 100, 200, 500];
  this.itemsPerPageOptions = baseOptions.filter(opt => opt <= total);

  // Optionally, always include total if not already in list
  if (!this.itemsPerPageOptions.includes(total)) {
    this.itemsPerPageOptions.push(total);
  }

  // Sort options
  this.itemsPerPageOptions.sort((a, b) => a - b);
}

  searchPolicies(): void {
    let filteredPolicies = [...this.policies];
    console.log(filteredPolicies);
    if (this.searchPolicyNo.trim()) {
      filteredPolicies = filteredPolicies.filter((policy) =>
        policy.PolicyNo?.toLowerCase().includes(
          this.searchPolicyNo.toLowerCase()
        )
      );
    }
    if (this.searchInsurerName.trim()) {
      filteredPolicies = filteredPolicies.filter((policy) =>
        policy.InsurerName?.toLowerCase().includes(
          this.searchInsurerName.toLowerCase()
        )
      );
    }
    if (this.searchPolicyHolder.trim()) {
      filteredPolicies = filteredPolicies.filter((policy) =>
        policy.PolicyHolder?.toLowerCase().includes(
          this.searchPolicyHolder.toLowerCase()
        )
      );
    }
    if (this.searchMobile.trim()) {
      filteredPolicies = filteredPolicies.filter((policy) =>
        policy.MobileNo?.toLowerCase().includes(this.searchMobile.toLowerCase())
      );
    }

    this.totalItems = filteredPolicies.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);
  }

  navigateToAddPolicy(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentPolicy = {
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
      CreatedBy: this.authService.getCurrentUser() || 'admin',
      DateCreated: null,
      UpdatedBy: '',
      DateUpdated: null,
    };
  }

  editPolicy(policyId: any): void {
    const policy = this.policies.find((p) => p.PolicyId === policyId);
    console.log('polsy', policy);
    if (policy) {
      this.currentPolicy = {
        ...policy,

        DateUpdated: new Date(),
        UpdatedBy: this.authService.getCurrentUser() || 'admin',
      };
      this.showForm = true;
      this.isEditing = true;
      this.router.navigate(['viewpolicy', policyId]);
    }
  }

  submitPolicy(): void {
    this.currentPolicy.DateCreated = this.isEditing
      ? this.currentPolicy.DateCreated
      : new Date();
    this.currentPolicy.CreatedBy = this.isEditing
      ? this.currentPolicy.CreatedBy
      : this.authService.getCurrentUser() || 'admin';

    if (this.isEditing) {
      this.authService
        .updatePolicy(this.currentPolicy.PolicyId, this.currentPolicy)
        .subscribe({
          next: () => {
            this.loadPolicies();
            this.showForm = false;
          },
          error: (err) => this.handleError('Failed to update policy', err),
        });
    } else {
      this.authService.createPolicy(this.currentPolicy).subscribe({
        next: () => {
          this.loadPolicies();
          this.showForm = false;
        },
        error: (err) => this.handleError('Failed to create policy', err),
      });
    }
  }

  deletePolicy(policyId: number): void {
    if (confirm('Are you sure you want to delete this policy?')) {
      this.authService.deletePolicy(policyId).subscribe({
        next: () => this.loadPolicies(),
        error: (err) => this.handleError('Failed to delete policy', err),
      });
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1;
      this.searchPolicies();
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
