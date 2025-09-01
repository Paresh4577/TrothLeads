import { Component, OnInit } from '@angular/core';
import { GroupPolicyService } from '../services/group-policy.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hradminportal',
  standalone: false,
  templateUrl: './hradminportal.component.html',
  styleUrl: './hradminportal.component.scss'
})
export class HradminportalComponent implements OnInit {
  constructor(private groupservice:GroupPolicyService, private router: Router) {}
  
  employee:any[]=[]
  hr:any;

  ngOnInit():void{
    this.getHr()
  }

  viewHrCompany(companyId:number):void{
    console.log("companyId",companyId)
    this.router.navigate(['/companydetails',companyId])
  }
  getHr():void{
    this.groupservice.getAllEmployees().subscribe({
      next:(res)=>{
        this.employee=JSON.parse(res.responseData)
        console.log("employee",this.employee)
        this.hr=this.employee.filter((item:any)=>item.isHr===true)
        console.log("hr",this.hr)
      }
    })
  }

  addNewHR(): void {
    this.router.navigate(['/addHr']);
  }

  navigateToManageEmployee()
  {
    this.router.navigate(['/manageemployee']);
  }
  
  navigateToHrPortal()
  {
    this.router.navigate(['/hrportal']);
  }
}
