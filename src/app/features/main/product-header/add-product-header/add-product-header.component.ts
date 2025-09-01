import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-product-header',
  standalone: false,
  templateUrl: './add-product-header.component.html',
  styleUrl: './add-product-header.component.scss'
})
export class AddProductHeaderComponent {
  currentHeader: any = {
    ProductHeaderId: null,
    ProductHeaderName: '',
    IsActive: true,
    CreatedBy: '',
    UpdatedBy: '',
  };

  isEditMode = false;

  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const headerId = this.route.snapshot.paramMap.get('headerId');
    if (headerId) {
      this.isEditMode = true;
      this.loadProductHeader(+headerId);
    }
  }

  loadProductHeader(id: number): void {
    this.authService.getProductHeaders().subscribe({
      next: (headers) => {
        const header = headers.find((h: any) => h.ProductHeaderId === id);
        if (header) {
          this.currentHeader = { ...header };
        }
      },
      error: (err) => {
        console.error('Error loading header:', err);
        this.router.navigate(['/procut-header']);
      },
    });
  }

  submitProductHeader(): void {
    const currentUser = this.authService.getCurrentUser() || 'admin';

    if (this.isEditMode) {
      this.currentHeader.UpdatedBy = currentUser;
    } else {
      this.currentHeader.CreatedBy = currentUser;
    }

    this.authService.createOrUpdateProductHeader(this.currentHeader).subscribe({
      next: (res) => {
        console.log('Header saved:', res);
        this.router.navigate(['/procut-header']);
      },
      error: (err) => {
        console.error('Failed to save header:', err);
        alert('Error saving header');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/procut-header']);
  }
}
