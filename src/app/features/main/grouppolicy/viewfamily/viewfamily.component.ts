import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';

@Component({
  selector: 'app-viewfamily',
  standalone: false,
  templateUrl: './viewfamily.component.html',
  styleUrl: './viewfamily.component.scss'
})
export class ViewfamilyComponent implements OnInit {
  employeeId: number | null = null;
  isLoading = true;
  errorMessage = '';
  employeeDetails: any = null;
  companyName: string = '';
  familyList: any[] = [];

  constructor(
    private authService: authService,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('EmpId'));
    console.log("Employee ID:", this.employeeId);
    if (this.employeeId) {
      this.loadEmployeeDetails(this.employeeId);
      this.loadFamilyMembers(this.employeeId);
    }
  }

  loadEmployeeDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAdminById(id).subscribe({
      next: (res: any) => {
        console.log("Employee details:", res);
        this.employeeDetails = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load employee data. Please try again later.';
        this.isLoading = false;
        console.error('Employee fetch error:', err);
      }
    });
  }

  loadFamilyMembers(empId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load both family members and additional data
    this.authService.getEmpfamily(empId).subscribe({
      next: (res: any) => {
        console.log("Family members response:", res);
        if (Array.isArray(res)) {
          this.familyList = res;
        } else if (res && Array.isArray(res.responseData)) {
          this.familyList = res.responseData;
        } else {
          this.familyList = [];
        }
        console.log("Processed family list:", this.familyList);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load family members. Please try again later.';
        this.isLoading = false;
        console.error('Family members fetch error:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['viewEmployee', this.employeeId]);
  }
}
