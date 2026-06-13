import { Component, OnInit, Input, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../core/services/location.service';

interface PassengerForm {
  id: number;
  type: 'Adult' | 'Child';
  isPrimary: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  salutation?: string;
  passportNumber?: string;
  issuingCountry?: string;
  expirationDate?: string;
  nationality?: string;
}
@Component({
  selector: 'app-flight-booking-component',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './flight-booking-component.html',
  styleUrl: './flight-booking-component.scss'
})
export class FlightBookingComponent {
  @Input() numAdults: number = 1;
  @Input() numChildren: number = 0;

  travelerForm!: FormGroup;
  private readonly locationService = inject(LocationService);
  userCurrency = computed(() => this.locationService.selectedCurrency());
  exchangeRate = signal<number>(1);
  basePriceEUR = 185.56;

  constructor(private fb: FormBuilder) {
    // Fetch exchange rate from EUR to user currency
    this.locationService.convertAmount(1, 'EUR', this.locationService.selectedCurrency()).subscribe(rate => {
      this.exchangeRate.set(rate);
    });
  }

  ngOnInit() {
    this.travelerForm = this.fb.group({
      passengers: this.fb.array<any>([])
    });

    this.initializePassengers();
  }

  private initializePassengers() {
    const passengersArray = this.passengers as FormArray;

    // Add Adults
    for (let i = 0; i < this.numAdults; i++) {
      passengersArray.push(this.createPassenger('Adult', i === 0));
    }

    // Add Children
    for (let i = 0; i < this.numChildren; i++) {
      passengersArray.push(this.createPassenger('Child', false));
    }
  }

  private createPassenger(type: 'Adult' | 'Child', isPrimary: boolean): FormGroup {
    const controls: any = {
      id: [Date.now() + Math.random()],
      type: [type],
      isPrimary: [isPrimary],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required]
    };

    if (type === 'Adult') {
      controls.salutation = ['Mr.'];
      controls.passportNumber = ['', Validators.required];
      controls.issuingCountry = ['France (FRA)'];
      controls.expirationDate = [''];
      controls.nationality = ['French'];
    }

    return this.fb.group(controls);
  }

  get passengers(): FormArray {
    return this.travelerForm.get('passengers') as FormArray;
  }

  getAdultCount(): number {
    return this.passengers.controls.filter(p => p.get('type')?.value === 'Adult').length;
  }

  getChildCount(): number {
    return this.passengers.controls.filter(p => p.get('type')?.value === 'Child').length;
  }

  onSubmit() {
    if (this.travelerForm.valid) {
      console.log('Booking Data:', this.travelerForm.value);
      alert('Traveler details saved successfully! Proceeding to Seat Selection...');
    } else {
      this.travelerForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
    }
  }

  protected readonly window = window;

  protected onCancel() {
    window.history.back();
  }
}
