export interface AirlineData {
  type: string;
  iataCode: string;
  icaoCode: string;
  businessName: string;
  commonName: string;
}

export interface AmadeusAirlineResponse {
  meta: {
    count: number;
    links: { self: string };
  };
  data: AirlineData[];
}
