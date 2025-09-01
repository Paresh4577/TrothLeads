import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';

@Component({
  selector: 'app-smslogs',
  standalone: false,
  templateUrl: './smslogs.component.html',
  styleUrls: ['./smslogs.component.scss']
})
export class SMSLogsComponent {
  smsLogs: any[] = [];
  paginatedLogs: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  searchLogId: string = '';
  searchUserId: string = '';
  searchMobile: string = '';
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPageOptions: number[] = [];

  constructor(private authService: authService) {}

  ngOnInit(): void {
    this.loadSMSLogs();
  }

 loadSMSLogs(): void {
  this.isLoading = true;
  this.authService.getSMSLogs(this.currentPage - 1, this.itemsPerPage).subscribe({
    next: (response) => {
      console.log("resis",response)
      try {
       
          this.smsLogs = response;
        console.log('🧮 Total Items from API:', this.smsLogs.length);

        this.totalItems = this.smsLogs.length || 0;
        this.generateItemsPerPageOptions(this.totalItems);
        this.applyFiltersAndPagination();
      } catch (e) {
        console.error('❌ Failed to parse responseData:', e);
        this.errorMessage = 'Invalid data format received.';
        this.smsLogs = [];
      } finally {
        this.isLoading = false;
      }
    },
    error: (error) => {
      this.errorMessage = 'Failed to load SMS logs. Please try again later.';
      this.isLoading = false;
      console.error('Error:', error);
    },
  });
}


generateItemsPerPageOptions(total: number): void {
  const baseOptions = [10, 25, 50, 100, 200, 500];
  this.itemsPerPageOptions = baseOptions.filter(opt => opt <= total);

  // Optionally, always include total if not already in list
  if (!this.itemsPerPageOptions.includes(total)) {
    this.itemsPerPageOptions.push(total);
  }

  // Sort options
  this.itemsPerPageOptions.sort((a, b) => a - b);
}


  

  applyFiltersAndPagination(): void {
    let filteredLogs = [...this.smsLogs];

    // Apply search filters
    if (this.searchLogId) {
      filteredLogs = filteredLogs.filter((log) =>
        log.SmsLogId?.toString().includes(this.searchLogId)
      );
    }
    if (this.searchUserId) {
      filteredLogs = filteredLogs.filter((log) =>
        log.UserId?.toString().includes(this.searchUserId)
      );
    }
    if (this.searchMobile) {
      filteredLogs = filteredLogs.filter((log) =>
        log.Mobile?.toLowerCase().includes(this.searchMobile.toLowerCase())
      );
    }

    // Update total items for pagination
    this.totalItems = filteredLogs.length;

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedLogs = filteredLogs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  searchLogs(): void {
    this.currentPage = 1; // Reset to first page on search
    this.applyFiltersAndPagination();
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.loadSMSLogs(); // Reload with new page size
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSMSLogs(); // Reload with new page
  }
}
