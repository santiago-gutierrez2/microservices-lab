export interface Order {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  createdDate: string;
}

export interface OrderRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}
