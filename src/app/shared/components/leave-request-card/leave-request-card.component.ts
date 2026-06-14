import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-leave-request-card',
  templateUrl: './leave-request-card.component.html',
  styleUrls: ['./leave-request-card.component.scss'],
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent]
})
export class LeaveRequestCardComponent {
  @Input() month: string = '';
  @Input() day: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() status: 'pending' | 'approved' | 'rejected' = 'pending';

  get statusColor(): 'warning' | 'success' | 'danger' {
    switch (this.status) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'warning';
    }
  }

  get statusText(): string {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }
}
