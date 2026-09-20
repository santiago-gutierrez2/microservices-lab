import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderService } from '../../../core/services/order';
import { Order } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product';

interface OrderView extends Order {
  productName: string;
  total: number;
}

@Component({
  imports: [FormsModule, CurrencyPipe, DatePipe],
  selector: 'app-order-list',
  styleUrl: './order-list.scss',
  templateUrl: './order-list.html',
})
export class OrderList {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly products = signal<Product[]>([]);

  protected readonly ordersLoading = signal(true);
  protected readonly ordersError = signal<string | null>(null);
  protected readonly productsError = signal<string | null>(null);
  protected readonly createError = signal<string | null>(null);

  protected readonly selectedProductId = signal<number | null>(null);
  protected readonly quantity = signal(1);

  protected readonly selectedProduct = computed(
    () => this.products().find((p) => p.id === this.selectedProductId()) ?? null,
  );

  // "JOIN en el cliente": order-service solo guarda productId, el nombre vive en catalog-service.
  protected readonly ordersView = computed<OrderView[]>(() => {
    const namesById = new Map(this.products().map((p) => [p.id, p.name]));
    return this.orders().map((order) => ({
      ...order,
      productName: namesById.get(order.productId) ?? `Producto #${order.productId}`,
      total: order.unitPrice * order.quantity,
    }));
  });

  constructor() {
    this.loadProducts();
    this.loadOrders();
  }

  private loadProducts(): void {
    this.productService.findAll().subscribe({
      next: (products) => this.products.set(products),
      error: () =>
        this.productsError.set(
          'catalog-api no responde: no se pueden mostrar nombres ni crear pedidos.',
        ),
    });
  }

  private loadOrders(): void {
    this.ordersLoading.set(true);
    this.orderService.findAll().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.ordersError.set(null);
        this.ordersLoading.set(false);
      },
      error: () => {
        this.ordersError.set('No se pudo conectar con order-service. ¿Está corriendo en el puerto 8081?');
        this.ordersLoading.set(false);
      },
    });
  }

  protected createOrder(): void {
    const product = this.selectedProduct();
    const quantity = this.quantity();
    if (!product || quantity < 1) {
      return;
    }
    this.createError.set(null);
    // unitPrice sale del cliente de forma provisional: en la Fase 2 lo validará el backend contra catalog-service.
    this.orderService
      .create({ productId: product.id, quantity, unitPrice: product.price })
      .subscribe({
        next: () => {
          this.selectedProductId.set(null);
          this.quantity.set(1);
          this.loadOrders();
        },
        error: (err: HttpErrorResponse) =>
          this.createError.set(err.error?.message ?? 'No se pudo crear el pedido.'),
      });
  }
}
