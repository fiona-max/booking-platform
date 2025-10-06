import { Routes } from '@angular/router';
import {LandingPage} from './features/landing-page/landing-page';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: '**', redirectTo: '' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register').then(m => m.Register)
      }
    ]  },
  // add other app routes here...
  { path: '**', redirectTo: '' }
];
