import { Component, OnInit } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-claim',
  standalone: false,
  templateUrl: './view-claim.component.html',
  styleUrl: './view-claim.component.scss',
})
export class ViewClaimComponent implements OnInit {
  claim: any = null;
  claimProperties: { key: string; value: any }[] = []; // Array for dynamic iteration
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: authService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const claimId = Number(params.get('claimId'));
      if (claimId) {
        this.loadClaimData(claimId);
      } else {
        this.errorMessage = 'No claim ID provided.';
        this.isLoading = false;
      }
    });
  }

  loadClaimData(claimId: number): void {
    this.isLoading = true;
    this.authService.getClaimById(claimId).subscribe({
      next: (claim) => {
        console.log('Fetched Claim Data:', claim);
        if (claim) {
          this.claim = { ...claim }; // Assign the fetched claim data dynamically
          console.log('Claim Full Name:', this.claim.FullName); // Example log
        } else {
          console.warn('No claim data found for ID:', claimId);
          this.errorMessage = 'Claim not found.';
          this.router.navigate(['/claims']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load claim:', err);
        this.errorMessage = 'Failed to load claim details.';
        this.isLoading = false;
        this.router.navigate(['/claims']);
      },
    });
  }

  // Format keys to be human-readable (e.g., "ClaimId" -> "Claim ID")
  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  goBack(): void {
    this.router.navigate(['/Claims']);
  }
}
