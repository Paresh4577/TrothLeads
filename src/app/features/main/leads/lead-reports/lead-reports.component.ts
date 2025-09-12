import { Component } from '@angular/core';
import { LeadService } from '../lead.service';

@Component({
  selector: 'app-lead-reports',
  standalone: false,
  templateUrl: './lead-reports.component.html',
  styleUrl: './lead-reports.component.scss'
})
export class LeadReportsComponent {
  totalCount: number = 0;
  fromDate!: string;
   displayedLeads: any[] = []; 
    currentPage = 1;
   pageNo: number = 1;
  pageSize: number = 10;
  toDate!: string;
   leads: any[] = [];
   filterType: string = 'MONTH'; 
   loading: boolean = false;

  constructor(private leadService: LeadService) { }

updateDisplayedLeads() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedLeads = this.leads.slice(startIndex, endIndex);
  }
  

previewReport() {
  if (!this.fromDate || !this.toDate) {
    alert('Please select both From and To dates');
    return;
  }

  this.loading = true;
  this.leads = [];

  this.leadService.getLeadsByRange(this.fromDate, this.toDate).subscribe({
    next: (res: any) => {
      this.loading = false;
      if (res && res.responseData) {
        this.leads = JSON.parse(res.responseData);
        console.log("Filtered Leads:", this.leads);
      }
    },
    error: (err) => {
      this.loading = false;
      console.error(err);
      alert('Failed to load report preview.');
    }
  });
}

 goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageNo = page;
      this.previewReport();
    }
  }

    getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.pageNo;
    const maxButtons = 5;
    const pages: number[] = [];

    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = Math.min(total, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  downloadReport() {
    if (!this.fromDate || !this.toDate) {
      alert('Please select both dates');
      return;
    }

    this.leadService.downloadLeadReportByRange(this.fromDate, this.toDate).subscribe({
      next: (response: Blob) => {
        console.log("response", response)
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        link.download = `LeadReport_${this.fromDate}_${this.toDate}_${timestamp}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        if (err.status === 400) {
          alert("No leads found for the selected date range.");
        } else {
          alert("Something went wrong. Try again.");
        }
      },
    });
  }

  changePage(direction: number): void {
    
    const newPage = this.pageNo + direction;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageNo = newPage;
      this.previewReport();
    }
  }

   get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }
}
