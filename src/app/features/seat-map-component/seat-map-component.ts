import {Component, inject, OnInit, signal} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FlightService} from '../../core/services/flight.service';
interface Seat {
  label: string;
  occupied: boolean;
  selected: boolean;
  premium: boolean;
}
interface Row {
  rowNumber: number;
  seats: Seat[];
}
@Component({
  selector: 'app-seat-map-component',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf
  ],
  templateUrl: './seat-map-component.html',
  styleUrl: './seat-map-component.scss'
})
export class SeatMapComponent implements OnInit {
  private readonly flightService = inject(FlightService);

  rows: Row[] = [];
  premiumRows = [15, 16, 17, 18];
  exitRows = [28];
  selectedFlight = signal<any>(null);
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    const flight = this.flightService.getSelectedFlight();
    if (flight) {
      this.selectedFlight.set(flight);
      this.fetchSeatMaps(flight);
    } else {
      this.generateSeats();
    }
  }

  fetchSeatMaps(flight: any): void {
    this.isLoading.set(true);
    this.flightService.getSeatMaps(flight).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response && response.data && response.data.length > 0) {
          this.mapSeatData(response.data[0]);
        } else {
          this.generateSeats();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error fetching seat maps:', err);
        this.generateSeats();
      }
    });
  }

  mapSeatData(seatMap: any): void {
    // Basic mapping logic for demonstration.
    // In a real scenario, you'd iterate through seatMap.decks[].view[]
    this.rows = [];
    if (seatMap.decks && seatMap.decks[0] && seatMap.decks[0].seats) {
       // Assuming the API returns a flat list or structured rows.
       // This is a placeholder for actual mapping logic based on Amadeus SeatMap API
    }

    // Fallback to generation if mapping is complex/missing for now
    if (this.rows.length === 0) {
      this.generateSeats();
    }
  }

  generateSeats(): void {
    const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let row = 15; row <= 34; row++) {
      const seats: Seat[] = seatLabels.map(label => ({
        label,
        occupied: Math.random() < 0.3,
        selected: false,
        premium: this.premiumRows.includes(row)
      }));
      this.rows.push({
        rowNumber: row,
        seats
      });
    }
  }

  toggleSeat(seat: Seat): void {
    if (seat.occupied) {
      return;
    }
    seat.selected = !seat.selected;
  }

  isExitRow(rowNumber: number): boolean {
    return this.exitRows.includes(rowNumber);
  }

  confirmSeats(): void {
    const selectedSeats = this.rows.flatMap(r => r.seats).filter(s => s.selected);
    console.log('Selected Seats:', selectedSeats);

    const pendingOrder = JSON.parse(sessionStorage.getItem('pendingOrder') || '{}');
    if (pendingOrder.travelers) {
      // Logic to assign seats to travelers
      pendingOrder.travelers.forEach((traveler: any, index: number) => {
        if (selectedSeats[index]) {
          // This structure depends on the specific API requirements for seat assignment
          traveler.assignedSeat = selectedSeats[index].label;
        }
      });
    }

    this.isLoading.set(true);
    this.flightService.createOrder(pendingOrder).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Booking confirmed with seats:', response);
        alert('Booking confirmed with your selected seats!');
        sessionStorage.removeItem('pendingOrder');
        // Navigate to success page or home
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error confirming booking:', err);
      }
    });
  }
}
