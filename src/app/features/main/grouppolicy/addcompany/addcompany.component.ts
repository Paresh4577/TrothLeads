import { Component } from '@angular/core';
import { MessageService } from '../../../../services/message.service';
import { authService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupPolicyService } from '../services/group-policy.service';

@Component({
  selector: 'app-addcompany',
  standalone: false,
  templateUrl: './addcompany.component.html',
  styleUrl: './addcompany.component.scss',
})
export class AddcompanyComponent {
   isEdit = false;
  formData = {
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',
    companyAddress: '',
    city: '',
    pincode: '',
    isActive: true,
    pageNo: 0,
    pageSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  constructor(
    private companyService: GroupPolicyService,
    private router: Router
  ) {}

  submitForm() {
    this.formData.updatedAt = new Date().toISOString();
    if (!this.isEdit) {
      this.formData.createdAt = new Date().toISOString();
    }

    this.companyService.saveOrUpdateCompany(this.formData).subscribe({
      next: (res:any) => {
        alert(this.isEdit ? 'Company updated successfully!' : 'Company added successfully!');
        this.resetForm();
        this.router.navigate(['/company-list']);
      },
      error: (err:any) => {
        alert('Error: ' + err.message);
      },
    });
  }

  resetForm() {
    this.formData = {
      companyName: '',
      contactEmail: '',
      contactPhone: '',
      contactPerson: '',
      companyAddress: '',
      city: '',
      pincode: '',
      isActive: true,
      pageNo: 0,
      pageSize: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.isEdit = false;
  }

  goBack() {
    this.router.navigate(['/company-list']);
  }
}
