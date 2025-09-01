import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-claims',
  standalone: false,
  templateUrl: './claims.component.html',
  styleUrl: './claims.component.scss',
})
export class ClaimsComponent {
  claims: any[] = []; // Full list of claims from the service
  paginatedClaims: any[] = []; // Filtered and paginated list for display
  employees: any[] = [];
  currentClaim: any = {
    ClaimId: null,
    FullName: '',
    PhoneNumber: '',
    Email: '',
    SelectProduct: '',
    PolicyNo: null,
  };

  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;

  searchPolicyNo: string = '';
  searchUserName: string = '';
  searchCustomerName: string = '';
  noRecordMessage: string = 'No Record found.';
  searchClaimNumber: string = '';
  searchCustomerNumber: string = '';
  searchEmail: string = '';
  searchProductName: string = '';
  searchInsuranceCompany: string = '';
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Search variables
  searchClaimId: string = '';
  searchFullName: string = '';
  searchPhoneno: string = '';
  searchPolicyno: string = '';
  showAddButton: boolean = false;
  constructor(
    private authService: authService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
     const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const masterPermission = permissions.find((p: any) => p.ModuleName === 'master');
    this.showAddButton = masterPermission?.CanWrite === true;

    this.noRecordMessage = this.messageService.getNoRecordMessage();
    this.loadEmployees();
    this.loadClaims();
     
  }
  
  loadEmployees(): void {
    this.authService.getEmployees().subscribe({
      next: (data) => {
        console.log("Data is ", data);
        this.employees = data;
      },
    
      error: (err) => {
        console.error('Failed to load employees:', err);
      }
      
    })
    console.log("Employee is ",this.employees)
  }


  loadClaims(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getClaims().subscribe({
      next: (data) => {
        console.log('claim data is ', data);
        
        this.claims = data;
        this.totalItems = data.length;
        this.isLoading = false;
        this.searchClaims(); // Apply search and pagination after loading
      },
      error: (err) => {
        this.errorMessage = 'Failed to load claims. Please try again later.';
        this.isLoading = false;
        console.error('Error loading claims:', err);
      },
    });
  }

  searchClaims(): void {
    let filteredClaims = this.claims;

    if (this.searchPolicyNo) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.PolicyNo?.toLowerCase().includes(this.searchPolicyNo.toLowerCase())
      );
    }

    if (this.searchUserName) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.UserName?.toLowerCase().includes(this.searchUserName.toLowerCase())
      );
    }

    if (this.searchCustomerName) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.FullName?.toLowerCase().includes(this.searchCustomerName.toLowerCase())
      );
    }

    if (this.searchClaimNumber) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.ClaimIdNumber?.toLowerCase().includes(this.searchClaimNumber.toLowerCase())
      );
    }

    if (this.searchInsuranceCompany) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.InsuranceCompanyName?.toLowerCase().includes(this.searchInsuranceCompany.toLowerCase())
      );
    }

    this.totalItems = filteredClaims.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.paginatedClaims = filteredClaims.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage
    );
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentClaim = {
      ClaimId: null,
      FullName: '',
      PhoneNumber: '',
      Email: '',
      SelectProduct: '',
      PolicyNo: null,
    };
  }

  editClaim(claimId: number): void {
    const claim = this.claims.find((c) => c.ClaimId === claimId);
    if (claim) {
      console.log('claim is', claim);
      this.router.navigate(['/addClaim', claimId]);
    }
  }

 
   
  navigateToAddProductForm():void {
    this.router.navigate(['/ProductCards']);

  }

  navigateToAddClaim():void {
    this.router.navigate(['/addClaim']);

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

  submitClaim(): void {
    if (this.isEditing) {
      this.authService
        .updateClaim(this.currentClaim.ClaimId, this.currentClaim)
        .subscribe({
          next: () => {
            this.loadClaims();
            this.showForm = false;
          },
          error: (err) => this.handleError('Failed to update claim', err),
        });
    } else {
      this.authService.createClaim(this.currentClaim).subscribe({
        next: () => {
          this.loadClaims();
          this.showForm = false;
        },
        error: (err) => this.handleError('Failed to create claim', err),
      });
    }
  }

  deleteClaim(claimId: number): void {
    if (confirm('Are you sure you want to delete this claim?')) {
      this.authService.deleteClaim(claimId).subscribe({
        next: () => this.loadClaims(),
        error: (err) => this.handleError('Failed to delete claim', err),
      });
    }
  }
  

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1; // Reset to first page
      this.searchClaims();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchClaims();
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000); // Clear error after 3 seconds
  }


  showPdf(id:any)
  {
    console.log("pdf called", id);
    const filteredClaim = this.claims.filter(claim => claim.ClaimId === id);
    console.log("filter data is ", filteredClaim)
   const data = filteredClaim[0].ClaimDocuments[0].DocFileName;
     if (filteredClaim.length > 0 && filteredClaim[0].ClaimDocuments.length > 0) {
    const pdfPath = filteredClaim[0].ClaimDocuments[0].DocFileName;
    window.open(pdfPath, '_blank');
  } else {
    console.log("PDF not found for claim ID:", id);
  }
  }
}
