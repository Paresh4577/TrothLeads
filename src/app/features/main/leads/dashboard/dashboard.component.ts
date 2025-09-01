import { Component } from '@angular/core';
import { LeadService } from '../lead.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [CommonModule, NgxChartsModule, FormsModule],
})
export class DashboardComponent {
  showLogsOnly: boolean = false;
  stats: any = {};
  weeklyChartData: any[] = [];
  startDate: any;
  allLeadsLog: any[] = [];
  endDate: any;
  pieChartData = [
    { name: 'Converted', value: 120 },
    { name: 'Dropped', value: 50 },
    { name: 'New', value: 90 },
  ];

  colorScheme = {
    domain: ['#4CAF50', '#F44336', '#2196F3'],
  };

  constructor(private leadService: LeadService, private router: Router) { }

  ngOnInit(): void {
    this.getWeeklyReport();
    this.fetchAllLeadsLog();
    const payload = {
      UserId: Number(localStorage.getItem('UserId')),

      PageNo: 0,
      PageSize: 0,
      StartDate: '', // optional
      EndDate: '', // optional
    };
    console.log('emp id is ', payload.UserId);
    this.leadService.getDashboardStats(payload).subscribe((res: any) => {
      if (res?.responseData) {
        this.stats = JSON.parse(res.responseData);
      }
    });
    this.leadService.getSourceWiseReport(payload).subscribe((res: any) => {
      console.log('Chart data from API:', res);
      if (res?.responseData) {
        const parsed = JSON.parse(res.responseData);
        this.pieChartData = parsed.map((item: any) => ({
          name: item.Source,
          value: item.TotalLeads,
        }));
      }
    });
  }
  goBack() {
    this.router.navigate(['leadlist'])
  }
 
  goToAllLeads(): void {
    this.router.navigate(['leadlist']);
  }
  toggleLogsView() {
    this.showLogsOnly = !this.showLogsOnly;
  }
  getWeeklyReport(): void {
    const payload = {
      StartDate: this.startDate || null,
      EndDate: this.endDate || null,
    };
    this.leadService.getWeeklyReport(payload).subscribe((res: any) => {
      if (res?.responseData) {
        const data = JSON.parse(res.responseData);
        this.weeklyChartData = data.map((d: any) => ({
          name: d.ReportDate,
          series: [
            { name: 'New', value: d.NewLeads },
            { name: 'In Progress', value: d.InProgressLeads },
            { name: 'Converted', value: d.ConvertedLeads },
            { name: 'Dropped', value: d.DroppedLeads },
          ],
        }));
      }
    });
  }

  fetchAllLeadsLog(): void {
    this.leadService.getAllLeadsLog().subscribe({

      next: (res) => {

        this.allLeadsLog = res?.responseData ? JSON.parse(res.responseData) : [];
        console.log("alleadslog", this.allLeadsLog)
      },
      error: (err) => {
        console.error('Error fetching leads log:', err);
        this.allLeadsLog = [];
      }
    });
  }
}
