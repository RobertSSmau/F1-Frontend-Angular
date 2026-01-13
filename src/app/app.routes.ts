import { Routes } from '@angular/router';
import { Error } from './error/error';
import { Championships } from './championships/championships';
import { Drivers } from './drivers/drivers';
import { Teams } from './teams/teams';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/auth/auth-guard';
import { Cars } from './cars/cars';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'championships', pathMatch: 'full' },
  {
    path: 'cars',
    component: Cars,
    canActivate: [authGuard],
  },
  {
    path: 'championships',
    component: Championships,
    canActivate: [authGuard],
  },
  {
    path: 'drivers',
    component: Drivers,
    canActivate: [authGuard],
  },
  {
    path: 'teams',
    component: Teams,
    canActivate: [authGuard],
  },
  { path: '**', component: Error },
];