import { Component } from '@angular/core';
import { GroupPolicyService } from '../services/group-policy.service';

@Component({
  selector: 'app-add-hr',
  standalone: false,
  templateUrl: './add-hr.component.html',
  styleUrl: './add-hr.component.scss'
})
export class AddHrComponent {
 isEdit: boolean = false;

 company:any;

  formData: any = {
    hrId: 0,
    companyId: '',
    hrName: '',
    hrEmail: '',
    Password:'',
    hrMobile: ''
  };

  constructor(private groupPolicyService: GroupPolicyService) {}

  ngOnInit(): void {
    this.getCompanyList()
    // For editing: you could set isEdit = true and populate formData here
    // Example:
    // this.isEdit = true;
    // this.formData = { hrId: 2, companyId: 1, hrName: 'John', hrEmail: 'john@xyz.com', hrMobile: '9999999999' };
  }

  submitHrForm(): void {
    const payload = {
      pageNo: 0,
      pageSize: 0,
      hrId: this.formData.hrId ?? 0,
      companyId: Number(this.formData.companyId),
      empId: 0,
      hrName: this.formData.hrName,
      hrEmail: this.formData.hrEmail,
      Password:this.formData.Password,
      hrMobile: this.formData.hrMobile,
      isActive: true,
      dateCreated: new Date().toISOString(),
      createdBy: 'admin',
      updatedBy: 'admin'
    };
    console.log("payload hr",payload)

    this.groupPolicyService.saveOrUpdateHr(payload).subscribe({
      next: (res) => {
        const action = this.formData.hrId > 0 ? 'updated' : 'created';
        alert(`HR ${action} successfully!`);
        this.resetForm();
      },
      error: (err) => {
        console.error('Failed to save HR:', err);
        alert('Operation failed. Please try again.');
      }
    });
  }

  resetForm(): void {
    this.formData = {
      hrId: 0,
      companyId: '',
      hrName: '',
      hrEmail: '',
      Password:'',
      hrMobile: ''
    };
    this.isEdit = false;
  }

  goBack(): void {
    window.history.back();
  }

   getCompanyList(): void {
  console.log("get company called");
  this.groupPolicyService.getAllCompanies().subscribe({
    next: (res) => {
      console.log("Company list:", res);
      
      // Parse JSON string inside responseData
      if (res.responseData) {
      
        this.company = JSON.parse(res.responseData);
          console.log("ompany",this.company)
      }
    },
    error: (err) => {
      console.error("Failed to fetch companies:", err);
    }
  });
}
}
