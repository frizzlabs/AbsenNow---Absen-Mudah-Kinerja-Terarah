import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pin-dots',
  template: `
    <div class="pin-dots">
      <div class="dot" *ngFor="let i of [1,2,3,4]" [ngClass]="getDotClass(i)"></div>
    </div>
  `,
  styleUrls: ['./pin-dots.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PinDotsComponent {
  @Input() length: number = 4;
  @Input() currentLength: number = 0;
  
  getDotClass(index: number): string {
    if (this.currentLength >= index) {
      return 'filled';
    } else if (this.currentLength + 1 === index) {
      return 'active';
    }
    return 'empty';
  }
}
