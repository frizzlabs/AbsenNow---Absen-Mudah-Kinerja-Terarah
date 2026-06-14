import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-leave-history-card',
  templateUrl: './leave-history-card.component.html',
  styleUrls: ['./leave-history-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, StatusBadgeComponent]
})
export class LeaveHistoryCardComponent {
  @Input() iconName: string = 'umbrella-outline';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() status: 'pending' | 'approved' | 'rejected' = 'pending';
  @Input() duration: string = '';
  @Input() totalDays: string = '';
  @Input() iconColorClass: string = 'primary'; // e.g. primary, warning, danger, medium

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
