import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-employees',
  standalone: false,
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {
  employees: any[] = [];
  paginatedEmployees: any[] = [];
  currentEmployee: any = {
    empId: null,
    firstName: '',
    lastName: '',
    email: '',
    productId: null,
    role: '',
    lastAssignedAt: null,
    isActive: true,
    dateCreated: null,
    createdBy: '',
    dateUpdated: null,
    updatedBy: '',
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
  searchFirstName: string = '';
  searchLastName: string = '';
  searchMobile:string='';
  searchEmail: string = '';
  searchRole: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.noRecord = this.message.getNoRecordMessage();
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getEmployees().subscribe({
      next: (data) => {
        console.log("emo",data)
        this.employees = data;
        this.totalItems = data.length; // Assuming API doesn't return totalCount
        this.generateItemsPerPageOptions();
        this.isLoading = false;
        this.searchEmployees();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load employees. Please try again later.';
        this.isLoading = false;
        console.error('Error loading employees:', err);
      },
    });
  }
  navigateToAddEmployee(): void {
    this.router.navigate(['/addEmployee']);
  }
  searchEmployees(): void {
    let filteredEmployees = [...this.employees];

    if (this.searchFirstName.trim()) {
      filteredEmployees = filteredEmployees.filter((employee) =>
        employee.FirstName?.toLowerCase().includes(this.searchFirstName.toLowerCase())
      );
    }

    if (this.searchLastName.trim()) {
      filteredEmployees = filteredEmployees.filter((employee) =>
        employee.LastName?.toLowerCase().includes(this.searchLastName.toLowerCase())
      );
    }

    if (this.searchEmail.trim()) {
      filteredEmployees = filteredEmployees.filter((employee) =>
        employee.Email?.toLowerCase().includes(this.searchEmail.toLowerCase())
      );
    }

    if (this.searchMobile.trim()) {
      filteredEmployees = filteredEmployees.filter((employee) =>
        employee.Mobile?.toLowerCase().includes(this.searchMobile.toLowerCase())
      );
    }

    if (this.searchRole.trim()) {
      filteredEmployees = filteredEmployees.filter((employee) =>
        employee.Role?.toLowerCase().includes(this.searchRole.toLowerCase())
      );
    }

    this.totalItems = filteredEmployees.length; // Update total items after filtering
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
  }

  // editEmployee(empId: number): void {
  //   this.authService.getEmployeeById(empId).subscribe({
  //     next: (employee) => {
  //       if (employee) {
  //         this.currentEmployee = {
  //           ...employee,
  //           dateUpdated: new Date(),
  //           updatedBy: this.authService.getCurrentUser() || 'admin',
  //         };
  //         this.showForm = true;
  //         this.isEditing = true;
  //       }
  //     },
  //     error: (err) => {
  //       this.errorMessage = 'Failed to load employee details.';
  //       console.error('Error fetching employee:', err);
  //     },
  //   });
  // }

  editEmployee(EmpId: number): void {
    console.log('Id is ', EmpId);
    const employee = this.employees.find((e) => e.EmpId === EmpId);
    console.log('employee ', employee);
    if (employee) {
      console.log('Inside If ',this.employees);
      this.router.navigate(['addEmployee', EmpId]);
    }
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

  generateItemsPerPageOptions(): void {
    this.itemsPerPageOptions = [10, 25, 50, 100];

    // Add totalItems dynamically if not already in options
    if (!this.itemsPerPageOptions.includes(this.totalItems) && this.totalItems > 0) {
      this.itemsPerPageOptions.push(this.totalItems);
    }
  }

  onItemsPerPageChange(value: any): void {
    console.log('Selected items per page:', value);
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.searchEmployees(); // Re-apply search and pagination
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000);
  }

  deleteEmployee(empId: number): void {
    console.log('Deleting employee with empId:', empId);
    const employee = this.employees.find((e) => e.EmpId === empId);
    if (employee) {
      const updatedEmployee = {
        ...employee,
        isActive: false,
        dateUpdated: new Date(),
        updatedBy: this.authService.getCurrentUser() || 'admin'
      };
      console.log('Updating employee to inactive:', updatedEmployee);
      this.authService.updateEmployee(empId, updatedEmployee).subscribe({
        next: () => {
          console.log('Employee deactivated successfully');
          localStorage.setItem('employeeMessage', 'Employee deactivated successfully!');
          this.loadEmployees(); // Refresh the list
        },
        error: (err) => {
          this.errorMessage = 'Failed to deactivate employee.';
          console.error('Deactivation error:', err);
          setTimeout(() => (this.errorMessage = ''), 3000);
        }
      });
    } else {
      this.errorMessage = 'Employee not found.';
      setTimeout(() => (this.errorMessage = ''), 3000);
    }
  }
}
