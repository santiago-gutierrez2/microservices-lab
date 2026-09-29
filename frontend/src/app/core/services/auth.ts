import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

const VERIFIER_KEY = 'pkce_code_verifier';
const STATE_KEY = 'pkce_state';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// PKCE: en vez de un "client secret" (que un SPA no puede guardar en secreto,
// cualquiera puede leer el JS), el navegador genera un secreto de un solo uso
// (code_verifier), manda su hash (code_challenge) al pedir el login, y revela
// el original solo al canjear el codigo. Si alguien interceptase el codigo de
// autorizacion por el camino, no podria canjearlo sin el verifier original.
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomUrlSafeString(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes.buffer);
}

async function codeChallengeFrom(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Token en memoria (signal), nunca en localStorage: si se recarga la
  // pagina se pierde y hay que volver a loguearse. Es una decision de
  // seguridad, no un descuido: localStorage es legible por cualquier script
  // que corra en la pagina (por ejemplo, via un XSS), sessionStorage tambien.
  private readonly accessToken = signal<string | null>(null);
  readonly isAuthenticated = signal(false);

  getAccessToken(): string | null {
    return this.accessToken();
  }

  // Paso 1: redirige al navegador entero a la pantalla de login de
  // auth-server. Antes de irnos, guardamos verifier y state en
  // sessionStorage porque window.location.href recarga la pagina -
  // cualquier variable en memoria (incluidas las de este servicio) se
  // pierde; sessionStorage sobrevive a la recarga.
  async login(): Promise<void> {
    const verifier = randomUrlSafeString();
    const challenge = await codeChallengeFrom(verifier);
    const state = randomUrlSafeString();

    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: environment.clientId,
      scope: 'openid profile',
      redirect_uri: environment.redirectUri,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    });

    window.location.href = `${environment.authServerUrl}/oauth2/authorize?${params.toString()}`;
  }

  // Paso 2: auth-server nos devolvio aqui (redirect_uri) con ?code=...&state=...
  // Canjeamos el code por un token hablando DIRECTAMENTE con auth-server -
  // el Gateway no interviene en absoluto en este intercambio.
  async handleCallback(code: string, returnedState: string): Promise<void> {
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);

    if (!verifier || !expectedState || expectedState !== returnedState) {
      // El state no coincide: o alguien esta intentando colar una respuesta
      // que no viene de la peticion que nosotros iniciamos (CSRF sobre el
      // propio flujo de login), o el usuario recargo/reuso una URL vieja.
      throw new Error('State inválido en el callback de OAuth2');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: environment.redirectUri,
      client_id: environment.clientId,
      code_verifier: verifier,
    });

    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${environment.authServerUrl}/oauth2/token`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    this.accessToken.set(response.access_token);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    this.accessToken.set(null);
    this.isAuthenticated.set(false);
    this.router.navigateByUrl('/products');
  }
}
