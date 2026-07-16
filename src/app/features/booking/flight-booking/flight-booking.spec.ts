import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightBooking } from './flight-booking';

describe('FlightBooking', () => {
  let component: FlightBooking;
  let fixture: ComponentFixture<FlightBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightBooking]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightBooking);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
