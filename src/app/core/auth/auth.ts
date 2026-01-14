import { Injectable, inject, signal } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { KEYCLOAK_CONFIG } from './auth.config';
import { User } from '../models/user.model';

const authConfig: AuthConfig = {
  issuer: `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}`,
  redirectUri: window.location.origin,
  clientId: KEYCLOAK_CONFIG.clientId,
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: false,
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private oauthService = inject(OAuthService);

  // status signals
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  user = this.userSignal.asReadonly();

  constructor() {
    this.oauthService.configure(authConfig);
    this.setupAutomaticSilentRefresh();
  }

  async initializeOAuth(): Promise<void> {
    try {
      await this.oauthService.loadDiscoveryDocumentAndTryLogin();
      
      if (this.oauthService.hasValidAccessToken()) {
        this.isLoggedInSubject.next(true);
        await this.loadUserInfo();
      } else {
        this.isLoggedInSubject.next(false);
      }
    } catch (error) {
      console.error('OAuth initialization error:', error);
      this.errorSignal.set('Errore inizializzazione autenticazione');
    }
  }

  private setupAutomaticSilentRefresh(): void {
    this.oauthService.setupAutomaticSilentRefresh();
  }

  // redirects to Keycloak
  login(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);
    this.oauthService.initCodeFlow();
  }

  // logout
  logout(): void {
    this.oauthService.logOut();
    this.userSignal.set(null);
    this.isLoggedInSubject.next(false);
    this.errorSignal.set(null);
  }

  // get access token
  getToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  // load user info from token claims
  private async loadUserInfo(): Promise<void> {
    try {
      const claims = this.oauthService.getIdentityClaims() as any;
      
      if (claims) {
        this.userSignal.set({
          sub: claims.sub || '',
          preferred_username: claims.preferred_username || '',
          email: claims.email || '',
          given_name: claims.given_name || '',
          family_name: claims.family_name || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  // Get user roles from token
  getUserRoles(): string[] {
    
    const token = this.oauthService.getAccessToken();
    if (!token) return [];
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.realm_access?.roles || [];
    } catch (error) {
      console.error('Error decoding token:', error);
      return [];
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
    
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }
}