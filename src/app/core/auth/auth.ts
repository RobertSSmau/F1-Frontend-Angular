import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError } from 'rxjs';
import { of } from 'rxjs';
import { TOKEN_ENDPOINT, USERINFO_ENDPOINT, LOGOUT_ENDPOINT } from './auth.config';
import { AuthToken, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);

  // status signals
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private refreshTokenSignal = signal<string | null>(this.getStoredRefreshToken());
  private userSignal = signal<User | null>(null);
  private isLoadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  user = this.userSignal.asReadonly();

  constructor() {
    // circular dependency temporary fix
    setTimeout(() => {
      if (this.hasValidToken()) {
        this.loadUserInfo();
      }
    }, 0);
    this.refreshTokenSignal.set(this.getStoredRefreshToken());
  }

  //login
login(username: string, password: string): Observable<boolean> {
  this.isLoadingSignal.set(true);
  this.errorSignal.set(null);

  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded',
  });

  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'f1-frontend',
    username: username,
    password: password,
    scope: 'openid profile email',
  }).toString();

  return this.httpClient.post<AuthToken>(TOKEN_ENDPOINT, body, { headers }).pipe(
    tap((response) => {
      this.tokenSignal.set(response.access_token);
      this.refreshTokenSignal.set(response.refresh_token || null);
      this.storeToken(response.access_token);
      this.storeRefreshToken(response.refresh_token || null);
      this.isLoggedInSubject.next(true);
      this.loadUserInfo();
      this.isLoadingSignal.set(false);
    }),
    map(() => true),
    catchError((error) => {
      const errorMsg = error.error?.error_description || 'Login fallito. Verifica credenziali.';
      this.errorSignal.set(errorMsg);
      this.isLoadingSignal.set(false);
      console.error('Login error:', error);
      return of(false);
    })
  );
}

  //Logout
  logout(): void {
    const refreshToken = this.refreshTokenSignal();
    if (refreshToken) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });

      const body = new URLSearchParams({
        client_id: 'f1-frontend',
        refresh_token: refreshToken,
      }).toString();

      this.httpClient.post(LOGOUT_ENDPOINT, body, { headers }).pipe(
        tap(() => {
          this.tokenSignal.set(null);
          this.refreshTokenSignal.set(null);
          this.userSignal.set(null);
          this.removeStoredToken();
          this.removeStoredRefreshToken();
          this.isLoggedInSubject.next(false);
          this.errorSignal.set(null);
        }),
        catchError((error) => {
          console.error('Logout error:', error);
          // Anche se fallisce, pulisci localmente
          this.tokenSignal.set(null);
          this.refreshTokenSignal.set(null);
          this.userSignal.set(null);
          this.removeStoredToken();
          this.removeStoredRefreshToken();
          this.isLoggedInSubject.next(false);
          this.errorSignal.set(null);
          return of(null);
        })
      ).subscribe();
    } else {
      this.tokenSignal.set(null);
      this.refreshTokenSignal.set(null);
      this.userSignal.set(null);
      this.removeStoredToken();
      this.removeStoredRefreshToken();
      this.isLoggedInSubject.next(false);
      this.errorSignal.set(null);
    }
  }


  // token if valid
  hasValidToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const decoded = this.decodeToken(token);
      const expirationTime = decoded.exp * 1000; 
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  }

  //keycloak user info
  private loadUserInfo(): void {
    const token = this.getToken();
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.httpClient
      .get<User>(USERINFO_ENDPOINT, { headers })
      .pipe(
        tap((user) => {
          this.userSignal.set(user);
        }),
        catchError((error) => {
          console.error('Errore caricamento user info:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  //roles
  getUserRoles(): string[] {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.decodeToken(token);
        const roles = decoded?.realm_access?.roles ?? [];
        return roles;
      } catch (error) {
        console.error('Error decoding token for roles:', error);
        return [];
      }
    }
    return [];
  }

  //specific role
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    const has = roles.includes(role);
    return has;
  }

  //token getter
  getToken(): string | null {
    return this.getStoredToken();
  }

  //jwt decoder
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT invalido');
    }

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  }

  //token save
  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  //refresh token save
  private storeRefreshToken(refreshToken: string | null): void {
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  } else {
    localStorage.removeItem('refresh_token');
  }
}
  

  //token read
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  //refresh token read
  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  //token remove
  private removeStoredToken(): void {
    localStorage.removeItem('auth_token');
  }

  //refresh token remove
  private removeStoredRefreshToken(): void {
    localStorage.removeItem('refresh_token');
  }
}