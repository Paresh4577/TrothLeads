import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { GlobalsService } from '../../../globals.service';

@Component({
  selector: 'app-banners',
  standalone: false,
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent {
  banners: any[] = [];
  paginatedBanners: any[] = [];
  currentBanner: any = {
    BannerId: null,
    BannerHeaderName: '',
    BannerFileName: '',
    BannerType: '',
    OrderNo: null,
    IsActive: true,
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

    itemsPerPageOptions: number[] = [5, 10, 25, 50];

  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Search variables
  searchBannerHeaderName: string = '';
  searchBannerFileName: string = '';
  searchBannerOrderNo: string = '';
  showAddButton: boolean = false;
  // Filter dropdown              
  selectedBannerType: string = 'All';
  bannerTypes: string[] = ['All', 'Inquiry', 'PopularPlans', 'Middle', 'ClaimNow'];

  constructor(private authService: authService, private router: Router, public globals: GlobalsService) { }

  ngOnInit(): void {

    const permissions = JSON.parse(localStorage.getItem('modulePermissions') || '[]');
    const masterPermission = permissions.find((p: any) => p.ModuleName === 'master');
    this.showAddButton = masterPermission?.CanWrite === true;
    this.loadBanners();
  }

  navigateToAddBanner(): void {
    this.router.navigate(['addBanner']);
  }

  loadBanners(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getBanners().subscribe({
      next: (data: any) => {
        this.banners = data;
        this.totalItems = data.length;
        console.log("length",this.totalItems)
       this.generateItemsPerPageOptions(this.totalItems)
        this.isLoading = false;
        this.searchBanners();
        console.log("banners",this.banners)
      },
      error: (err) => {
        this.errorMessage = 'Failed to load banners. Please try again later.';
        this.isLoading = false;
        console.error('Error loading banners:', err);
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
  searchBanners(): void {
    let filteredBanners = [...this.banners];

    if (this.searchBannerHeaderName.trim()) {
      filteredBanners = filteredBanners.filter((banner) =>
        banner.BannerHeaderName?.toLowerCase().includes(this.searchBannerHeaderName.toLowerCase())
      );
    }

    if (this.searchBannerFileName.trim()) {
      filteredBanners = filteredBanners.filter((banner) =>
        banner.BannerFileName?.toLowerCase().includes(this.searchBannerFileName.toLowerCase())
      );
    }

    if (this.searchBannerOrderNo.trim()) {
      filteredBanners = filteredBanners.filter((banner) =>
        banner.OrderNo?.toString().toLowerCase().includes(this.searchBannerOrderNo.toLowerCase())
      );
    }

    // Filter by BannerType
    if (this.selectedBannerType && this.selectedBannerType !== 'All') {
      filteredBanners = filteredBanners.filter(
        (banner) => banner.BannerType?.toLowerCase().trim() === this.selectedBannerType.toLowerCase()
      );
    }

    this.totalItems = filteredBanners.length;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedBanners = filteredBanners.slice(startIndex, endIndex);
  }

  onBannerTypeChange(): void {
    this.searchBanners();
  }

  editBanner(bannerId: number): void {
    const banner = this.banners.find((b) => b.BannerId === bannerId);
    if (banner) {
      this.router.navigate(['addBanner', bannerId]);
    }
  }

  deleteBanner(bannerId: number): void {
    const banner = this.banners.find((b) => b.BannerId === bannerId);
    this.authService.deleteBanner(bannerId).subscribe({
      next: () => this.loadBanners()

    });
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1;
      this.searchBanners();
    }
  }
}
