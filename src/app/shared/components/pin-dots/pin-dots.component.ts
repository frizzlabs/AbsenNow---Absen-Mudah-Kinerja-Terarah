import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pin-dots',
  template: `
    <div class="pin-dots" [class.loading]="isLoading">
      <ng-container *ngIf="!isLoading">
        <div class="dot" *ngFor="let i of [1,2,3,4]" [ngClass]="getDotClass(i)"></div>
      </ng-container>
      <ng-container *ngIf="isLoading">
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
        <div class="spinner-dot"></div>
      </ng-container>
    </div>
  `,
  styleUrls: ['./pin-dots.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PinDotsComponent {
  @Input() length: number = 4;
  @Input() currentLength: number = 0;
  @Input() isLoading: boolean = false;
  
  getDotClass(index: number): string {
    if (this.currentLength >= index) {
      return 'filled';
    } else if (this.currentLength + 1 === index) {
      return 'active';
    }
    return 'empty';
  }
}
