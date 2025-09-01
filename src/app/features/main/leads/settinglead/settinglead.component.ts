import { Component, OnInit } from '@angular/core';
import { LeadService } from '../lead.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settinglead',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settinglead.component.html',
  styleUrls: ['./settinglead.component.scss'],
})
export class SettingLeadComponent implements OnInit {
  teamForm!: FormGroup;
  users: any[] = [];

  constructor(
    private leadService: LeadService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.teamForm = this.fb.group({
      AssignedToUserId: [null, Validators.required],
    });

    this.leadService.getEmp().subscribe((res: any) => {
      this.users = JSON.parse(res.responseData || '[]').filter(
        (u: any) => u.IsEmployee
      );
    });
  }

  goBack() {
  this.router.navigate(['/leadlist']);
}
  save(): void {
    const payload = {
      UserAdminId: this.teamForm.value.AssignedToUserId,
      UpdatedBy: localStorage.getItem('UserId') ?? 999,
    };

    this.leadService.assignTeamLead(payload).subscribe((res: any) => {
      if (res?.status === '200') {
        alert('User has been made a Team Lead');
        this.router.navigate(['/leadlist']);
      } else {
        alert('Failed: ' + res.message);
      }
    });
  }
}
