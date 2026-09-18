import { Component } from '@angular/core';
import { ProductList } from './features/products/product-list/product-list';

@Component({
  imports: [ProductList],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
