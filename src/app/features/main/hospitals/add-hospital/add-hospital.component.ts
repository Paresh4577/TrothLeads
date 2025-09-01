import { Component, OnInit } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-hospital',
  standalone: false,
  templateUrl: './add-hospital.component.html',
  styleUrls: ['./add-hospital.component.scss'],
})
export class AddHospitalComponent implements OnInit {
  currentHospital: any = {
    HospitalId: null,
    CompanyId: null, // Added CompanyId
    HospitalName: '',
    DisplayName: '',
    HospitalCode: '',
    Logo: '',
    PinCode: '', // Updated to match HTML
    StateId: null,
    CityId: null,
    StateName: '',
    CityName: '',
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

  companies: any[] = [];
  states: any[] = [];
  allCities: any[] = [];
  filteredCities: any[] = [];
  filteredCompnies: any[] = [];
  isEditing: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const hospitalId = Number(params.get('hospitalId')); // Assuming route param is 'hospitalId'
      if (hospitalId) {
        this.isEditing = true;
        this.loadHospitalData(hospitalId);
      }
    });
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin({
      companies: this.authService.getCompanies(),
      states: this.authService.getStateName(0, 0), // Assuming getStateName() returns states
      cities: this.authService.getCityName(0, 0), // Assuming getCityName() returns all cities
    }).subscribe({
      next: (result) => {
        this.companies = result.companies;
        this.states = result.states.data;
        this.allCities = result.cities.data;
        if (this.currentHospital.StateId) {
          this.filterCitiesByState(this.currentHospital.StateId);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load initial data.';
        console.error(err);
      },
    });
  }

  getState(): void {
    this.authService.getStateName(0, 0).subscribe({
      next: (state) => {
        this.states = state.data;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load states.';
        console.error(err);
      },
    });
  }

  getCity(): void {
    this.authService.getCityName(0, 0).subscribe({
      next: (cities) => {
        this.allCities = cities.data;
        if (this.currentHospital.StateId) {
          this.filterCitiesByState(this.currentHospital.StateId);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load cities.';
        console.error(err);
      },
    });
  }

  filterCitiesByState(stateId: any): void {
    const stateIdNum = Number(stateId);
    this.filteredCities = this.allCities.filter(
      (city) => Number(city.StateId) === stateIdNum
    );
    if (this.currentHospital.CityId) {
      const cityExists = this.filteredCities.some(
        (city) => Number(city.CityId) === Number(this.currentHospital.CityId)
      );
      if (!cityExists) {
        this.currentHospital.CityId = null;
      }
    }
  }

  onStateChange(event: any): void {
    const stateId = event.target.value;
    this.currentHospital.StateId = stateId;
    this.currentHospital.CityId = null; // Reset city when state changes
    this.filterCitiesByState(stateId);
  }

  loadHospitalData(hospitalId: number): void {
    this.authService.getHospitalById(hospitalId).subscribe({
      next: (hospital) => {
        this.currentHospital = { ...hospital };
        if (this.currentHospital.StateId && this.allCities.length > 0) {
          this.filterCitiesByState(this.currentHospital.StateId);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load hospital data.';
        console.error(err);
        this.router.navigate(['/hospitals']);
      },
    });
  }

  submitHospital(): void {
    console.log('Hospital data is ', this.currentHospital);
    console.log('isEditing is ', this.isEditing);
    // Validate required fields
    if (
      !this.currentHospital.CompanyId ||
      !this.currentHospital.HospitalName ||
      !this.currentHospital.StateId ||
      !this.currentHospital.CityId
    ) {
      console.log('returned');
      this.errorMessage =
        'Please fill in all required fields (Company, Hospital Name, State, City).';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    // Set StateName and CityName
    const selectedState = this.states.find(
      (state) => Number(state.StateId) === Number(this.currentHospital.StateId)
    );
    const selectedCity = this.filteredCities.find(
      (city) => Number(city.CityId) === Number(this.currentHospital.CityId)
    );
    console.log('selected city ', selectedCity);
    const selectedCompany = this.filteredCompnies.find(
      (company) =>
        Number(company.CompanyId) === Number(this.currentHospital.CompanyId)
    );
    this.currentHospital.StateName = selectedState
      ? selectedState.StateName
      : '';
    this.currentHospital.CityName = selectedCity ? selectedCity.CityName : '';
    this.currentHospital.CompanyName = selectedCompany
      ? selectedCompany.CompanyName
      : '';
    console.log('Company Id is ', selectedCompany);

    if (this.isEditing == true) {
      console.log('isEditing is ', this.isEditing);
      console.log('Hospital Id is ', this.currentHospital.HospitalId);
      this.currentHospital.DateUpdated = new Date();
      this.currentHospital.UpdatedBy =
        this.authService.getCurrentUser() || 'admin';
      this.authService
        .updateHospital(this.currentHospital.HospitalId, this.currentHospital)
        .subscribe({
          next: () => {
            console.log('Hospital updated successfully!');
            localStorage.setItem(
              'hospitalMessage',
              'Hospital updated successfully!'
            );
            this.router.navigate(['/hospitals']);
          },
          error: (err) => {
            this.errorMessage = 'Failed to update hospital.';
            console.error(err);
            setTimeout(() => (this.errorMessage = ''), 3000);
          },
        });
    } else {
      this.currentHospital.DateCreated = new Date();
      this.currentHospital.CreatedBy =
        this.authService.getCurrentUser() || 'admin';
      this.authService.createHospital(this.currentHospital).subscribe({
        next: () => {
          localStorage.setItem(
            'hospitalMessage',
            'Hospital added successfully!'
          );
          this.router.navigate(['/hospitals']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create hospital.';
          console.error(err);
          setTimeout(() => (this.errorMessage = ''), 3000);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/hospitals']);
  }
}
