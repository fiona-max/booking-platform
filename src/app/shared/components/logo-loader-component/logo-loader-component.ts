import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-logo-loader-component',
  imports: [CommonModule],
  templateUrl: './logo-loader-component.html',
  styleUrl: './logo-loader-component.scss',
  standalone: true
})
export class LogoLoaderComponent {
  progressText = 'Searching airlines...';

  @Input() texts = [
    'Searching airlines...',
    'Finding the best routes...',
    'Checking seat availability...',
    'Finalizing prices...'
  ];

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private textIndex = 0;

  // Generate the 8 orbit angles (matching the original 0,45,...,315)
  readonly orbitAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      this.progressText = this.texts[this.textIndex];
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }

  getOrbitStyle(angle: number): { [key: string]: string } {
    return { transform: `rotate(${angle}deg)` };
  }
}
