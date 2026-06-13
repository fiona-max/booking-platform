import { Component, signal, inject, OnInit, Output, EventEmitter, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../../core/services/flight.service';
import { LocationService } from '../../../core/services/location.service';
import { LocationSuggestion } from '../../../core/models/flight.model';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject, switchMap, map, of } from 'rxjs';
import { TravelSelectorComponent } from '../travel-selector-component/travel-selector-component';
@Component({
  selector: 'app-flight-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, LucideAngularModule, TravelSelectorComponent],
  templateUrl: './flight-search-form.component.html',
  styleUrl: './flight-search-form.component.scss'
})
export class FlightSearchFormComponent implements OnInit {
  private readonly flightService = inject(FlightService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  @Input() initialValues: any = null;
  @Output() searchStarted = new EventEmitter<void>();
  @Output() searchCompleted = new EventEmitter<any[]>();
  @Output() searchError = new EventEmitter<string>();

  loading = signal(false);
  error = signal<string | null>(null);
  userCurrency = computed(() => this.locationService.selectedCurrency());
  exchangeRate = signal<number>(1);
  flightsForm: FormGroup;

  originSuggestions = signal<LocationSuggestion[]>([]);
  destinationSuggestions = signal<LocationSuggestion[]>([]);
  private originSearch$ = new Subject<string>();
  private destinationSearch$ = new Subject<string>();

  originCode = signal<string | null>(null);
  destinationCode = signal<string | null>(null);
  originName = signal<string | null>(null);
  destinationName = signal<string | null>(null);

  constructor() {
    this.flightsForm = this.fb.group({
      tripType: ['Round Trip', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      travelers: ['1 Adult'],
      adults: [1, [Validators.required, Validators.min(1)]],
      departureDate: ['', [Validators.required, this.futureDateValidator()]],
      returnDate: [''],
      children: [0],
      travelClass: ['Economy'],
      maxPrice: [2500],
      currency: [this.locationService.selectedCurrency()],
      nonStop: [false]
    }, {validators: this.dateRangeValidator()});

    this.originSearch$.pipe(
      debounceTime(200),
      map(keyword => keyword.trim()),
      distinctUntilChanged(),
      switchMap(keyword => keyword.length >= 2 ? this.flightService.searchLocations(keyword) : of([]))
    ).subscribe(results => this.originSuggestions.set(results));

    this.destinationSearch$.pipe(
      debounceTime(200),
      map(keyword => keyword.trim()),
      distinctUntilChanged(),
      switchMap(keyword => keyword.length >= 2 ? this.flightService.searchLocations(keyword) : of([]))
    ).subscribe(results => this.destinationSuggestions.set(results));

    this.flightsForm.get('currency')?.valueChanges.subscribe(newCurrency => {
      this.locationService.updateCurrency(newCurrency);
      this.updateExchangeRate(newCurrency);
    });
  }

  private updateExchangeRate(targetCurrency: string) {
    // Assuming base is EUR as Amadeus often uses EUR for its data
    this.locationService.convertAmount(1, 'EUR', targetCurrency).subscribe(rate => {
      this.exchangeRate.set(rate);
    });
  }

  ngOnInit() {
    if (this.initialValues) {
      this.flightsForm.patchValue(this.initialValues);
      if (this.initialValues.originCode) this.originCode.set(this.initialValues.originCode);
      if (this.initialValues.destinationCode) this.destinationCode.set(this.initialValues.destinationCode);
      if (this.initialValues.originName) this.originName.set(this.initialValues.originName);
      if (this.initialValues.destinationName) this.destinationName.set(this.initialValues.destinationName);

      // Sync travelers select
      const adults = this.initialValues.adults || 1;
      const children = this.initialValues.children || 0;
      if (adults === 1 && children === 0) this.flightsForm.patchValue({travelers: '1 Adult'});
      else if (adults === 2 && children === 0) this.flightsForm.patchValue({travelers: '2 Adults'});
      else if (adults === 1 && children === 1) this.flightsForm.patchValue({travelers: '1 Adult, 1 Child'});
      else if (adults === 2 && children === 1) this.flightsForm.patchValue({travelers: '2 Adults, 1 Child'});
      else if (adults === 2 && children === 2) this.flightsForm.patchValue({travelers: '2 Adults, 2 Children'});
    }
  }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(control.value);
      return selectedDate < today ? {pastDate: true} : null;
    };
  }

  private dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const tripType = group.get('tripType')?.value;
      if (tripType === 'One Way') return null;
      const departureDate = group.get('departureDate')?.value;
      const returnDate = group.get('returnDate')?.value;
      if (!departureDate || !returnDate) return null;
      const departure = new Date(departureDate);
      const returnD = new Date(returnDate);
      return returnD < departure ? {invalidRange: true} : null;
    };
  }

  submit() {
    if (this.flightsForm.invalid || !this.originCode() || !this.destinationCode()) {
      this.error.set('LANDING.ERROR_SELECT_LOCATION');
      this.searchError.emit(this.error()!);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.searchStarted.emit();

    const value = this.flightsForm.value;
    const query: any = {
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

    if (value.nonStop) {
      query.nonStop = true;
    }

    this.flightService.searchFlights(query).subscribe({
      next: (results) => {
        this.loading.set(false);
        if (results.length > 0) {
          this.flightService.setLatestResults(results);
          this.searchCompleted.emit(results);
          this.router.navigate([
            '/results',
            this.originName() || this.originCode(),
            this.originCode(),
            this.destinationName() || this.destinationCode(),
            this.destinationCode(),
            value.departureDate,
            value.adults,
            value.children
          ]);
        } else {
          this.error.set('LANDING.ERROR_NO_FLIGHTS');
          this.searchError.emit(this.error()!);
        }
      },
      error: (err) => {
        console.error('Search error:', err);
        this.error.set('LANDING.ERROR_SEARCH_FAILED');
        this.searchError.emit(this.error()!);
        this.loading.set(false);
      }
    });
  }
  onOriginChange(event: any) {
    const keyword = event.target?.value;
    this.originCode.set(null);
    if (keyword) {
      this.originSearch$.next(keyword);
    } else {
      this.originSuggestions.set([]);
    }
  }

  onDestinationChange(event: any) {
    const keyword = event.target?.value;
    this.destinationCode.set(null);
    if (keyword) {
      this.destinationSearch$.next(keyword);
    } else {
      this.destinationSuggestions.set([]);
    }
  }

  selectLocation(location: LocationSuggestion, field: 'origin' | 'destination') {
    this.flightsForm.patchValue({
      [field]: `${location.name} (${location.iataCode})`
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

  onTravelersChanged(event: { adults: number, children: number }) {
    this.flightsForm.patchValue({
      adults: event.adults,
      children: event.children,     // Assuming 'children' = children under 2
      travelers: this.getTravelersSummary(event.adults, event.children)
    });
  }

  private getTravelersSummary(adults: number, children: number): string {
    let summary = `${adults} Adult`;
    if (adults > 1) summary = `${adults} Adults`;

    if (children > 0) {
      summary += `, ${children} Infant`;
      if (children > 1) summary += 's';
    }
    return summary;
  }
}

