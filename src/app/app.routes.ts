import { Routes } from '@angular/router';
import {LandingPage} from './features/landing-page/landing-page';
import {FlightResultsComponent} from './features/flight-results/flight-results.component';
import {BookingComponent} from './features/booking/booking.component';
import {ValidationComponent} from './features/booking/validation/validation.component';

export const routes: Routes = [
  // Home / Landing Page (Search)
  { path: '', component: LandingPage },

  // Flight Results Page
  { path: 'results/:origin/:originCode/:destination/:destinationCode', component: FlightResultsComponent },
  { path: 'results/:origin/:destination', component: FlightResultsComponent },
  { path: 'results', component: FlightResultsComponent },

  // Validation Page
  { path: 'validation', component: ValidationComponent },

  // Booking Page (Passenger Details)
  { path: 'booking', component: BookingComponent },

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
