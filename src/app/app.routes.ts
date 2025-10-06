import { Routes } from '@angular/router';
import {LandingPage} from './features/landing-page/landing-page';

export const routes: Routes = [
  // Home / Landing Page
  { path: '', component: LandingPage },

  // Auth routes (standalone components)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login').then(m => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register').then(m => m.Register),
      },
    ],
  },

  // Always keep this last
  { path: '**', redirectTo: '' },
];
