import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { authService } from '../../../../auth/auth.service';
import { MessageService } from '../../../../../services/message.service';

@Component({
  selector: 'app-view-assign-claim',
  standalone: false,
  templateUrl: './view-assign-claim.component.html',
  styleUrl: './view-assign-claim.component.scss',
})
export class ViewAssignClaimComponent {
  claimAssignments: any[] = [];
  claims: any[] = [];
  paginatedClaimAssignments: any[] = [];
  employees: any[] = [];
  currentClaimAssignment: any = {
    AssignmentId: null,
    claimId: null,
    empId: null,
    assignedAt: null,
    assignmentNote: '',
    IsActive: true,
  };

  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Search variables
  searchClaimId: string = '';
  searchAssignmentNote: string = '';
  noRecordMessage: string = '';
  constructor(
    private authService: authService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecordMessage = this.messageService.getNoRecordMessage();
    this.loadEmployees();
    this.loadClaimAssignments();
    this.loadClaims();
  }

  loadEmployees(): void {
    this.authService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        console.log('Loaded employees:', data);
      },
      error: (err) => {
        console.error('Failed to load employees:', err);
      },
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
        console.error('Error loading claims:', err);
      },
    });
  }

  loadClaimAssignments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getClaimAssignments().subscribe({
      next: (data) => {
        console.log('Raw claimAssignments data:', data);
        this.claimAssignments = data.filter(
          (assignment) =>
            assignment.assignmentId != null && !isNaN(assignment.assignmentId)
        );
        console.log('Filtered claimAssignments:', this.claimAssignments);
        this.totalItems = this.claimAssignments.length;
        this.isLoading = false;
        this.searchClaimAssignments();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading claim assignments:', err);
      },
    });
  }

  searchClaimAssignments(): void {
    let filteredClaimAssignments = [...this.claimAssignments];

    if (this.searchClaimId.trim()) {
      filteredClaimAssignments = filteredClaimAssignments.filter((assignment) =>
        assignment.claimId?.toString().includes(this.searchClaimId)
      );
    }

    if (this.searchAssignmentNote.trim()) {
      filteredClaimAssignments = filteredClaimAssignments.filter((assignment) =>
        assignment.assignmentNote
          ?.toLowerCase()
          .includes(this.searchAssignmentNote.toLowerCase())
      );
    }

    this.totalItems = filteredClaimAssignments.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClaimAssignments = filteredClaimAssignments.slice(
      startIndex,
      endIndex
    );
  }

  getEmployeeName(empId: number | null): string {
    if (!empId) return '-';
    const employee = this.employees.find((emp) => emp.empId === empId);
    return employee ? `${employee.FirstName} ${employee.LastName}` : '-';
  }

  navigateToAddClaimAssignment(): void {
    this.router.navigate(['/addClaimAssignment']);
  }

  editClaimAssignment(assignmentId: number): void {
    const assignment = this.claimAssignments.find(
      (a) => a.assignmentId === assignmentId
    );
    console.log(assignment?.assignmentId);
    if (assignment) {
      console.log('hit');
      this.router.navigate(['/addClaimAssignment', assignmentId]);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1;
      this.searchClaimAssignments();
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
