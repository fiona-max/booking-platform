import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { LocationService } from '../../core/services/location.service';
import { FlightSearchQuery, LocationSuggestion } from '../../core/models/flight.model';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, switchMap, map, of } from 'rxjs';

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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LucideAngularModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit {
  private readonly flightService = inject(FlightService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State signals
  loading = signal(false);
  error = signal<string | null>(null);
  flightsForm: FormGroup;

  // Autocomplete signals and subjects
  originSuggestions = signal<LocationSuggestion[]>([]);
  destinationSuggestions = signal<LocationSuggestion[]>([]);
  private originSearch$ = new Subject<string>();
  private destinationSearch$ = new Subject<string>();

  // IATA codes and names for search
  originCode = signal<string | null>(null);
  destinationCode = signal<string | null>(null);
  originName = signal<string | null>(null);
  destinationName = signal<string | null>(null);

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


  constructor() {
    this.flightsForm = this.fb.group({
      tripType: ['Round Trip', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      departureDate: ['', [Validators.required, this.futureDateValidator()]],
      returnDate: [''],
      children: [0],
      travelClass: ['Economy'],
      maxPrice: [0],
      currency: ['USD']
    }, { validators: this.dateRangeValidator() });

    // Setup origin autocomplete
    this.originSearch$.pipe(
      debounceTime(200),
      map(keyword => keyword.trim()),
      distinctUntilChanged(),
      switchMap(keyword => keyword.length >= 2 ? this.flightService.searchLocations(keyword) : of([]))
    ).subscribe(results => this.originSuggestions.set(results));

    // Setup destination autocomplete
    this.destinationSearch$.pipe(
      debounceTime(200),
      map(keyword => keyword.trim()),
      distinctUntilChanged(),
      switchMap(keyword => keyword.length >= 2 ? this.flightService.searchLocations(keyword) : of([]))
    ).subscribe(results => this.destinationSuggestions.set(results));
  }

  ngOnInit() {
    this.detectUserLocation();
  }

  private detectUserLocation() {
    // 1. Try to get currency from IP (usually most accurate for currency)
    this.locationService.getCurrencyFromIP().subscribe(data => {
      if (data && data.currency) {
        this.flightsForm.patchValue({ currency: data.currency });
      }
    });

    // 2. Try to get user coordinates (as requested "pick user location from their browser")
    this.locationService.getUserLocation()
      .then(position => {
        console.log('User location detected:', position.coords.latitude, position.coords.longitude);
        // We could potentially use these coordinates to auto-suggest the nearest airport
        // But the primary request was to determine currency, which we did via IP.
        // Locale can also be a fallback.
      })
      .catch(err => {
        console.warn('Geolocation failed or denied:', err);
        // Fallback to locale-based currency if IP also failed (already handled by default in service)
      });
  }

  /**
   * Validator to ensure the date is not in the past.
   */
  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(control.value);
      return selectedDate < today ? { pastDate: true } : null;
    };
  }

  /**
   * Validator to ensure return date is not before departure date.
   */
  private dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const tripType = group.get('tripType')?.value;
      if (tripType === 'One Way') {
        return null;
      }

      const departureDate = group.get('departureDate')?.value;
      const returnDate = group.get('returnDate')?.value;

      if (!departureDate || !returnDate) {
        return null;
      }

      const departure = new Date(departureDate);
      const returnD = new Date(returnDate);

      return returnD < departure ? { invalidRange: true } : null;
    };
  }

  /**
   * Submits the flight search form and navigates to the results page.
   */
  submit() {
    if (this.flightsForm.invalid || !this.originCode() || !this.destinationCode()) {
      this.error.set('LANDING.ERROR_SELECT_LOCATION');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const value = this.flightsForm.value;
    const query = {
      originCode: this.originCode()!,
      destinationCode: this.destinationCode()!,
      departureDate: value.departureDate,
      returnDate: value.tripType === 'Round Trip' ? (value.returnDate || undefined) : undefined,
      adults: value.adults,
      children: value.children,
      travelClass: value.travelClass,
      maxPrice: value.maxPrice,
      currency: value.currency
    };

    // Call service to find flights
    this.flightService.searchFlights(query).subscribe({
      next: (results) => {
        this.loading.set(false);
        if (results.length > 0) {
          this.flightService.setLatestResults(results);
          this.router.navigate([
            '/results',
            this.originName() || this.originCode(),
            this.originCode(),
            this.destinationName() || this.destinationCode(),
            this.destinationCode()
          ]);
        } else {
          this.error.set('LANDING.ERROR_NO_FLIGHTS');
        }
      },
      error: (err) => {
        console.error('Search error:', err);
        this.error.set('LANDING.ERROR_SEARCH_FAILED');
        this.loading.set(false);
      }
    });
  }

  /**
   * Handles changes in the origin input field.
   */
  onOriginChange(event: any) {
    const keyword = event.target?.value;
    this.originCode.set(null);
    if (keyword) {
      this.originSearch$.next(keyword);
    } else {
      this.originSuggestions.set([]);
    }
  }

  /**
   * Handles changes in the destination input field.
   */
  onDestinationChange(event: any) {
    const keyword = event.target?.value;
    this.destinationCode.set(null);
    if (keyword) {
      this.destinationSearch$.next(keyword);
    } else {
      this.destinationSuggestions.set([]);
    }
  }

  /**
   * Selects a location from the autocomplete suggestions.
   */
  selectLocation(location: LocationSuggestion, field: 'origin' | 'destination') {
    this.flightsForm.patchValue({
      [field]: location.name
    });
    if (field === 'origin') {
      this.originCode.set(location.iataCode);
      this.originName.set(location.address?.cityName || location.name);
      this.originSuggestions.set([]);
    } else {
      this.destinationCode.set(location.iataCode);
      this.destinationName.set(location.address?.cityName || location.name);
      this.destinationSuggestions.set([]);
    }
  }

  /**
   * Resets the search form.
   */
  reset() {
    this.flightsForm.reset({
      tripType: 'Round Trip',
      adults: 1,
      travelClass: 'Economy',
      currency: 'USD'
    });
    this.originCode.set(null);
    this.destinationCode.set(null);
    this.originName.set(null);
    this.destinationName.set(null);
    this.error.set(null);
  }
}
