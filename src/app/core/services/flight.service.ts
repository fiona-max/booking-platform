import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { FlightOffer, FlightSearchQuery, BookingRequest, BookingResponse, LocationSuggestion } from '../models/flight.model';
import { environment } from '../../../environments/environment';
// If it was renamed to FlightSearchParams:

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly locationCache = new Map<string, LocationSuggestion[]>();

  // Internal state to hold flight search results and selection
  private latestResults = signal<FlightOffer[]>([]);
  private selectedFlight = signal<FlightOffer | null>(null);

  /**
   * Searches for flights based on query parameters.
   */
  searchFlights(query: any): Observable<FlightOffer[]> {
    let params = new HttpParams()
      .set('originCode', query.originCode)
      .set('destinationCode', query.destinationCode)
      .set('departureDate', query.departureDate)
      .set('adults', query.adults.toString());

    if (query.returnDate) {
      params = params.set('returnDate', query.returnDate);
    }
    if (query.maxPrice && query.maxPrice > 0) {
      params = params.set('maxPrice', query.maxPrice.toString());
    }
    if (query.currency) {
      params = params.set('currencyCode', query.currency);
    }
    if (query.travelClass) {
      params = params.set('travelClass', query.travelClass.toUpperCase());
    }
    if (query.children !== undefined) {
      params = params.set('children', query.children.toString());
    }

    return this.http.get<FlightOffer[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Sets the latest flight search results in the state.
   */
  setLatestResults(flights: FlightOffer[]) {
    this.latestResults.set(flights);
  }

  /**
   * Retrieves the latest search results.
   */
  getLatestResults(): FlightOffer[] {
    return this.latestResults();
  }

  /**
   * Sets the currently selected flight for booking.
   */
  setSelectedFlight(flight: FlightOffer) {
    this.selectedFlight.set(flight);
  }

  /**
   * Retrieves the currently selected flight.
   */
  getSelectedFlight(): FlightOffer | null {
    return this.selectedFlight();
  }

  /**
   * Clears the selected flight from state.
   */
  clearSelectedFlight() {
    this.selectedFlight.set(null);
  }

  /**
   * Validates pricing for a selected flight offer.
   */
  priceFlight(flightOffer: FlightOffer): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/price`, { flightOffer });
  }

  /**
   * Finalizes the booking for a flight and travelers.
   */
  bookFlight(bookingRequest: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.apiUrl}/book`, bookingRequest);
  }

  /**
   * Autocomplete search for airport/city locations.
   */
  searchLocations(keyword: string): Observable<LocationSuggestion[]> {
    const term = keyword.toLowerCase().trim();
    if (this.locationCache.has(term)) {
      return of(this.locationCache.get(term)!);
    }
    return this.http.get<LocationSuggestion[]>(`${this.apiUrl}/locations`, {
      params: { keyword: term }
    }).pipe(
      tap(results => this.locationCache.set(term, results))
    );
  }

  getLocations(keyword: string) {
    return this.http.get<any>('/api/flights/locations', {
      params: { keyword }
    });
  }
}
