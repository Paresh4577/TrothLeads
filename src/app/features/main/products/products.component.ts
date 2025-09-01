import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  products: any[] = []; // Full list of products from the service
  paginatedProducts: any[] = [];
  successMessage: string = '';
  showEditForm = false; // Filtered and paginated list for display
  currentProduct: any = {
    ProductId: null,
    ProductName: '',
    ProductCode: '',
    Description: '',
    Price: null,
    IsActive: true,
    DateCreated: null,
    CreatedBy: '',
    DateUpdated: null,
    UpdatedBy: '',
  };

  isLoading = true;
  errorMessage = '';
  showForm = false;
  isEditing = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Search variables
  searchProductName: string = '';
  searchProductCode: string = '';
  itemsPerPageOptions: number[] = [];
  noRecord: string = '';
  showAddButton: boolean = false;
  constructor(
    private authService: authService,
    private router: Router,
    private mesageservice: MessageService
  ) {}

  ngOnInit(): void {
    const permissions = JSON.parse(
      localStorage.getItem('modulePermissions') || '[]'
    );
    const policiesPermission = permissions.find((p: any) => p.ModuleName === 'policies');
    const masterPermission = permissions.find(
      (p: any) => p.ModuleName === 'master'
    );
    this.showAddButton = masterPermission?.CanWrite === true;
this.showAddButton = policiesPermission?.CanWrite === true;
    const token = localStorage.getItem('authtoken');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProducts();
    this.noRecord = this.mesageservice.getNoRecordMessage();
  }

 
    

  navigateToAddProduct(): void {
    this.router.navigate(['/addProduct']); // Navigate to the addProduct route
  }

toggleIsActive(product: any): void {
    const updatedProduct = { ...product, IsActive: product.IsActive };
    // Format DateUpdated to YYYY-MM-DD HH:MM:SS
    const formatDate = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };
    updatedProduct.DateUpdated = formatDate(new Date());
    updatedProduct.UpdatedBy = this.authService.getCurrentUser() || 'admin';

    this.authService.updateProduct(product.ProductId, updatedProduct).subscribe({
      next: () => {
        this.loadProducts();
       this.successMessage = `Product ${product.ProductName} is now ${product.IsActive ? 'active' : 'inactive'}`;
this.errorMessage = '';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => {
        product.IsActive = !product.IsActive; // Revert toggle state
        this.handleError('Failed to update product status', err);
      },
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getAllProducts().subscribe({
      next: (data: any) => {
        console.log(data);
        this.products = data;
        this.totalItems = data.length; // Total database records count
        this.generateItemsPerPageOptions(this.totalItems); // Dynamically generate options
        this.isLoading = false;
        this.searchProducts();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        console.error('Error loading products:', err);
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

  searchProducts(): void {
    let filteredProducts = [...this.products];

    if (this.searchProductName) {
      filteredProducts = filteredProducts.filter((product) =>
        product.ProductName.toLowerCase().includes(
          this.searchProductName.toLowerCase()
        )
      );
    }

    if (this.searchProductCode) {
      filteredProducts = filteredProducts.filter((product) =>
        product.ProductCode.toLowerCase().includes(
          this.searchProductCode.toLowerCase()
        )
      );
    }

    this.totalItems = filteredProducts.length;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    console.log(this.paginatedProducts);
  }

  showAddForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentProduct = {
      ProductId: null,
      ProductName: '',
      ProductCode: '',
      Description: '',
      Price: null,
      IsActive: true,
      DateCreated: null,
      CreatedBy: this.authService.getCurrentUser() || 'admin',
      DateUpdated: null,
      UpdatedBy: '',
    };
  }

  editProduct(productId: number): void {
    const product = this.products.find((p) => p.ProductId === productId);
    if (product) {
      console.log('productid', productId);
      this.router.navigate(['/addProduct', productId]);
    }
  }

  submitProduct(): void {
    this.currentProduct.DateCreated = this.isEditing
      ? this.currentProduct.DateCreated
      : new Date();
    this.currentProduct.CreatedBy = this.isEditing
      ? this.currentProduct.CreatedBy
      : this.authService.getCurrentUser() || 'admin';

    if (this.isEditing) {
      this.authService
        .updateProduct(this.currentProduct.ProductId, this.currentProduct)
        .subscribe({
          next: () => {
            this.loadProducts();
            this.showForm = false;
          },
          error: (err) => this.handleError('Failed to update product', err),
        });
    } else {
      this.authService.createProduct(this.currentProduct).subscribe({
        next: () => {
          this.loadProducts();
          this.showForm = false;
        },
        error: (err) => this.handleError('Failed to create product', err),
      });
    }
  }

  deleteProduct(productId: number): void {
    console.log('productid', productId);
    this.authService.deleteProduct(productId).subscribe({
      next: () => this.loadProducts(),
      error: (err) => this.handleError('Failed to delete product', err),
    });
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.itemsPerPage = +target.value;
      this.currentPage = 1; // Reset to first page
      this.searchProducts();
    }
  }

  private handleError(message: string, error: any): void {
    this.errorMessage = message;
    console.error(error);
    setTimeout(() => (this.errorMessage = ''), 3000); // Clear error after 3 seconds
  }
}
