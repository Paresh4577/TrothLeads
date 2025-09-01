import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';

@Component({
  selector: 'app-viewemployee',
  standalone: false,
  templateUrl: './viewemployee.component.html',
  styleUrl: './viewemployee.component.scss',
})
export class ViewemployeeComponent implements OnInit {
  employeeId: number | null = null;
  isLoading = true;
  errorMessage = '';
  employeeDetails: any = null;
  companyName: string = '';

  constructor(
    private authService: authService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('employeeId'));
    if (this.employeeId) {
      this.loadEmployeeDetails(this.employeeId);
    } else {
      this.errorMessage = 'Invalid employee ID.';
      this.isLoading = false;
    }
  }

  loadEmployeeDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAdminById(id).subscribe({
      next: (res: any) => {
        console.log('res is ', res);
        this.employeeDetails = res;
        console.log('res company id is ', res.CompanyId);
        if (res && res.CompanyId) {
          this.loadCompanyName(res.CompanyId);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          'Failed to load employee data. Please try again later.';
        this.isLoading = false;
        console.error('Employee fetch error:', err);
      },
    });
  }

  loadCompanyName(companyId: number): void {
    console.log('called loadcompany');
    this.authService.getCompanyById(companyId).subscribe({
      next: (company: any) => {
        console.log('Company names is ', company);
        if (company) {
          this.companyName = company.CompanyName;
        }
      },
      error: (err) => {
        console.error('Error fetching company:', err);
      },
    });
  }

  deleteEmployee(id: any): void {
    console.log('id is ', id);
    this.authService.deleteAdmin(id).subscribe({
      next: (res) => {
        console.log('deleted');
        this.router.navigate(['GroupPolicy']);
      },
    });
  }

  editEmployee(id: any) {
    this.router.navigate(['/createadmin', id]);
  }

  addEmployeeFamily(id: any) {
    this.router.navigate(['/addfamily', id]);
  }

  viewEmployeeFamily(id: any) {
    this.router.navigate(['/viewempfamily', id]);
  }

  goBack(): void {
    this.router.navigate(['GroupPolicy']); // Change this as per your route
  }
}
