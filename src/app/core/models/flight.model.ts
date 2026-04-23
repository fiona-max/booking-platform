export interface FlightOffer {
  id: string;
  type: string;
  source: string;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions?: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

export interface FlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees?: Fee[];
  grandTotal?: string;
  billingCurrency?: string;
}

export interface Fee {
  amount: string;
  type: string;
}

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags?: IncludedCheckedBags;
}

export interface IncludedCheckedBags {
  quantity: number;
}

export interface Traveler {
  id: string;
  dateOfBirth: string;
  name: {
    firstName: string;
    lastName: string;
  };
  gender: string;
  contact: {
    emailAddress: string;
    phones: Phone[];
  };
}

export interface Phone {
  deviceType: string;
  countryCallingCode: string;
  number: string;
}

export interface FlightSearchQuery {
  originCode: string;
  destinationCode: string;
  departureDate: string;
  adults: number;
  returnDate?: string;
  max?: number;
}

export interface LocationSuggestion {
  name: string;
  detailedName: string;
  iataCode: string;
  address: {
    cityName: string;
    countryName: string;
  };
  subType: string;
}

export interface BookingRequest {
  flightOffer: FlightOffer;
  travelers: Traveler[];
}

export interface BookingResponse {
  type: string;
  id: string;
  queuingOfficeId: string;
  associatedRecords: AssociatedRecord[];
  travelers: any[];
  flightOffers: FlightOffer[];
}

export interface AssociatedRecord {
  reference: string;
  originSystemCode: string;
  creationDate: string;
}
