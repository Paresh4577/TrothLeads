import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GroupPolicyService } from '../services/group-policy.service';

@Component({
  selector: 'app-enrollement',
  standalone: false,
  templateUrl: './enrollement.component.html',
  styleUrl: './enrollement.component.scss'
})
export class EnrollementComponent {
  // Initialize enrollementdata with default values to bind with ngModel
  enrollementdata: any = {
    empId: 0,
    policyId: 0,
    familyId: 0
  };
   
  hrId: any;
  groupPolicyHrList: any;
  currentEmployee: string | null = null;
  employees: any[] = [];
  policies: any[] = [];
  family: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private groupservice: GroupPolicyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.hrId = localStorage.getItem('HrId');
    console.log('HrId from localStorage:', this.hrId);
    if (this.hrId) {
      this.fetchGroupPoliciesForHr(+this.hrId);
    } else {
      console.error('HrId not found in localStorage');
    }

    // Check if we're returning from add family page
    const familyAdded = localStorage.getItem('FamilyAdded');
    if (familyAdded === 'true') {
      this.successMessage = 'Family member added successfully! Please refresh to see the new family member.';
      localStorage.removeItem('FamilyAdded');
      // Clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }

    // Check if we're returning from employee operations
    const employeeMessage = localStorage.getItem('employeeMessage');
    if (employeeMessage) {
      this.successMessage = employeeMessage;
      localStorage.removeItem('employeeMessage');
      // Clear success message after 5 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    }
  }

  fetchGroupPoliciesForHr(hrId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log("Fetching data for HrId:", hrId);
    
    this.groupservice.getGroupPolicyByHr(hrId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Raw API Response:', res);
        if (res && res.responseData) {
          try {
            const data = JSON.parse(res.responseData);
            console.log('Parsed data:', data);
            
            this.groupPolicyHrList = data.Employees || [];
            console.log('Group Policy Hr List:', this.groupPolicyHrList);
            this.employees = data.Employees 
            
            // Transform policies to add PolicyId if missing
            this.policies = (data.Policies || []).map((policy: any) => ({
              ...policy,
              PolicyId: policy.policyid
            }));
            
            this.family = []; 
            this.employees.forEach((emp: any) => {
              if (emp.FamilyMembers && Array.isArray(emp.FamilyMembers)) {
                emp.FamilyMembers.forEach((fm: any) => {
                  // Optional: attach EmpId or Employee Name if needed
                  this.family.push({
                    ...fm,
                    EmpId: emp.EmpId,
                    EmployeeName: `${emp.FirstName || ''} ${emp.LastName || ''}`.trim()
                  });
                });
              }
            });
            console.log('Employees loaded:', this.employees.length);
            console.log('Policies loaded:', this.policies.length);
            console.log('Family members loaded:', this.family.length);
            
            // Log first few items for debugging
            if (this.employees.length > 0) {
              console.log('First employee:', this.employees[0]);
            }
            if (this.policies.length > 0) {
              console.log('First policy:', this.policies[0]);
            }
            
            if (this.employees.length === 0 && this.policies.length === 0) {
              this.errorMessage = 'No data available for this HR ID. Please check if the HR ID is correct or if there are any assigned policies/employees.';
            }
            
            // If there's already a selected employee, load their family members
            if (this.enrollementdata.EmpId) {
              this.onEmployeeChange();
            }
          } catch (parseError) {
            console.error('Error parsing response data:', parseError);
            console.log('Raw responseData:', res.responseData);
            this.errorMessage = 'Error parsing server response. Please check console for details.';
          }
        } else {
          console.warn('No responseData in API response');
          console.log('Full response:', res);
          this.errorMessage = 'No data received from server. Please check if the API is working correctly.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching Group Policies by HR:', err);
        console.error('Error details:', err.error);
        this.errorMessage = 'Failed to load data. Please check your connection and try again.';
      }
    });
  }

  saveEnrollmentEmployee(): void {
    // Validate that required fields are filled
    if (!this.enrollementdata.empId || !this.enrollementdata.policyId) {
      console.error('Employee and Policy are required fields');
      return;
    }

    // Prepare data for API - ensure proper data types
    const enrollmentData = {
      empId: this.enrollementdata.empId,
      policyId: this.enrollementdata.policyId,
      familyId: this.enrollementdata.familyId || 0
    };

    console.log('Enrollment data being sent:', enrollmentData);
    
    this.groupservice.SaveEnrollment(enrollmentData).subscribe({
      next: (response) => {
        console.log('Employee enrolled successfully:', response);
        this.successMessage = 'Employee enrolled successfully!';
        this.errorMessage = '';
        this.resetForm();
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error enrolling employee:', error);
        this.errorMessage = 'Failed to enroll employee. Please check the data and try again.';
        this.successMessage = '';
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      },
    });
  }

  // Optional: Add a reset form method
  resetForm(): void {
    this.enrollementdata = {
      empId: 0,
      policyId: 0,
      familyId: 0
    };
  }

  // Retry loading data
  retryLoadData(): void {
    if (this.hrId) {
      this.fetchGroupPoliciesForHr(+this.hrId);
    }
  }

  // Get family members for selected employee
  getFamilyMembersForEmployee(empId: any): any[] {
    console.log('Looking for employee with ID:', empId);
    console.log('Available employees:', this.employees[0].EmpId);
    
    const selectedEmployee = this.employees.find(emp => emp.EmpId === empId);
    console.log('Selected employee:', selectedEmployee);
    
    if (selectedEmployee && selectedEmployee.FamilyMembers) {
      console.log('Employee family members:', selectedEmployee.FamilyMembers);
      const filteredMembers = selectedEmployee.FamilyMembers.filter((member: any) => 
        member.FamilyName && member.Relation && member.Gender
      );
      console.log('Filtered family members:', filteredMembers);
      return filteredMembers;
    }
    console.log('No family members found for employee');
    return [];
  }

  // Handle employee selection change
  onEmployeeChange(): void {
    console.log('Employee changed to:', this.enrollementdata.empId);
    // Reset family selection when employee changes
    this.enrollementdata.familyId = this.enrollementdata.empId;
    // Update family members for the selected employee
  //  this.family = this.getFamilyMembersForEmployee(this.enrollementdata.empId);
    console.log('Family members loaded:', this.family);
  }

  // Add family member function
  addFamilyMember(empId?: number): void {
    console.log('Adding family member for employee:', empId);
    if (empId) {
      // Store the employee ID in localStorage for the add family component
      localStorage.setItem('SelectedEmpId', empId.toString());
      this.router.navigate(['/addfamily']);
    } else if (this.enrollementdata.empId) {
      // Use the currently selected employee
      localStorage.setItem('SelectedEmpId', this.enrollementdata.empId.toString());
      this.router.navigate(['/addfamily']);
    } else {
      console.error('No employee selected for adding family member');
      this.errorMessage = 'Please select an employee first before adding family members.';
    }
  }

  // Refresh family members after adding new ones
  refreshFamilyMembers(): void {
    if (this.enrollementdata.empId) {
      this.onEmployeeChange();
    }
  }

  // Edit employee function
  editEmployee(empId?: number): void {
    console.log('Editing employee:', empId);
    if (empId) {
      this.router.navigate(['/addEmployee', empId]);
    } else if (this.enrollementdata.empId) {
      this.router.navigate(['/addEmployee', this.enrollementdata.empId]);
    } else {
      this.errorMessage = 'Please select an employee first before editing.';
    }
  }

  // View employee function
  viewEmployee(empId?: number): void {
    console.log('Viewing employee:', empId);
    if (empId) {
      this.router.navigate(['/viewEmployee', empId]);
    } else if (this.enrollementdata.empId) {
      this.router.navigate(['/viewEmployee', this.enrollementdata.empId]);
    } else {
      this.errorMessage = 'Please select an employee first before viewing details.';
    }
  }

  // Add new employee function
  addNewEmployee(): void {
    console.log('Adding new employee');
    this.router.navigate(['/addEmployee']);
  }

  // View employee dashboard function
  viewEmployeeDashboard(empId: number): void {
    console.log('Viewing employee dashboard for ID:', empId);
    if (empId) {
      // Navigate to the employee dashboard
      this.router.navigate(['/viewEmployee', empId]);
    } else {
      console.error('No employee ID provided for viewing dashboard');
    }
  }
}