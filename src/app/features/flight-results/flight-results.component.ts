import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { FlightOffer } from '../../core/models/flight.model';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Component to display flight search results.
 * Allows users to view available flights and proceed to booking.
 */
@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, TranslateModule],
  templateUrl: './flight-results.component.html',
  styles: [`
    @reference "../../../styles.scss";
  `]
})
export class FlightResultsComponent implements OnInit {
  private readonly flightService = inject(FlightService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals for managing flight results and UI state
  flights = signal<FlightOffer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filter signals
  selectedStops = signal<number[]>([]);
  selectedAirlines = signal<string[]>([]);
  maxPrice = signal<number | null>(null);
  selectedCabin = signal<string | null>(null);
  sortBy = signal<'cheapest' | 'fastest' | 'best'>('cheapest');

  // Computed signal for filtered and sorted flights
  filteredFlights = computed(() => {
    let result = [...this.flights()];

    // Filter by Stops
    if (this.selectedStops().length > 0) {
      result = result.filter(flight => {
        const stops = flight.itineraries[0].segments.length - 1;
        if (this.selectedStops().includes(2)) {
          return this.selectedStops().includes(stops) || stops >= 2;
        }
        return this.selectedStops().includes(stops);
      });
    }

    // Filter by Airlines
    if (this.selectedAirlines().length > 0) {
      result = result.filter(flight =>
        flight.validatingAirlineCodes.some(code => this.selectedAirlines().includes(code))
      );
    }

    // Filter by Price
    if (this.maxPrice() !== null) {
      result = result.filter(flight => parseFloat(flight.price.total) <= this.maxPrice()!);
    }

    // Filter by Cabin
    if (this.selectedCabin()) {
      result = result.filter(flight =>
        flight.travelerPricings[0].fareDetailsBySegment[0].cabin === this.selectedCabin()
      );
    }

    // Sorting
    if (this.sortBy() === 'cheapest') {
      result.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    } else if (this.sortBy() === 'fastest') {
      result.sort((a, b) => this.parseDuration(a.itineraries[0].duration) - this.parseDuration(b.itineraries[0].duration));
    } else if (this.sortBy() === 'best') {
      // "Best" is a mix of price and duration. Simple heuristic: price + (duration_in_mins * 0.1)
      result.sort((a, b) => {
        const scoreA = parseFloat(a.price.total) + (this.parseDuration(a.itineraries[0].duration) * 0.1);
        const scoreB = parseFloat(b.price.total) + (this.parseDuration(b.itineraries[0].duration) * 0.1);
        return scoreA - scoreB;
      });
    }

    return result;
  });

  // Helper to parse Amadeus duration (e.g., PT2H30M) to minutes
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = parseInt(match?.[1]?.replace('H', '') || '0');
    const minutes = parseInt(match?.[2]?.replace('M', '') || '0');
    return hours * 60 + minutes;
  }

  // Options for filters (derived from results)
  airlineOptions = computed(() => {
    const codes = new Set<string>();
    this.flights().forEach(f => f.validatingAirlineCodes.forEach(c => codes.add(c)));
    return Array.from(codes);
  });

  minPriceInResults = computed(() => {
    if (this.flights().length === 0) return 0;
    return Math.min(...this.flights().map(f => parseFloat(f.price.total)));
  });

  maxPriceInResults = computed(() => {
    if (this.flights().length === 0) return 0;
    return Math.max(...this.flights().map(f => parseFloat(f.price.total)));
  });

  // Helper signals for UI
  origin = computed(() => {
    const routeOrigin = this.route.snapshot.paramMap.get('origin');
    const routeOriginCode = this.route.snapshot.paramMap.get('originCode');

    if (routeOrigin && routeOriginCode) {
      return `${routeOrigin.toUpperCase()} (${routeOriginCode.toUpperCase()})`;
    } else if (routeOrigin) {
      return routeOrigin.toUpperCase();
    }

    const flight = this.flights()[0];
    return flight ? flight.itineraries[0].segments[0].departure.iataCode : 'Origin';
  });

  destination = computed(() => {
    const routeDest = this.route.snapshot.paramMap.get('destination');
    const routeDestCode = this.route.snapshot.paramMap.get('destinationCode');

    if (routeDest && routeDestCode) {
      return `${routeDest.toUpperCase()} (${routeDestCode.toUpperCase()})`;
    } else if (routeDest) {
      return routeDest.toUpperCase();
    }

    const flight = this.flights()[0];
    if (!flight) return 'Destination';
    const lastSeg = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
    return lastSeg.arrival.iataCode;
  });

  ngOnInit() {
    const storedFlights = this.flightService.getLatestResults();
    if (storedFlights && storedFlights.length > 0) {
      this.flights.set(storedFlights);
      // Initialize maxPrice with the maximum found in results
      this.maxPrice.set(this.maxPriceInResults());
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleStop(stop: number) {
    const current = this.selectedStops();
    if (current.includes(stop)) {
      this.selectedStops.set(current.filter(s => s !== stop));
    } else {
      this.selectedStops.set([...current, stop]);
    }
  }

  toggleAirline(airline: string) {
    const current = this.selectedAirlines();
    if (current.includes(airline)) {
      this.selectedAirlines.set(current.filter(a => a !== airline));
    } else {
      this.selectedAirlines.set([...current, airline]);
    }
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

  resetFilters() {
    this.selectedStops.set([]);
    this.selectedAirlines.set([]);
    this.maxPrice.set(this.maxPriceInResults());
    this.selectedCabin.set(null);
  }

  /**
   * Navigates back to the search page.
   */
  modifySearch() {
    this.router.navigate(['/']);
  }

  /**
   * Selects a flight and navigates to the booking page.
   * @param flight The selected flight offer.
   */
  selectFlight(flight: FlightOffer) {
    this.loading.set(true);
    this.error.set(null);

    // Validate pricing before moving to booking
    this.flightService.priceFlight(flight).subscribe({
      next: (response) => {
        const flightOffer = response.data?.flightOffers?.[0] || response.flightOffers?.[0];
        if (flightOffer) {
          console.log(flightOffer)
          this.flightService.setSelectedFlight(flightOffer);
          this.router.navigate(['/validation']);
        } else {
          this.error.set('FLIGHT_RESULTS.ERROR_VALIDATE_FAILED');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Pricing error:', err);
        this.error.set('FLIGHT_RESULTS.ERROR_PRICING_FAILED');
        this.loading.set(false);
      }
    });
  }
}
