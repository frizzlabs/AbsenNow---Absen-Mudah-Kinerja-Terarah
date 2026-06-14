import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circular-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="circular-progress" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" class="track"></circle>
        <circle cx="50" cy="50" r="40" class="fill"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="offset"></circle>
      </svg>
      <div class="content">
        <span class="value">{{ percentage }}%</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }
    .circular-progress {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      transform: rotate(-90deg);
    }
    circle {
      fill: none;
      stroke-width: 8;
      stroke-linecap: round;
    }
    .track {
      stroke: var(--ion-color-light);
    }
    .fill {
      stroke: var(--ion-color-primary);
      transition: stroke-dashoffset 0.5s ease-in-out;
    }
    .content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .value {
      font-size: 24px;
      font-weight: 700;
      color: var(--ion-color-dark);
    }
  `]
})
export class CircularProgressComponent implements OnChanges {
  @Input() percentage: number = 0;
  @Input() size: number = 100;
  
  circumference = 2 * Math.PI * 40;
  offset = this.circumference;
  
  ngOnChanges() {
    this.offset = this.circumference - (this.percentage / 100) * this.circumference;
  }
}
