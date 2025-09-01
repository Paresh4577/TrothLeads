import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from '../../../services/message.service';
import { FindPipe } from '../../../shared/pipes/find.pipe';

@Component({
  selector: 'app-hospitals',
  standalone: false,
  templateUrl: './hospitals.component.html',
  styleUrls: ['./hospitals.component.scss'],
})
export class HospitalsComponent implements OnInit {
   canDelete: any;
  canWrite: any;
  canRead: any;
  hospitals: any[] = [];
  paginatedHospitals: any[] = [];
  cashlessFilter: string = 'all';
  companies: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  selectedCompanyId: number | null = null;
  currentHospital: any = {
    HospitalId: null,
    HospitalName: '',
    DisplayName: '',
    HospitalCode: '',
    Logo: '',
    PinCode: '',
    StateId: null,
    CityId: null,
    CityName: '',
    StateName: '',
    CompanyName: '',
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
  successMessage: string = '';
  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  searchHospitalName: string = '';
  searchHospitalCode: string = '';
  searchCompanyName: string = '';
  searchStateName: string = '';
  searchCityName: string = '';
  searchPincode: string = '';
  itemsPerPageOptions: number[] = [];
  noRecord: string = '';

  getSelectedCompanyName(): string {
    if (!this.selectedCompanyId) return 'All Companies';
    const company = this.companies.find(
      (c) => c.CompanyId === this.selectedCompanyId
    );
    return company ? company.CompanyName : 'All Companies';
  }

  constructor(
    private authService: authService,
    private router: Router,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.message.getNoRecordMessage();
    this.loadData();
    this.checkPermissions();
    const message = localStorage.getItem('hospitalMessage');
    if (message) {
      this.successMessage = message;
      localStorage.removeItem('hospitalMessage');
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  checkPermissions() {
    this.canRead = localStorage.getItem('canread') === 'true';
    this.canWrite = localStorage.getItem('canwrite') === 'true';
    this.canDelete = localStorage.getItem('candelete') === 'true';
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadHospitals(this.itemsPerPage, this.selectedCompanyId || 0);
  }

 loadData(): void {
  this.isLoading = true;
  this.errorMessage = '';

  forkJoin({
    companies: this.authService.getCompanies(),
    hospitals: this.getHospitalObservable(
      this.itemsPerPage,
      this.selectedCompanyId || 0,
      this.currentPage
    ),
  }).subscribe({
    next: (result) => {
      // ✅ Filter active companies only
      this.companies = (result.companies || []).filter(
        (c: any) => c.IsActive === 1 || c.IsActive === true
      );

      if (result.hospitals && result.hospitals.data) {
        this.hospitals = result.hospitals.data.map((hospital) => ({
          ...hospital,
          CompanyName:
            this.companies.find((c) => c.CompanyId === hospital.CompanyId)
              ?.CompanyName || '-',
        }));
        console.log('hospital data is ', this.hospitals);

        this.paginatedHospitals = this.hospitals;
        this.totalItems = result.hospitals.totalCount;
        this.generateItemsPerPageOptions();
        this.isLoading = false;
        this.searchHospitals();
      } else {
        this.errorMessage = 'Invalid response format from server';
        this.isLoading = false;
      }
    },
    error: (err) => {
      this.errorMessage = 'Failed to load data. Please try again later.';
      this.isLoading = false;
      console.error('Error loading data:', err);
    },
  });
}

  private getHospitalObservable(
    pageSize: number,
    companyId: number,
    currentPage: number
  ) {
    if (this.cashlessFilter === 'cashless') {
      return this.authService.getHospitalsWithCashless(
        pageSize,
        companyId,
        currentPage
      );
    } else if (this.cashlessFilter === 'withoutCashless') {
      return this.authService.getHospitalsWithoutCashless(
        pageSize,
        companyId,
        currentPage
      );
    } else {
      return this.authService.getHospitals(pageSize, companyId, currentPage);
    }
  }

  navigateToAddHospital(): void {
    this.router.navigate(['/addHospital']);
  }

  onCompanyFilterChange(): void {
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.currentPage = 1;
    this.loadHospitals(this.itemsPerPage, this.selectedCompanyId || 0);
  }

  loadHospitals(
    pagesize: number = this.itemsPerPage,
    companyId: number = 0
  ): void {
    this.isLoading = true;
    this.errorMessage = '';

    const hospitalObservable = this.getHospitalObservable(
      pagesize,
      companyId,
      this.currentPage
    );

    hospitalObservable.subscribe({
      next: (result) => {
        if (result && result.data) {
          this.hospitals = result.data.map((hospital) => ({
            ...hospital,
            CompanyName:
              this.companies.find((c) => c.CompanyId === hospital.CompanyId)
                ?.CompanyName || '-',
          }));
          this.paginatedHospitals = this.hospitals;
          this.totalItems = result.totalCount;
          this.generateItemsPerPageOptions();
          this.isLoading = false;
          this.searchHospitals();
        } else {
          this.errorMessage = 'Invalid response format from server';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage =
          'Failed to load hospital data. Please try again later.';
        this.isLoading = false;
        console.error('Error loading hospitals:', err);
      },
    });
  }

  generateItemsPerPageOptions(): void {
    this.itemsPerPageOptions = [10, 20, 50];
    if (this.totalItems >= 100) this.itemsPerPageOptions.push(100);
    if (this.totalItems >= 500) this.itemsPerPageOptions.push(500);
    if (this.totalItems >= 1000) this.itemsPerPageOptions.push(1000);
    if (this.totalItems > 1000) this.itemsPerPageOptions.push(this.totalItems);
  }

  searchHospitals(): void {
    let filteredHospitals = [...this.hospitals];

    if (this.selectedCompanyId) {
      filteredHospitals = filteredHospitals.filter(
        (hospital) => hospital.CompanyId === this.selectedCompanyId
      );
    }

    if (this.searchHospitalName.trim()) {
      filteredHospitals = filteredHospitals.filter((hospital) =>
        hospital.HospitalName?.toLowerCase().includes(
          this.searchHospitalName.toLowerCase()
        )
      );
    }

    if (this.searchHospitalCode.trim()) {
      filteredHospitals = filteredHospitals.filter((hospital) =>
        hospital.HospitalCode?.toLowerCase().includes(
          this.searchHospitalCode.toLowerCase()
        )
      );
    }

    if (this.searchCompanyName.trim()) {
      filteredHospitals = filteredHospitals.filter((hospital) =>
        hospital.CompanyName?.toLowerCase().includes(
          this.searchCompanyName.toLowerCase()
        )
      );
    }

    if (this.searchCityName.trim()) {
      filteredHospitals = filteredHospitals.filter((hospital) =>
        hospital.CityName?.toLowerCase().includes(
          this.searchCityName.toLowerCase()
        )
      );
    }

    if (this.searchStateName.trim()) {
      filteredHospitals = filteredHospitals.filter((hospital) =>
        hospital.StateName?.toLowerCase().includes(
          this.searchStateName.toLowerCase()
        )
      );
    }

    if (this.searchPincode.trim()) {
      filteredHospitals = filteredHospitals.filter((hospital) =>
        hospital.Pincode?.toLowerCase().includes(
          this.searchPincode.toLowerCase()
        )
      );
    }

    this.paginatedHospitals = filteredHospitals;
  }

  editHospital(hospitalId: number): void {
    console.log('Id is ', hospitalId);
    const hospital = this.hospitals.find((h) => h.HospitalId === hospitalId);
    console.log('hospital ', hospital);
    if (hospital) {
      console.log('Inside If ');
      this.router.navigate(['/addHospital', hospitalId]);
    }
  }

  deleteHospital(hospitalId: number): void {
    if (confirm('Are you sure you want to delete this hospital?')) {
      this.authService.deleteHospital(hospitalId).subscribe({
        next: () => this.loadHospitals(),
        error: (err) => this.handleError('Failed to delete hospital', err),
      });
    }
  }

  onCashlessFilterChange(): void {
    this.currentPage = 1;
    this.loadHospitals(this.itemsPerPage, this.selectedCompanyId || 0);
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const tdElement = imgElement.parentElement;
    if (tdElement) {
      tdElement.innerHTML = '<span class="text-gray-500">-</span>';
    }
  }

  onItemsPerPageChange(value: any): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadHospitals(this.itemsPerPage, this.selectedCompanyId || 0);
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
