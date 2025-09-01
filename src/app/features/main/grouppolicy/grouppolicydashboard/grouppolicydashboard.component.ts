import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router } from '@angular/router'; 

import { GroupPolicyService } from '../services/group-policy.service';

interface Dependent {
  Name: string;
  DateOfBirth: string;
  Relation: string;
  Gender: string;
  Phone: string;
}

interface Employee {
  EmployeeCode: string;
  EmployeeName: string;
  Email: string;
  Department?: string;
  Dependents: Dependent[];
  Status: string;
}

@Component({
  selector: 'app-grouppolicydashboard',
  standalone: false,
  
  templateUrl: './grouppolicydashboard.component.html',
  styleUrl: './grouppolicydashboard.component.scss',
})
export class GrouppolicydashboardComponent {
  dashboardData = {
    totalPolicies: 0,
    totalClaims: 0, // Static for now
    totalCompanies: 0, // Static for now
  };
  enrollment: any[] = [];
  companyid:any;
isHr:any;

isEmployee:any;
selectedEmployeeId: number | null = null;
HrId:any;
hrmobile:any;
 company: any;
   isModalOpen = false;
  currentEmployee: string | null = null;
  modalMessage = '';
 groupPolicyHrList: any;
  policycount:any;
  employeecount:any;
  totalEmployees:any;
  pendingEnrollments:any;
  totalDependents:any;
  employees: any[] = [];
 empid:any;
  policies: any[] = [];
companyName: string = '';
companyAddress: string = '';
hrEmail: string = '';
hrMobile: string = '';
employee:any;

  constructor(private authService: authService ,private groupservice:GroupPolicyService, private router: Router) {}


  ngOnInit() {
  
    this.companyid=localStorage.getItem('companyid');
    this.empid=localStorage.getItem('UserId');
    this.isHr = localStorage.getItem('ISHR') === 'true'; 
    this.isEmployee=localStorage.getItem('IsEmployee')==='true';
    this.HrId = localStorage.getItem('HrId');
    this.hrmobile=localStorage.getItem('HrMobile');
    console.log("hr",this.isHr,"company",this.HrId)
    this.getCompanyList();
    this.getEnrollment();
    this.getEmployeeList();
    this.getPoliciesList();
    this.getOneEmployee();
     this.fetchGroupPoliciesForHr(this.HrId);
    this.authService.getPolicies().subscribe((policies: any[]) => {
      this.dashboardData.totalPolicies = policies?.length || 0;
    });
    this.authService.getTotalClaims().subscribe((claim: any) => {
      console.log('totallll claim is ', claim.totalCount);
      this.dashboardData.totalClaims = claim.totalCount || 0;
    });

    this.authService.getGroupPolicy().subscribe((comapny: any) => {
      this.dashboardData.totalCompanies = comapny?.length || 0;
    });
  }

  navigateToHrPortal()
  {
    this.router.navigate(['/hrportal']);
  }
 openModal(employeeName: string, event: MouseEvent) {
    this.modalMessage = `Hi, this is a message for ${employeeName}!`;
    this.currentEmployee = employeeName;
    this.isModalOpen = true;
  }


  closeModal() {
    this.isModalOpen = false;
  }

fetchGroupPoliciesForHr(hrId: number): void {
  console.log("hrid", hrId);
  this.groupservice.getGroupPolicyByHr(hrId).subscribe({
    next: (res) => {
      console.log('Group Policy for HR:', res.responseData);
      if (res.responseData) {
        const data = JSON.parse(res.responseData);
        this.groupPolicyHrList = data.Employees || [];
        this.employees = data.Employees || [];
        
        // Count enrolled employees (where isEnroll is true)
        this.employeecount = this.employees.filter((emp: any) => emp.isEnroll === true).length;
        console.log("employeecount",this.employeecount)
        // Count total employees
        this.totalEmployees = this.employees.length;
        
        // Count pending enrollments (where isEnroll is false)
        this.pendingEnrollments = this.employees.filter((emp: any) => emp.isEnroll === false).length;
        
        // Count total dependents (family members)
        this.totalDependents = this.employees.reduce((total: number, emp: any) => {
          if (emp.FamilyMembers && Array.isArray(emp.FamilyMembers)) {
            return total + emp.FamilyMembers.filter((fm: any) => 
              fm.FamilyName && fm.Relation && fm.Gender
            ).length;
          }
          return total;
        }, 0);
        
        console.log('Total employees:', this.totalEmployees);
        console.log('Enrolled employees:', this.employeecount);
        console.log('Pending enrollments:', this.pendingEnrollments);
        console.log('Total dependents:', this.totalDependents);
        console.log("First employee's family members:", this.employees[0]?.FamilyMembers);

        this.policies = data.Policies || [];

        if (this.groupPolicyHrList.length > 0) {
          console.log("groupPolicyHrList",this.groupPolicyHrList)
          const firstHr = this.groupPolicyHrList.find((hr: any) => hr.ISHR === true);
          console.log("firstHr",firstHr)
          this.companyName = firstHr.CompanyName;
          console.log("companynamenirav", firstHr.CompanyName)
          this.companyAddress = firstHr.CompanyAddress;
          this.hrEmail = firstHr.Email;
          this.hrMobile = firstHr.Mobile;
        }
      }
    },
    error: (err) => {
      console.error('Error fetching Group Policies by HR:', err);
    }
  });
}

  getCompanyList(): void {
  console.log("get company called");
  this.groupservice.getAllCompanies().subscribe({
    next: (res) => {
      console.log("nirav Company list:", res);
      
      // Parse JSON string inside responseData
      if (res.responseData) {
      
        this.company = JSON.parse(res.responseData);
          console.log("nirav Company",this.company)
      }
    },
    error: (err) => {
      console.error("Failed to fetch companies:", err);
    }
  });
}
 getPoliciesList():void{
  this.groupservice.getAllPolicies().subscribe({
    next: (res) => {
      console.log("policy list:", res);
      
       this.policycount = res.totalCount;
    },
    error: (err) => {
      console.error("Failed to fetch policy:", err);
    }
  });
 }

 getEmployeeList():void{
  this.groupservice.getAllEmployees().subscribe({
    next: (res) => {
      console.log("employee list:", res.totalCount);
      this.totalEmployees = res.totalCount;
       //this.employeecount = res.totalCount;
    },
    error: (err) => {
      console.error("Failed to fetch employee:", err);
    }
  });
 }

 getEnrollment():void{
  this.groupservice.getEnrollment(this.empid).subscribe({
    next: (res) => {
      console.log("enrollment list:", res.responseData);
      
       this.enrollment = JSON.parse(res.responseData);
       console.log("Enrollment is ",this.enrollment)
    },
    error: (err) => {
      console.error("Failed to fetch employee:", err);
    }
  });
 }
 getOneEmployee():void
 {
  this.groupservice.getEmp(this.empid).subscribe({
    next:(res)=>{
        this.employee = JSON.parse(res.responseData);
  
     console.log("employee is",this.employee[0])
    }
  })
 }
 viewCompany(companyId: number): void {
  console.log('Viewing company with ID:', companyId);
  if (companyId) {
    this.router.navigate(['/companydetails', companyId]);
  } else {
    console.error('No company ID provided for viewing');
  }
}
viewPolicy(policyId: number): void {
  console.log('Viewing policy with ID:', policyId);
  if (policyId) {
    this.router.navigate(['/policydetails', policyId]);
  } else {
    console.error('No policy ID provided for viewing');
  }
}
  
  navigatetoCompanyList() {
    this.router.navigate(['/GroupPolicy']);
  }

  navigateToAddCompany() {
    this.router.navigate(['/addcompany']);
  }

   navigateToAddHr() {
    this.router.navigate(['/addHr']);
  }

   navigateToAddAssignGP() {
    console.log("assign clicked")
    this.router.navigate(['/AssignGroupPolicy']);
  }

  addFamily(empId?: number)
  {
    console.log("family for employee:", empId);
    if (empId) {
      // Store the employee ID in localStorage for the add family component
      localStorage.setItem('SelectedEmpId', empId.toString());
      this.router.navigate(['/addfamily']);
    } else {
      this.router.navigate(['/addfamily']);
    }
  }
  addEmp()
  {
    this.router.navigate(['/addemp']);
  }
 navigateToManageEmployee()
  {
    this.router.navigate(['/manageemployee']);
  }
  navigatetPolicyList()
  {
    this.router.navigate(['/AssignGroupPolicy']);
  }

   navigatetEmpList()
  {
    this.router.navigate(['/manageemployee']);
  }
  navigateToEnrollement()
  {
    
    this.router.navigate(['enrollment']);
  }

  // Modal properties for family members
  isFamilyModalOpen = false;
  selectedEmployeeForFamily: any = null;
  selectedEmployeeFamilyMembers: any[] = [];

  viewFamilyMembers(empId: number)
  {
    console.log("Viewing family for employee:", empId);
    
    // Find the selected employee
    this.selectedEmployeeForFamily = this.employees.find(emp => emp.EmpId === empId);
    
    if (this.selectedEmployeeForFamily) {
      // Get family members for this employee
      this.selectedEmployeeFamilyMembers = this.selectedEmployeeForFamily.FamilyMembers || [];
      
      // Filter out empty family members
      this.selectedEmployeeFamilyMembers = this.selectedEmployeeFamilyMembers.filter((member: any) => 
        member.FamilyName && member.Relation && member.Gender
      );
      
      console.log("Employee:", this.selectedEmployeeForFamily);
      console.log("Family members:", this.selectedEmployeeFamilyMembers);
      
      // Open the modal
      this.isFamilyModalOpen = true;
    } else {
      console.error("Employee not found with ID:", empId);
    }
  }

  closeFamilyModal() {
    this.isFamilyModalOpen = false;
    this.selectedEmployeeForFamily = null;
    this.selectedEmployeeFamilyMembers = [];
  }

  addFamilyForSelectedEmployee() {
    if (this.selectedEmployeeForFamily) {
      this.closeFamilyModal();
      this.addFamily(this.selectedEmployeeForFamily.EmpId);
    }
  }

  // Edit employee function
  editEmployee(empId: number): void {
    console.log('Editing employee with ID:', empId);
    if (empId) {
      // Navigate to the edit employee page with the employee ID
      this.router.navigate(['/addemp', empId]);
    } else {
      console.error('No employee ID provided for editing');
    }
  }

  // View employee details function
  viewEmployee(empId: number): void {
    console.log('Viewing employee with ID:', empId);
    if (empId) {
      // Navigate to the view employee page
      this.router.navigate(['/viewEmployee', empId]);
    } else {
      console.error('No employee ID provided for viewing');
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

}
