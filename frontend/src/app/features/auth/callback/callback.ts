import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-callback',
  template: `
    @if (error()) {
      <p class="error">No se pudo completar el login: {{ error() }}</p>
    } @else {
      <p>Completando el login...</p>
    }
  `,
  styles: `.error { color: #b00020; max-width: 480px; margin: 2rem auto; font-family: system-ui, sans-serif; }`,
})
export class Callback {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly error = signal<string | null>(null);

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const state = params.get('state');

    if (!code || !state) {
      this.error.set('faltan parámetros code/state en la URL de vuelta');
      return;
    }

    this.authService
      .handleCallback(code, state)
      .then(() => this.router.navigateByUrl('/products'))
      .catch((err) => this.error.set(err instanceof Error ? err.message : 'error desconocido'));
  }
}
