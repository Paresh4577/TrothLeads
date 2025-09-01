import { Component, OnInit } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-garage',
  standalone: false,
  templateUrl: './add-garage.component.html',
  styleUrl: './add-garage.component.scss',
})
export class AddGarageComponent implements OnInit {
  currentGarage: any = {
    GarageId: null,
    GarageName: '',
    GarageCode: '',
    Logo: '',
    StateId: null,
    CityId: null,
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
  states: any[] = [];
  allCities: any[] = []; // सभी शहरों का मास्टर डेटा
  filteredCities: any[] = []; // फिल्टर किए हुए शहर
  isEditing: boolean = false;

  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const garageId = Number(params.get('garageId'));
      if (garageId) {
        this.loadGarageData(garageId);
        this.isEditing = true;
      } else {
        console.warn('No garageId found in the route.');
      }
    });
    this.getState();
    this.getCity();
    this.loadInitialData();
  }
  getState(): void {
    this.authService.getStateName('', '').subscribe({
      next: (state) => {
        console.log('state is ', state);
        this.states = state.data;
      },
      error: (err) => {
        console.error('Failed to load states:', err);
      },
    });
  }

  getCity(): void {
    this.authService.getCityName(0, 0).subscribe({
      next: (cities) => {
        console.log('cities are ', cities);
        this.allCities = cities.data;

        if (this.currentGarage.StateId) {
          this.filterCitiesByState(this.currentGarage.StateId);
        } else {
          this.filteredCities = [];
        }
      },
      error: (err) => {
        console.error('Failed to load cities:', err);
      },
    });
  }
  loadInitialData(): void {
    forkJoin({
      states: this.authService.getStateName(0, 0), // Assuming getStateName() returns states
      cities: this.authService.getCityName(0, 0), // Assuming getCityName() returns all cities
    }).subscribe({
      next: (result) => {
        this.states = result.states.data;
        this.allCities = result.cities.data;
        if (this.currentGarage.StateId) {
          this.filterCitiesByState(this.currentGarage.StateId);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  filterCitiesByState(stateId: any): void {
    console.log('Filtering cities for StateId:', stateId);
    // Make sure stateId is a number for comparison
    const stateIdNum = Number(stateId);

    // Filter cities where StateId matches the selected state
    this.filteredCities = this.allCities.filter((city) => {
      // Ensure city.StateId is also converted to number for comparison
      return Number(city.StateId) === stateIdNum;
    });

    console.log('Filtered cities:', this.filteredCities);

    if (this.currentGarage.CityId) {
      const cityExists = this.filteredCities.some(
        (city) => Number(city.CityId) === Number(this.currentGarage.CityId)
      );
      if (!cityExists) {
        this.currentGarage.CityId = null;
      }
    }
  }

  onStateChange(event: any): void {
    console.log('State changed to:', event.target.value);
    const stateId = event.target.value;
    this.currentGarage.StateId = stateId;
    this.currentGarage.CityId = null;
    this.filterCitiesByState(stateId);
  }

  loadGarageData(garageId: number): void {
    this.authService.getGarageById(garageId).subscribe({
      next: (garage) => {
        console.log('Fetched Garage Data:', garage);
        if (garage) {
          this.currentGarage = { ...garage }; // Assign the fetched garage data
          console.log('Garage Name:', this.currentGarage.GarageName);

          if (this.currentGarage.StateId && this.allCities.length > 0) {
            this.filterCitiesByState(this.currentGarage.StateId);
          }
        } else {
          console.warn('No garage data found for ID:', garageId);
          this.router.navigate(['garages']);
        }
      },
      error: (err) => {
        console.error('Failed to load garage:', err);
        this.router.navigate(['garages']);
      },
    });
  }

  submitGarage(): void {
    if (this.isEditing) {
      this.currentGarage.DateUpdated = new Date();
      this.currentGarage.UpdatedBy =
        this.authService.getCurrentUser() || 'admin';
      this.authService
        .updateGarage(this.currentGarage.GarageId, this.currentGarage)
        .subscribe({
          next: () => {
            localStorage.setItem(
              'garageMessage',
              'Garage updated successfully!'
            );
            this.router.navigate(['app/garages']);
          },
          error: (err) => {
            console.error('Failed to update garage:', err);
          },
        });
    } else {
      this.currentGarage.DateCreated = new Date();
      this.currentGarage.CreatedBy =
        this.authService.getCurrentUser() || 'admin';
      this.authService.createGarage(this.currentGarage).subscribe({
        next: () => {
          localStorage.setItem('garageMessage', 'Garage added successfully!');
          this.router.navigate(['app/garages']);
        },
        error: (err) => {
          console.error('Failed to create garage:', err);
        },
      });
    }
  }
  cancel(): void {
    this.router.navigate(['garages']);
  }
}
