import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { ActivityService, ActivitySummary } from '../../../../core/services/activity.service';
import { TimesheetService } from '../../../../core/services/timesheet.service';

@Component({
  selector: 'app-timesheet-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent]
})
export class MonthlyPage {
  summary: ActivitySummary | null = null;
  weeks: any[] = [];

  constructor(
    private router: Router,
    private activityService: ActivityService,
    private timesheetService: TimesheetService
  ) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.activityService.getSummary('monthly').subscribe({
      next: (s) => (this.summary = s),
      error: () => {}
    });
    const now = new Date();
    this.timesheetService.getTimesheets(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: (data) => (this.weeks = data),
      error: () => {}
    });
  }

  // ---- helpers ----
  minsToHm(mins: number): string {
    const m = mins || 0;
    return `${Math.floor(m / 60)}h ${(m % 60).toString().padStart(2, '0')}m`;
  }
  get headerMonth(): string {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  get totalLogged(): string { return this.minsToHm(this.summary?.total_minutes || 0); }
  get workDays(): number { return this.summary?.work_days || 0; }
  get regularHours(): number { return Math.round((this.summary?.regular_minutes || 0) / 60); }
  get overtimeHours(): number { return Math.round((this.summary?.overtime_minutes || 0) / 60); }

  weekTitle(w: any): string {
    const s = new Date(w.week_start_date);
    const e = new Date(w.week_end_date);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  weekMonth(w: any): string {
    return new Date(w.week_end_date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  }
  weekDay(w: any): string {
    return new Date(w.week_end_date).getDate().toString().padStart(2, '0');
  }
  statusText(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
  statusColor(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'rejected' || s === 'revision') return 'danger';
    return 'warning';
  }

  goWeekly() {
    this.router.navigate(['/timesheet/weekly']);
  }
  goDaily() {
    this.router.navigate(['/activity']);
  }
  viewWeek(id: number) {
    this.router.navigate(['/timesheet/approval-status'], { queryParams: { id } });
  }
}
