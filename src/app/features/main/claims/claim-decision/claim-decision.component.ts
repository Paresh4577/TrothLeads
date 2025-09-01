import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../../services/message.service';

@Component({
  selector: 'app-claim-decision',
  standalone: false,
  templateUrl: './claim-decision.component.html',
  styleUrl: './claim-decision.component.scss'
})
export class ClaimDecisionComponent {
  claimDecisions: any[] = [];
    inProgressClaims: any[] = [];
     allClaims: any[] = [];
  paginatedClaimDecisions: any[] = [];
  currentClaimDecision: any = {
    decisionId: null,
    claimId: null,
    decisionStatus: '',
    decisionComments: '',
    decidedAt: null
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
  searchDecisionId: string = '';
  searchClaimId: string = '';
  searchDecisionStatus: string = '';
  noRecordMessage: string = '';

  constructor(
    private claimDecisionService: authService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecordMessage = this.messageService.getNoRecordMessage();
    this.loadClaimDecisions();
    this.loadClaims();
  }

  loadClaimDecisions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.claimDecisionService.getClaimDecisions().subscribe({
      next: (data) => {
        this.claimDecisions = data;
        console.log("decisions", this.claimDecisions);
        this.totalItems = data.length;
        this.isLoading = false;
        this.searchClaimDecisions();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claim decisions. Please try again later.';
        this.isLoading = false;
        console.error('Error loading claim decisions:', err);
      }
    });
  }

  loadClaims(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.claimDecisionService.getClaims().subscribe({
      next: (data) => {
        console.log('claim data is ', data);
        this.allClaims = data;
        console.log("allclaims",this.allClaims)
        // Filter claims based on ClaimStatusId
        this.inProgressClaims = this.allClaims.filter(claim => claim.ClaimStatusId === 7);
        
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claims. Please try again later.';
        console.error('Error loading claims:', err);
        this.isLoading = false;
      },
    });
  }

  searchClaimDecisions(): void {
    let filteredClaimDecisions = [...this.claimDecisions];

    if (this.searchDecisionId.trim()) {
      filteredClaimDecisions = filteredClaimDecisions.filter((decision) =>
        decision.decisionId?.toString().includes(this.searchDecisionId)
      );
    }

    if (this.searchClaimId.trim()) {
      filteredClaimDecisions = filteredClaimDecisions.filter((decision) =>
        decision.claimId?.toString().includes(this.searchClaimId)
      );
    }

    if (this.searchDecisionStatus.trim()) {
      filteredClaimDecisions = filteredClaimDecisions.filter((decision) =>
        decision.decisionStatus?.toLowerCase().includes(this.searchDecisionStatus.toLowerCase())
      );
    }

    this.totalItems = filteredClaimDecisions.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClaimDecisions = filteredClaimDecisions.slice(startIndex, endIndex);
  }

  updateClaimDecision(decision: any): void {
    const decisionData = {
      decisionId: decision.decisionId,
      claimId: decision.claimId,
      decisionStatus: decision.decisionStatus,
      decisionComments: decision.decisionComments,
      decidedAt: decision.decidedAt
    };

    this.claimDecisionService.updateClaimDecision(decision.decisionId, decisionData).subscribe({
      next: () => {
        this.loadClaimDecisions();
      },
      error: (err) => {
        this.handleError('Failed to update claim decision', err);
      }
    });
  }

  navigateToAddClaimDecision(): void {
    this.router.navigate(['/addClaimDecision']);
  }

  editClaimDecision(decisionId: number): void {
    const decision = this.claimDecisions.find((d) => d.decisionId === decisionId);
    console.log("decisionis",decision)
    if (decision) {
     console.log("decisionid",decisionId)
      this.router.navigate(['/addClaimDecision', decisionId]);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1;
      this.searchClaimDecisions();
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
