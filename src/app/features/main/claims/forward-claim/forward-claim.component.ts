import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../../services/message.service';

@Component({
  selector: 'app-forward-claim',
  standalone: false,
  templateUrl: './forward-claim.component.html',
  styleUrl: './forward-claim.component.scss'
})
export class ForwardClaimComponent {
  claimForwards: any[] = [];
  paginatedClaimForwards: any[] = [];
  claims: any[] = [];
  employees: any[] = [];
  // claims: any[] = [];
  currentClaimForward: any = {
    ReviewId: null,
    ClaimId: null,
    EmpId: null,
    ReviewStatus: '',
    ReviewComments: '',
    ForwardedToInsurer: false
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
  searchReviewId: string = '';
  searchClaimId: string = '';
  searchReviewStatus: string = '';
  noRecordMessage: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecordMessage = this.messageService.getNoRecordMessage();
    this.loadEmployees();
    this.loadClaimForwards();
    this.loadClaims();
  }

  loadEmployees(): void {
    this.authService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        console.error('Failed to load employees:', err);
      }
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

  //  get hasForwardedClaims(): boolean {
  //   return (
  //     this.claims?.length > 0 &&
  //     this.claims.some(
  //       claim =>
  //         !!claim.forwardDate &&
  //         !!claim.forwardComment &&
  //         !!claim.forwardMethod
  //     )
  //   );
  // }

  loadClaimForwards(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getClaimForwards().subscribe({
      next: (data) => {
        this.claimForwards = data;
        console.log("forward",this.claimForwards)
        this.totalItems = data.length;
        this.isLoading = false;
        this.searchClaimForwards();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claim forwards. Please try again later.';
        this.isLoading = false;
        console.error('Error loading claim forwards:', err);
      }
    });
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

  // loadClaims(): void {
  //   this.errorMessage = '';

  //   this.authService.getClaims().subscribe({
  //     next: (data) => {
  //       console.log('claim data is ', data);
  //       this.claims = data;
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Failed to load claims. Please try again later.';
  //       console.error('Error loading claims:', err);
  //     },
  //   });
  // }

  searchClaimForwards(): void {
    let filteredClaimForwards = [...this.claimForwards];

    if (this.searchReviewId.trim()) {
      filteredClaimForwards = filteredClaimForwards.filter((forward) =>
        forward.ReviewId?.toString().includes(this.searchReviewId)
      );
    }

    if (this.searchClaimId.trim()) {
      filteredClaimForwards = filteredClaimForwards.filter((forward) =>
        forward.ClaimId?.toString().includes(this.searchClaimId)
      );
    }

    if (this.searchReviewStatus.trim()) {
      filteredClaimForwards = filteredClaimForwards.filter((forward) =>
        forward.ReviewStatus?.toLowerCase().includes(this.searchReviewStatus.toLowerCase())
      );
    }

    this.totalItems = filteredClaimForwards.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClaimForwards = filteredClaimForwards.slice(startIndex, endIndex);
  }

  assignEmployee(forward: any): void {
    const assignmentData = {
      ReviewId: forward.ReviewId,
      ClaimId: forward.ClaimId,
      EmpId: forward.EmpId,
      ReviewStatus: forward.ReviewStatus,
      ReviewComments: forward.ReviewComments,
      ForwardedToInsurer: forward.ForwardedToInsurer
    };

    this.authService.updateClaimForward(forward.ReviewId, assignmentData).subscribe({
      next: () => {
        this.loadClaimForwards();
      },
      error: (err) => {
        this.handleError('Failed to assign employee', err);
      }
    });
  }

  navigateToAddClaimForward(): void {
    this.router.navigate(['/addClaimForward']);
  }

  editClaimForward(reviewId: number): void {
    const forward = this.claimForwards.find((f) => f.reviewId === reviewId);
    console.log(forward.reviewId)
    if (forward) {
      console.log("hit")
      this.router.navigate(['/addClaimForward', reviewId]);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1;
      this.searchClaimForwards();
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
