import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { FlightSearchFormComponent } from '../../shared/components/flight-search-form/flight-search-form.component';

/**
 * Main Landing Page component containing the flight search form.
 * Handles user input for flight criteria and initiates the search.
 */

interface Feature {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, LucideAngularModule, FlightSearchFormComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage {
  features: Feature[] = [
    {
      title: 'LANDING.VERIFIED_PARTNERS',
      description: 'LANDING.VERIFIED_PARTNERS_DESC',
      icon: 'shield'
    },
    {
      title: 'LANDING.REAL_TIME_UPDATES',
      description: 'LANDING.REAL_TIME_UPDATES_DESC',
      icon: 'clock'
    },
    {
      title: 'LANDING.SECURE_TRANSACTIONS',
      description: 'LANDING.SECURE_TRANSACTIONS_DESC',
      icon: 'lock'
    }
  ];
}
