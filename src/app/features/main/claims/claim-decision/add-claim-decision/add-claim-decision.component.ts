import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-add-claim-decision',
  standalone: false,
  templateUrl: './add-claim-decision.component.html',
  styleUrl: './add-claim-decision.component.scss'
})
export class AddClaimDecisionComponent {
  // Arrays to store filtered claims
  newClaims: any[] = [];
  inProgressClaims: any[] = [];
  approvedClaims: any[] = [];
  
  allClaims: any[] = [];
  isLoading = false;
  showModal: boolean = false;
  selectedClaimId: string = '';
  decisionForm: FormGroup;
  isEditing: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize decision form with required fields
    this.decisionForm = this.fb.group({
      decision: [null, Validators.required],
      comments: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClaims();
    
    // Check if we're editing an existing decision
    this.route.paramMap.subscribe((params) => {
      const decisionId = Number(params.get('decisionId'));
      if (decisionId) {
        this.isEditing = true;
        this.loadDecisionData(decisionId);
      }
    });
  }

  loadClaims(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.getClaims().subscribe({
      next: (data) => {
        console.log('claim data is ', data);
        this.allClaims = data;
        
        // Filter claims based on ClaimStatusId
        this.newClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 1);
        this.inProgressClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 7);
        this.approvedClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 9);
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claims. Please try again later.';
        console.error('Error loading claims:', err);
        this.isLoading = false;
      },
    });
  }

  makeDecision(claimId: number): void {
    this.selectedClaimId = claimId.toString();
    this.showModal = true;
    
    // Reset form for new decision
    this.decisionForm.reset();
    
    // If editing existing decision, pre-populate form
    const claim = this.allClaims.find(c => c.ClaimId === claimId);
    if (claim && claim.Decision) {
      this.decisionForm.patchValue({
        decision: claim.Decision,
        comments: claim.DecisionComments || ''
      });
    }
  }
  
  viewDecision(claimId: number): void {
    // View only mode for approved claims
    this.selectedClaimId = claimId.toString();
    this.showModal = true;
    
    const claim = this.allClaims.find(c => c.ClaimId === claimId);
    if (claim) {
      this.decisionForm.patchValue({
        decision: claim.Decision,
        comments: claim.DecisionComments || ''
      });
      
      // Disable form for view-only mode
      this.decisionForm.disable();
    }
  }
  
  closeModal(): void {
    this.showModal = false;
    this.selectedClaimId = '';
    this.decisionForm.enable(); // Re-enable form for future use
  }

  loadDecisionData(decisionId: number): void {
    // Load existing decision data if needed
    // This would typically call a service method
    this.authService.getClaimById(decisionId).subscribe({
      next: (claim) => {
        if (claim) {
          this.decisionForm.patchValue({
            decision: claim.Decision || null,
            comments: claim.DecisionComments || ''
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claim decision data.';
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.decisionForm.invalid) {
      this.errorMessage = 'Please complete all required fields';
      return;
    }
    
    const formValues = this.decisionForm.value;
    
    // Prepare decision data
    const decisionData = {
      claimId: parseInt(this.selectedClaimId),
      decision: formValues.decision,
      comments: formValues.comments,
      // Update claim status based on decision
      claimStatusId: formValues.decision === 'approve' ? 9 : 
                     formValues.decision === 'reject' ? 8 : 7, // 7 for pending/more info
      dateDecided: new Date().toISOString(),
      decidedBy: 'Current User' // Replace with actual user info
    };

    console.log('Decision data: ', decisionData);
    
    // Call service to save decision
    // Comment out or uncomment based on your actual service implementations
    /*
    this.authService.saveClaimDecision(decisionData).subscribe({
      next: () => {
        this.successMessage = 'Decision saved successfully!';
        this.errorMessage = null;
        this.closeModal();
        this.loadClaims(); // Reload claims to reflect changes
      },
      error: (err) => {
        this.errorMessage = 'Failed to save decision: ' + (err.error?.title || err.message);
        console.error('Decision save error:', err);
      }
    });
    */
    
    // For demonstration purposes, show success message and close modal
    this.successMessage = 'Decision saved successfully!';
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
    this.closeModal();
    
    // Simulate updating claims list
    // In a real application, you would reload data from the server
    const claimIndex = this.allClaims.findIndex(c => c.ClaimId === parseInt(this.selectedClaimId));
    if (claimIndex >= 0) {
      // Update claim status in the list
      this.allClaims[claimIndex].ClaimStatusId = decisionData.claimStatusId;
      this.allClaims[claimIndex].Decision = decisionData.decision;
      this.allClaims[claimIndex].DecisionComments = decisionData.comments;
      
      // Refilter claims to update the UI
      this.newClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 1);
      this.inProgressClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 7);
      this.approvedClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 9);
    }
  }
  
  // Add additional methods as needed for claim status updates
  updateClaimStatus(claimId: number, newStatus: number): void {
    // This would update a claim's status via API call
    const updateData = {
      claimId: claimId,
      claimStatusId: newStatus
    };
    
    // Call service to update claim status
    /*
    this.authService.updateClaimStatus(updateData).subscribe({
      next: () => {
        this.successMessage = 'Claim status updated successfully!';
        this.loadClaims(); // Reload to get fresh data
      },
      error: (err) => {
        this.errorMessage = 'Failed to update claim status: ' + (err.error?.title || err.message);
      }
    });
    */
  }
  
  // Example method for handling claim rejections with specific reason
  rejectClaim(claimId: number, reason: string): void {
    const rejectionData = {
      claimId: claimId,
      claimStatusId: 8, // Rejected status
      rejectionReason: reason,
      dateRejected: new Date().toISOString()
    };
    
    // Implementation would be similar to updateClaimStatus
    console.log('Rejecting claim with data:', rejectionData);
  }
  
  // Example method for approving with specific amount
  approveClaim(claimId: number, amount: number): void {
    const approvalData = {
      claimId: claimId,
      claimStatusId: 9, // Approved status
      approvedAmount: amount,
      dateApproved: new Date().toISOString()
    };
    
    // Implementation would be similar to updateClaimStatus
    console.log('Approving claim with data:', approvalData);
  }
  
  
}