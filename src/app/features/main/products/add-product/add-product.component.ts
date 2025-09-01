import { Component } from '@angular/core';
import { authService } from '../../../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  standalone: false,
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  currentProduct: any = {
    ProductId: null,
    ProductName: '',
    ProductCode: '',
    ProductDesc: '',
    ProductHeaderId: null,
    ProductImage: null,
    DateCreated: null,
    CreatedBy: '',
    DateUpdated: null,
    UpdatedBy: '',
    weburl: '',
    priority: null,
  };
  priorityList: number[] = [];
  isEditMode: boolean = false;
  productHeaders: { ProductHeaderId: number; ProductHeaderName: string }[] = [];
  imagePreview: string | null = null;
  selectedImage: File | null = null;

  constructor(
    private authService: authService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load product headers from all products
    this.loadProductHeaders();
    this.loadPriorityList();

    // Check if we're in edit mode
    const productId = this.route.snapshot.paramMap.get('productId');
    if (productId) {
      this.isEditMode = true;
      this.loadProduct(+productId);
    }
  }
  loadPriorityList(): void {
    this.authService.getProducts().subscribe((products: any[]) => {
      const count = products.length || 10;
      this.priorityList = Array.from({ length: count }, (_, i) => i + 1);
    });
  }

  loadProductHeaders(): void {
    this.authService.getProductHeaders().subscribe({
      next: (products) => {
        // Extract unique product headers
        const headersMap = new Map<number, string>();
        products.forEach((product: any) => {
          if (product.ProductHeaderId && product.ProductHeaderName) {
            headersMap.set(product.ProductHeaderId, product.ProductHeaderName);
          }
        });
        this.productHeaders = Array.from(headersMap.entries()).map(
          ([id, name]) => ({
            ProductHeaderId: id,
            ProductHeaderName: name,
          })
        );
      },
      error: (err: any) => {
        console.error('Failed to load product headers:', err);
      },
    });
    console.log("productehaders",this.productHeaders)
  }

  loadProduct(productId: number): void {
    this.authService.getProductById(productId).subscribe({
      next: (product: any) => {
        console.log('product is ', product);
        if (product) {
          this.currentProduct = { ...product };

          // Set the editor content
          const editor = document.getElementById(
            'productDesc'
          ) as HTMLDivElement;
          if (editor) {
            editor.innerHTML = this.currentProduct.ProductDesc || '';
          }

          // If there's an existing image, set the preview
          if (this.currentProduct.ProductImage) {
            this.imagePreview = this.currentProduct.ProductImage;
          }

          console.log('Product loaded for editing:', this.currentProduct);
        }
      },
      error: (err: any) => {
        console.error('Failed to load product:', err);
        this.router.navigate(['products']);
      },
    });
  }

  onEditorInput(event: Event): void {
    const target = event.target as HTMLDivElement;
    this.currentProduct.ProductDesc = target.innerHTML;
  }

  formatText(command: string): void {
    document.execCommand(command, false, undefined);
  }
  extractFileName(imagePath: string): string {
    // Agar full URL ya path ho to sirf file name nikaale
    return imagePath.split('/').pop() || imagePath;
  }

  onImageSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPG and PNG images are allowed.');
      input.value = ''; // clear the invalid file
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }

    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(this.selectedImage);
  }

  submitProduct(): void {
    const currentUser = this.authService.getCurrentUser() || 'admin';
    if (this.isEditMode) {
      this.currentProduct.DateUpdated = new Date().toISOString();
      this.currentProduct.UpdatedBy = currentUser;

      console.log('Updating product with ID:', this.currentProduct.ProductId);

      // Only pass the image if a new one was selected
      const imageToUse = this.selectedImage || undefined;

      this.authService
        .updateProduct(
          this.currentProduct.ProductId,
          this.currentProduct,
          imageToUse
        )
        .subscribe({
          next: (response) => {
            console.log('Product updated successfully:', response);
            this.router.navigate(['products']);
          },
          error: (err) => {
            console.error('Failed to update product:', err);
            let errorMessage = 'Failed to update product. ';

            if (err.status === 0) {
              errorMessage +=
                'Please check if the API server is running at http://localhost:2293';
            } else if (err.status === 401) {
              errorMessage += 'You are not authorized. Please login again.';
            } else if (err.status === 400) {
              errorMessage += 'Invalid data provided. Please check your input.';
            } else if (err.status === 500) {
              errorMessage += 'Server error. Please try again later.';
            } else {
              errorMessage += err.message || 'Please try again.';
            }

            alert(errorMessage);
          },
        });
    } else {
      this.currentProduct.DateCreated = new Date().toISOString();
      this.currentProduct.CreatedBy = currentUser;

      console.log('Submitting new product data:', this.currentProduct);
      this.authService
        .createProduct(this.currentProduct, this.selectedImage || undefined)
        .subscribe({
          next: (response) => {
            console.log('Product created successfully:', response);
            this.router.navigate(['products']);
          },
          error: (err) => {
            console.error('Failed to create product:', err);
            let errorMessage = 'Failed to create product. ';

            if (err.status === 0) {
              errorMessage +=
                'Please check if the API server is running at http://localhost:2293';
            } else if (err.status === 401) {
              errorMessage += 'You are not authorized. Please login again.';
            } else if (err.status === 400) {
              errorMessage += 'Invalid data provided. Please check your input.';
            } else if (err.status === 500) {
              errorMessage += 'Server error. Please try again later.';
            } else {
              errorMessage += err.message || 'Please try again.';
            }

            alert(errorMessage);
          },
        });
    }
  }

  cancel(): void {
    this.router.navigate(['products']);
  }
}
