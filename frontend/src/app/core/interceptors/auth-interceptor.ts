import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

// Solo añade el token en las llamadas al Gateway (environment.apiBaseUrl).
// Las llamadas a auth-server (login/token) van sin este header - todavia
// no tenemos ningun token que mandar en esas, y no hace falta: auth-server
// no es un recurso protegido por este mismo JWT.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token && req.url.startsWith(environment.apiBaseUrl)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
