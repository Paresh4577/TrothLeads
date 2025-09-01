import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';

@Component({
  selector: 'app-assign-claim',
  standalone: false,
  templateUrl: './assign-claim.component.html',
  styleUrl: './assign-claim.component.scss'
})
export class AssignClaimComponent {
  claimAssignmentForm: FormGroup;
  claims: any[] = [];
  isLoading = false;
   showModal: boolean = false;
  selectedClaimId: string = '';
  assignForm: FormGroup;
  employees: any[] = [];
  isEditing: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

    assignEmployee(claimId: string) {
    this.router.navigate(['/assignEmp', claimId]);
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
  }
  }
  
//
  ngOnInit(): void {
    this.loadClaims();
    this.loadDropdownData();
    this.route.paramMap.subscribe((params) => {
      const assignmentId = Number(params.get('assignmentId'));
      if (assignmentId) {
        this.isEditing = true;
        this.loadClaimAssignmentData(assignmentId);
      }
    });
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
      
        next: (data:any) => {
          console.log("Claim assign data is ", data);
          //console.log('claim data is ', data);
         
            this.claims = data;
            
        
      },
      error: (err) => {
      
        console.error('Error loading claims:', err);
      },
    });
  }

  
  editClaim(claimId: number): void {
    const claim = this.claims.find((c) => c.ClaimId === claimId);
    if (claim) {
      console.log('claim is', claim);
      this.router.navigate(['/assignEmp', claimId]);
    }
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

 BackToClaimList(){
    this.router.navigate(['/getClaimAssignment']);
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
