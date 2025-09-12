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
  totalMostLeadsSource: any;
   totalMostLeadsSourceName: any;
  showLogsOnly: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  userName: any;
  stats: any = {};
  weeklyChartData: any[] = [];
  startDate: any;
  allLeadsLog: any[] = [];
  leadsBySource: any[] = [];
  endDate: any;
  empCode: any;
  pieChartData: any[] = [];
  // pieChartData = [
  //   { name: 'Converted', value: 120 },
  //   { name: 'Dropped', value: 50 },
  //   { name: 'New', value: 90 },
  // ];

  colorScheme = {
    domain: ['#4CAF50', '#F44336', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4'],
  };

  constructor(private leadService: LeadService, private router: Router) { }

  ngOnInit(): void {
    this.getWeeklyReport();
    this.fetchLeadsBySource();
    this.fetchAllLeadsLog();
    this.empCode = localStorage.getItem('Employeecode');
    console.log("emp code", this.empCode)
    this.userName = localStorage.getItem('token');
    const payload = {
      UserId: Number(localStorage.getItem('UserId')),

      PageNo: 0,
      PageSize: 0,
      StartDate: '',
      EndDate: '',
    };
    console.log('emp id is ', payload.UserId);
    this.leadService.getDashboardStats(payload).subscribe((res: any) => {
      if (res?.responseData) {
        this.stats = JSON.parse(res.responseData);
      }
    });
    // this.leadService.getSourceWiseReport(payload).subscribe((res: any) => {
    //   console.log('Chart data from API:', res);
    //   if (res?.responseData) {
    //     const parsed = JSON.parse(res.responseData);
    //     this.pieChartData = parsed.map((item: any) => ({
    //       name: item.Source,
    //       value: item.TotalLeads,
    //     }));
    //   }
    // });
  }
  goBack() {
    this.router.navigate(['leadlist'])
  }
  transformDataForChart() {
    this.pieChartData = []; // Clear existing data

    // Simple for loop to transform data
    for (let i = 0; i < this.leadsBySource.length; i++) {
      this.pieChartData.push({
        name: this.leadsBySource[i].Source,
        value: this.leadsBySource[i].LeadCount
      });
    }
    console.log('Total leadsBySource:', this.leadsBySource.length);
    console.log('Total pieChartData:', this.pieChartData.length);
    console.log('pieChartData:', this.pieChartData);
  }
  goToAllLeads(): void {
    this.router.navigate(['leadlist']);
  }
  // toggleLogsView() {
  //   this.showLogsOnly = !this.showLogsOnly;
  // }
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

  fetchLeadsBySource(): void {
    this.leadService.getLeadsBySource().subscribe({
      next: (res) => {
        this.leadsBySource = res?.responseData ? JSON.parse(res.responseData) : [];
        console.log("leadsbysource", this.leadsBySource);
        const sorted = [...this.leadsBySource].sort((a, b) => b.LeadCount - a.LeadCount);
        const topSource = sorted[0];
        const topSourceName = topSource.Source;
        this.totalMostLeadsSource = topSource.LeadCount;
        this.totalMostLeadsSourceName= topSourceName;
        console.log("Top Source:",this.totalMostLeadsSource,this.totalMostLeadsSourceName);

        this.transformDataForChart();
      },
      error: (err) => {
        console.error('Error fetching leads log:', err);
        this.allLeadsLog = [];
      }
    });
  }


  getPaginatedLogs() {
    if (!this.allLeadsLog) return [];

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allLeadsLog.slice(startIndex, endIndex);
  }

  // Get total number of pages
  getTotalPages(): number {
    if (!this.allLeadsLog) return 0;
    return Math.ceil(this.allLeadsLog.length / this.itemsPerPage);
  }

  // Get start index for current page
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  // Get end index for current page
  getEndIndex(): number {
    const endIndex = this.currentPage * this.itemsPerPage;
    return Math.min(endIndex, this.allLeadsLog?.length || 0);
  }

  // Go to previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Go to next page
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Go to specific page
  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // Get visible page numbers (show max 5 pages)
  getVisiblePages(): number[] {
    const totalPages = this.getTotalPages();
    const visiblePages: number[] = [];

    if (totalPages <= 5) {
      // Show all pages if total pages <= 5
      for (let i = 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // Show smart pagination
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }
    }

    return visiblePages;
  }

  // Reset pagination when toggling view (add this to your existing toggleLogsView method)
  toggleLogsView() {
    this.showLogsOnly = !this.showLogsOnly;
    if (this.showLogsOnly) {
      this.currentPage = 1; // Reset to first page when opening all logs
    }
  }
}
