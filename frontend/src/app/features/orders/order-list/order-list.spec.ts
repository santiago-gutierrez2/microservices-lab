import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderList } from './order-list';
import { environment } from '../../../../environments/environment';

const PRODUCTS_URL = `${environment.catalogApiUrl}/products`;
const ORDERS_URL = `${environment.orderApiUrl}/orders`;

const products = [
  { id: 1, name: 'Teclado mecánico', description: '', price: 59.99, stock: 25 },
  { id: 2, name: 'Mouse inalámbrico', description: '', price: 29.5, stock: 40 },
];
const orders = [
  { id: 10, productId: 1, quantity: 2, unitPrice: 59.99, createdDate: '2026-09-20T17:18:58Z' },
  { id: 11, productId: 99999, quantity: 1, unitPrice: 1, createdDate: '2026-09-20T17:19:08Z' },
];

describe('OrderList', () => {
  let fixture: ComponentFixture<OrderList>;
  let http: HttpTestingController;

  const el = () => fixture.nativeElement as HTMLElement;
  const rows = () => Array.from(el().querySelectorAll('tbody tr')).map((r) => r.textContent ?? '');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(OrderList);
  });

  afterEach(() => http.verify());

  it('joins orders with product names from catalog-service', async () => {
    http.expectOne(PRODUCTS_URL).flush(products);
    http.expectOne(ORDERS_URL).flush(orders);
    await fixture.whenStable();

    const [first, orphan] = rows();
    expect(first).toContain('Teclado mecánico');
    expect(first).toContain('$119.98');
    expect(orphan).toContain('Producto #99999');
  });

  it('still shows orders (with fallback names) when catalog-service is down', async () => {
    http.expectOne(PRODUCTS_URL).flush('boom', { status: 500, statusText: 'Server Error' });
    http.expectOne(ORDERS_URL).flush(orders);
    await fixture.whenStable();

    expect(el().querySelector('.warning')?.textContent).toContain('catalog-api no responde');
    expect(rows()[0]).toContain('Producto #1');
  });

  it('shows an error when order-service is down', async () => {
    http.expectOne(PRODUCTS_URL).flush(products);
    http.expectOne(ORDERS_URL).flush('boom', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el().querySelector('.error')?.textContent).toContain('order-service');
    expect(el().querySelector('table')).toBeNull();
  });

  it('creates an order using the selected product price, then reloads the list', async () => {
    http.expectOne(PRODUCTS_URL).flush(products);
    http.expectOne(ORDERS_URL).flush([]);
    await fixture.whenStable();

    const select = el().querySelector('select') as HTMLSelectElement;
    const quantity = el().querySelector('input[name="quantity"]') as HTMLInputElement;
    const submit = el().querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);

    select.selectedIndex = 2; // 0 = placeholder, 1 = teclado, 2 = mouse
    select.dispatchEvent(new Event('change'));
    quantity.value = '3';
    quantity.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(submit.disabled).toBe(false);

    submit.click();
    const post = http.expectOne(ORDERS_URL);
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ productId: 2, quantity: 3, unitPrice: 29.5 });
    post.flush({ id: 12, productId: 2, quantity: 3, unitPrice: 29.5, createdDate: '2026-09-20T18:00:00Z' });

    http.expectOne(ORDERS_URL).flush([
      { id: 12, productId: 2, quantity: 3, unitPrice: 29.5, createdDate: '2026-09-20T18:00:00Z' },
    ]);
    await fixture.whenStable();
    expect(rows()[0]).toContain('Mouse inalámbrico');
  });

  it('shows the backend validation message when creating fails', async () => {
    http.expectOne(PRODUCTS_URL).flush(products);
    http.expectOne(ORDERS_URL).flush([]);
    await fixture.whenStable();

    const select = el().querySelector('select') as HTMLSelectElement;
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    (el().querySelector('button[type="submit"]') as HTMLButtonElement).click();
    http
      .expectOne(ORDERS_URL)
      .flush({ message: 'quantity: debe ser mayor que 0' }, { status: 400, statusText: 'Bad Request' });
    await fixture.whenStable();

    expect(el().querySelector('.error')?.textContent).toContain('quantity: debe ser mayor que 0');
  });
});
