import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { ActivityService, ActivitySummary } from '../../../../core/services/activity.service';
import { TimesheetService } from '../../../../core/services/timesheet.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-timesheet-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, PageHeaderComponent]
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
    return `${Math.floor(m / 60)} jam ${(m % 60).toString().padStart(2, '0')} mnt`;
  }
  get headerMonth(): string {
    return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }
  get totalLogged(): string { return this.minsToHm(this.summary?.total_minutes || 0); }
  get workDays(): number { return this.summary?.work_days || 0; }
  get regularHours(): number { return Math.round((this.summary?.regular_minutes || 0) / 60); }
  get overtimeHours(): number { return Math.round((this.summary?.overtime_minutes || 0) / 60); }

  weekTitle(w: any): string {
    const s = new Date(w.week_start_date);
    const e = new Date(w.week_end_date);
    return `${s.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}`;
  }
  weekMonth(w: any): string {
    return new Date(w.week_end_date).toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
  }
  weekDay(w: any): string {
    return new Date(w.week_end_date).getDate().toString().padStart(2, '0');
  }
  statusText(status: string): string {
    if (!status) return 'Menunggu';
    const map: { [k: string]: string } = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      revision: 'Revisi'
    };
    return map[status.toLowerCase()] || status;
  }
  statusColor(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'primary';
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
