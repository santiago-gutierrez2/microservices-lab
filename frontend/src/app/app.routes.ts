import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'callback',
    loadComponent: () => import('./features/auth/callback/callback').then((m) => m.Callback),
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./features/orders/order-list/order-list').then((m) => m.OrderList),
  },
];
