import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { authService } from '../../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forward-to-company',
  standalone: false,
  templateUrl: './forward-to-company.component.html',
  styleUrl: './forward-to-company.component.scss'
})
export class ForwardToCompanyComponent implements OnInit {
  claimForm: FormGroup;
  selectedClaim: any = null; // Store the selected claim details
  forwardingMethods: string[] = ['Email', 'In-Person', 'Post'];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  selectedClaimId: number | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize form without claimId
    this.claimForm = this.fb.group({
      forwardDate: [this.getTodayDate(), Validators.required],
      forwardMethod: ['', Validators.required],
      forwardComment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get claimId from route parameters
    this.route.params.subscribe(params => {
      const claimId = +params['ClaimId']; // Convert to number
      if (claimId) {
        this.selectedClaimId = claimId;
        console.log("claimidiss",this.selectedClaimId)
        this.loadClaimDetails(claimId); // Load claim details
      } else {
        this.errorMessage = 'No claim ID provided.';
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }

  getTodayDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
  }

   BackToClaimList(){
    this.router.navigate(['/addClaimForward']);
  }

  loadClaimDetails(claimId: number): void {
    this.isLoading = true;
    this.authService.getClaimById(claimId).subscribe({
      next: (claim) => {
        if (claim) {
          this.selectedClaim = claim; // Store claim details for display
          this.isLoading = false;
        } else {
          this.errorMessage = `Claim with ID ${claimId} not found.`;
          this.isLoading = false;
          setTimeout(() => this.errorMessage = null, 3000);
        }
      },
      error: (err) => {
        console.error('Error loading claim:', err);
        this.errorMessage = 'Failed to load claim details.';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = null, 3000);
      }
    });
  }
  
  async onSubmit(): Promise<void> {
    // if (this.claimForm.invalid) {
    //   this.markFormGroupTouched(this.claimForm);
    //   this.errorMessage = 'Please fill all required fields.';
    //   setTimeout(() => this.errorMessage = null, 3000);
    //   return;
    // }
    
    if (!this.selectedClaimId) {
      this.errorMessage = 'No claim selected.';
      this.isLoading = false;
      setTimeout(() => this.errorMessage = null, 3000);
      return;
    }
    
    this.isLoading = true;
    
    const { forwardDate, forwardMethod, forwardComment } = this.claimForm.value;
    
    try {
      // Step 1: Fetch existing claim data to preserve other fields
      const claimResponse = await this.authService.getClaimById(this.selectedClaimId).toPromise();
      console.log("claimresponse is ",claimResponse)
      if (!claimResponse) {
        this.errorMessage = `Claim with ID ${this.selectedClaimId} not found.`;
        this.isLoading = false;
        setTimeout(() => this.errorMessage = null, 3000);
        return;
      }
      
      console.log(`Updating claim with ID: ${this.selectedClaimId}`, claimResponse);
      
      // Step 2: Prepare claim documents if they exist
      const validDocuments = claimResponse.ClaimDocuments
        ?.filter((doc: any) => doc.DocName && doc.DocPath)
        .map((doc: any) => ({
          DocName: doc.DocName,
          OrderNo: doc.OrderNo,
          DocPath: doc.DocPath
        })) || [];
      
      // Step 3: Construct updated claimData preserving existing fields
      const claimData = {
        ClaimId: this.selectedClaimId,
        PolicyId: claimResponse.PolicyId,
        CustomerNo: claimResponse.CustomerNo,
        PolicyNo: claimResponse.PolicyNo,
        ClaimStatusId: claimResponse.ClaimStatusId || 11,
        CompanyId: claimResponse.CompanyId,
        FullName: claimResponse.FullName,
        PhoneNumber: claimResponse.PhoneNumber,
        Email: claimResponse.Email,
        SubmissionDate: claimResponse.SubmissionDate ? new Date(claimResponse.SubmissionDate).toISOString() : null,
        Description: claimResponse.Description,
        ClaimAmount: claimResponse.ClaimAmount,
        ProductId: claimResponse.ProductId,
        UserId: claimResponse.UserId,
        EmpId: claimResponse.EmpId,
        IsActive: claimResponse.IsActive ?? true,
        ClaimDocuments: validDocuments,
        
        // Updated forward fields
        ForwardDate: forwardDate ? new Date(forwardDate).toISOString() : null,
        ForwardMethod: forwardMethod,
        ForwardComment: forwardComment
      };
      
      // Step 4: Update claim with the selected ID
      await this.authService.updateClaim(this.selectedClaimId, claimData).toPromise();
      
      this.successMessage = `Claim #${this.selectedClaimId} forwarded successfully!`;
      this.errorMessage = null;
      
      // Reset loading state
      this.isLoading = false;
      
      // Step 5: Redirect after short delay
      setTimeout(() => {
        this.router.navigate(['/addClaimForward']);
      }, 1500);
      
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = 'Failed to update claim: ' + (error.message || 'Unknown error');
      console.error('Error forwarding claim:', error);
      setTimeout(() => this.errorMessage = null, 5000);
    }
  }
  
  // Helper method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  // Reset the form
  resetForm(): void {
    this.claimForm.reset({
      forwardDate: this.getTodayDate(),
      forwardMethod: '',
      forwardComment: ''
    });
    this.successMessage = null;
    this.errorMessage = null;
  }
}