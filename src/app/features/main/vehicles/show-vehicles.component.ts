import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle, VehicleApiResponse } from '../../../models/vehicle.model';
import { authService } from '../../auth/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-show-vehicles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-vehicles.component.html',
  styleUrls: ['./show-vehicles.component.scss']
})
export class ShowVehiclesComponent implements OnInit {
  vehicleNo?: string;
  vehicle?: any;
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: authService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Fetch vehicleNo from the route
    this.route.paramMap.subscribe(params => {
      this.vehicleNo = params.get('vehicleNo') ?? '';
      console.log('Vehicle number from route:', this.vehicleNo);

      if (this.vehicleNo) {
        this.loadVehicleDetails(this.vehicleNo);
      } else {
        this.errorMessage = 'Vehicle number is missing';
        this.isLoading = false;
      }
    });
  }

  loadVehicleDetails(vehicleNo: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.vehicle = undefined;

    this.authService.getvehicleByNo(vehicleNo).subscribe({
      next: (response: VehicleApiResponse) => {
        console.log('Raw API response:', response);
        if (response?.responseData) {
          try {
            const vehicles: Vehicle[] = JSON.parse(response.responseData);
            console.log("vehicle is ",vehicles)
            if (vehicles.length > 0) {
              this.vehicle = vehicles[0];
            } else {
              this.errorMessage = 'No vehicle data found.';
            }
          } catch (error) {
            console.error('Error parsing vehicle data:', error);
            this.errorMessage = 'Invalid vehicle data format.';
          }
        } else {
          this.errorMessage = 'Vehicle not found.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading vehicle:', err);
        this.errorMessage = 'Failed to fetch vehicle details.';
        this.isLoading = false;
      }
    });
  }
}
