import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderService } from './order';
import { environment } from '../../../environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('findAll should GET the orders endpoint of order-service', () => {
    service.findAll().subscribe();
    const req = http.expectOne(`${environment.orderApiUrl}/orders`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create should POST the request body to order-service', () => {
    const body = { productId: 1, quantity: 2, unitPrice: 59.99 };
    service.create(body).subscribe();
    const req = http.expectOne(`${environment.orderApiUrl}/orders`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1, ...body, createdDate: '2026-09-20T17:18:58Z' });
  });
});
