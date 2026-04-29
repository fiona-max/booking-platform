import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { FlightOffer, BookingRequest, Traveler } from '../../core/models/flight.model';
import { TranslateModule } from '@ngx-translate/core';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Component for handling flight booking and passenger details.
 */
@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterModule, NgOptimizedImage, LucideAngularModule],
  templateUrl: './booking.component.html',
  styles: [`
    @reference "../../../styles.scss";
    .input-field {
      @apply w-full h-12 px-4 rounded-lg bg-white/90 border border-gray-200 focus:ring-2 focus:ring-primary outline-none transition-all dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100;
    }
    .label-accent {
      @apply absolute -top-3 left-3 bg-white px-1 text-xs text-text-light font-semibold dark:bg-zinc-900 dark:text-zinc-400;
    }
  `]
})
export class BookingComponent implements OnInit {
  private readonly flightService = inject(FlightService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // State signals
  selectedFlight = signal<FlightOffer | null>(null);
  bookingResponse = signal<any>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Form for booking information
  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    cardholderName: ['', Validators.required],
    expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
  });

  bookingSummary = computed(() => {
    const flight = this.selectedFlight();
    if (!flight) return { destination: '', departure: '', returnDate: '', travellers: 0, total: 0 };

    const firstItinerary = flight.itineraries[0];
    const lastSegmentIdx = firstItinerary.segments.length - 1;
    const destination = firstItinerary.segments[lastSegmentIdx].arrival.iataCode;
    const departure = firstItinerary.segments[0].departure.at;

    let returnDate = 'N/A';
    if (flight.itineraries.length > 1) {
      returnDate = flight.itineraries[1].segments[0].departure.at;
    }

    return {
      destination,
      departure: new Date(departure).toLocaleDateString(),
      returnDate: returnDate !== 'N/A' ? new Date(returnDate).toLocaleDateString() : 'N/A',
      travellers: flight.travelerPricings.length,
      total: flight.price.total
    };
  });

  ngOnInit() {
    const flight = this.flightService.getSelectedFlight();
    if (flight) {
      this.selectedFlight.set(flight);
    } else {
      // Redirect to home if no flight is selected
      this.router.navigate(['/']);
    }
  }

  /**
   * Submits the booking request to the backend.
   */
  submit() {
    if (this.form.invalid) {
      this.error.set('BOOKING.ERROR_COMPLETE_DETAILS');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Prepare traveler data from form
    const formValue = this.form.value;
    const traveler: Traveler = {
      id: '1',
      dateOfBirth: '1990-01-01', // Default as it's no longer in the form
      name: {
        firstName: formValue.firstName,
        lastName: formValue.lastName
      },
      gender: 'MALE', // Default as it's no longer in the form
      contact: {
        emailAddress: formValue.email,
        phones: [
          {
            deviceType: 'MOBILE',
            countryCallingCode: '34', // Hardcoded or extracted from phone if needed
            number: formValue.phone
          }
        ]
      }
    };

    // Construct booking request
    const bookingRequest: BookingRequest = {
      flightOffer: this.selectedFlight()!,
      travelers: [traveler]
    };

    // Call service to book the flight
    this.flightService.bookFlight(bookingRequest).subscribe({
      next: (response) => {
        this.bookingResponse.set(response);
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Booking error:', err);
        if (err.status === 0) {
          this.error.set('BOOKING.ERROR_CONNECTION');
        } else {
          this.error.set('BOOKING.ERROR_CREATE_FAILED');
        }
        this.loading.set(false);
      }
    });
  }

  /**
   * Resets the booking state and navigates back to search.
   */
  reset() {
    this.flightService.clearSelectedFlight();
    this.router.navigate(['/']);
  }
}
