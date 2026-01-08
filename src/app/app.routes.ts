import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Welcome } from './welcome/welcome';
import { Error  } from './error/error';
import { Championships } from './championships/championships';

export const routes: Routes = [
    {path:'login', component: Login},
    {path: '', component: Login},
    {path:'welcome', component: Welcome},
    {path:'championships', component: Championships},
    {path:'**', component: Error},
];
