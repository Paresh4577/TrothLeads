import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';

@Component({
  selector: 'app-product-forms',
  standalone: false,
  templateUrl: './product-forms.component.html',
  styleUrl: './product-forms.component.scss'
})
export class ProductFormsComponent {
  products: any[] = [];
  totalItems: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  private colors: string[] = [
   
    '#5BA6C9', // Muted Cyan
    '#5C9FA8', // Desaturated Teal
    '#6DAACB', // Soft Steel Blue
    '#88C2D7', // Light Ocean Blue
    '#7FB8C9'  // Soft Cool Teal
  ];
  
  
  
  
  constructor(private authService: authService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getProducts().subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.products = data;
        this.totalItems = data.length; // Total database records count
        this.generateItemsPerPageOptions(); // Dynamically generate options
        this.isLoading = false;
        this.searchProducts();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to load products. Please try again later.';
        this.isLoading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  // Placeholder for generateItemsPerPageOptions (implement as needed)
  generateItemsPerPageOptions(): void {
    // Example: Generate pagination options based on totalItems
    // You can customize this based on your requirements
    console.log('Generating items per page options');
  }

  // Placeholder for searchProducts (implement as needed)
  searchProducts(): void {
    // Example: Filter products based on search criteria
    console.log('Searching products');
  }

  // Utility to determine card color based on index
  getCardClass(index: number): string {
    return index % 2 === 0 ? 'card-blue' : 'card-orange';
  }

  // Generate a random color from the colors array
  getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.colors.length);
    return this.colors[randomIndex];
  }
}
