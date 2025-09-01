import { Component, OnInit } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { PaginationComponent } from '../../../components/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vehicle, VehicleApiResponse } from '../../../models/vehicle.model';
import { VehiclesRoutingModule } from './vehicles-routing.module';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, PaginationComponent, FormsModule, VehiclesRoutingModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  vehicles: Vehicle[] = [];
  paginatedVehicles: Vehicle[] = [];
  currentVehicle: Vehicle = {
    UserVehicleId: 0,
    VehicleNo: '',
    OwnerName: '',
    IsActive: true
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

  searchVehicleName: string = '';
  noRecord: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private messageservice: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.messageservice.getNoRecordMessage();
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Fetching vehicles data...');
    this.authService.getVehicles().subscribe({
      next: (response: VehicleApiResponse) => {
        console.log('Raw API response:', response);
        
        if (response && response.responseData) {
          try {
            // Parse the responseData string into an array
            this.vehicles = JSON.parse(response.responseData);
            console.log('Parsed vehicles data:', this.vehicles);
            
            // Update total count from API response
            this.totalItems = response.totalCount || this.vehicles.length;
            console.log('Total vehicles:', this.totalItems);
            
            this.generateItemsPerPageOptions(this.totalItems);
            this.isLoading = false;
            this.searchVehicles();
          } catch (error) {
            console.error('Error parsing vehicles data:', error);
            this.errorMessage = 'Error processing vehicle data';
            this.isLoading = false;
          }
        } else {
          console.error('Invalid response format:', response);
          this.errorMessage = 'Invalid data format received';
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load vehicles. Please try again later.';
        this.isLoading = false;
        console.error('Error loading vehicles:', err);
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
    this.searchVehicles();
  }

  searchVehicles(): void {
    let filteredVehicles = [...this.vehicles];

    if (this.searchVehicleName.trim()) {
      filteredVehicles = filteredVehicles.filter((vehicle) =>
        vehicle.OwnerName?.toLowerCase().includes(this.searchVehicleName.toLowerCase())
      );
      console.log('Filtered vehicles by owner name:', filteredVehicles);
    }

    this.totalItems = filteredVehicles.length;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
    console.log('Paginated vehicles:', this.paginatedVehicles);
  }

  showVehicleDetails(vehicleNo: string): void {
    console.log('Showing vehicle details for:', vehicleNo);
    this.router.navigate(['show-vehicles', vehicleNo]);
  }

  // editVehicle(vehicleId: number): void {
  //   console.log('Editing vehicle with ID:', vehicleId);
  //   const vehicle = this.vehicles.find((v) => v.UserVehicleId === vehicleId);
  //   if (vehicle) {
  //     console.log('Found vehicle to edit:', vehicle);
  //     this.currentVehicle = { ...vehicle };
  //     this.showForm = true;
  //     this.isEditing = true;
  //   }
  // }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }
} 