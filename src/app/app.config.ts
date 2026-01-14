import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { BASE_PATH } from './services/openapi-client/variables';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { AuthService } from './core/auth/auth';

export function initializeOAuth(authService: AuthService): () => Promise<void> {
  return () => authService.initializeOAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideOAuthClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeOAuth,
      deps: [AuthService],
      multi: true
    },
    { provide: BASE_PATH, useValue: 'http://localhost:5135' }
  ]
};