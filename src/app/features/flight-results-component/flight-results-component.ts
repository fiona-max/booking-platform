// import {Component, OnInit, signal, effect, inject} from '@angular/core';
// import {CommonModule} from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import {ActivatedRoute, Router} from '@angular/router';
// import {FlightResultsModel} from '../../core/models/flightResultsModel';
// import {LocationService} from '../../core/services/location.service';
// import {FlightSearchFormComponent} from '../../shared/components/flight-search-form/flight-search-form.component';
// import {FlightOffer, Price} from '../../core/models/flight.model';
// import {FlightService} from '../../core/services/flight.service';
//
// @Component({
//   selector: 'app-flight-results-component',
//   imports: [CommonModule, FormsModule, FlightSearchFormComponent],
//   standalone: true,
//   templateUrl: './flight-results-component.html',
//   styleUrl: './flight-results-component.scss'
// })
// export class FlightResultsComponent {
//   private readonly flightService = inject(FlightService);
//   private readonly router = inject(Router);
//   flights = signal<FlightOffer[]>([]);
//   loading = signal(false);
//   error = signal<string | null>(null);
//   origin: string = 'origin';
//   destination: string = 'destination';
//   searchSummary: string = 'Wednesday, 24 July • 1 Passenger';
//   resultsCount: number = 12;
//
//   openDetailsId: string | null = 'details-1';
//   currencyCode: string = 'EUR';
//   exchangeRateToLocal: number = 1.0;
//
//   flightOffers: FlightResultsModel[] = [
//     {
//       id: "1",
//       type: "flight-offer",
//       source: "GDS",
//       lastTicketingDate: "2026-06-09",
//       numberOfBookableSeats: 9,
//       itineraries: [
//         {
//           duration: "PT1H30M",
//           segments: [
//             {
//               departure: { iataCode: "ORY", terminal: "1", at: "2026-06-10T13:45:00" },
//               arrival: { iataCode: "LHR", terminal: "4", at: "2026-06-10T14:15:00" },
//               carrierCode: "VY",
//               number: "8960",
//               aircraft: { code: "320" },
//               operating: { carrierCode: "VY" },
//               duration: "PT1H30M",
//               id: "6",
//               numberOfStops: 0,
//               blacklistedInEU: false
//             }
//           ]
//         }
//       ],
//       price: { currency: "EUR", total: "185.56", base: "102.00", fees: [], grandTotal: "185.56" },
//       pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: true },
//       validatingAirlineCodes: ["VY"],
//       travelerPricings: []
//     },
//     {
//       id: "2",
//       type: "flight-offer",
//       source: "GDS",
//       lastTicketingDate: "2026-07-01",
//       numberOfBookableSeats: 5,
//       itineraries: [
//         {
//           duration: "PT8H20M",
//           segments: [
//             {
//               departure: { iataCode: "CDG", terminal: "2E", at: "2026-07-05T10:00:00" },
//               arrival: { iataCode: "JFK", terminal: "4", at: "2026-07-05T12:20:00" },
//               carrierCode: "AF",
//               number: "6",
//               aircraft: { code: "77W" },
//               operating: { carrierCode: "AF" },
//               duration: "PT8H20M",
//               id: "21",
//               numberOfStops: 0,
//               blacklistedInEU: false
//             }
//           ]
//         }
//       ],
//       price: { currency: "EUR", total: "720.00", base: "650.00", fees: [], grandTotal: "720.00" },
//       pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: true },
//       validatingAirlineCodes: ["AF"],
//       travelerPricings: []
//     },
//     {
//       id: "3",
//       type: "flight-offer",
//       source: "GDS",
//       lastTicketingDate: "2026-08-15",
//       numberOfBookableSeats: 2,
//       itineraries: [
//         {
//           duration: "PT11H00M",
//           segments: [
//             {
//               departure: { iataCode: "LHR", terminal: "5", at: "2026-08-20T09:30:00" },
//               arrival: { iataCode: "DXB", terminal: "3", at: "2026-08-20T20:30:00" },
//               carrierCode: "EK",
//               number: "2",
//               aircraft: { code: "388" },
//               operating: { carrierCode: "EK" },
//               duration: "PT11H00M",
//               id: "31",
//               numberOfStops: 0,
//               blacklistedInEU: false
//             }
//           ]
//         }
//       ],
//       price: { currency: "EUR", total: "950.00", base: "900.00", fees: [], grandTotal: "950.00" },
//       pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: true },
//       validatingAirlineCodes: ["EK"],
//       travelerPricings: []
//     },
//     {
//       id: "4",
//       type: "flight-offer",
//       source: "GDS",
//       lastTicketingDate: "2026-09-10",
//       numberOfBookableSeats: 7,
//       itineraries: [
//         {
//           duration: "PT2H45M",
//           segments: [
//             {
//               departure: { iataCode: "FRA", terminal: "1", at: "2026-09-15T07:00:00" },
//               arrival: { iataCode: "MAD", terminal: "2", at: "2026-09-15T09:45:00" },
//               carrierCode: "LH",
//               number: "1120",
//               aircraft: { code: "321" },
//               operating: { carrierCode: "LH" },
//               duration: "PT2H45M",
//               id: "41",
//               numberOfStops: 0,
//               blacklistedInEU: false
//             }
//           ]
//         }
//       ],
//       price: { currency: "EUR", total: "210.00", base: "180.00", fees: [], grandTotal: "210.00" },
//       pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: true },
//       validatingAirlineCodes: ["LH"],
//       travelerPricings: []
//     },
//     {
//       id: "5",
//       type: "flight-offer",
//       source: "GDS",
//       lastTicketingDate: "2026-10-01",
//       numberOfBookableSeats: 4,
//       itineraries: [
//         {
//           duration: "PT13H30M",
//           segments: [
//             {
//               departure: { iataCode: "SIN", terminal: "1", at: "2026-10-05T22:00:00" },
//               arrival: { iataCode: "LAX", terminal: "B", at: "2026-10-06T07:30:00" },
//               carrierCode: "SQ",
//               number: "38",
//               aircraft: { code: "359" },
//               operating: { carrierCode: "SQ" },
//               duration: "PT13H30M",
//               id: "51",
//               numberOfStops: 0,
//               blacklistedInEU: false
//             }
//           ]
//         }
//       ],
//       price: { currency: "EUR", total: "1200.00", base: "1100.00", fees: [], grandTotal: "1200.00" },
//       pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: true },
//       validatingAirlineCodes: ["SQ"],
//       travelerPricings: []
//     }
//   ];
//   // This array holds your final rendered/filtered lists
//   filteredOffers: FlightResultsModel[] = [];
//
//   // Unique list of airlines extracted from your flightOffers array
//   availableAirlines: string[] = [];
//   minPrice: number = 50;
//   maxPrice: number = 1000;
//
//   filters = {
//     stops: {
//       nonStop: true, // Checkboxes default values
//       oneStop: false,
//       twoPlusStops: false
//     },
//     airlines: new Map<string, boolean>(), // Track check states by airline name
//     maxPrice: 1000
//   };
//   currentSort: 'cheapest' | 'fastest' = 'cheapest';
//   showSearchForm = signal(false);
//   private locationService = inject(LocationService);
//
//   constructor(
//     private route: ActivatedRoute
//   ) {
//     this.showSearchForm.set(false); // Hide form after successful search
//
//     // React to currency changes
//     effect(() => {
//       this.currencyCode = this.locationService.selectedCurrency();
//       this.updatePriceRange();
//       this.applyFilters();
//     });
//   }
//
//   private updatePriceRange() {
//     if (this.currencyCode === 'XAF' || this.currencyCode === 'XOF') {
//       this.minPrice = 30000;
//       this.maxPrice = 1000000;
//       this.filters.maxPrice = 1000000;
//     } else if (this.currencyCode === 'EUR') {
//       this.minPrice = 50;
//       this.maxPrice = 1500;
//       this.filters.maxPrice = 1500;
//     } else {
//       // Default for other currencies, maybe fetch current exchange rate for range?
//       // For now, let's just keep it simple or use a reasonable default
//       this.minPrice = 0;
//       this.maxPrice = 2000;
//       this.filters.maxPrice = 2000;
//     }
//   }
//
//   ngOnInit() {
//     const storedFlights = this.flightService.getLatestResults();
//     if (storedFlights && storedFlights.length > 0) {
//       this.flights.set(storedFlights);
//       this.maxPrice.set(this.maxPriceInResults());
//       this.updateExchangeRate(storedFlights[0].price.currency, this.locationService.selectedCurrency());
//     } else {
//       this.router.navigate(['/']);
//     }
//
//     this.route.params.subscribe(params => {
//       if (params['origin']) this.origin = params['origin'];
//       if (params['destination']) this.destination = params['destination'];
//
//       const date = params['date'];
//       const adults = parseInt(params['adults'] || '1', 10);
//       const children = parseInt(params['children'] || '0', 10);
//       const totalPassengers = adults + children;
//
//       if (date) {
//         const dateObj = new Date(date);
//         const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
//         const formattedDate = dateObj.toLocaleDateString('en-GB', options);
//         this.searchSummary = `${formattedDate} • ${totalPassengers} Passenger${totalPassengers > 1 ? 's' : ''}`;
//       } else {
//         this.searchSummary = `${totalPassengers} Passenger${totalPassengers > 1 ? 's' : ''}`;
//       }
//     });
//
//     this.extractUniqueAirlines();
//     this.applyFilters();
//   }
//
//   modifySearch() {
//     this.showSearchForm.update(v => !v);
//   }
//   // Set active sort and re-evaluate the listings
//   setSort(sortType: 'cheapest' | 'fastest'): void {
//     this.currentSort = sortType;
//     this.applyFilters();
//   }
//   // Helper helper to turn ISO duration strings (like "PT8H20M" or "PT1F30M") cleanly into numerical total minutes
//   private parseISODurationToMinutes(durationStr: string): number {
//     if (!durationStr) return 0;
//
//     const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
//     if (!matches) return 0;
//
//     const hours = matches[1] ? parseInt(matches[1], 10) : 0;
//     const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
//
//     return (hours * 60) + minutes;
//   }
//
//   // 3. EXTRACT UNIQUE AIRLINES FROM YOUR OFFERS
//   extractUniqueAirlines(): void {
//     const airlineSet = new Set(this.flightOffers.map(offer => offer.itineraries[0]?.segments[0]?.carrierCode));
//     this.availableAirlines = Array.from(airlineSet).sort();
//
//     // Automatically set all newly discovered airlines to checked by default
//     this.availableAirlines.forEach(airline => {
//       this.filters.airlines.set(airline, true);
//     });
//   }
//
//   // 5. EVENT TOGGLE HANDLE FOR MAP STATE
//   toggleAirline(airline: string): void {
//     const currentState = this.filters.airlines.get(airline);
//     this.filters.airlines.set(airline, !currentState);
//     this.applyFilters();
//   }
//
//   applyFilters(): void {
//     // 1. Check if the user is actively using the filters
//     const airlineMapValues = Array.from(this.filters.airlines.values());
//     const isFilteringAirlines = airlineMapValues.includes(false) && airlineMapValues.includes(true);
//
//     const { nonStop, oneStop, twoPlusStops } = this.filters.stops;
//     const totalStopsChecked = (nonStop ? 1 : 0) + (oneStop ? 1 : 0) + (twoPlusStops ? 1 : 0);
//     const isFilteringStops = totalStopsChecked > 0 && totalStopsChecked < 3;
//
//     // 2. Map through original flights and DO THE ACTUAL MATH CONVERSION HERE
//     this.locationService.fetchExchangeRates('EUR').subscribe(rates => {
//       const rate = rates[this.currencyCode.toLowerCase()] || 1.0;
//
//       let results = this.flightOffers.map(flight => {
//         const convertedFlight = JSON.parse(JSON.stringify(flight));
//         const baseEuroPrice = Number(flight.price.total);
//         convertedFlight.displayPrice = baseEuroPrice * rate;
//         return convertedFlight;
//       });
//
//       // 3. Now filter out items based on the NEW converted prices
//       results = results.filter(flight => {
//         if (flight.displayPrice > this.filters.maxPrice) {
//           return false;
//         }
//
//         // Airline filters
//         if (isFilteringAirlines) {
//           const carrierCode = flight.itineraries?.[0]?.segments?.[0]?.carrierCode;
//           if (!this.filters.airlines.get(carrierCode)) return false;
//         }
//
//         // Stops filters
//         if (isFilteringStops) {
//           const actualStops = flight.stops !== undefined
//             ? flight.stops
//             : (flight.itineraries?.[0]?.segments?.length || 1) - 1;
//
//           if (actualStops === 0 && !nonStop) return false;
//           if (actualStops === 1 && !oneStop) return false;
//           if (actualStops >= 2 && !twoPlusStops) return false;
//         }
//
//         return true;
//       });
//
//       // 4. Sort the converted math results
//       if (this.currentSort === 'cheapest') {
//         results.sort((a, b) => a.displayPrice - b.displayPrice);
//       } else if (this.currentSort === 'fastest') {
//         results.sort((a, b) => {
//           const durationA = this.parseISODurationToMinutes(a.itineraries?.[0]?.duration);
//           const durationB = this.parseISODurationToMinutes(b.itineraries?.[0]?.duration);
//           return durationA - durationB;
//         });
//       }
//
//       this.filteredOffers = results;
//     });
//   }
//
//   selectFlight(flight: any) {
//     this.loading.set(true);
//     this.error.set(null);
//
//     this.flightService.priceFlight(flight).subscribe({
//       next: (response) => {
//         // CHANGED: Fallback checks both standard properties & raw variant layers coming from backend pricing calls
//         const flightOffer = response.data?.flightOffers?.[0] || response.flightOffers?.[0] || response;
//
//         if (flightOffer) {
//           this.flightService.setSelectedFlight(flightOffer);
//           this.router.navigate(['/validation']);
//         } else {
//           this.error.set('FLIGHT_RESULTS.ERROR_VALIDATE_FAILED');
//         }
//         this.loading.set(false);
//       },
//       error: (err) => {
//         console.error('Pricing validation phase dropped:', err);
//         this.error.set('FLIGHT_RESULTS.ERROR_PRICING_FAILED');
//         this.loading.set(false);
//       }
//     });
//   }
//
// }
