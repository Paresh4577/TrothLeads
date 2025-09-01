import { Component } from '@angular/core';
import { MessageService } from '../../../../services/message.service';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupPolicyService } from '../services/group-policy.service';

@Component({
  selector: 'app-addemp',
  standalone: false,
  templateUrl: './addemp.component.html',
  styleUrl: './addemp.component.scss',
})
export class AddempComponent {
  showPassword: boolean = false;
  selectedFile: File | null = null;
  password: string = '';
  companies: any[] = [];
  isEditing: boolean = false;
  employeeId: number | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  currentUser: any = {
    EmpId: null,
    FirstName: '',
    MidName: '',
    LastName: '',
    document: '',
    Email: '',
    Mobile: '',
    Gender: '',
    birthdate: '',
    Password: '',
    Address: '',
    CompanyId: null,
    IsEmployee: true,
    Employeecode: this.generateEmployeeCode()
  };

  constructor(
    private authService: authService,
    private groupPolicyService: GroupPolicyService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('AddempComponent initialized');
    this.loadCompanies();
    
    // Check if we're in edit mode by looking for EmpId in route params
    this.route.paramMap.subscribe(params => {
      const empId = params.get('EmpId');
      console.log('Route parameter EmpId:', empId);
      
      if (empId && empId !== 'null' && empId !== 'undefined') {
        this.isEditing = true;
        this.employeeId = +empId;
        console.log('Loading employee data for ID:', this.employeeId);
        this.loadEmployeeData(+empId);
      } else {
        console.log('No EmpId found in route, staying in add mode');
        this.isEditing = false;
        this.employeeId = null;
      }
    });
  }

  loadCompanies(): void {
    this.groupPolicyService.getAllCompanies().subscribe({
      next: (res) => {
        this.companies = JSON.parse(res.responseData);
        console.log("com is ", this.companies);
      },
      error: (err) => {
        console.error('Error loading companies:', err);
        this.errorMessage = 'Failed to load companies. Please try again.';
      },
    });
  }

  loadEmployeeData(empId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Starting to load employee data for ID:', empId);
    
    this.groupPolicyService.getEmp(empId).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Raw API response:', res);
        
        if (res && res.responseData) {
          try {
            const employees = JSON.parse(res.responseData);
            console.log('Parsed employees data:', employees);
            
            if (employees && Array.isArray(employees) && employees.length > 0) {
              const employee = employees[0];
              console.log('Found employee data:', employee);
              
              // Map the API response to our form model
              this.currentUser = {
                EmpId: employee.EmpId || employee.empId || empId,
                FirstName: employee.FirstName || employee.firstName || '',
                MidName: employee.MidName || employee.midName || '',
                LastName: employee.LastName || employee.lastName || '',
                Email: employee.Email || employee.email || '',
                Mobile: employee.Mobile || employee.mobile || '',
                Gender: employee.Gender || employee.gender || '',
                birthdate: employee.birthdate || employee.BirthDate || employee.birthDate || '',
                Password: employee.Password || employee.password || '',
                Address: employee.Address || employee.address || '',
                CompanyId: employee.CompanyId || employee.companyId || null,
                IsEmployee: employee.IsEmployee !== undefined ? employee.IsEmployee : true,
                Employeecode: employee.Employeecode || employee.employeeCode || this.generateEmployeeCode()
              };
              
              console.log('Form data populated:', this.currentUser);
              this.successMessage = 'Employee data loaded successfully for editing.';
              
              // Clear success message after 3 seconds
              setTimeout(() => {
                this.successMessage = '';
              }, 3000);
              
            } else {
              console.error('No employee found in response array');
              this.errorMessage = 'Employee not found. Please check the employee ID.';
            }
          } catch (parseError) {
            console.error('Error parsing response data:', parseError);
            console.log('Raw responseData:', res.responseData);
            this.errorMessage = 'Error parsing employee data. Please try again.';
          }
        } else {
          console.error('No responseData in API response');
          console.log('Full response:', res);
          this.errorMessage = 'No employee data received from server.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading employee data:', err);
        console.error('Error details:', err.error);
        this.errorMessage = 'Failed to load employee data. Please check your connection and try again.';
      }
    });
  }
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.currentUser.document = this.selectedFile.name;
    }
  }

  submitEmployee(): void {
    console.log("Current data is ", this.currentUser);
  
    const formData = new FormData();
  
    // Append regular fields
    formData.append('EmpId', this.currentUser.EmpId || '');
    formData.append('FirstName', this.currentUser.FirstName);
    formData.append('MidName', this.currentUser.MidName || '');
    formData.append('LastName', this.currentUser.LastName);
    formData.append('Email', this.currentUser.Email);
    formData.append('Mobile', this.currentUser.Mobile);
    formData.append('Password', this.currentUser.Password);
    formData.append('Gender', this.currentUser.Gender || '');
    formData.append('birthdate', this.currentUser.birthdate || '');
    formData.append('Address', this.currentUser.Address || '');
    formData.append('CompanyId', this.currentUser.CompanyId);
    formData.append('IsEmployee', this.currentUser.IsEmployee);
    formData.append('Employeecode', this.currentUser.Employeecode || '');
    formData.append('CreatedBy', 'admin');
    formData.append('UpdatedBy', 'admin');
  
    // Append file
    if (this.selectedFile) {
      formData.append('Document', this.selectedFile);
    }
  
    // Send as FormData
    this.groupPolicyService.SaveEmployee(formData).subscribe({
      next: (res) => {
        this.successMessage = 'Employee added successfully!';
        localStorage.setItem('employeeMessage', this.successMessage);
        setTimeout(() => {
          // Redirect or reset if needed
          this.router.navigate(['/grouppolicydashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error saving employee:', err);
       // this.errorMessage = 'Failed to add employee. Please try again.';
      }
    });
  }
  

  resetForm(): void {
    if (this.isEditing) {
      // Reload the employee data
      if (this.employeeId) {
        this.loadEmployeeData(this.employeeId);
      }
    } else {
      // Reset to default values
      this.currentUser = {
        EmpId: null,
        FirstName: '',
        MidName: '',
        LastName: '',
        Email: '',
        Mobile: '',
        Gender: '',
        birthdate: '',
        Password: '',
        Address: '',
        CompanyId: null,
        IsEmployee: true,
        Employeecode: this.generateEmployeeCode()
      };
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelForm(): void {
    this.router.navigate(['/grouppolicydashboard']);
  }

  private generateEmployeeCode(): string {
    const prefix = 'EMP';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${randomNum}`;
  }

  // Method to manually test parameter fetching
  testParameterFetching(): void {
    console.log('=== Parameter Fetching Test ===');
    console.log('Current route params:', this.route.snapshot.paramMap);
    console.log('Current query params:', this.route.snapshot.queryParamMap);
    console.log('Current URL:', this.router.url);
    console.log('Is editing mode:', this.isEditing);
    console.log('Employee ID:', this.employeeId);
    console.log('==============================');
  }
}
 


 

  

