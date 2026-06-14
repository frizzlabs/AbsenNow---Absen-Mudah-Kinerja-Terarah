import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-track" [ngClass]="trackClass">
      <div class="progress-fill" [ngStyle]="{'width': percentage + '%'}" [ngClass]="fillClass"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: var(--ion-color-light);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--ion-color-primary);
      border-radius: 4px;
      transition: width 0.3s ease-in-out;
    }
    .track-white { background: rgba(255,255,255,0.2); }
    .fill-white { background: #fff; }
    .fill-green { background: var(--ion-color-success); }
    .fill-orange { background: var(--ion-color-warning); }
  `]
})
export class ProgressBarComponent {
  @Input() percentage: number = 0;
  @Input() trackClass: string = '';
  @Input() fillClass: string = '';
}
