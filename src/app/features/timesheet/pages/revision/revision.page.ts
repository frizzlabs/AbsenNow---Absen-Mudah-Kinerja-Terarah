import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { TimesheetService } from '../../../../core/services/timesheet.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-timesheet-revision',
  templateUrl: './revision.page.html',
  styleUrls: ['./revision.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslatePipe, PageHeaderComponent, BottomNavComponent]
})
export class RevisionPage implements OnInit {
  timesheet: any = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private timesheetService: TimesheetService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.timesheetService.getTimesheet(id).subscribe({
        next: (t) => {
          this.timesheet = t;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    } else {
      this.isLoading = false;
    }
  }

  hoursLabel(mins: number): string {
    return `${((mins || 0) / 60).toFixed(1)} jam`;
  }
  taskHours(mins: number): string {
    return `${((mins || 0) / 60).toFixed(1)} jam`;
  }
  get rangeLabel(): string {
    if (!this.timesheet) return '';
    const s = new Date(this.timesheet.week_start_date);
    const e = new Date(this.timesheet.week_end_date);
    return `${s.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}`;
  }
  get reviewedAtLabel(): string {
    if (!this.timesheet?.reviewed_at) return '';
    return new Date(this.timesheet.reviewed_at).toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  /** Group activities by date for display. */
  get entries() {
    const groups: { date: Date; totalMins: number; activities: any[] }[] = [];
    (this.timesheet?.activities || []).forEach((a: any) => {
      const d = new Date(a.activity_date);
      let g = groups.find(x => x.date.toDateString() === d.toDateString());
      if (!g) {
        g = { date: d, totalMins: 0, activities: [] };
        groups.push(g);
      }
      g.activities.push(a);
      g.totalMins += a.duration_minutes || 0;
    });
    return groups.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  goBack() {
    this.router.navigate(['/timesheet/approval-status'], { queryParams: { id: this.timesheet?.id } });
  }

  async resubmit() {
    if (!this.timesheet) return;

    const loading = await this.loadingCtrl.create({ message: 'Resubmitting...' });
    await loading.present();

    this.timesheetService.resubmitTimesheet(this.timesheet.id).subscribe({
      next: (res) => {
        loading.dismiss();
        if (res?.timesheet) {
          localStorage.setItem('last_submitted_timesheet', JSON.stringify(res.timesheet));
        }
        this.router.navigate(['/timesheet/success']);
      },
      error: async (err) => {
        loading.dismiss();
        const toast = await this.toastCtrl.create({
          message: err.error?.message || 'Failed to resubmit timesheet.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        });
        await toast.present();
      }
    });
  }
}
