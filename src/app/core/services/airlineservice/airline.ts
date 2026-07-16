import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AmadeusAirlineResponse} from '../../models/airlineData';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Airline {
  // URL pointing to your Node.js backend proxy
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);


  constructor() {}

  /**
   * Looks up airline information by IATA or ICAO codes.
   * @param airlineCodes Comma-separated list of airline codes (e.g., 'TX,CA,VU')
   */
  lookupAirlines(airlineCodes: string): Observable<AmadeusAirlineResponse> {
    const params = new HttpParams().set('codes', airlineCodes);
    return this.http.get<AmadeusAirlineResponse>(`${this.apiUrl}/airlines`,
      {
        params
      });
  }
}
