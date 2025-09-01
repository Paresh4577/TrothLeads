import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-state',
  standalone: false,
  templateUrl: './state.component.html',
  styleUrl: './state.component.scss',
})
export class StateComponent {
  states: any[] = []; // Full list of states from the service
  paginatedStates: any[] = []; // Filtered and paginated list for display
  currentState: any = {
    StateId: null,
    StateName: '',
    IsActive: true,
    DateCreated: null,
    CreatedBy: '',
    DateUpdated: null,
    UpdatedBy: '',
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
  searchStateName: string = '';
  itemsPerPageOptions: number[] = [];
  noRecord: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.message.getNoRecordMessage();
    this.loadStates();
  }

  loadStates(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getStateName(this.itemsPerPage, 0).subscribe({
      next: (data) => {
        this.states = data.data;
        this.totalItems = data.totalCount;
        this.generateItemsPerPageOptions(this.totalItems);
        this.isLoading = false;
        this.searchStates();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load states. Please try again later.';
        this.isLoading = false;
        console.error('Error loading states:', err);
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

  searchStates(): void {
    let filteredStates = [...this.states];

    if (this.searchStateName.trim()) {
      filteredStates = filteredStates.filter((state) =>
        state.StateName?.toLowerCase().includes(
          this.searchStateName.toLowerCase()
        )
      );
    }

    this.totalItems = filteredStates.length; // Update total items after filtering
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedStates = filteredStates.slice(startIndex, endIndex);
  }

  editState(stateId: number): void {
    const state = this.states.find((s) => s.StateId === stateId);
    if (state) {
      this.currentState = {
        ...state,
        DateUpdated: new Date(),
        UpdatedBy: this.authService.getCurrentUser() || 'admin',
      };
      this.showForm = true;
      this.isEditing = true;
    }
  }

  onItemsPerPageChange(value: any): void {
    console.log('Selected items per page:', value); // ✅ Debugging point
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadStates();
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
