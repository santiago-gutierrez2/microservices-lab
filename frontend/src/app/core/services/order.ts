import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Order, OrderRequest } from '../models/order.model';

@Service()
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = `${environment.orderApiUrl}/orders`;

  findAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  create(request: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }
}
