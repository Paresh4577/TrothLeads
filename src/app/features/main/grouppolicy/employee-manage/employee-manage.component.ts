import { Component } from '@angular/core';

import { GroupPolicyService } from '../services/group-policy.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-manage',
  standalone: false,
  templateUrl: './employee-manage.component.html',
  styleUrl: './employee-manage.component.scss'
})
export class EmployeeManageComponent {
  employee: any[] = []
   constructor( private groupservice:GroupPolicyService,private router: Router) {}
   
  ngOnInit() {
   this.getEmployeeList();
  }
 getEmployeeList():void{
  this.groupservice.getAllEmployees().subscribe({
    next: (res) => {
      console.log("employee list:", res.totalCount);
      
       this.employee = JSON.parse(res.responseData);;
       console.log("emp isss ",this.employee)
    },
    error: (err) => {
      console.error("Failed to fetch employee:", err);
    }
  })
}

navigateToAddEmployee():void
{
  console.log("nivage")
   this.router.navigate(['/addemp']);
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
