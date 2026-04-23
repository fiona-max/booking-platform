import { Component, signal, inject, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FlightService } from '../../../core/services/flight.service';
import { FlightOffer } from '../../../core/models/flight.model';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './validation.component.html',
  styles: [`
    @reference "../../../../styles.scss";
    .glass-panel {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(20px);
    }
    .teal-gradient {
        background: linear-gradient(135deg, #006670 0%, #00818E 100%);
    }
  `]
})
export class ValidationComponent implements OnInit, OnDestroy {
  private readonly flightService = inject(FlightService);
  private readonly router = inject(Router);

  // State signals
  selectedFlight = signal<FlightOffer | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  timeLeft = signal<number>(900); // 15 minutes in seconds
  timerInterval: any;

  // Computed properties for the UI
  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  outboundSegments = computed(() => {
    const flight = this.selectedFlight();
    if (!flight) return [];

    const firstItinerary = flight.itineraries[0];
    const travelerPricing = flight.travelerPricings?.[0];

    return firstItinerary.segments.map(segment => {
      const fareDetails = travelerPricing?.fareDetailsBySegment?.find(fd => fd.segmentId === segment.id);
      return {
        origin: segment.departure.iataCode,
        destination: segment.arrival.iataCode,
        originName: segment.departure.iataCode, // Ideally we'd have names, but IATA codes for now
        destinationName: segment.arrival.iataCode,
        departureTime: segment.departure.at,
        arrivalTime: segment.arrival.at,
        duration: segment.duration,
        airline: segment.carrierCode || flight.validatingAirlineCodes[0] || 'Airline',
        flightNumber: (segment.carrierCode || '') + '-' + (segment.number || ''),
        aircraft: segment.aircraft?.code || 'Boeing 777-300ER',
        cabin: fareDetails?.cabin || 'ECONOMY',
        class: fareDetails?.class || 'J',
        terminal: segment.departure.terminal,
        arrivalTerminal: segment.arrival.terminal
      };
    });
  });

  outboundSummary = computed(() => {
    const segments = this.outboundSegments();
    if (segments.length === 0) return null;

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const flight = this.selectedFlight();
    const firstItinerary = flight?.itineraries[0];

    return {
      origin: firstSegment.origin,
      destination: lastSegment.destination,
      originName: firstSegment.originName,
      destinationName: lastSegment.destinationName,
      departureTime: firstSegment.departureTime,
      arrivalTime: lastSegment.arrivalTime,
      duration: firstItinerary?.duration || '',
      stops: segments.length - 1
    };
  });

  priceSummary = computed(() => {
    const flight = this.selectedFlight();
    if (!flight) return null;
    const price = flight.price;
    const base = parseFloat(price.base);
    const total = parseFloat(price.total);
    const taxes = total - base;
    return {
      currency: price.currency,
      base: base.toFixed(2),
      taxes: taxes.toFixed(2),
      discount: (210.00).toFixed(2), // Static discount as in UI for now
      grandTotal: (total - 210.00).toFixed(2)
    };
  });

  ngOnInit() {
    const flight = this.flightService.getSelectedFlight();
    if (flight) {
      this.isLoading.set(true);
      this.flightService.priceFlight(flight).subscribe({
        next: (response) => {
          // The response from /price usually contains a flightOffer object
          // Adjust based on actual API response structure
          const validatedOffer = response.data?.flightOffers?.[0] || response.flightOffer || flight;
          this.selectedFlight.set(validatedOffer);
          this.flightService.setSelectedFlight(validatedOffer);
          this.isLoading.set(false);
          this.startTimer();
        },
        error: (err) => {
          console.error('Pricing validation failed:', err);
          this.error.set('VALIDATION.ERROR_NOT_AVAILABLE');
          this.isLoading.set(false);
          // Optional: redirect back after some time or show a button
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(time => {
        if (time <= 0) {
          clearInterval(this.timerInterval);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  proceedToCheckout() {
    this.router.navigate(['/booking']);
  }
}
