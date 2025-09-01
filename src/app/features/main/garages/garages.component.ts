import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanWriteDirective } from '../../../directives/can-write.directive';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-garages',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, CanWriteDirective],
  templateUrl: './garages.component.html',
  styleUrls: ['./garages.component.scss'],
})
export class GaragesComponent implements OnInit {
  showAddButton: boolean = false;
  isLoading = true;
  errorMessage = '';
  successMessage: string = '';
  showForm = false;
  isEditing = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions: number[] = [5, 10, 25, 50];
  selectedCompanyId: number | null = null;
  companies: { CompanyId: number; CompanyName: string }[] = [];
  garages: any[] = [];
  paginatedGarages: any[] = [];
  searchGarageName: string = '';
  searchGarageCode: string = '';
  searchState: string = '';
  searchCity: string = '';
  searchAddress: string = '';
  searchPincode: string = '';
  searchEmail: string = '';
  searchContact: string = '';
  searchContactPerson: string = '';
  searchDescription: string = '';
  noRecord: string = '';

  constructor(
    private authService: authService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.message.getNoRecordMessage();
    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const masterPermission = permissions.find((p: any) => p.ModuleName === 'master');
    this.showAddButton = masterPermission?.CanWrite === true;
    
    // Load companies and garages
    this.loadData();

    // Check for success message in localStorage
    const message = localStorage.getItem('garageMessage');
    if (message) {
      this.successMessage = message;
      localStorage.removeItem('garageMessage');
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      companies: this.authService.getCompanies(),
      garages: this.authService.getGarages(this.itemsPerPage, this.selectedCompanyId || null, this.currentPage),
    }).subscribe({
      next: (result) => {
        this.companies = result.companies;

        if (result.garages && result.garages.data) {
          this.garages = result.garages.data.map((garage) => ({
            ...garage,
            logoError: false,
            GarageId: garage.GarageId || '',
            ABSCode: garage.ABSCode || '',
            ABSCodeCreateDate: garage.ABSCodeCreateDate || '',
            LocationPreference: garage.LocationPreference || '',
            WorkshopName: garage.WorkshopName || '',
            Correction: garage.Correction || '',
            WorkshopAddress: garage.WorkshopAddress || '',
            Pincode: garage.Pincode || '',
            Lat: garage.Lat || '',
            Long: garage.Long || '',
            WorkshopType: garage.WorkshopType || '',
            BodyshopInchargeName: garage.BodyshopInchargeName || '',
            BodyShopManagerEmailId: garage.BodyShopManagerEmailId || '',
            BodyshopManagerContactNo: garage.BodyshopManagerContactNo || '',
            PAN: garage.PAN || '',
            GSTN: garage.GSTN || '',
            MSME: garage.MSME || '',
            MSMECertificateNumber: garage.MSMECertificateNumber || '',
            DocumentsAvailable: garage.DocumentsAvailable || '',
            MonthCreated: garage.MonthCreated || '',
            Coordinator: garage.Coordinator || '',
            NetworkNonNetwork: garage.NetworkNonNetwork || '',
            CompanyId: garage.CompanyId || '',
            CompanyName:
              this.companies.find((c) => c.CompanyId === garage.CompanyId)?.CompanyName || '-',
            IsActive: garage.IsActive || false,
            IsCashless: garage.IsCashless || false,
            DateCreated: garage.DateCreated || '',
            CreatedBy: garage.CreatedBy || '',
            DateUpdated: garage.DateUpdated || '',
            UpdatedBy: garage.UpdatedBy || '',
            StateName: garage.StateName || '',
            CityName: garage.CityName || '',
            MakerCompanyName: garage.MakerCompanyName || '',
            WheelType: garage.WheelType || '',
            ZoneName: garage.ZoneName || '',
          }));

          this.paginatedGarages = this.garages;
          this.totalItems = result.garages.totalCount;
          this.generateItemsPerPageOptions();
          this.searchGarages();
        } else {
          this.errorMessage = 'Invalid data received from server';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Failed to load data: ${err.message || 'Unknown error'}`;
        console.error('Error loading data:', err);
        this.isLoading = false;
      },
    });
  }

  loadCompanies(): void {
    this.authService.getCompanies().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (err) => {
        this.errorMessage = `Failed to load companies: ${err.message || 'Unknown error'}`;
        console.error('Error loading companies:', err);
      },
    });
  }

  onCompanyFilterChange(): void {
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.currentPage = 1;
    this.loadGarages();
  }

  loadGarages(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.garages = [];

    this.authService.getGarages(this.itemsPerPage, this.selectedCompanyId || null, this.currentPage).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.garages = response.data.map((garage) => ({
            ...garage,
            logoError: false,
            GarageId: garage.GarageId || '',
            ABSCode: garage.ABSCode || '',
            ABSCodeCreateDate: garage.ABSCodeCreateDate || '',
            LocationPreference: garage.LocationPreference || '',
            WorkshopName: garage.WorkshopName || '',
            Correction: garage.Correction || '',
            WorkshopAddress: garage.WorkshopAddress || '',
            Pincode: garage.Pincode || '',
            Lat: garage.Lat || '',
            Long: garage.Long || '',
            WorkshopType: garage.WorkshopType || '',
            BodyshopInchargeName: garage.BodyshopInchargeName || '',
            BodyShopManagerEmailId: garage.BodyShopManagerEmailId || '',
            BodyshopManagerContactNo: garage.BodyshopManagerContactNo || '',
            PAN: garage.PAN || '',
            GSTN: garage.GSTN || '',
            MSME: garage.MSME || '',
            MSMECertificateNumber: garage.MSMECertificateNumber || '',
            DocumentsAvailable: garage.DocumentsAvailable || '',
            MonthCreated: garage.MonthCreated || '',
            Coordinator: garage.Coordinator || '',
            NetworkNonNetwork: garage.NetworkNonNetwork || '',
            CompanyId: garage.CompanyId || '',
            CompanyName:
              this.companies.find((c) => c.CompanyId === garage.CompanyId)?.CompanyName || '-',
            IsActive: garage.IsActive || false,
            IsCashless: garage.IsCashless || false,
            DateCreated: garage.DateCreated || '',
            CreatedBy: garage.CreatedBy || '',
            DateUpdated: garage.DateUpdated || '',
            UpdatedBy: garage.UpdatedBy || '',
            StateName: garage.StateName || '',
            CityName: garage.CityName || '',
            MakerCompanyName: garage.MakerCompanyName || '',
            WheelType: garage.WheelType || '',
            ZoneName: garage.ZoneName || '',
          }));

          this.paginatedGarages = this.garages;
          this.totalItems = response.totalCount;
          this.generateItemsPerPageOptions();
          this.searchGarages();
        } else {
          this.errorMessage = 'Invalid data received from server';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = `Failed to load garages: ${err.message || 'Unknown error'}`;
        console.error('Error loading garages:', err);
        this.isLoading = false;
      },
    });
  }

  generateItemsPerPageOptions(): void {
    this.itemsPerPageOptions = [5, 10, 25, 50];
    if (this.totalItems >= 100) this.itemsPerPageOptions.push(100);
    if (this.totalItems >= 500) this.itemsPerPageOptions.push(500);
    if (this.totalItems >= 1000) this.itemsPerPageOptions.push(1000);
    if (this.totalItems > 1000) this.itemsPerPageOptions.push(this.totalItems);
  }

  searchGarages(): void {
    let filteredGarages = [...this.garages];

    if (this.selectedCompanyId) {
      filteredGarages = filteredGarages.filter(
        (garage) => garage.CompanyId === this.selectedCompanyId
      );
    }

    if (this.searchGarageName.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.WorkshopName?.toLowerCase().includes(
          this.searchGarageName.toLowerCase()
        )
      );
    }

    if (this.searchGarageCode.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.ABSCode?.toLowerCase().includes(
          this.searchGarageCode.toLowerCase()
        )
      );
    }

    if (this.searchState.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.StateName?.toLowerCase().includes(
          this.searchState.toLowerCase()
        )
      );
    }

    if (this.searchCity.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.CityName?.toLowerCase().includes(
          this.searchCity.toLowerCase()
        )
      );
    }

    if (this.searchAddress.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.WorkshopAddress?.toLowerCase().includes(
          this.searchAddress.toLowerCase()
        )
      );
    }

    if (this.searchPincode.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.Pincode?.toLowerCase().includes(
          this.searchPincode.toLowerCase()
        )
      );
    }

    if (this.searchEmail.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.BodyShopManagerEmailId?.toLowerCase().includes(
          this.searchEmail.toLowerCase()
        )
      );
    }

    if (this.searchContact.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.BodyshopManagerContactNo?.toLowerCase().includes(
          this.searchContact.toLowerCase()
        )
      );
    }

    if (this.searchContactPerson.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.BodyshopInchargeName?.toLowerCase().includes(
          this.searchContactPerson.toLowerCase()
        )
      );
    }

    if (this.searchDescription.trim()) {
      filteredGarages = filteredGarages.filter((garage) =>
        garage.Description?.toLowerCase().includes(
          this.searchDescription.toLowerCase()
        )
      );
    }

    this.totalItems = filteredGarages.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedGarages = filteredGarages.slice(startIndex, endIndex);
  }

  editGarage(garageId: number): void {
    console.log('Id is ', garageId);
    const garage = this.garages.find((g) => g.GarageId === garageId);
    console.log('garage ', garage);
    if (garage) {
      this.router.navigate(['/addGarage', garageId], { state: { garage } });
    }
  }

  deleteGarage(garageId: number): void {
    if (confirm('Are you sure you want to delete this garage?')) {
      this.authService.deleteGarage(garageId).subscribe({
        next: () => this.loadGarages(),
        error: (err) => this.handleError('Failed to delete garage', err),
      });
    }
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  handleImageError(event: Event, garage: any): void {
    console.error(
      `Failed to load image for ${garage.WorkshopName}: ${garage.Logo}`
    );
    garage.logoError = true;
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const tdElement = imgElement.parentElement;
    if (tdElement) {
      tdElement.innerHTML = '<span class="text-gray-500">-</span>';
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadGarages();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadGarages();
  }

  private handleError(message: string, error: any): void {
    const errorDetails =
      error.error && error.error.errors
        ? JSON.stringify(error.error.errors)
        : error.message || 'Unknown error';
    this.errorMessage = `${message}: ${errorDetails}`;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  navigateToAddGarage(): void {
    this.router.navigate(['addGarage']);
  }

  getSelectedCompanyName(): string {
    if (!this.selectedCompanyId) return 'All Companies';
    const company = this.companies.find(
      (c) => c.CompanyId === this.selectedCompanyId
    );
    return company ? company.CompanyName : 'All Companies';
  }
}