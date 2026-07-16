import { Component, signal, inject, OnInit, computed, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FlightService } from '../../../core/services/flight.service';
import { LocationService } from '../../../core/services/location.service';
import { FlightOffer } from '../../../core/models/flight.model';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslateModule],
  templateUrl: './validation.component.html',
  styles: []
})
export class ValidationComponent implements OnInit, OnDestroy {
  private readonly flightService = inject(FlightService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);
  // Globally shared currency
  userCurrency = computed(() => this.locationService.selectedCurrency());
  exchangeRate = signal<number>(1);

  // State signals
  selectedFlight = signal<FlightOffer | null>(null);
  adults = signal<number>(1);
  children = signal<number>(0);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  timeLeft = signal<number>(900);
  lastTicketingDate = signal<string | null>(null);
  timerInterval: any;


  outboundSegments = computed(() => {
    const flight = this.selectedFlight();
    if (!flight || !flight.itineraries || flight.itineraries.length === 0) return [];

    const firstItinerary = flight.itineraries[0];
    const travelerPricing = flight.travelerPricings?.[0];

    return firstItinerary.segments.map(segment => {
      const fareDetails = travelerPricing?.fareDetailsBySegment?.find(fd => fd.segmentId === segment.id);
      return {
        origin: segment.departure.iataCode,
        destination: segment.arrival.iataCode,
        originName: segment.departure.iataCode,
        destinationName: segment.arrival.iataCode,
        departureTime: segment.departure.at,
        arrivalTime: segment.arrival.at,
        duration: segment.duration,
        airline: segment.carrierCode || flight.validatingAirlineCodes?.[0] || 'Airline',
        flightNumber: (segment.carrierCode || '') + (segment.number ? '-' + segment.number : ''),
        aircraft: segment.aircraft?.code || 'N/A',
        cabin: fareDetails?.cabin || 'ECONOMY',
        class: fareDetails?.class || 'N/A',
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
    if (!flight || !flight.price) return null;
    const price = flight.price;
    const base = parseFloat(price.base || '0');
    const total = parseFloat(price.total || price.grandTotal || '0');
    const taxes = total - base;
    return {
      currency: this.userCurrency(),
      base: (base * this.exchangeRate()).toFixed(2),
      taxes: (taxes * this.exchangeRate()).toFixed(2),
      grandTotal: (total * this.exchangeRate()).toFixed(2)
    };
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['adults']) this.adults.set(parseInt(params['adults'], 10));
      if (params['children']) this.children.set(parseInt(params['children'], 10));
    });

    const flight = this.flightService.getSelectedFlight();
    console.log('ValidationComponent: Recovered flight:', flight);
    if (!flight) {
      console.warn('ValidationComponent: No flight found, redirecting to home');
      this.router.navigate(['/']);
      return;
    }
    this.selectedFlight.set(flight);
    this.lastTicketingDate.set(flight.lastTicketingDate || null);
    this.updateExchangeRate(
      flight.price.currency,
      this.locationService.selectedCurrency()
    );
    this.isLoading.set(false);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private updateExchangeRate(from: string, to: string) {
    this.locationService.convertAmount(1, from, to).subscribe(rate => {
      this.exchangeRate.set(rate);
    });
  }

  // Map of airline codes to full names
  private readonly airlineNames: { [key: string]: string } = {
    'VY': 'Vueling',
    'IB': 'Iberia',
    'AF': 'Air France',
    'DY': 'Norwegian Air',
    'UX': 'Air Europa',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'FR': 'Ryanair',
    'U2': 'EasyJet',
    'TK': 'Turkish Airlines',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'TP': 'TAP Air Portugal',
    'KL': 'KLM',
    'AZ': 'ITA Airways',
    'SN': 'Brussels Airlines',
    'OS': 'Austrian Airlines',
    'LX': 'Swiss International Air Lines'
  };

  /**
   * Returns the full name of an airline based on its code.
   */
  getAirlineName(code: string): string {
    return this.airlineNames[code] || code;
  }

  /**
   * Returns the URL for an airline logo based on its IATA code.
   */
  getAirlineLogoUrl(code: string): string {
    return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
  }

  proceedToCheckout() {
    const summary = this.outboundSummary();
    if (summary) {
      this.router.navigate([
        '/booking',
        summary.origin,
        summary.destination,
        summary.departureTime.split('T')[0],
        this.adults(),
        this.children()
      ]);
    } else {
      this.router.navigate(['/booking', this.adults(), this.children()]);
    }
  }

  goBack() {
    this.location.back();
  }
}
