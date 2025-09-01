import { Component, OnInit } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-banner',
  standalone: false,
  templateUrl: './add-banner.component.html',
  styleUrls: ['./add-banner.component.scss'],
})
export class AddBannerComponent implements OnInit {
  currentBanner: any = {
    BannerId: null,
    BannerHeaderName: '',
    BannerFileName: '',
    BannerType: '',
    WebUrl:'',
    ProductId:null,
    OrderNo: 0,
    IsActive: true,
    DateCreated: null,
    CreatedBy: '',
    DateUpdated: null,
    UpdatedBy: '',
  };
 bannerTypes: string[] = ['Inquiry', 'Middle', 'PopularPlans','ClaimNow'];
  isEditing: boolean = false;
  selectedFile: File | null = null;
products: any[] = [];
  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const bannerId = Number(params.get('bannerId'));
      if (bannerId) {
        this.isEditing = true;
        this.loadBannerData(bannerId);
      }
    });
    this.loadProducts();
  }
 loadProducts(): void {

    this.authService.getProducts().subscribe({
      next: (data: any) => {
        console.log(data);
        this.products = data;
        
      },
      error: (err: any) => {
       
        console.error('Error loading products:', err);
      },
    });
  }
  loadBannerData(bannerId: number): void {
    this.authService.getBannerById(bannerId).subscribe({
      next: (banner) => {
        console.log('Fetched banner:', banner);
        if (banner) {
          this.currentBanner = { ...banner };
        } else {
          console.warn('No banner data found for ID:', bannerId);
          this.router.navigate(['banner']);
        }
      },
      error: (err) => {
        console.error('Failed to load banner:', err);
        this.router.navigate(['banner']);
      },
    });
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.currentBanner.BannerFileName = this.selectedFile?.name || ''; // Safe access with fallback
    }
  }

submitBanner(): void {
  // 1️⃣ Basic field validations
  if (!this.currentBanner.BannerHeaderName?.trim()) {
    console.error('Banner Header Name is required');
    return;
  }

  if (!this.currentBanner.OrderNo) {
    console.error('Order Number is required');
    return;
  }

  // File is mandatory only when adding a new banner
  if (!this.isEditing && !this.selectedFile) {
    console.error('File is required for new banners');
    return;
  }

  // 2️⃣ Prepare data
  const bannerId = this.isEditing ? this.currentBanner.BannerId : null;

  const bannerHeaderName = this.currentBanner.BannerHeaderName.trim();
  const orderNo = this.currentBanner.OrderNo ?? 0;
  const isActive = this.currentBanner.IsActive ?? true;
  const bannerType = this.currentBanner.BannerType || '';
  const productId = this.currentBanner.ProductId ?? null;

  // Only send file when creating or when a new file is chosen
  const fileToUpload = (!this.isEditing || this.selectedFile) ? this.selectedFile : null;

  // 3️⃣ Call API
  this.authService.uploadBanner(
    bannerId,
    bannerHeaderName,
    fileToUpload,
    orderNo,
    isActive,
    bannerType,
    productId
  )
  .subscribe({
    next: (response) => {
      console.log('Banner saved successfully:', response);

      localStorage.setItem(
        'bannerMessage',
        this.isEditing
          ? 'Banner updated successfully!'
          : 'Banner added successfully!'
      );

      this.router.navigate(['banner']);
    },
    error: (err) => {
      console.error(
        `Failed to ${this.isEditing ? 'update' : 'create'} banner:`,
        err
      );
      if (err.error) {
        console.error('Error details:', err.error);
      }
    }
  });
}



  cancel(): void {
    this.router.navigate(['banner']);
  }
}