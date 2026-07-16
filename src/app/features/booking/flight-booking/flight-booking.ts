import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';


@Component({
  selector: 'app-flight-booking',
  imports: [
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './flight-booking.html',
  styleUrl: './flight-booking.scss'
})
export class FlightBooking {
  UserDetailsform: FormGroup;
  preferencesForm: FormGroup;
  paymentForm: FormGroup;


  constructor(private fb: FormBuilder) {
    this.UserDetailsform = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      emergencyName: [''],
      emergencyPhone: ['']
    });

    this.preferencesForm = this.fb.group({
      meal: ['Standard'],
      seat: ['No Preference'],
      flyerId: ['']
    });


    this.paymentForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expiry: ['', Validators.required],
      cvv: ['', Validators.required],
      agree: [true]
    });


  }
}
