export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}
