import { Component, signal, inject, OnInit, computed, effect, untracked } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';
import { LocationService } from '../../core/services/location.service';
import { Airline } from '../../core/services/airlineservice/airline';
import { FlightOffer } from '../../core/models/flight.model';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { FlightSearchFormComponent } from '../../shared/components/flight-search-form/flight-search-form.component';
import {LogoLoaderComponent} from '../../shared/components/logo-loader-component/logo-loader-component';

@Component({
  selector: 'app-flight-results',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, TranslateModule, FlightSearchFormComponent, DecimalPipe, LogoLoaderComponent],
  templateUrl: './flight-results.component.html',
  styles: [`@reference "../../../styles.scss"`]
})
export class FlightResultsComponent implements OnInit {
  private readonly flightService = inject(FlightService);
  private readonly locationService = inject(LocationService);
  private readonly airlineService = inject(Airline);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Search form visibility
  showSearchForm = signal(false);

  // Signals for managing flight results and UI state
  flights = signal<FlightOffer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filter signals
  selectedStops = signal<number[]>([]);
  selectedAirlines = signal<string[]>([]);
  maxPrice = signal<number | null>(null);
  selectedCabin = signal<string | null>(null);
  userCurrency = computed(() => this.locationService.selectedCurrency());
  exchangeRate = signal<number>(1);

  // Sorting
  sortBy = signal<'cheapest' | 'fastest' | 'best'>('cheapest');

  // Dynamic airline names
  dynamicAirlineNames = signal<{ [key: string]: string }>({});

  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(10);
  searchSummary:  string = '';
  searchInitialValues: any = null;

  constructor() {
    // Watch for new search results
    effect(() => {
      const newResults = this.flightService.getLatestResults();
      if (newResults && newResults.length > 0) {
        this.flights.set(newResults);
        this.maxPrice.set(this.maxPriceInResults());
        this.showSearchForm.set(false); // Hide form after successful search
        this.fetchAirlineNames();
      }
    });

    // Reset page to 1 when filters alter
    effect(() => {
      this.selectedStops();
      this.selectedAirlines();
      this.maxPrice();
      this.selectedCabin();
      this.sortBy();

      untracked(() => this.currentPage.set(1));
    });
  }

// Computed signal for filtered and sorted flights
  filteredFlights = computed(() => {
    let result = [...this.flights()];

    // Filter by Stops
    if (this.selectedStops().length > 0) {
      result = result.filter(flight => {
        // FIX: Added fallback array empty check and safe navigation
        const segments = flight.itineraries?.[0]?.segments || [];
        const stops = segments.length > 0 ? segments.length - 1 : 0;

        if (this.selectedStops().includes(2)) {
          return this.selectedStops().includes(stops) || stops >= 2;
        }
        return this.selectedStops().includes(stops);
      });
    }

    // Filter by Airlines
    if (this.selectedAirlines().length > 0) {
      result = result.filter(flight =>
        this.selectedAirlines().some(airline => (flight.validatingAirlineCodes || []).includes(airline)) ||
        this.selectedAirlines().includes(flight.validatingCarrier)
      );
    }

    // Filter by Price
    const maxP = this.maxPrice();
    if (maxP !== null) {
      result = result.filter(flight => parseFloat(flight.price.total) <= maxP);    }

    // Filter by Cabin
    const cabin = this.selectedCabin();
    if (cabin) {
      result = result.filter(flight =>
        (flight.travelerPricings || []).some(tp =>
          (tp.fareDetailsBySegment || []).some(fd => fd.cabin === cabin)
        )
      );
    }

    // Sorting
    const sortVal = this.sortBy();
    if (sortVal === 'cheapest') {
      result.sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total));
    } else if (sortVal === 'fastest') {
      // FIX: Added fallback string 'N/A' if duration is undefined
      result.sort((a, b) => this.parseDuration(a.itineraries?.[0]?.duration || 'N/A') - this.parseDuration(b.itineraries?.[0]?.duration || 'N/A'));
    } else if (sortVal === 'best') {
      result.sort((a, b) => {
        const scoreA = parseFloat(a.price.total) + (this.parseDuration(a.itineraries?.[0]?.duration || 'N/A') * 0.1);
        const scoreB = parseFloat(b.price.total) + (this.parseDuration(b.itineraries?.[0]?.duration || 'N/A') * 0.1);
        return scoreA - scoreB;
      });
    }

    return result;
  });

  // Computed signals for pagination
  totalPages = computed(() => Math.ceil(this.filteredFlights().length / this.pageSize()));

  paginatedFlights = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredFlights().slice(start, start + this.pageSize());
  });

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (current < total - 2) pages.push('...');
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  });

  // Helper to parse duration string cleanly (handles 'PT2H30M' and Sabre's fallback 'N/A')
  private parseDuration(duration: string): number {
    if (!duration || duration === 'N/A') return 0; // CHANGED: Gracefully escape if Sabre data does not provide it early
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = parseInt(match?.[1]?.replace('H', '') || '0');
    const minutes = parseInt(match?.[2]?.replace('M', '') || '0');
    return hours * 60 + minutes;
  }

  // Options for filters (derived safely from results)
  airlineOptions = computed(() => {
    const codes = new Set<string>();
    this.flights().forEach(f => {
      if (f?.validatingCarrier) {
        codes.add(f.validatingCarrier);
      }
      if (f?.validatingAirlineCodes) {
        f.validatingAirlineCodes.forEach(c => codes.add(c));
      }
    });
    return Array.from(codes);
  });

  minPriceInResults = computed(() => {
    const list = this.flights();
    if (!list || list.length === 0) return 0;
    // FIX: Guard nested price reference paths safely using optional chaining
    const prices = list.map(f => f?.price?.total ?? 0);
    return Math.min(...prices.map(p => typeof p === 'string' ? parseFloat(p) : p));
  });

  maxPriceInResults = computed(() => {
    const list = this.flights();
    if (!list || list.length === 0) return 0;
    // FIX: Guard nested price reference paths safely using optional chaining
    const prices = list.map(f => f?.price?.total ?? 0);
    return Math.max(...prices.map(p => typeof p === 'string' ? parseFloat(p) : p));
  });

  // Helper signals for layout contexts
  origin = computed(() => {
    const routeOrigin = this.route.snapshot.paramMap.get('origin') || this.route.snapshot.params['origin'];
    const routeOriginCode = this.route.snapshot.paramMap.get('originCode');

    if (routeOrigin && routeOriginCode) {
      return `${routeOrigin.toUpperCase()} (${routeOriginCode.toUpperCase()})`;
    } else if (routeOrigin) {
      return routeOrigin.toUpperCase();
    }

    const flight = this.flights()[0];
    if (flight && flight.itineraries[0]?.segments[0]) {
      const seg = flight.itineraries[0].segments[0];
      if (seg.departureAirport && seg.departureAirport !== seg.departure.iataCode) {
        return `${seg.departureAirport} (${seg.departure.iataCode})`;
      }
      return seg.departure.iataCode;
    }
    return 'Origin';
  });

  destination = computed(() => {
    const routeDest = this.route.snapshot.paramMap.get('destination') || this.route.snapshot.params['destination'];
    const routeDestCode = this.route.snapshot.paramMap.get('destinationCode');

    if (routeDest && routeDestCode) {
      return `${routeDest.toUpperCase()} (${routeDestCode.toUpperCase()})`;
    } else if (routeDest) {
      return routeDest.toUpperCase();
    }

    const flight = this.flights()[0];
    if (!flight) return 'Destination';
    const segments = flight.itineraries[0]?.segments || [];
    const lastSeg = segments[segments.length - 1];
    if (lastSeg) {
      if (lastSeg.arrivalAirport && lastSeg.arrivalAirport !== lastSeg.arrival.iataCode) {
        return `${lastSeg.arrivalAirport} (${lastSeg.arrival.iataCode})`;
      }
      return lastSeg.arrival.iataCode;
    }
    return 'Destination';
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const originName = params['origin'];
      const originCode = params['originCode'];
      const destinationName = params['destination'];
      const destinationCode = params['destinationCode'];
      const date = params['date'];
      const adults = parseInt(params['adults'] || '1', 10);
      const children = parseInt(params['children'] || '0', 10);
      const totalPassengers = adults + children;

      this.searchInitialValues = {
        origin: originName && originCode ? `${originName} (${originCode})` : originName,
        originCode: originCode,
        originName: originName,
        destination: destinationName && destinationCode ? `${destinationName} (${destinationCode})` : destinationName,
        destinationCode: destinationCode,
        destinationName: destinationName,
        departureDate: date,
        adults: adults,
        children: children
      };

      if (date) {
        const dateObj = new Date(date);
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
        const formattedDate = dateObj.toLocaleDateString('en-GB', options);
        this.searchSummary = `${formattedDate} • ${totalPassengers} Passenger${totalPassengers > 1 ? 's' : ''}`;
      } else {
        this.searchSummary = `${totalPassengers} Passenger${totalPassengers > 1 ? 's' : ''}`;
      }
    });
    const storedFlights = this.flightService.getLatestResults();
    if (storedFlights && storedFlights.length > 0) {
      this.flights.set(storedFlights);
      this.maxPrice.set(this.maxPriceInResults());
      this.updateExchangeRate(storedFlights[0].price.currency, this.locationService.selectedCurrency());
      this.fetchAirlineNames();
    } else {
      this.router.navigate(['/']);
    }
  }

  private fetchAirlineNames() {
    const codes = this.airlineOptions();
    if (codes.length === 0) return;

    // Filter out codes we already have names for
    const existingNames = this.dynamicAirlineNames();
    const missingCodes = codes.filter(code => !existingNames[code]);

    if (missingCodes.length === 0) return;

    // Fetch all missing airline names in a single request using comma-separated codes
    this.airlineService.lookupAirlines(missingCodes.join(',')).subscribe({
      next: (response) => {
        if (response.data) {
          this.dynamicAirlineNames.update(names => {
            const updatedNames = { ...names };
            response.data.forEach(airline => {
              updatedNames[airline.iataCode] = airline.commonName || airline.businessName;
            });
            return updatedNames;
          });
        }
      },
      error: (err) => console.error('Failed to fetch airline names:', err)
    });
  }

  toggleStop(stop: number) {
    const current = this.selectedStops();
    this.selectedStops.set(current.includes(stop) ? current.filter(s => s !== stop) : [...current, stop]);
    this.currentPage.set(1);
  }

  toggleAirline(airline: string) {
    const current = this.selectedAirlines();
    this.selectedAirlines.set(current.includes(airline) ? current.filter(a => a !== airline) : [...current, airline]);
    this.currentPage.set(1);
  }

  private updateExchangeRate(from: string, to: string) {
    this.locationService.convertAmount(1, from, to).subscribe(rate => {
      this.exchangeRate.set(rate);
    });
  }

  private readonly airlineNames: { [key: string]: string } = {
    'VY': 'Vueling', 'IB': 'Iberia', 'AF': 'Air France', 'DY': 'Norwegian Air',
    'UX': 'Air Europa', 'BA': 'British Airways', 'LH': 'Lufthansa', 'FR': 'Ryanair',
    'U2': 'EasyJet', 'TK': 'Turkish Airlines', 'EK': 'Emirates', 'QR': 'Qatar Airways',
    'AA': 'American Airlines', 'DL': 'Delta Air Lines', 'UA': 'United Airlines',
    'TP': 'TAP Air Portugal', 'KL': 'KLM', 'AZ': 'ITA Airways', 'SN': 'Brussels Airlines',
    'OS': 'Austrian Airlines', 'LX': 'Swiss International Air Lines'
  };

  parseFloat(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
  }
  getAirlineName(code: string): string {
    return this.dynamicAirlineNames()[code] || this.airlineNames[code] || code;
  }

  getAirlineLogoUrl(code: string): string {
    return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
  }

  getAirlineLogo(code: string): string {
    return `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;
  }


  resetFilters() {
    this.selectedStops.set([]);
    this.selectedAirlines.set([]);
    this.maxPrice.set(this.maxPriceInResults());
    this.selectedCabin.set(null);
    this.currentPage.set(1);
  }

  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.goToPage(this.currentPage() - 1);
  }

  modifySearch() {
    this.showSearchForm.update(v => !v);
  }

  /**
   * Selects a flight, calls backend validation endpoint, and handles state serialization safely.
   */
  // selectFlight(flight: FlightOffer) {
  //   this.loading.set(true);
  //   this.error.set(null);
  //
  //   this.flightService.priceFlight(flight).subscribe({
  //     next: (response) => {
  //       // Robust extraction of flight offer from response
  //       let flightOffer = response.data?.flightOffers?.[0] || response.flightOffer;
  //
  //       // If not found in standard properties, check if the response itself is the offer
  //       // or if it's our hybrid payload echoed back
  //       if (!flightOffer) {
  //         if (response.itineraries || response.price) {
  //           flightOffer = response;
  //         } else if (response.data?.flightOffers?.[0]) {
  //           flightOffer = response.data.flightOffers[0];
  //         }
  //       }
  //
  //       if (flightOffer && (flightOffer.itineraries || flightOffer.price)) {
  //         this.flightService.setSelectedFlight(flightOffer);
  //         this.router.navigate(['/validation']);
  //       } else {
  //         this.error.set('FLIGHT_RESULTS.ERROR_VALIDATE_FAILED');
  //       }
  //       this.loading.set(false);
  //     },
  //     error: (err) => {
  //       console.error('Pricing validation phase dropped:', err);
  //       this.error.set('FLIGHT_RESULTS.ERROR_PRICING_FAILED');
  //       this.loading.set(false);
  //     }
  //   });
  // }

  selectFlight(flight: any) {
    console.log('Flight selected:', flight);
    this.loading.set(true);
    this.error.set(null);

    // ✅ Always available now
    // const originalFlight = flight.__raw;

    if (!flight) {
      console.error('❌ No raw flight attached:', flight);
      this.error.set('FLIGHT_RESULTS.ERROR_VALIDATE_FAILED');
      this.loading.set(false);
      return;
    }

    this.flightService.priceFlight(flight).subscribe({
      next: (response) => {
        console.log('✅ Pricing response:', response);

        const flightOffer =
          response?.data?.flightOffers?.[0] ||
          response?.flightOffers?.[0] ||
          (response?.itineraries && response?.price ? response : null);

        if (flightOffer) {
          this.flightService.setSelectedFlight(flightOffer);
          // Pass traveler counts to validation page
          const params = this.route.snapshot.params;
          this.router.navigate(['/validation'], {
            queryParams: {
              adults: params['adults'] || 1,
              children: params['children'] || 0
            }
          });
        } else {
          this.error.set('FLIGHT_RESULTS.ERROR_VALIDATE_FAILED');
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('FLIGHT_RESULTS.ERROR_PRICING_FAILED');
        this.loading.set(false);
      }
    });
  }


}
