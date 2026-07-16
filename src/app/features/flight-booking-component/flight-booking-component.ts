import { Component, Input, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {FlightService} from '../../core/services/flight.service';
import { LocationService } from '../../core/services/location.service';
import {CommonModule, DatePipe} from '@angular/common';
import {LucideAngularModule} from 'lucide-angular';
import {TranslateModule} from '@ngx-translate/core';

@Component({
  selector: 'app-flight-booking-component',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslateModule],
  providers: [DatePipe],
  standalone: true,
  templateUrl: './flight-booking-component.html',
  styleUrl: './flight-booking-component.scss'
})

export class FlightBookingComponent implements OnInit {
  @Input() numAdults: number = 1;
  @Input() numChildren: number = 0;
  @Input() origin: string = 'ORY';
  @Input() destination: string = 'LHR';
  @Input() date: string = '2024-05-24';

  travelerForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly flightService = inject(FlightService);
  private readonly locationService = inject(LocationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  userCurrency = computed(() => this.locationService.selectedCurrency());
  exchangeRate = signal<number>(1);
  basePriceEUR = 185.56;

  selectedFlight = signal<any | null>(null);
  countries: any[] = [];
  isBookingInProgress = signal<boolean>(false);

  ngOnInit() {
    this.loadCountries();

    this.route.params.subscribe(params => {
      if (params['adults']) this.numAdults = parseInt(params['adults'], 10);
      if (params['children']) this.numChildren = parseInt(params['children'], 10);
      if (params['origin']) this.origin = params['origin'];
      if (params['destination']) this.destination = params['destination'];
      if (params['date']) this.date = params['date'];

      this.travelerForm = this.fb.group({
        passengers: this.fb.array([])
      });

      this.initializePassengers();
    });

    const flight = this.flightService.getSelectedFlight();
    if (flight) {
      this.selectedFlight.set(flight);
      if (flight.price) {
        this.basePriceEUR = parseFloat(flight.price.base || flight.price.total || '185.56');
        this.locationService.convertAmount(1, flight.price.currency, this.locationService.selectedCurrency()).subscribe(rate => {
          this.exchangeRate.set(rate);
        });
      }
    }
  }

  private initializePassengers() {
    const passengersArray = this.passengers;

    // Add Adults (First one is designated as Primary Contact)
    for (let i = 0; i < this.numAdults; i++) {
      passengersArray.push(this.createPassenger('ADULT', i === 0));
    }

    // Add Children
    for (let i = 0; i < this.numChildren; i++) {
      passengersArray.push(this.createPassenger('CHILD', false));
    }
  }

  private createPassenger(type: 'ADULT' | 'CHILD', isPrimary: boolean): FormGroup {
    const controls: any = {
      type: [type],
      isPrimary: [isPrimary],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required]
    };

    // Every traveler needs a contact phone/email section in GDS, but primary contact details are crucial
    if (isPrimary || type === 'ADULT') {
      controls.emailAddress = ['', [Validators.required, Validators.email]];
      controls.countryCallingCode = ['34', Validators.required]; // Default e.g. Spain '34'
      controls.phoneNumber = ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]];
    }

    // International travel documents (Required for GDS/Amadeus Orders)
    controls.passportNumber = ['', type === 'ADULT' ? Validators.required : Validators.nullValidator];
    controls.issuingCountry = ['ES', type === 'ADULT' ? Validators.required : Validators.nullValidator]; // Default Country ISO Code
    controls.issueDate = ['', type === 'ADULT' ? Validators.required : Validators.nullValidator];
    controls.expirationDate = ['', type === 'ADULT' ? Validators.required : Validators.nullValidator];
    controls.nationality = ['ES', type === 'ADULT' ? Validators.required : Validators.nullValidator];

    return this.fb.group(controls);
  }

  get passengers(): FormArray {
    return this.travelerForm.get('passengers') as FormArray;
  }

  getAdultCount(): number {
    return this.passengers.controls.filter(p => p.get('type')?.value === 'ADULT').length;
  }

  getChildCount(): number {
    return this.passengers.controls.filter(p => p.get('type')?.value === 'CHILD').length;
  }

  loadCountries() {
    this.flightService.getCountries()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (countries) => {
          this.countries = countries;
        },
        error: (err) => {
          console.error('Error loading countries:', err);
        }
      });
  }

  onSubmit() {
    if (this.travelerForm.invalid) {
      this.travelerForm.markAllAsTouched();
      return;
    }

    const rawFormValues = this.travelerForm.value.passengers;
    const currentFlightOffer = this.selectedFlight();

    if (!currentFlightOffer) {
      console.error("No flight offer selected for booking.");
      return;
    }

    this.isBookingInProgress.set(true);

    // 1. Format the Travelers data array matching Amadeus requirements
    const travelersPayload = rawFormValues.map((passenger: any, index: number) => {
      const travelerId = (index + 1).toString();

      const formattedTraveler: any = {
        id: travelerId,
        dateOfBirth: passenger.dateOfBirth,
        name: {
          firstName: passenger.firstName.toUpperCase(),
          lastName: passenger.lastName.toUpperCase()
        },
        gender: passenger.gender.toUpperCase()
      };

      // Contact info mapping (Amadeus maps email and phone to individual traveler details)
      if (passenger.emailAddress || passenger.phoneNumber) {
        formattedTraveler.contact = {
          emailAddress: passenger.emailAddress,
          phones: [
            {
              deviceType: 'MOBILE',
              countryCallingCode: passenger.countryCallingCode,
              number: passenger.phoneNumber
            }
          ]
        };
      }

      // Passport/Document mapping
      if (passenger.passportNumber) {
        formattedTraveler.documents = [
          {
            documentType: 'PASSPORT',
            birthPlace: passenger.nationality, // standard fallback
            issuanceLocation: passenger.issuingCountry,
            issuanceDate: passenger.issueDate,
            number: passenger.passportNumber,
            expiryDate: passenger.expirationDate,
            issuanceCountry: passenger.issuingCountry,
            validityCountry: passenger.issuingCountry,
            nationality: passenger.nationality,
            holder: true
          }
        ];
      }

      return formattedTraveler;
    });

    // 2. Wrap into the complete API schema
    const orderPayload = {
      type: 'flight-order',
      flightOffers: [currentFlightOffer],
      travelers: travelersPayload
    };
     console.log('Prepared Order Payload for API:', orderPayload);
    // 3. Make API call to backend endpoint (e.g. /create-order)
    // this.flightService.createOrder(orderPayload)
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (response) => {
    //       this.isBookingInProgress.set(false);
    //       console.log('Order created successfully!', response);
    //       alert(`Booking Confirmed! Reference: ${response?.data?.associatedRecords?.[0]?.reference || 'N/A'}`);
    //     },
    //     error: (err) => {
    //       this.isBookingInProgress.set(false);
    //       console.error('Error creating flight order:', err);
    //     }
    //   });
  }

  protected onCancel() {
    window.history.back();
  }
}

// import {Component, OnInit, Input, inject, signal, computed, DestroyRef} from '@angular/core';
// import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule, DatePipe } from '@angular/common';
// import { LocationService } from '../../core/services/location.service';
// import {LucideAngularModule} from 'lucide-angular';
// import {TranslateModule} from '@ngx-translate/core';
// import { ActivatedRoute } from '@angular/router';
// import {FlightService} from '../../core/services/flight.service';
// import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
//
// @Component({
//   selector: 'app-flight-booking-component',
//   imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, TranslateModule],
//   providers: [DatePipe],
//   standalone: true,
//   templateUrl: './flight-booking-component.html',
//   styleUrl: './flight-booking-component.scss'
// })
// export class FlightBookingComponent {
//   @Input() numAdults: number = 1;
//   @Input() numChildren: number = 0;
//   @Input() origin: string = 'ORY';
//   @Input() destination: string = 'LHR';
//   @Input() date: string = '2024-05-24';
//
//   travelerForm!: FormGroup;
//   private readonly flightService = inject(FlightService);
//   private readonly locationService = inject(LocationService);
//   private readonly route = inject(ActivatedRoute);
//   userCurrency = computed(() => this.locationService.selectedCurrency());
//   exchangeRate = signal<number>(1);
//   basePriceEUR = 185.56;
//
//   selectedFlight = signal<any | null>(null);
//
//   private destroyRef = inject(DestroyRef);
//   countries: any = [];
//
//
//   constructor(private fb: FormBuilder) {
//     // Fetch exchange rate from EUR to user currency
//     this.locationService.convertAmount(1, 'EUR', this.locationService.selectedCurrency()).subscribe(rate => {
//       this.exchangeRate.set(rate);
//     });
//   }
//
//   ngOnInit() {
//     this.loadCountries();
//     this.route.params.subscribe(params => {
//       if (params['adults']) this.numAdults = parseInt(params['adults'], 10);
//       if (params['children']) this.numChildren = parseInt(params['children'], 10);
//       if (params['origin']) this.origin = params['origin'];
//       if (params['destination']) this.destination = params['destination'];
//       if (params['date']) this.date = params['date'];
//
//       this.travelerForm = this.fb.group({
//         passengers: this.fb.array<any>([])
//       });
//
//       this.initializePassengers();
//     });
//
//     const flight = this.flightService.getSelectedFlight();
//     if (flight) {
//       this.selectedFlight.set(flight);
//       if (flight.price) {
//         this.basePriceEUR = parseFloat(flight.price.base || flight.price.total || '185.56');
//         // Update exchange rate based on flight currency if needed
//         this.locationService.convertAmount(1, flight.price.currency, this.locationService.selectedCurrency()).subscribe(rate => {
//           this.exchangeRate.set(rate);
//         });
//       }
//     }
//   }
//
//   private initializePassengers() {
//     const passengersArray = this.passengers as FormArray;
//
//     // Add Adults
//     for (let i = 0; i < this.numAdults; i++) {
//       passengersArray.push(this.createPassenger('Adult', i === 0));
//     }
//
//     // Add Children
//     for (let i = 0; i < this.numChildren; i++) {
//       passengersArray.push(this.createPassenger('Child', false));
//     }
//   }
//
//   private createPassenger(type: 'Adult' | 'Child', isPrimary: boolean): FormGroup {
//     const controls: any = {
//       id: [Date.now() + Math.random()],
//       type: [type],
//       isPrimary: [isPrimary],
//       firstName: ['', [Validators.required, Validators.minLength(2)]],
//       lastName: ['', [Validators.required, Validators.minLength(2)]],
//       dateOfBirth: ['', Validators.required],
//       gender: ['', Validators.required]
//     };
//
//     if (type === 'Adult') {
//       controls.salutation = ['Mr.'];
//       controls.passportNumber = ['', Validators.required];
//       controls.issuingCountry = ['France (FRA)'];
//       controls.issueDate = ['', Validators.required];
//       controls.expirationDate = ['', Validators.required];
//       controls.nationality = ['French'];
//     }
//
//     return this.fb.group(controls);
//   }
//
//   get passengers(): FormArray {
//     return this.travelerForm.get('passengers') as FormArray;
//   }
//
//   getAdultCount(): number {
//     return this.passengers.controls.filter(p => p.get('type')?.value === 'Adult').length;
//   }
//
//   getChildCount(): number {
//     return this.passengers.controls.filter(p => p.get('type')?.value === 'Child').length;
//   }
//   loadCountries() {
//     this.flightService.getCountries().pipe(takeUntilDestroyed(this.destroyRef))
//       .subscribe({
//         next: (countries) => {
//           this.countries = countries;
//         },
//         error: (err) => {
//           console.error('Error loading countries:', err);
//         }
//     })
//   }
//
//
//   onSubmit() {
//     if (this.travelerForm.valid) {
//       console.log('Booking Data:', this.travelerForm.value);
//       // alert('Traveler details saved successfully! Proceeding to Seat Selection...');
//     }else{
//       console.log(this.travelerForm.value)
//     }
//   }
//
//   protected readonly window = window;
//
//   protected onCancel() {
//     window.history.back();
//   }
// }
