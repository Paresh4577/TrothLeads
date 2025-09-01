import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { authService } from '../../../auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-addempfamily',
  standalone: false,
  templateUrl: './addempfamily.component.html',
  styleUrl: './addempfamily.component.scss',
})
export class AddempfamilyComponent {
  employeeDetails: any = null;
  PolicyNo: any = null;
  isLoading = true;
  errorMessage = '';
  employeeId: any;
  familyMember: any;

  constructor(
    private authService: authService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if there's a selected employee ID from dashboard
    const selectedEmpId = localStorage.getItem("SelectedEmpId");
    if (selectedEmpId) {
      this.employeeId = selectedEmpId;
      // Clear the selected employee ID from localStorage
      localStorage.removeItem("SelectedEmpId");
    } else {
      this.employeeId = localStorage.getItem("UserId");
    }
    
    console.log("Loading family for employee ID:", this.employeeId);
    this.loadEmployeeDetails(this.employeeId);
  }

  loadEmployeeDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAdminById(id).subscribe({
      next: (res: any) => {
        console.log('res emp is ', res);
        this.employeeDetails = res;
        console.log('res company id is ', res.CompanyId);
            if(res.CompanyId == 0 || res.isHr == true){
              this.employeeId = Number(this.route.snapshot.paramMap.get('EmpId'));
            }
        // Initialize familyMember after we have the employee details
        this.familyMember = {
          UserId: 0,
          EmpId: this.employeeId,
          PolicyNo: this.employeeDetails.PolicyNo,
          Name: '',
          DOB: null,
          Relation: '',
          Gender: '',
          Phone: '',
        };

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

  onSubmit(): void {
    
    console.log('Submitted family member:', this.familyMember);
   
    this.authService.addFamilyMember(this.familyMember).subscribe({
      next: (response) => {
        console.log('Family member added successfully:', response);
        // Set flag to indicate family member was added
        localStorage.setItem('FamilyAdded', 'true');
        this.router.navigate(['grouppolicydashboard']);
      },
      error: (error) => {
        console.error('Error adding family member:', error);
        this.errorMessage = 'Failed to add family member. Please try again.';
      },
    });
  }

  cancelForm(): void {
    if (
      confirm('Are you sure you want to cancel? All entered data will be lost.')
    ) {
      this.router.navigate(['viewEmployee', this.employeeId]);
    }
  }
}
