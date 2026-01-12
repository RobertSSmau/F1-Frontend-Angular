import { Routes } from '@angular/router';
import { Error } from './error/error';
import { Championships } from './championships/championships';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'championships', pathMatch: 'full' },
  {
    path: 'championships',
    component: Championships,
    canActivate: [authGuard],
  },
  { path: '**', component: Error },
];