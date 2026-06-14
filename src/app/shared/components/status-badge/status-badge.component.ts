import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-status-badge',
  template: `
    <div class="status-badge" [ngClass]="'status-' + color">
      <div class="status-dot" *ngIf="!icon"></div>
      <ion-icon *ngIf="icon" [name]="icon" class="status-icon"></ion-icon>
      <span>{{ text }}</span>
    </div>
  `,
  styleUrls: ['./status-badge.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class StatusBadgeComponent {
  @Input() color: 'success' | 'warning' | 'danger' | 'primary' | 'medium' = 'success';
  @Input() icon?: string;
  @Input() text: string = '';
}
