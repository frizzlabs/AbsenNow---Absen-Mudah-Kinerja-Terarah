import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { LeaveBalanceCardComponent } from '../../../../shared/components/leave-balance-card/leave-balance-card.component';
import { LeaveRequestCardComponent } from '../../../../shared/components/leave-request-card/leave-request-card.component';
import { LeaveService } from '../../../../core/services/leave.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, LeaveBalanceCardComponent, LeaveRequestCardComponent]
})
export class HomePage implements OnInit {
  balances: any[] = [];
  requests: any[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private leaveService: LeaveService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadBalancesAndRequests();
  }

  loadBalancesAndRequests() {
    this.isLoading = true;
    this.leaveService.getBalances().subscribe({
      next: (balances) => {
        this.balances = balances;
        this.leaveService.getRequests().subscribe({
          next: (requests) => {
            this.requests = requests;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Failed to load leave requests', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load leave balances', err);
        this.isLoading = false;
      }
    });
  }

  getBalance(type: string) {
    const bal = this.balances.find(b => b.leave_type === type);
    return bal ? bal : { allocated: 0, used: 0 };
  }

  getUsedDays(): number {
    return this.balances.reduce((acc, b) => acc + b.used, 0);
  }

  getAllocatedDays(): number {
    return this.balances.reduce((acc, b) => acc + b.allocated, 0);
  }

  getPendingRequestsCount(): number {
    return this.requests
      .filter(r => r.status === 'pending')
      .reduce((acc, r) => acc + r.total_days, 0);
  }

  formatMonth(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short' });
    } catch (e) {
      return '';
    }
  }

  formatDay(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.getDate().toString().padStart(2, '0');
    } catch (e) {
      return '';
    }
  }

  formatSubtitle(log: any): string {
    try {
      const start = new Date(log.start_date);
      const end = new Date(log.end_date);
      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const days = log.total_days;
      return `${startStr} - ${endStr} (${days} ${days > 1 ? 'days' : 'day'})`;
    } catch (e) {
      return '';
    }
  }

  capitalize(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  viewHistory() {
    this.router.navigate(['/leave/history']);
  }

  requestLeave() {
    this.leaveService.resetDraft(); // reset draft wizard before starting
    this.router.navigate(['/leave/create/type']);
  }
}
