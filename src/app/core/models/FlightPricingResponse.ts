export interface FlightOffersPricingRequestBody {
  "data": {
    "type": "flight-order",
    "flightOffers": [
      {
        "type": "flight-offer",
        "id": "1",
        "source": "GDS",
        "instantTicketingRequired": boolean,
        "nonHomogeneous": boolean,
        "oneWay": boolean,
        "lastTicketingDate": "2020-08-04",
        "numberOfBookableSeats": 9,
        "itineraries": [
          {
            "duration": "PT32H15M",
            "segments": [
              {
                "departure": {
                  "iataCode": "SYD",
                  "terminal": "1",
                  "at": "2021-02-01T19:15:00"
                },
                "arrival": {
                  "iataCode": "SIN",
                  "terminal": "1",
                  "at": "2021-02-02T00:30:00"
                },
                "carrierCode": "TR",
                "number": "13",
                "aircraft": {
                  "code": "789"
                },
                "operating": {
                  "carrierCode": "TR"
                },
                "duration": "PT8H15M",
                "id": "1",
                "numberOfStops": 0,
                "blacklistedInEU": boolean
              },
              {
                "departure": {
                  "iataCode": "SIN",
                  "terminal": "1",
                  "at": "2021-02-02T22:05:00"
                },
                "arrival": {
                  "iataCode": "DMK",
                  "terminal": "1",
                  "at": "2021-02-02T23:30:00"
                },
                "carrierCode": "TR",
                "number": "868",
                "aircraft": {
                  "code": "788"
                },
                "operating": {
                  "carrierCode": "TR"
                },
                "duration": "PT2H25M",
                "id": "2",
                "numberOfStops": 0,
                "blacklistedInEU": boolean
              }
            ]
          },
          {
            "duration": "PT15H",
            "segments": [
              {
                "departure": {
                  "iataCode": "DMK",
                  "terminal": "1",
                  "at": "2021-02-05T23:15:00"
                },
                "arrival": {
                  "iataCode": "SIN",
                  "terminal": "1",
                  "at": "2021-02-06T02:50:00"
                },
                "carrierCode": "TR",
                "number": "867",
                "aircraft": {
                  "code": "788"
                },
                "operating": {
                  "carrierCode": "TR"
                },
                "duration": "PT2H35M",
                "id": "5",
                "numberOfStops": 0,
                "blacklistedInEU": boolean
              },
              {
                "departure": {
                  "iataCode": "SIN",
                  "terminal": "1",
                  "at": "2021-02-06T06:55:00"
                },
                "arrival": {
                  "iataCode": "SYD",
                  "terminal": "1",
                  "at": "2021-02-06T18:15:00"
                },
                "carrierCode": "TR",
                "number": "12",
                "aircraft": {
                  "code": "789"
                },
                "operating": {
                  "carrierCode": "TR"
                },
                "duration": "PT8H20M",
                "id": "6",
                "numberOfStops": 0,
                "blacklistedInEU": boolean
              }
            ]
          }
        ],
        "price": {
          "currency": "EUR",
          "total": "546.70",
          "base": "334.00",
          "fees": [
            {
              "amount": "0.00",
              "type": "SUPPLIER"
            },
            {
              "amount": "0.00",
              "type": "TICKETING"
            }
          ],
          "grandTotal": "546.70"
        },
        "pricingOptions": {
          "fareType": [
            "PUBLISHED"
          ],
          "includedCheckedBagsOnly": true
        },
        "validatingAirlineCodes": [
          "HR"
        ],
        "travelerPricings": [
          {
            "travelerId": "1",
            "fareOption": "STANDARD",
            "travelerType": "ADULT",
            "price": {
              "currency": "EUR",
              "total": "546.70",
              "base": "334.00"
            },
            "fareDetailsBySegment": [
              {
                "segmentId": "1",
                "cabin": "ECONOMY",
                "fareBasis": "O2TR24",
                "class": "O",
                "includedCheckedBags": {
                  "weight": 20,
                  "weightUnit": "KG"
                }
              },
              {
                "segmentId": "2",
                "cabin": "ECONOMY",
                "fareBasis": "O2TR24",
                "class": "O",
                "includedCheckedBags": {
                  "weight": 20,
                  "weightUnit": "KG"
                }
              },
              {
                "segmentId": "5",
                "cabin": "ECONOMY",
                "fareBasis": "X2TR24",
                "class": "X",
                "includedCheckedBags": {
                  "weight": 20,
                  "weightUnit": "KG"
                }
              },
              {
                "segmentId": "6",
                "cabin": "ECONOMY",
                "fareBasis": "H2TR24",
                "class": "H",
                "includedCheckedBags": {
                  "weight": 20,
                  "weightUnit": "KG"
                }
              }
            ]
          }
        ]
      }
    ],
    "travelers": [
      {
        "id": "1",
        "dateOfBirth": "1990-01-01",
        "name": {
          "firstName": "JOHN",
          "lastName": "DOE"
        },
        "gender": "MALE",
        "contact": {
          "emailAddress": "johndoe@example.com",
          "phones": [
            {
              "deviceType": "MOBILE",
              "countryCallingCode": "1",
              "number": "5555555555"
            }
          ]
        }
      }
    ]
  }
}

  export interface FlightOffersPricingResponse {
  data: {
    type: string;
    flightOffers: FlightOfferPricing[];
  };
  dictionaries: {
    locations: Record<string, Location>;
  };
}

// ------------------ FLIGHT OFFER ------------------

export interface FlightOfferPricing {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  lastTicketingDate: string;
  itineraries: Itinerary[];
  price: Price;
  pricingOptions: PricingOptions;
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
  paymentCardRequired: boolean;
}

// ------------------ ITINERARY ------------------

export interface Itinerary {
  segments: Segment[];
}

export interface Segment {
  departure: FlightEndPoint;
  arrival: FlightEndPoint;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating: {
    carrierCode: string;
  };
  id: string;
  numberOfStops: number;
  duration: string;
}

export interface FlightEndPoint {
  iataCode: string;
  terminal?: string;
  at: string;
}

// ------------------ PRICE ------------------

export interface Price {
  currency: string;
  total: string;
  base: string;
  fees: Fee[];
  grandTotal: string;
  billingCurrency: string;
}

export interface Fee {
  amount: string;
  type: string;
}

// ------------------ PRICING OPTIONS ------------------

export interface PricingOptions {
  fareType: string[];
  includedCheckedBagsOnly: boolean;
}

// ------------------ TRAVELER PRICING ------------------

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: "ADULT" | "CHILD" | "INFANT";
  price: TravelerPrice;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface TravelerPrice {
  currency: string;
  total: string;
  base: string;
  taxes: Tax[];
}

export interface Tax {
  amount: string;
  code: string;
}

// ------------------ FARE DETAILS ------------------

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  fareBasis: string;
  class: string;
  includedCheckedBags: {
    quantity: number;
  };
}

// ------------------ LOCATION DICTIONARY ------------------

export interface Location {
  cityCode: string;
  countryCode: string;
}
