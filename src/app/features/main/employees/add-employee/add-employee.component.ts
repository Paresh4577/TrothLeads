import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-employee',
  standalone: false,
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss'
})
export class AddEmployeeComponent {
  currentEmployee: any = {
    empId: null,
    firstName: '',
    lastName: '',
    email: '',
    mobile:'',
    productId: null,
    role: '',
    lastAssignedAt: null,
    isActive: true,
    dateCreated: null,
    createdBy: '',
    dateUpdated: null,
    updatedBy: '',
  };

  products: any[] = [];
  isEditing: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const empId = Number(params.get('empId')); // Assuming route param is 'empId'
      if (empId) {
        this.isEditing = true;
        this.loadEmployeeData(empId);
      }
    });
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.authService.getProducts().subscribe({
      next: (products) => (this.products = products,console.log("rpuductsisis",this.products)),
      error: (err) => console.error('Error loading products:', err),
    });
  }

  loadEmployeeData(empId: number): void {
    this.authService.getEmployeeById(empId).subscribe({
      next: (employee) => {
        this.currentEmployee = { ...employee };
      },
      error: (err) => {
        this.errorMessage = 'Failed to load employee data.';
        console.error(err);
        this.router.navigate(['/employees']);
      },
    });
  }

  submitEmployee(): void {
  

    // Validate required fields
    if (
      !this.currentEmployee.FirstName ||
      !this.currentEmployee.LastName ||
      !this.currentEmployee.Email ||
      !this.currentEmployee.Role
    ) {
      this.errorMessage =
        'Please fill in all required fields (First Name, Last Name, Email, Role).';
      setTimeout(() => (this.errorMessage = ''), 3000);
      return;
    }

    // Set ProductName for display (optional, if needed)
    const selectedProduct = this.products.find(
      (product) => Number(product.ProductId) === Number(this.currentEmployee.ProductId)
    );
    this.currentEmployee.productName = selectedProduct ? selectedProduct.ProductName : '';
    console.log('Selected productId:', this.currentEmployee.productId);

    if (this.isEditing) {
      this.currentEmployee.dateUpdated = new Date();
      this.currentEmployee.updatedBy = this.authService.getCurrentUser() || 'admin';
      this.authService
        .updateEmployee(this.currentEmployee.empId, this.currentEmployee)
        .subscribe({
          next: () => {
            localStorage.setItem(
              'employeeMessage',
              'Employee updated successfully!'
            );
            this.router.navigate(['/getEmployees']);
          },
          error: (err) => {
            this.errorMessage = 'Failed to update employee.';
            console.error(err);
            setTimeout(() => (this.errorMessage = ''), 3000);
          },
        });
    } else {
      this.currentEmployee.dateCreated = new Date();
      this.currentEmployee.createdBy = this.authService.getCurrentUser() || 'admin';
      this.authService.createEmployee(this.currentEmployee).subscribe({
        next: () => {
          localStorage.setItem(
            'employeeMessage',
            'Employee added successfully!'
          );
          this.router.navigate(['/getEmployees']);
        },
        error: (err) => {
          this.errorMessage = 'Failed to create employee.';
          console.error(err);
          setTimeout(() => (this.errorMessage = ''), 3000);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/getEmployees']);
  }
}
