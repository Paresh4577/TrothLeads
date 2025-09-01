import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
@Component({
  selector: 'app-getsupport',
  standalone: false,
  templateUrl: './getsupport.component.html',
  styleUrl: './getsupport.component.scss'
})
export class GetsupportComponent {
  supportList: any[] = [];
  pageNo: number = 0;
  pageSize: number = 0;
paginatedSupportList: any[] = [];
itemsPerPage: number = 10;
currentPage: number = 0;
totalItems: number = 0;
itemsPerPageOptions: number[] = [];
isLoading = false;
errorMessage = '';

  constructor(private authService: authService) {}

  ngOnInit(): void {
    this.loadSupportData(); // ✅ Initial data load on page load
  }

loadSupportData(): void {
  this.isLoading = true;
  this.authService.getSupport(this.pageNo, this.pageSize).subscribe({
    next: (data) => {
      console.log('📞 Support data received:', data);
      this.supportList = data;
      this.totalItems = data.length;

      // ✅ Dynamically generate options based on total items
      this.generateItemsPerPageOptions(this.totalItems);

      this.updatePagination();
      this.isLoading = false;
    },
    error: (err) => {
      console.error('❌ Failed to load support data:', err);
      this.errorMessage = err.message || 'Failed to load support data';
      this.isLoading = false;
    }
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


updatePagination(): void {
  const start = this.currentPage * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.paginatedSupportList = this.supportList.slice(start, end);
}

// Handlers
onItemsPerPageChange(count: number): void {
  this.itemsPerPage = count;
  this.currentPage = 0;
  this.updatePagination();
}

onPageChange(page: number): void {
  this.currentPage = page;
  this.updatePagination();
}
}
