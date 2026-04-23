# Flight Pricing API Endpoint Documentation

## POST /api/flight-pricing

### Summary
The `POST /api/flight-pricing` endpoint is used to validate the final price and availability of a specific flight offer before proceeding to the booking stage. This is a critical step as flight prices and seat availability can change rapidly.

### Request Schema
- **URL**: `http://localhost:3000/api/flights/price` (or as configured in `environment.ts`)
- **Method**: `POST`
- **Body**:
  ```json
  {
    "flightOffer": {
      "id": "string",
      "type": "flight-offer",
      "source": "GDS",
      "lastTicketingDate": "YYYY-MM-DD",
      "numberOfBookableSeats": 9,
      "itineraries": [...],
      "price": {
        "currency": "GBP",
        "total": "540.20",
        "base": "400.00"
      },
      "travelerPricings": [...]
    }
  }
  ```

### Response Schema
- **Success (200 OK)**:
  Returns the validated flight offer, which may include updated pricing or availability details.
  ```json
  {
    "data": {
      "flightOffers": [
        {
          "type": "flight-offer",
          "id": "1",
          "source": "GDS",
          "lastTicketingDate": "2024-11-01",
          "itineraries": [...],
          "price": {
            "currency": "GBP",
            "total": "540.20",
            "base": "400.00",
            "grandTotal": "540.20"
          },
          "travelerPricings": [...]
        }
      ]
    }
  }
  ```

### Error Handling
- **400 Bad Request**: The selected flight is no longer available or the price has expired.
- **500 Internal Server Error**: Issues with the downstream GDS or airline provider.

### Context for AI Agents
AI agents should call this endpoint immediately after a user selects a flight from the search results. It ensures that the user is presented with the most up-to-date pricing and that the flight is still bookable. If the endpoint returns a 400 error, the agent should inform the user and suggest performing a new search.

### Angular Integration Example

#### FlightService (`src/app/core/services/flight.service.ts`)
```typescript
/**
 * Validates pricing for a selected flight offer.
 */
priceFlight(flightOffer: FlightOffer): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/price`, { flightOffer });
}
```

#### Component Usage
```typescript
// In your component (e.g., FlightResultsComponent)
this.flightService.priceFlight(selectedFlight).subscribe({
  next: (response) => {
    // Navigate to the validation/payment page with confirmed price
    this.router.navigate(['/booking/validation']);
  },
  error: (err) => {
    // Handle error (e.g., show "Flight no longer available" message)
    this.errorMessage = 'The selected flight is no longer available at this price. Please search again.';
  }
});
```
