import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { authModule } from '../../../../auth/auth.module';
import { authService } from '../../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-add-assign-employee',
  standalone: false,
  templateUrl: './add-assign-employee.component.html',
  styleUrl: './add-assign-employee.component.scss',
})
export class AddAssignEmployeeComponent {
  claimForm: FormGroup;
  employees: any[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  claimId: number | null = null;
  isEditing: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize form with only claimId and empId
    this.claimForm = this.fb.group({
      claimId: [null, Validators.required],
      empId: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Load employees for dropdown
    this.loadEmployees();

    // Get claimId from route params
    this.route.paramMap.subscribe((params) => {
      const claimId = Number(params.get('claimId'));
      if (claimId) {
        this.isEditing = true;
        this.claimId = claimId;
        this.claimForm.patchValue({ claimId });
        this.loadClaimData(claimId);
      }
    });
  }
  BackToClaimList() {
    this.router.navigate(['/addClaimAssignment']);
  }

  loadEmployees(): void {
    console.log('Employee Called');
    this.authService.getEmployees().subscribe({
      next: (employees: any[]) => {
        console.log('Emp Employee is', employees);
        this.employees = employees;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.errorMessage = 'Failed to load employees.';
      },
    });
  }

  loadClaimData(claimId: number): void {
    this.authService.getClaimById(claimId).subscribe({
      next: (claim) => {
        if (claim) {
          // Patch empId if it exists
          this.claimForm.patchValue({
            empId: claim.EmpId ?? null,
          });
        }
      },
      error: (err) => {
        console.error('Error loading claim:', err);
        this.errorMessage = 'Failed to load claim data.';
        setTimeout(() => (this.errorMessage = null), 3000);
        this.router.navigate(['/Claims']);
      },
    });
  }

  async onSubmit(): Promise<void> {
    if (this.claimForm.invalid) {
      this.errorMessage = 'Please select an employee.';
      setTimeout(() => (this.errorMessage = null), 3000);
      return;
    }

    const { claimId, empId } = this.claimForm.value;

    try {
      // Fetch the existing claim data to preserve other fields
      const claimResponse = await this.authService
        .getClaimById(claimId)
        .toPromise();
      if (!claimResponse) {
        this.errorMessage = 'Claim not found.';
        setTimeout(() => (this.errorMessage = null), 3000);
        return;
      }

      // Filter out documents that don't have a name or path (as in your old method)
      const validDocuments =
        claimResponse.ClaimDocuments?.filter(
          (doc: any) => doc.DocName && doc.DocPath
        ).map((doc: any) => ({
          DocName: doc.DocName,
          OrderNo: doc.OrderNo,
          DocPath: doc.DocPath,
        })) || [];

      // Create the updated claim data, only changing empId
      const claimData = {
        ClaimId: claimResponse.ClaimId || claimId,
        PolicyId: claimResponse.PolicyId,
        ClaimStatusId: claimResponse.ClaimStatusId || 11,
        CustomerNo: claimResponse.CustomerNo,
        PolicyNo: claimResponse.PolicyNo,
        CompanyId: claimResponse.CompanyId,
        FullName: claimResponse.FullName,
        PhoneNumber: claimResponse.PhoneNumber,
        Email: claimResponse.Email,
        SubmissionDate: claimResponse.SubmissionDate
          ? new Date(claimResponse.SubmissionDate).toISOString()
          : null,
        Description: claimResponse.Description,
        ClaimAmount: claimResponse.ClaimAmount,
        ProductId: claimResponse.ProductId,
        UserId: claimResponse.UserId,
        EmpId: empId, // Update only empId
        IsActive: claimResponse.IsActive ?? true,
        ClaimDocuments: validDocuments,
      };

      // Update the claim
      await this.authService.updateClaim(claimId, claimData).toPromise();
      this.successMessage = 'Employee assigned successfully!';
      this.errorMessage = null;

      // Navigate back to claims list
      setTimeout(() => {
        this.router.navigate(['/addClaimAssignment']);
      }, 1500);
    } catch (error: any) {
      this.errorMessage = 'Failed to assign employee: ' + error.message;
      console.error('Error updating claim:', error);
      setTimeout(() => (this.errorMessage = null), 3000);
    }
  }
}
