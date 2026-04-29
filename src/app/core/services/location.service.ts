import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly http = inject(HttpClient);

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
      catchError(() => of({ currency: 'USD', country: 'United States', city: 'New York' }))
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
