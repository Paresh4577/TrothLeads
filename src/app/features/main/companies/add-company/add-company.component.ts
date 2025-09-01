import { Component, OnInit } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-company',
  standalone: false,
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss'],
})
export class AddCompanyComponent implements OnInit {
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

  isEditing: boolean = false;

  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get company ID from the route dynamically
    this.route.paramMap.subscribe((params) => {
      const companyId = Number(params.get('companyId')); // Convert to number
      if (companyId) {
        this.isEditing = true;
        this.loadCompanyData(companyId);
      } else {
        console.warn('No companyId found in the route.');
      }
    });
  }

  loadCompanyData(companyId: number): void {
    this.authService.getCompanyById(companyId).subscribe({
      next: (company) => {
        console.log('Fetched Company Data:', company);
        if (company) {
          this.currentCompany = { ...company }; // Assign the fetched company data
          console.log('Company Name:', this.currentCompany.CompanyName);
        } else {
          console.warn('No company data found for ID:', companyId);
          this.router.navigate(['companies']);
        }
      },
      error: (err) => {
        console.error('Failed to load company:', err);
        this.router.navigate(['companies']);
      },
    });
  }



  submitCompany(): void {
    if (this.isEditing) {
      console.log('Inside edited mode');
      this.currentCompany.DateUpdated = new Date();
      this.currentCompany.UpdatedBy =
        this.authService.getCurrentUser() || 'admin';

      // API me companyId alag se pass nahi karna, sirf object bhejna hai
      this.authService.updateCompany(this.currentCompany).subscribe({
        next: () => {
          localStorage.setItem(
            'companyMessage',
            'company updated successfully!'
          );
          this.router.navigate(['companies']);
        },
        error: (err) => {
          console.error('Failed to update company:', err);
        },
      });
    } else {
      this.currentCompany.DateCreated = new Date();
      this.currentCompany.CreatedBy =
        this.authService.getCurrentUser() || 'admin';

      this.authService.createCompany(this.currentCompany).subscribe({
        next: () => {
          localStorage.setItem('companyMessage', 'company added successfully!');
          this.router.navigate(['companies']);
        },
        error: (err) => {
          console.error('Failed to create company:', err);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['companies']);
  }
}
