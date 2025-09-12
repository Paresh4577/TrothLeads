import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LeadService } from '../lead.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addlead',
  standalone: false,
  templateUrl: './addlead.component.html',
  styleUrl: './addlead.component.scss',
})
export class AddleadComponent {
  leadForm!: FormGroup;
  users: any[] = [];
  categories: any[] = [];
  sources = ['GetQuotes', 'Advertise', 'Call', 'Manual'];

  isAdmin: boolean = true;
  leadId: number = 0;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.leadId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.leadId;

    this.leadForm = this.fb.group({
      Name: ['', Validators.required],
      Phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      Email: ['', [Validators.required, Validators.email]],
      Message: [''],
      Source: ['Manual', Validators.required],
      CategoryId: [null, Validators.required],
      AssignedToUserId: [null],
      CreatedBy: [999],
      type: [''],
      PolicyNo: ['']
    });

    this.fetchCategory();
    this.fetchEmployee();

    if (this.isEditMode) {
      this.leadService.getLeadById(this.leadId).subscribe((res) => {
        const parsed = JSON.parse(res.responseData || '[]');
        if (parsed.length) {
          this.leadForm.patchValue(parsed[0]);
        }
      });
    }
  }
  goBack() {
    this.router.navigate(['leadlist'])
  }

  fetchCategory() {
    this.leadService.getCat().subscribe((res: any) => {
      this.categories = JSON.parse(res.responseData || '[]');
    });
  }

  fetchEmployee() {
    this.leadService.getEmp().subscribe((res: any) => {
      const companyId = localStorage.getItem('companyid');
      const userId = localStorage.getItem('UserId');
      console.log(res.responseData);
      this.users = JSON.parse(res.responseData || '[]').filter(
        (u: any) => u.IsEmployee
      );

      this.isAdmin = companyId === '0';
      if (!this.isAdmin && userId) {
        this.users = this.users.filter((u: any) => u.UserAdminId == userId);
      }
    });
  }

  submitLead(): void {
    if (this.leadForm.valid) {
      const companyid = localStorage.getItem('companyid');
      const userId = localStorage.getItem('UserId');

      if (companyid && companyid !== '0') {
        this.leadForm.patchValue({ AssignedToUserId: userId });
      }

      const payload = this.leadForm.value;

      if (this.isEditMode) {
        payload.LeadId = this.leadId;
        this.leadService.updateLead(payload).subscribe((res: any) => {
          if (res?.status === '200') {
            Swal.fire({
              icon: 'info', // You could also use 'warning' or 'success'
              title: 'Success',
              text: 'Lead Updated Successfully',
              confirmButtonColor: '#17a2b8' // A different color for clarity
            });
            this.router.navigate(['/leadlist']);
          } else {
            alert('Error: ' + res.message);
          }
        });
      } else {
        this.leadService.saveLead(payload).subscribe((res: any) => {
          if (res?.status === '200') {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Lead Saved Successfully',
              confirmButtonColor: '#3085d6'
            });
            this.router.navigate(['/leadlist']);
          } else {
            alert('Error: ' + res.message);
          }
        });
      }
    } else {
      this.leadForm.markAllAsTouched();
      alert('Some fields are required');
    }
  }
}
