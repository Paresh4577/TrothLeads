import { Component } from '@angular/core';
import { authService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-header',
  standalone: false,
  templateUrl: './product-header.component.html',
  styleUrl: './product-header.component.scss'
})
export class ProductHeaderComponent {
  productHeaders: { ProductHeaderId: number; ProductHeaderName: string }[] = [];
  isLoading: boolean = false;
  searchProductHeaderName = '';
  paginatedProductHeaders: any[] = [];
 errorMessage: string = '';
 currentPage = 1;
 itemsPerPage = 10;
 totalItems = 0;
 
 
   constructor(private authService: authService,private router:Router) {}
 
   ngOnInit(): void {
     this.loadProductHeaders();
   }
 
  loadProductHeaders(): void {
   this.isLoading = true;
   this.authService.getProductHeaders().subscribe({
     next: (products) => {
       const headersMap = new Map<number, string>();
       products.forEach((product: any) => {
         if (product.ProductHeaderId && product.ProductHeaderName) {
          console.log("Product header",product.ProductHeaderName)
           headersMap.set(product.ProductHeaderId, product.ProductHeaderName);
         }
       });
 
       this.productHeaders = Array.from(headersMap.entries()).map(
         ([id, name]) => ({
           ProductHeaderId: id,
           ProductHeaderName: name,
         })
       );
       this.searchProductheaders(); 
       this.isLoading = false;
     },
     error: (err) => {
       console.error('Failed to load product headers:', err);
       this.errorMessage = 'Failed to load product headers.';
       this.isLoading = false;
     },
   });
 }
 navigateToAddProductHeader(){
  this.router.navigate(['/addProductHeader']);
 }
 
 searchProductheaders(): void {
  let filteredProductHeaders = [...this.productHeaders];

  if (this.searchProductHeaderName) {
    filteredProductHeaders = filteredProductHeaders.filter((product) =>
      product.ProductHeaderName.toLowerCase().includes(
        this.searchProductHeaderName.toLowerCase()
      )
    );
  }

  

  this.totalItems = filteredProductHeaders.length;

  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  this.paginatedProductHeaders = filteredProductHeaders.slice(startIndex, endIndex);
  console.log(this.paginatedProductHeaders);
}

 deleteProductHeader(ProductHeaderId: number): void {
  console.log("id is product ",ProductHeaderId)
    const banner = this.productHeaders.find((b) => b.ProductHeaderId === ProductHeaderId);
    this.authService.deleteProductHeader(ProductHeaderId).subscribe({
      next: () => this.loadProductHeaders()
    });
  }
}
