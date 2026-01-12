import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasValidToken()) {
    return true;
  }

  // Token non valido - reindirizza a login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};