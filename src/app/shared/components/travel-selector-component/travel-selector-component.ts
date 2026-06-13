import { Component,EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-travel-selector-component',
  imports: [],
  templateUrl: './travel-selector-component.html',
  styleUrl: './travel-selector-component.scss'
})
export class TravelSelectorComponent {
  @Input() adults: number = 1;
  @Input() children: number = 0;

  @Output() travelersChange = new EventEmitter<{ adults: number, children: number }>();

  isOpen = false;

  get totalTravelers(): number {
    return this.adults + this.children;
  }

  increment(type: 'adults' | 'children'): void {
    if (type === 'adults') this.adults++;
    else this.children++;
    this.emitChange();
  }

  decrement(type: 'adults' | 'children'): void {
    if (type === 'adults' && this.adults > 1) this.adults--;
    else if (type === 'children' && this.children > 0) this.children--;
    this.emitChange();
  }

  private emitChange(): void {
    this.travelersChange.emit({ adults: this.adults, children: this.children });
  }

  done(): void {
    this.isOpen = false;
    this.emitChange();
  }
}
