import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { TimesheetService } from '../../../../core/services/timesheet.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-timesheet-approval-status',
  templateUrl: './approval-status.page.html',
  styleUrls: ['./approval-status.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslatePipe, BottomNavComponent, PageHeaderComponent]
})
export class ApprovalStatusPage implements OnInit {
  timesheet: any = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private timesheetService: TimesheetService
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

  minsToHm(mins: number): string {
    const m = mins || 0;
    return `${Math.floor(m / 60)} jam ${(m % 60).toString().padStart(2, '0')} mnt`;
  }
  get rangeLabel(): string {
    if (!this.timesheet) return '';
    const s = new Date(this.timesheet.week_start_date);
    const e = new Date(this.timesheet.week_end_date);
    return `${s.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  get monthLabel(): string {
    if (!this.timesheet) return '';
    return new Date(this.timesheet.week_start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }
  get totalLogged(): string { return this.minsToHm(this.timesheet?.total_minutes || 0); }
  get workDays(): number {
    if (!this.timesheet?.activities) return 0;
    const days = new Set(this.timesheet.activities.map((a: any) => a.activity_date));
    return days.size;
  }
  statusText(status: string): string {
    if (!status) return 'Menunggu';
    switch (status.toLowerCase()) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'revision': return 'Perlu Revisi';
      default: return status;
    }
  }
  formatEventTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  }

  goBack() {
    this.router.navigate(['/activity']);
  }

  editActivity() {
    if (this.timesheet?.status === 'revision') {
      this.router.navigate(['/timesheet/revision'], { queryParams: { id: this.timesheet.id } });
    } else {
      this.router.navigate(['/activity']);
    }
  }
}
