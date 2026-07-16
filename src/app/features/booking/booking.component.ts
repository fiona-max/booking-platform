import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { LocationService } from '../../core/services/location.service';
import { FlightOffer, BookingRequest, Traveler } from '../../core/models/flight.model';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Component for handling flight booking and passenger details.
 */
@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule, LucideAngularModule, DecimalPipe],
  templateUrl: './booking.component.html',
  styles: []
})
export class BookingComponent implements OnInit {
  // private readonly flightService = inject(FlightService);
  // private readonly locationService = inject(LocationService);
  // private readonly router = inject(Router);
  // private readonly fb = inject(FormBuilder);
  //
  // // Globally shared currency
  // userCurrency = computed(() => this.locationService.selectedCurrency());
  // exchangeRate = signal<number>(1);
  //
  // selectedFlight = signal<FlightOffer | null>(null);
  // bookingResponse = signal<any>(null);
  // loading = signal(false);
  // error = signal<string | null>(null);
  // success = signal(false);
  // countries = signal<any[]>([]);
  //
  // // Form for booking information
  // form: FormGroup = this.fb.group({
  //   firstName: ['', Validators.required],
  //   lastName: ['', Validators.required],
  //   email: ['', [Validators.required, Validators.email]],
  //   phone: ['', Validators.required],
  //   gender: ['', Validators.required],
  //   country: ['', Validators.required],
  //   passportNumber: ['', Validators.required],
  //   passportExpiry: ['', Validators.required],
  //   passportName: ['', Validators.required],
  //   cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
  //   cardholderName: ['', Validators.required],
  //   expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
  //   cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  // });
  //
  // bookingSummary = computed(() => {
  //   const flight = this.selectedFlight();
  //   if (!flight) return { destination: '', departure: '', returnDate: '', travellers: 0, total: 0 };
  //
  //   const firstItinerary = flight.itineraries[0];
  //   const lastSegmentIdx = firstItinerary.segments.length - 1;
  //   const destination = firstItinerary.segments[lastSegmentIdx].arrival.iataCode;
  //   const departure = firstItinerary.segments[0].departure.at;
  //
  //   let returnDate = 'N/A';
  //   if (flight.itineraries.length > 1) {
  //     returnDate = flight.itineraries[1].segments[0].departure.at;
  //   }
  //
  //   return {
  //     destination,
  //     departure: new Date(departure).toLocaleDateString(),
  //     returnDate: returnDate !== 'N/A' ? new Date(returnDate).toLocaleDateString() : 'N/A',
  //     travellers: flight.travelerPricings.length,
  //     originalCurrency: flight.price.currency,
  //     total: parseFloat(flight.price.total),
  //     convertedTotal: parseFloat(flight.price.total) * this.exchangeRate()
  //   };
  // });
  //
  ngOnInit() {
    // this.loadCountries();
    // const flight = this.flightService.getSelectedFlight();
    // if (flight) {
    //   this.selectedFlight.set(flight);
    //   this.updateExchangeRate(flight.price.currency, this.locationService.selectedCurrency());
    // } else {
    //   // Redirect to home if no flight is selected
    //   this.router.navigate(['/']);
    // }
  }
  //
  // private updateExchangeRate(from: string, to: string) {
  //   this.locationService.convertAmount(1, from, to).subscribe(rate => {
  //     this.exchangeRate.set(rate);
  //   });
  // }
  //
  // private loadCountries() {
  //   this.locationService.getCountries().subscribe(countries => {
  //     this.countries.set(countries);
  //   });
  // }
  //
  // // Map of airline codes to full names
  // private readonly airlineNames: { [key: string]: string } = {
  //   'VY': 'Vueling',
  //   'IB': 'Iberia',
  //   'AF': 'Air France',
  //   'DY': 'Norwegian Air',
  //   'UX': 'Air Europa',
  //   'BA': 'British Airways',
  //   'LH': 'Lufthansa',
  //   'FR': 'Ryanair',
  //   'U2': 'EasyJet',
  //   'TK': 'Turkish Airlines',
  //   'EK': 'Emirates',
  //   'QR': 'Qatar Airways',
  //   'AA': 'American Airlines',
  //   'DL': 'Delta Air Lines',
  //   'UA': 'United Airlines',
  //   'TP': 'TAP Air Portugal',
  //   'KL': 'KLM',
  //   'AZ': 'ITA Airways',
  //   'SN': 'Brussels Airlines',
  //   'OS': 'Austrian Airlines',
  //   'LX': 'Swiss International Air Lines'
  // };
  //
  // /**
  //  * Returns the full name of an airline based on its code.
  //  */
  // getAirlineName(code: string): string {
  //   return this.airlineNames[code] || code;
  // }
  //
  // /**
  //  * Returns the URL for an airline logo based on its IATA code.
  //  */
  // getAirlineLogoUrl(code: string): string {
  //   return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
  // }
  //
  // /**
  //  * Submits the booking request to the backend.
  //  */
  // submit() {
  //   if (this.form.invalid) {
  //     this.error.set('BOOKING.ERROR_COMPLETE_DETAILS');
  //     return;
  //   }
  //
  //   this.loading.set(true);
  //   this.error.set(null);
  //
  //   // Prepare traveler data from form
  //   const formValue = this.form.value;
  //   const traveler: Traveler = {
  //     id: '1',
  //     dateOfBirth: '1990-01-01', // Default as it's no longer in the form
  //     name: {
  //       firstName: formValue.firstName,
  //       lastName: formValue.lastName
  //     },
  //     gender: formValue.gender,
  //     contact: {
  //       emailAddress: formValue.email,
  //       phones: [
  //         {
  //           deviceType: 'MOBILE',
  //           countryCallingCode: '34', // Hardcoded or extracted from phone if needed
  //           number: formValue.phone
  //         }
  //       ]
  //     },
  //     documents: [
  //       {
  //         documentType: 'PASSPORT',
  //         number: formValue.passportNumber,
  //         expiryDate: formValue.passportExpiry,
  //         issuanceCountry: formValue.country,
  //         nationality: formValue.country,
  //         holder: true
  //       }
  //     ]
  //   };
  //
  //   // Construct booking request
  //   const bookingRequest: BookingRequest = {
  //     flightOffer: this.selectedFlight()!,
  //     travelers: [traveler]
  //   };
  //
  //   // Call service to book the flight
  //   this.flightService.bookFlight(bookingRequest).subscribe({
  //     next: (response) => {
  //       this.bookingResponse.set(response);
  //       this.success.set(true);
  //       this.loading.set(false);
  //     },
  //     error: (err) => {
  //       console.error('Booking error:', err);
  //       if (err.status === 0) {
  //         this.error.set('BOOKING.ERROR_CONNECTION');
  //       } else {
  //         this.error.set('BOOKING.ERROR_CREATE_FAILED');
  //       }
  //       this.loading.set(false);
  //     }
  //   });
  // }
  //
  // /**
  //  * Resets the booking state and navigates back to search.
  //  */
  // reset() {
  //   this.flightService.clearSelectedFlight();
  //   this.router.navigate(['/']);
  // }
}
