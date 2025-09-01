import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-add-forward-claim',
  standalone: false,
  templateUrl: './add-forward-claim.component.html',
  styleUrl: './add-forward-claim.component.scss'
})
export class AddForwardClaimComponent {
  claimAssignmentForm: FormGroup;
  claims: any[] = [];
   showModal: boolean = false;
   claimForwards: any[] = [];
   isLoading = true;
  selectedClaimId: string = '';
  decisionForm: FormGroup;
  assignForm: FormGroup;
  employees: any[] = [];
  allForwardClaims: any[] = [];
  isEditing: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

    assignEmployee(claimId: string) {
    this.router.navigate(['/addClaimAssignment', claimId]);
  }

  constructor(
    private fb: FormBuilder,
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.claimAssignmentForm = this.fb.group({
      assignmentId: [null],
      claimId: [null],
      empId: [null],
      assignedAt: [new Date().toISOString().slice(0, 16)],
      assignmentNote: [''],
      isActive: [true],
      dateCreated: [null],
      createdBy: ['System'],
      dateUpdated: [null],
      updatedBy: ['System'],
    });
    {
    this.assignForm = this.fb.group({
      employeeId: [null]
    });
       this.decisionForm = this.fb.group({
          DateCreated : [null],
          reviewComments: ['', Validators.required],
          ForwardingMethod: ['', Validators.required]
        });
  }
  }
  

  ngOnInit(): void {
    this.loadClaims();
    this.loadDropdownData();
    this.loadClaimForwards();
    this.route.paramMap.subscribe((params) => {
      const assignmentId = Number(params.get('assignmentId'));
      if (assignmentId) {
        this.isEditing = true;
        this.loadClaimAssignmentData(assignmentId);
      }
    });
  }

  loadClaimForwards(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getClaimForwards().subscribe({
      next: (data) => {
        this.claimForwards = data;
        console.log("forward",this.claimForwards)
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claim forwards. Please try again later.';
        this.isLoading = false;
        console.error('Error loading claim forwards:', err);
      }
    });
  }

  viewForward(claimId: number): void {
    // View only mode for approved claims
    this.selectedClaimId = claimId.toString();
    this.showModal = true;
    
    const claim = this.allForwardClaims.find(c => c.reviewId === claimId);
    if (claim) {
      this.decisionForm.patchValue({
        decision: claim.Decision,
        comments: claim.DecisionComments || ''
      });
      
      // Disable form for view-only mode
      this.decisionForm.disable();
    }
  }

  navigateToReview(claimId: any): void {
    const forward = this.allForwardClaims.find(f => f.claimId === claimId);
    if (forward?.ReviewId) {
      console.log("forwardid",forward.ReviewId)
      this.router.navigate(['/addForward', forward.ReviewId]);
    } else {
      console.warn('Review ID not found for claim:', claimId);
    }
  }

  editClaim(claimId: number): void {
    const claim = this.claims.find((c) => c.ClaimId === claimId);
    if (claim) {
      console.log('claim is', claim);
      this.router.navigate(['/addForward', claimId]);
    }
  }

  BackToClaimList(){
    this.router.navigate(['/ClaimForward']);
  }
  
  

  loadDropdownData(): void {
    
    this.authService.getEmployees().subscribe({
      next: (employees) => (this.employees = employees),
      error: (err) => console.error('Error loading employees:', err),
    });
    
  }

    loadClaims(): void {
    this.errorMessage = '';

    this.authService.getClaims().subscribe({
      next: (data) => {
        console.log('claim data is ', data);
        this.claims = data;
        
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claims. Please try again later.';
        console.error('Error loading claims:', err);
      },
    });
  }

  
  openAssignModal(claimId: string) {
    this.selectedClaimId = claimId;
    this.showModal = true;
    this.assignForm.reset();
  }

  
  closeModal() {
    this.showModal = false;
    this.selectedClaimId = '';
  }
confirmAssign(): void {
  const selectedEmployeeId = this.assignForm.value.employeeId;

  if (!selectedEmployeeId || !this.selectedClaimId) {
    this.errorMessage = 'Please select an employee.';
    return;
  }

  const assignmentData = {
    AssignmentId: 0, // New assignment
    claimId: this.selectedClaimId,
    empId: selectedEmployeeId,
    assignedAt: new Date().toISOString(),
    assignmentNote: null,
    IsActive: true,
    DateCreated: new Date().toISOString(),
    CreatedBy: 'System',
    DateUpdated: null,
    UpdatedBy: null
  };

  // this.authService.createClaimAssignment(assignmentData).subscribe({
  //   next: () => {
  //     console.log('Employee assigned successfully!');
  //     this.successMessage = 'Employee assigned successfully!';
  //     this.errorMessage = null;
  //     this.showModal = false;
  //     this.selectedClaimId = '';
  //     this.assignForm.reset();
  //     this.loadClaims(); // Optional: refresh claim list
  //   },
  //   error: (err) => {
  //     this.errorMessage = 'Failed to assign employee: ' + (err.error?.title || err.message);
  //     console.error('Assignment error:', err);
  //     setTimeout(() => (this.errorMessage = ''), 3000);
  //   }
  // });
}


  loadClaimAssignmentData(assignmentId: number): void {
    this.authService.getClaimAssignmentById(assignmentId).subscribe({
      next: (assignment) => {
        console.log('assignment is', assignment);
        if (assignment) {
          this.claimAssignmentForm.patchValue({
            assignmentId: assignment.assignmentId ?? null,
            claimId: assignment.claimId ?? null,
            empId: assignment.empId ?? null,
            assignedAt: assignment.assignedAt
              ? new Date(assignment.assignedAt).toISOString().slice(0, 16)
              : null,
            assignmentNote: assignment.assignmentNote ?? '',
            isActive: assignment.IsActive ?? true,
            dateCreated: assignment.DateCreated
              ? new Date(assignment.DateCreated).toISOString().slice(0, 16)
              : null,
            createdBy: assignment.CreatedBy ?? 'System',
            dateUpdated: assignment.DateUpdated
              ? new Date(assignment.DateUpdated).toISOString().slice(0, 16)
              : null,
            updatedBy: assignment.UpdatedBy ?? 'System',
          });
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claim assignment data.';
        console.error(err);
        this.router.navigate(['/addClaimAssignment']);
      },
    });
  }

  clearForm(): void {
    this.claimAssignmentForm.reset();
    this.claimAssignmentForm.patchValue({
      assignedAt: new Date().toISOString().slice(0, 16),
      isActive: true,
      createdBy: '',
      updatedBy: '',
      claimId: null,
      empId: null,
      assignmentNote: '',
      dateCreated: null,
      dateUpdated: null,
    });
    this.errorMessage = null;
    this.successMessage = null;
  }

  get hasForwardedClaims(): boolean {
    return (
      this.claims?.length > 0 &&
      this.claims.some(
        claim =>
          !!claim.forwardDate &&
          !!claim.forwardComment &&
          !!claim.forwardMethod
      )
    );
  }
  
  
  onSubmit(): void {
    
    console.log('Claism assignment data is ', this.assignForm.value);
    console.log('isEditing is ', this.isEditing);
    console.log("modal assign clicked")
    

    const formValues = this.claimAssignmentForm.value;
    const assignmentData = {
      AssignmentId: this.isEditing ? formValues.assignmentId : 0,
      claimId: formValues.claimId,
      empId: formValues.empId,
     
    };

    if (this.isEditing) {
      console.log('isEditing is ', this.isEditing);
      console.log('Claim Assignment ID is ', assignmentData.AssignmentId);

    //   this.authService.updateClaimAssignment(assignmentData.AssignmentId, assignmentData).subscribe({
    //     next: () => {
    //       console.log('Claim assignment updated successfully!');
    //       this.successMessage = 'Claim assignment updated successfully!';
    //       this.errorMessage = null;
    //       this.clearForm();
    //       this.router.navigate(['/getClaimAssignment']);
    //     },
    //     error: (err) => {
    //       this.errorMessage = 'Failed to update claim assignment: ' + (err.error?.title || err.message);
    //       console.error('Update error details:', err);
    //       setTimeout(() => (this.errorMessage = ''), 3000);
    //     },
    //   });
    // } else {
    //   this.authService.createClaimAssignment(assignmentData).subscribe({
    //     next: () => {
    //       console.log('Claim assignment added successfully!');
    //       this.successMessage = 'Claim assignment added successfully!';
    //       this.errorMessage = null;
    //       this.clearForm();
    //       this.router.navigate(['/getClaimAssignment']);
    //     },
    //     error: (err) => {
    //       this.errorMessage = 'Failed to create claim assignment: ' + (err.error?.title || err.message);
    //       console.error('Create error details:', err);
    //       setTimeout(() => (this.errorMessage = ''), 3000);
    //     },
    //   });
    }
  }
}