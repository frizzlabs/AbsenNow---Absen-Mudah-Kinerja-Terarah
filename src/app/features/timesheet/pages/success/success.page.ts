import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-timesheet-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent]
})
export class SuccessPage implements OnInit {
  timesheet: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const raw = localStorage.getItem('last_submitted_timesheet');
    if (raw) {
      try {
        this.timesheet = JSON.parse(raw);
      } catch (e) {
        this.timesheet = null;
      }
    }
  }

  get rangeLabel(): string {
    if (!this.timesheet) return 'this week';
    const s = new Date(this.timesheet.week_start_date);
    const e = new Date(this.timesheet.week_end_date);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  get totalLabel(): string {
    const mins = this.timesheet?.total_minutes || 0;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  backToActivity() {
    this.router.navigate(['/activity']);
  }

  goToApproval() {
    this.router.navigate(['/timesheet/approval-status'], {
      queryParams: this.timesheet ? { id: this.timesheet.id } : {}
    });
  }
}
