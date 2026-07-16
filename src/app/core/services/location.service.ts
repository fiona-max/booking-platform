import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);

  // Globally shared location and currency state
  selectedCurrency = signal<string>('USD');
  selectedLocation = signal<string>('Detecting...');

  // Cache for exchange rates: { baseCurrency: { targetCurrency: rate } }
  private exchangeRates = signal<Record<string, Record<string, number>>>({});

  constructor() {
    // Try to restore from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency) {
      this.selectedCurrency.set(savedCurrency);
    }
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      this.selectedLocation.set(savedLocation);
    }
  }

  // Fallback map of country codes to currencies
  private readonly countryCurrencyMap: { [key: string]: string } = {
    'US': 'USD', 'GB': 'GBP', 'FR': 'EUR', 'DE': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
    'CA': 'CAD', 'AU': 'AUD', 'JP': 'JPY', 'CN': 'CNY', 'IL': 'ILS', 'CH': 'CHF',
    'AE': 'AED', 'SA': 'SAR', 'IN': 'INR', 'RU': 'RUB', 'BR': 'BRL', 'ZA': 'ZAR',
    'MX': 'MXN', 'TR': 'TRY', 'KR': 'KRW', 'SG': 'SGD', 'NZ': 'NZD'
  };

  /**
   * Attempts to get the user's currency based on their IP address.
   * This is generally faster and less intrusive than using Geolocation API
   * which requires user permission and might not directly provide currency.
   */
  getCurrencyFromIP(): Observable<{ currency: string, country: string, city: string }> {
    return this.http.get<any>('https://ipapi.co/json/').pipe(
      map(data => ({
        currency: data?.currency || this.countryCurrencyMap[data?.country_code] || 'USD',
        country: data?.country_name || 'United States',
        city: data?.city || 'New York'
      })),
      tap(data => {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (!savedCurrency) {
          this.selectedCurrency.set(data.currency);
        }
        const savedLocation = localStorage.getItem('selectedLocation');
        if (!savedLocation) {
          this.selectedLocation.set(`${data.city}, ${data.country}`);
        }
      }),
      catchError(() => {
        const fallback = { currency: 'USD', country: 'United States', city: 'New York' };
        this.selectedCurrency.set(fallback.currency);
        this.selectedLocation.set(`${fallback.city}, ${fallback.country}`);
        return of(fallback);
      })
    );
  }

  updateCurrency(currency: string) {
    this.selectedCurrency.set(currency);
    localStorage.setItem('selectedCurrency', currency);
  }

  /**
   * Fetches a list of all countries.
   */
  getCountries(): Observable<any[]> {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name,cca2').pipe(
      map(countries => countries.sort((a, b) => a.name.common.localeCompare(b.name.common))),
      catchError(() => of([]))
    );
  }

  /**
   * Fetches exchange rates for a given base currency.
   */
  fetchExchangeRates(baseCurrency: string): Observable<Record<string, number>> {
    const cached = this.exchangeRates()[baseCurrency];
    if (cached) {
      return of(cached);
    }

    // Using fawazahmed0/exchange-api (latest)
    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCurrency.toLowerCase()}.json`;
    const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${baseCurrency.toLowerCase()}.json`;

    return this.http.get<any>(url).pipe(
      map(data => data[baseCurrency.toLowerCase()]),
      tap(rates => {
        this.exchangeRates.update(prev => ({ ...prev, [baseCurrency]: rates }));
      }),
      catchError(() => {
        // Try fallback
        return this.http.get<any>(fallbackUrl).pipe(
          map(data => data[baseCurrency.toLowerCase()]),
          tap(rates => {
            this.exchangeRates.update(prev => ({ ...prev, [baseCurrency]: rates }));
          }),
          catchError(err => {
            console.error('Failed to fetch exchange rates', err);
            return of({});
          })
        );
      })
    );
  }

  /**
   * Converts an amount from one currency to another.
   * Returns an Observable of the converted amount.
   */
  convertAmount(amount: number | string, fromCurrency: string, toCurrency: string): Observable<number> {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (fromCurrency === toCurrency) {
      return of(numAmount);
    }

    return this.fetchExchangeRates(fromCurrency).pipe(
      map(rates => {
        const rate = rates[toCurrency.toLowerCase()];
        if (rate) {
          return numAmount * rate;
        }
        return numAmount; // Fallback to original amount if rate not found
      })
    );
  }

  /**
   * Attempts to get user location coordinates via Browser Geolocation API.
   */
  getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false
        });
      }
    });
  }

  /**
   * Determines the currency based on the user's browser locale as a secondary heuristic.
   */
  getCurrencyFromLocale(): string {
    try {
      // Modern browsers can sometimes provide this via Intl
      const locale = navigator.language;
      // Better way for locale to currency mapping:
      const region = locale.split('-')[1] || (locale.length === 2 ? locale.toUpperCase() : 'US');
      return this.countryCurrencyMap[region] || 'USD';
    } catch (e) {
      return 'USD';
    }
  }
}
