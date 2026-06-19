import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { SubmitConfirmationSheetComponent } from '../../components/submit-confirmation-sheet/submit-confirmation-sheet.component';
import { ActivityService, ActivitySummary } from '../../../../core/services/activity.service';
import { TimesheetService } from '../../../../core/services/timesheet.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

interface LogGroup {
  date: Date;
  totalMins: number;
  logs: any[];
}

@Component({
  selector: 'app-timesheet-weekly',
  templateUrl: './weekly.page.html',
  styleUrls: ['./weekly.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent, PageHeaderComponent]
})
export class WeeklyPage {
  summary: ActivitySummary | null = null;
  groups: LogGroup[] = [];
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
    this.load();
  }

  load() {
    this.isLoading = true;
    this.activityService.getActivities('weekly').subscribe({
      next: (data) => {
        this.groups = this.groupByDate(data);
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
    this.activityService.getSummary('weekly').subscribe({
      next: (s) => (this.summary = s),
      error: () => {}
    });
  }

  private groupByDate(list: any[]): LogGroup[] {
    const groups: LogGroup[] = [];
    list.forEach(a => {
      const d = new Date(a.activity_date);
      let g = groups.find(x => x.date.toDateString() === d.toDateString());
      if (!g) {
        g = { date: d, totalMins: 0, logs: [] };
        groups.push(g);
      }
      g.logs.push(a);
      g.totalMins += a.duration_minutes || 0;
    });
    return groups.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // ---- formatting helpers ----
  minsToHm(mins: number): string {
    const m = mins || 0;
    return `${Math.floor(m / 60)}h ${(m % 60).toString().padStart(2, '0')}m`;
  }
  toAmPm(timeStr: string): string {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  get headerRange(): string {
    if (!this.summary) return '';
    const s = new Date(this.summary.period_start);
    const e = new Date(this.summary.period_end);
    return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  get totalLogged(): string { return this.minsToHm(this.summary?.total_minutes || 0); }
  get workDays(): number { return this.summary?.work_days || 0; }
  get avgDaily(): string { return this.minsToHm(this.summary?.avg_daily_minutes || 0); }
  get overtime(): string { return this.minsToHm(this.summary?.overtime_minutes || 0); }
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

  goToActivity(id: number) {
    this.router.navigate(['/activity/detail'], { queryParams: { id } });
  }

  goMonthly() {
    this.router.navigate(['/timesheet/monthly']);
  }

  goDaily() {
    this.router.navigate(['/activity']);
  }

  addActivity() {
    this.router.navigate(['/activity/add']);
  }

  async submitTimesheet() {
    const modal = await this.modalCtrl.create({
      component: SubmitConfirmationSheetComponent,
      breakpoints: [0, 0.75],
      initialBreakpoint: 0.75,
      cssClass: 'bottom-sheet-modal',
      componentProps: {
        totalLabel: this.totalLogged,
        rangeLabel: this.headerRange,
        activitiesCount: this.summary?.activities_count || 0
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.submitted) {
      await this.doSubmit();
    }
  }

  private async doSubmit() {
    const loading = await this.loadingCtrl.create({ message: 'Submitting timesheet...' });
    await loading.present();

    const isoDate = new Date().toISOString().slice(0, 10);
    this.timesheetService.submitTimesheet(isoDate).subscribe({
      next: (res) => {
        loading.dismiss();
        if (res?.timesheet) {
          localStorage.setItem('last_submitted_timesheet', JSON.stringify(res.timesheet));
        }
        this.router.navigate(['/timesheet/success']);
      },
      error: async (err) => {
        loading.dismiss();
        const msg = err.error?.message || 'Failed to submit timesheet.';
        const toast = await this.toastCtrl.create({ message: msg, duration: 3000, position: 'top', color: 'danger' });
        await toast.present();
      }
    });
  }
}
