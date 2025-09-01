import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-view-user',
  standalone: false,
  templateUrl: './view-user.component.html',
  styleUrl: './view-user.component.scss'
})
export class ViewUserComponent {
  userId: number | null = null;
  userDetails: any;
  claims: any[] = [];
  policies : any[]= [];
  activeTab: string = 'claims'; // default tab

  // Claim status mapping based on tblclaimstatus master data
  private claimStatusMap: { [key: number]: string } = {
    1: 'Pending',
    2: 'Document Pending',
    3: 'In-Progress',
    4: 'In Document Viewing',
    5: 'Completed',
    6: 'Under Review',
    7: 'Approved',
    8: 'Cancelled',
    9: 'Rejected',
    10: 'On Hold'
  };

  constructor(private route: ActivatedRoute, private authService: authService,private router:Router) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('userId'));
    if (this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  loadUserDetails(userId: number): void {
    this.authService.getUserById(userId).subscribe({
      next: (data) => {
        console.log("user 3", data);
        // Map ClaimStatusId to ClaimStatusName for each claim
        if (data && data.Claims) {
          data.Claims = data.Claims.map((claim: any) => ({
            ...claim,
            ClaimStatusName: this.claimStatusMap[claim.ClaimStatusId] || 'Unknown'
          }));
        }
        this.userDetails = data;
      },
      error: (err) => {
        console.error('Failed to load user details:', err);
      },
    });
  }

  loadPolicies(): void {
    if (this.userId) {
      this.authService.getPoliciesByUserId(this.userId).subscribe({
        next: (data) => {
          this.policies = data;
          console.log('Policies loaded:', this.policies);
        },
        error: (err) => {
          console.error('Error loading policies:', err);
        },
      });
    }
  }

  navigateToViewDocument(claimId:any):void {
    console.log("claimid is", claimId);

    this.router.navigate(['/ViewDocument', claimId]);
    
    const filteredClaim = this.claims.filter(claim => claim.ClaimId === claimId);
    console.log("filtered data is", filteredClaim);
    
    if (filteredClaim.length > 0) {
      const claimDocuments = filteredClaim[0].ClaimDocuments;
      console.log("Claim Documents:");
    
      claimDocuments.forEach((doc: { DocName: string; DocFileName: string }) => {
        console.log("DocName:", doc.DocName);
        console.log("DocFileName:", doc.DocFileName);
      });
    } else {
      console.log("No claim found for the given claimId.");
    }
    
    
  }
}