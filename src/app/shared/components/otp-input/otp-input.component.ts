import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-input',
  template: `
    <div class="otp-container">
      <div class="otp-box" *ngFor="let box of getBoxes(); let i = index" [ngClass]="{'active': value.length === i, 'filled': value.length > i}">
        {{ value[i] || '' }}
      </div>
    </div>
  `,
  styleUrls: ['./otp-input.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class OtpInputComponent {
  @Input() length: number = 6;
  @Input() value: string = '';
  
  getBoxes() {
    return Array(this.length).fill(0);
  }
}
