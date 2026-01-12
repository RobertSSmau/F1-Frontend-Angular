import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map, catchError } from 'rxjs';
import { of } from 'rxjs';
import { TOKEN_ENDPOINT, USERINFO_ENDPOINT } from './auth.config';
import { AuthToken, User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);

  // status signals
  private tokenSignal = signal<string | null>(this.getStoredToken());
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
        this.storeToken(response.access_token);
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
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.removeStoredToken();
    this.isLoggedInSubject.next(false);
    this.errorSignal.set(null);
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
    const user = this.userSignal();
    return user?.realm_access?.roles ?? [];
  }

  //specific role
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
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

  //token read
  private getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  //token remove
  private removeStoredToken(): void {
    localStorage.removeItem('auth_token');
  }
}