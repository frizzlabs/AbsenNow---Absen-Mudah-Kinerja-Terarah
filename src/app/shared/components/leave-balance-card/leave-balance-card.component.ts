import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-balance-card',
  templateUrl: './leave-balance-card.component.html',
  styleUrls: ['./leave-balance-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class LeaveBalanceCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() daysLeft: number = 0;
  @Input() usedDays: number = 0;
  @Input() totalDays: number = 0;
  @Input() colorClass: 'primary' | 'danger' = 'primary'; // e.g. 'primary' for blue, 'danger' for red

  get progressPercentage(): number {
    if (this.totalDays === 0) return 0;
    return (this.usedDays / this.totalDays) * 100;
  }
}
