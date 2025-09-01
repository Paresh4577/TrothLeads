import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';

@Component({
  selector: 'app-view-documents',
  standalone: false,
  templateUrl: './view-documents.component.html',
  styleUrl: './view-documents.component.scss'
})
export class ViewDocumentsComponent {
  claimId: any;
  claimDetails: any;
  searchText: string = '';
  claimDocuments: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private claimService: authService
  ) { }

  ngOnInit(): void {
    this.claimId = this.route.snapshot.paramMap.get('claimId');
    console.log("newclaimid",this.claimId)
    this.getClaimDetails();
  }

  getClaimDetails(): void {
    this.claimService.getClaimById(this.claimId).subscribe(
      (data) => {
        this.claimDetails = data;
        console.log("claim details is ",this.claimDetails)
        this.claimDocuments = data.ClaimDocuments || [];
      },
      (error) => {
        console.error('Error fetching claim details:', error);
      }
    );
  }

  viewPdf(docFileName: string): void {
    // Implement your PDF viewing logic here
    // This could open a new tab or use a PDF viewer component
    console.log("docfilenme",docFileName)
    window.open(`${docFileName}`, '_blank');
  }

  
  



  goBack(): void {
    this.router.navigate(['/claims-management']);
  }
}
