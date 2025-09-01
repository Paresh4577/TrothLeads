import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { forkJoin } from 'rxjs';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-city',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './city.component.html',
  styleUrl: './city.component.scss',
})
export class CityComponent implements OnInit {
  cities: any[] = [];
  paginatedCities: any[] = [];
  states: any[] = [];
  currentCity: any = {
    CityId: null,
    CityName: '',
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
  noRecord: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  itemsPerPageOptions: number[] = [10, 25, 50, 100];

  // Search variables
  searchCityName: string = '';
  searchStateName: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.message.getNoRecordMessage();
    this.loadCities();
  }
  loadCities(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getCityName(this.itemsPerPage, 0).subscribe({
      next: (data) => {
        this.cities = data.data;
        this.totalItems = data.totalCount;
        this.generateItemsPerPageOptions();
        this.isLoading = false;
        this.searchCities();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load data. Please try again later.';
        this.isLoading = false;
        console.error('Error loading data:', err);
      },
    });
  }
  searchCities(): void {
    let filteredCities = [...this.cities];

    if (this.searchCityName.trim()) {
      filteredCities = filteredCities.filter((city) =>
        city.CityName?.toLowerCase().includes(this.searchCityName.toLowerCase())
      );
    }

    this.totalItems = filteredCities.length; // Update total items after filtering
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCities = filteredCities.slice(startIndex, endIndex);
  }

  navigateToAddCity(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentCity = {
      CityId: null,
      CityName: '',
      StateId: null,
      StateName: '',
      IsActive: true,
      DateCreated: null,
      CreatedBy: this.authService.getCurrentUser() || 'admin',
      DateUpdated: null,
      UpdatedBy: '',
    };
  }

  editCity(cityId: number): void {
    const city = this.cities.find((c) => c.CityId === cityId);
    if (city) {
      this.currentCity = {
        ...city,
        DateUpdated: new Date(),
        UpdatedBy: this.authService.getCurrentUser() || 'admin',
      };
      this.showForm = true;
      this.isEditing = true;
    }
  }

  generateItemsPerPageOptions(): void {
    this.itemsPerPageOptions = [10, 20, 50, 100, 500];

    // ✅ Add totalItems dynamically if not already in options
    if (!this.itemsPerPageOptions.includes(this.totalItems)) {
      this.itemsPerPageOptions.push(this.totalItems);
    }
  }

  onItemsPerPageChange(value: any): void {
    console.log('Selected items per page:', value); // ✅ Debugging point
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loadCities();
  }
  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
}
