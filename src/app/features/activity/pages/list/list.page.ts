import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { FilterSheetComponent } from '../../components/filter-sheet/filter-sheet.component';
import { SubmitTimesheetModalComponent } from '../../components/submit-timesheet-modal/submit-timesheet-modal.component';
import { SubmitSuccessModalComponent } from '../../components/submit-success-modal/submit-success-modal.component';
import { ActivityService, ActivitySummary } from '../../../../core/services/activity.service';
import { TimesheetService } from '../../../../core/services/timesheet.service';

export interface Activity {
  id: number;
  title: string;
  durationHours: number;
  durationMinutes: number;
  project: string;
  projectColor: string;
  timeRange: string;
  date: Date;
}

@Component({
  selector: 'app-activity-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, TranslatePipe, PageHeaderComponent]
})
export class ListPage {
  Math = Math;

  selectedView: 'daily' | 'weekly' | 'monthly' = 'daily';

  activities: Activity[] = [];
  summary: ActivitySummary | null = null;
  weeks: any[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private activityService: ActivityService,
    private timesheetService: TimesheetService
  ) {}

  ionViewWillEnter() {
    this.loadView();
  }

  setView(view: 'daily' | 'weekly' | 'monthly') {
    this.selectedView = view;
    this.loadView();
  }

  loadView() {
    this.isLoading = true;
    this.activityService.getActivities(this.selectedView).subscribe({
      next: (data) => {
        this.activities = data.map(a => this.mapActivity(a));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load activities', err);
        this.isLoading = false;
      }
    });

    if (this.selectedView === 'weekly' || this.selectedView === 'monthly') {
      this.activityService.getSummary(this.selectedView).subscribe({
        next: (s) => (this.summary = s),
        error: (err) => console.error('Failed to load summary', err)
      });
    }

    if (this.selectedView === 'monthly') {
      const now = new Date();
      this.timesheetService.getTimesheets(now.getMonth() + 1, now.getFullYear()).subscribe({
        next: (data) => (this.weeks = data),
        error: (err) => console.error('Failed to load timesheets', err)
      });
    }
  }

  private mapActivity(a: any): Activity {
    const mins = a.duration_minutes || 0;
    return {
      id: a.id,
      title: a.title,
      durationHours: Math.floor(mins / 60),
      durationMinutes: mins % 60,
      project: a.project || '—',
      projectColor: a.project_color || 'primary',
      timeRange: `${this.toAmPm(a.start_time)} - ${this.toAmPm(a.end_time)}`,
      date: new Date(a.activity_date)
    };
  }

  private toAmPm(timeStr: string): string {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  get filteredActivities(): Activity[] {
    return this.activities;
  }

  get totalDuration(): string {
    let totalMins = 0;
    this.activities.forEach(act => {
      totalMins += (act.durationHours * 60) + act.durationMinutes;
    });
    return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
  }

  get dateSubtitle(): string {
    if (this.selectedView === 'daily') return 'Today';
    if (this.selectedView === 'weekly') return 'This Week';
    if (this.selectedView === 'monthly') return 'This Month';
    return '';
  }

  get dateHeader(): string {
    const today = new Date();
    if (this.selectedView === 'daily') {
      return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (this.selectedView === 'weekly') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (this.selectedView === 'monthly') {
      return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return '';
  }

  get groupedActivities() {
    const groups: { dateStr: string; dateObj: Date; activities: Activity[]; totalMins: number }[] = [];
    this.activities.forEach(act => {
      const dStr = act.date.toDateString();
      let group = groups.find(g => g.dateStr === dStr);
      if (!group) {
        group = { dateStr: dStr, dateObj: act.date, activities: [], totalMins: 0 };
        groups.push(group);
      }
      group.activities.push(act);
      group.totalMins += (act.durationHours * 60) + act.durationMinutes;
    });
    return groups.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }

  get weeklyWeeks() {
    return this.weeks.map(w => ({
      label: this.weekLabel(w.week_start_date, w.week_end_date),
      weekLabel: '',
      status: this.formatStatus(w.status),
      statusClass: this.statusClass(w.status),
      hours: this.minsToHm(w.total_minutes),
      id: w.id
    }));
  }

  // ---- Summary view helpers (weekly/monthly cards) ----
  get summaryTotal(): string {
    return this.minsToHm(this.summary?.total_minutes || 0);
  }
  get summaryWorkDays(): number {
    return this.summary?.work_days || 0;
  }
  get summaryAvgDaily(): string {
    return this.minsToHm(this.summary?.avg_daily_minutes || 0);
  }
  get summaryOvertime(): string {
    return this.minsToHm(this.summary?.overtime_minutes || 0);
  }
  get summaryRegularHours(): number {
    return Math.round((this.summary?.regular_minutes || 0) / 60);
  }
  get summaryOvertimeHours(): number {
    return Math.round((this.summary?.overtime_minutes || 0) / 60);
  }
  get goalLabel(): string {
    const goal = Math.round((this.summary?.weekly_goal_minutes || 2400) / 60);
    const logged = Math.round((this.summary?.total_minutes || 0) / 60);
    return `${logged}h / ${goal}h`;
  }
  get goalPercent(): number {
    const goal = this.summary?.weekly_goal_minutes || 2400;
    const logged = this.summary?.total_minutes || 0;
    return goal > 0 ? Math.min(100, Math.round((logged / goal) * 100)) : 0;
  }

  private minsToHm(mins: number): string {
    const m = mins || 0;
    return `${Math.floor(m / 60)}h ${(m % 60).toString().padStart(2, '0')}m`;
  }

  private weekLabel(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  statusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'rejected' || s === 'revision') return 'danger';
    return 'warning';
  }

  async openSubmitModal() {
    const breakdown = this.activities.map(a => ({
      title: a.title,
      label: this.formatDuration(a.durationHours, a.durationMinutes)
    }));

    const modal = await this.modalCtrl.create({
      component: SubmitTimesheetModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      handle: false,
      cssClass: 'bottom-sheet-modal',
      componentProps: {
        summary: this.summary,
        dateRange: this.dateHeader,
        breakdown
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.submitted) {
      await this.submitCurrentWeek();
    }
  }

  private async submitCurrentWeek() {
    const loading = await this.loadingCtrl.create({ message: 'Submitting timesheet...' });
    await loading.present();

    const weekStart = new Date();
    const isoDate = weekStart.toISOString().slice(0, 10);

    this.timesheetService.submitTimesheet(isoDate).subscribe({
      next: async () => {
        loading.dismiss();
        const successModal = await this.modalCtrl.create({
          component: SubmitSuccessModalComponent,
          cssClass: 'full-screen-modal'
        });
        await successModal.present();
      },
      error: async (err) => {
        loading.dismiss();
        const msg = err.error?.message || 'Failed to submit timesheet.';
        const toast = await this.toastCtrl.create({ message: msg, duration: 3000, position: 'top', color: 'danger' });
        await toast.present();
      }
    });
  }

  formatDuration(hours: number, minutes: number): string {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  addActivity() {
    this.router.navigate(['/activity/add']);
  }

  viewDetail(id?: number) {
    this.router.navigate(['/activity/detail'], { queryParams: { id } });
  }

  viewWeek(id?: number) {
    this.router.navigate(['/timesheet/approval-status'], { queryParams: { id } });
  }

  async openFilter() {
    const modal = await this.modalCtrl.create({
      component: FilterSheetComponent,
      breakpoints: [0, 0.75],
      initialBreakpoint: 0.75,
      cssClass: 'bottom-sheet-modal'
    });
    await modal.present();
  }
}
