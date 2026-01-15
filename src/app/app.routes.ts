import { Routes } from '@angular/router';
import { Error } from './error/error';
import { Championships } from './championships/championships';
import { Drivers } from './drivers/drivers';
import { Teams } from './teams/teams';
import { LoginComponent } from './features/auth/login/login';
import { authGuard } from './core/auth/auth-guard';
import { Cars } from './cars/cars';
import { Body } from './body/body';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: Body,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'championships', pathMatch: 'full' },
      { path: 'championships', component: Championships },
      { path: 'drivers', component: Drivers },
      { path: 'teams', component: Teams },
      { path: 'cars', component: Cars },
    ]
  },
  { path: '**', component: Error },
];