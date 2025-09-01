import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';

@Component({
  selector: 'app-view-policy',
  standalone: false,
  templateUrl: './view-policy.component.html',
  styleUrl: './view-policy.component.scss',
})
export class ViewPolicyComponent {
  errorMessage = '';
  policyId: number | null = null;
  isLoading = true;
  policyDetails: any[] = [];
  policies: any[] = [];
  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.policyId = Number(this.route.snapshot.paramMap.get('policyId'));
    if (this.policyId) {
      this.loadPolicyDetails(this.policyId);
    }
  }

  loadPolicyDetails(policyId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getPolicyById(policyId).subscribe({
      next: (data) => {
        console.log('policy details', data);

        // You can add any data mapping/transformation here if needed
        // For example, format dates, status mapping, etc.
        if (data) {
          // Format policy dates for better display
          data.FormattedPolicyStartDate = new Date(
            data.PolicyStartDate
          ).toLocaleDateString();
          data.FormattedPolicyEndDate = new Date(
            data.PolicyEndDate
          ).toLocaleDateString();
          data.FormattedPolicyIssueDate = new Date(
            data.PolicyIssueDate
          ).toLocaleDateString();

          // Add any status mapping if needed
          data.PolicyStatusText = data.PolicyIsActive ? 'Active' : 'Inactive';
        }

        this.policyDetails = data ? [data] : [];
        console.log('policyDetails', this.policyDetails);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          'Failed to load policy details. Please try again later.';
        this.isLoading = false;
        console.error('Failed to load policy details:', err);
      },
    });
  }

  loadPolicies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getPolicies().subscribe({
      next: (data) => {
        this.policies = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load policies. Please try again later.';
        this.isLoading = false;
        console.error('Error loading policies:', err);
      },
    });
  }
}
