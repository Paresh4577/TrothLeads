import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss',
})
export class CompaniesComponent implements OnInit {
  companies: any[] = []; // Full list of companies from the service
  paginatedCompanies: any[] = []; // Filtered and paginated list for display
  currentCompany: any = {
    CompanyId: null,
    CompanyName: '',
    DisplayName: '',
    CompanyURL: '',
    CompanyCode: '',
    RegistrationNumber: '',
    Logo: '',
    Address: '',
    Email: '',
    Contact: '',
    ContactPerson: '',
    Description: '',
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
  itemsPerPageOptions: number[] = [5, 10, 25, 50];

  // Search variables
  searchCompanyName: string = '';
  searchCompanyCode: string = '';
  searchDisplaName: string = '';
  searchCompanyUrl: string = '';
  searchRegistrationUrl: string = '';
  searchAddress: string = '';
  searchEmail: string = '';
  searchContact: string = '';
  searchContactPerson: string = '';
  searchDescription: string = '';
  successMessage: string = '';
 showAddButton: boolean = false;
  constructor(private authService: authService, private router: Router) {}

  ngOnInit(): void {
    
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const masterPermission = permissions.find((p: any) => p.ModuleName === 'master');
    this.showAddButton = masterPermission?.CanWrite === true;
    console.log("btn is ",this.showAddButton)
    console.log("inside commapnies ", masterPermission);
    this.loadCompanies();
    const message = localStorage.getItem('companyMessage');
    console.log('message is ', message);
    if (message) {
      this.successMessage = message;
      localStorage.removeItem('companyMessage'); // Clear the message
      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  navigateToAddCompany(): void {
    this.router.navigate(['addCompany']);
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
        this.totalItems = this.companies.length;
        this.generateItemsPerPageOptions(this.totalItems);
        this.isLoading = false;
        this.searchCompanies();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load companies. Please try again later.';
        this.isLoading = false;
        console.error('Error loading companies:', err);
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

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1; // Reset to first page
    this.searchCompanies();
  }

  searchCompanies(): void {
    let filteredCompanies = [...this.companies]; // Create a copy to avoid mutating original data

    // Filter by Company Name
    if (this.searchCompanyName.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.CompanyName?.toLowerCase().includes(
          this.searchCompanyName.toLowerCase()
        )
      );
    }

    // Filter by Company Code
    if (this.searchCompanyCode.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.CompanyCode?.toLowerCase().includes(
          this.searchCompanyCode.toLowerCase()
        )
      );
    }
    if (this.searchDisplaName.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.DisplayName?.toLowerCase().includes(
          this.searchDisplaName.toLowerCase()
        )
      );
    }
    if (this.searchCompanyUrl.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.CompanyURL?.toLowerCase().includes(
          this.searchCompanyUrl.toLowerCase()
        )
      );
    }
    if (this.searchRegistrationUrl.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.RegistrationNumber?.toLowerCase().includes(
          this.searchRegistrationUrl.toLowerCase()
        )
      );
    }
    if (this.searchAddress.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.Address?.toLowerCase().includes(
          this.searchAddress.toLowerCase()
        )
      );
    }
    if (this.searchEmail.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.Email?.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }
    if (this.searchContact.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.Contact?.toLowerCase().includes(
          this.searchContact.toLowerCase()
        )
      );
    }
    if (this.searchContactPerson.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.ContactPerson?.toLowerCase().includes(
          this.searchContactPerson.toLowerCase()
        )
      );
    }
    if (this.searchDescription.trim()) {
      filteredCompanies = filteredCompanies.filter((company) =>
        company.Description?.toLowerCase().includes(
          this.searchDescription.toLowerCase()
        )
      );
    }

    // Update total items after filtering
    this.totalItems = filteredCompanies.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentCompany = {
      CompanyId: null,
      CompanyName: '',
      DisplayName: '',
      CompanyURL: '',
      CompanyCode: '',
      RegistrationNumber: '',
      Logo: '',
      Address: '',
      Email: '',
      Contact: '',
      ContactPerson: '',
      Description: '',
      IsActive: true,
      DateCreated: null, // Will be set on submit
      CreatedBy: this.authService.getCurrentUser() || 'admin', // Assuming authService has getCurrentUser
      DateUpdated: null,
      UpdatedBy: '',
    };
  }

  editCompany(companyId: number): void {
    console.log('Id is ', companyId);
    // Fetch the specific hospital data
    const company = this.companies.find((c) => c.CompanyId === companyId);
    console.log('company ', company);
    if (company) {
      console.log('Inside If ');
      // Navigate with the hospital data (optional, using state)
      this.router.navigate(['addCompany', companyId]);
    }
  }

  submitCompany(): void {
    this.currentCompany.DateCreated = this.isEditing
      ? this.currentCompany.DateCreated
      : new Date();
    this.currentCompany.CreatedBy = this.isEditing
      ? this.currentCompany.CreatedBy
      : this.authService.getCurrentUser() || 'admin';

    if (this.isEditing) {
      this.authService.updateCompany(this.currentCompany).subscribe({
        next: () => {
          this.loadCompanies();
          this.showForm = false;
        },
        error: (err) => this.handleError('Failed to update company', err),
      });
    } else {
      this.authService.createCompany(this.currentCompany).subscribe({
        next: () => {
          this.loadCompanies();
          this.showForm = false;
        },
        error: (err) => this.handleError('Failed to create company', err),
      });
    }
  }

  deleteCompany(companyId: number): void {
    if (confirm('Are you sure you want to delete this company?')) {
      this.authService.deleteCompany(companyId).subscribe({
        next: () => this.loadCompanies(),
        error: (err) => this.handleError('Failed to delete company', err),
      });
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const tdElement = imgElement.parentElement;
    if (tdElement) {
      tdElement.innerHTML = '<span class="text-gray-500">-</span>';
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000); // Clear error after 3 seconds
  }
}
