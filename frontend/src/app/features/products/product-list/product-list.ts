import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product';
import { Product, ProductRequest } from '../../../core/models/product.model';

@Component({
  imports: [FormsModule, CurrencyPipe],
  selector: 'app-product-list',
  styleUrl: './product-list.scss',
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly productService = inject(ProductService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected newProduct: ProductRequest = { name: '', description: '', price: 0, stock: 0 };

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.findAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con catalog-api. ¿Está corriendo en el puerto 8080?');
        this.loading.set(false);
      },
    });
  }

  protected addProduct(): void {
    if (!this.newProduct.name.trim()) {
      return;
    }
    this.productService.create(this.newProduct).subscribe(() => {
      this.newProduct = { name: '', description: '', price: 0, stock: 0 };
      this.loadProducts();
    });
  }

  protected removeProduct(id: number): void {
    this.productService.delete(id).subscribe(() => this.loadProducts());
  }
}
