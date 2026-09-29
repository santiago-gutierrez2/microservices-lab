import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

// Si no hay sesion, ni siquiera dejamos que la ruta cargue e intente pedir
// datos (que fallarian con 401 via el interceptor) - mandamos directo a
// login. login() hace una redireccion de pagina completa, asi que esta
// funcion no necesita devolver una UrlTree: la navegacion de Angular queda
// cortada por la propia recarga del navegador.
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  authService.login();
  return false;
};
