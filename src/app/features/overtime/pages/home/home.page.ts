import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OvertimeService, OvertimeSummary } from '../../../../core/services/overtime.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-overtime-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslatePipe, PageHeaderComponent, BottomNavComponent]
})
export class HomePage {
  selectedSegment = 'all';
  requestsList: any[] = [];
  groupedOvertimes: { title: string; items: any[] }[] = [];
  isLoading = true;

  summary: OvertimeSummary | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private overtimeService: OvertimeService
  ) {}

  ionViewWillEnter() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab && ['all', 'pending', 'approved', 'rejected'].includes(tab)) {
      this.selectedSegment = tab;
    }
    this.loadOvertimes();
    this.loadSummary();
  }

  loadOvertimes() {
    this.isLoading = true;
    this.overtimeService.getRequests().subscribe({
      next: (data) => {
        this.requestsList = data;
        this.groupOvertimes(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load overtime list', err);
        this.isLoading = false;
      }
    });
  }

  loadSummary() {
    this.overtimeService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (err) => {
        console.error('Failed to load overtime summary', err);
      }
    });
  }

  groupOvertimes(list: any[]) {
    const groups: { [key: string]: any[] } = {};

    list.forEach(item => {
      let key = 'Other';
      try {
        const d = new Date(item.overtime_date);
        key = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      } catch (e) {
        key = 'Other';
      }
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    this.groupedOvertimes = Object.keys(groups).map(key => ({
      title: key,
      items: groups[key]
    }));
  }

  get filteredGroups() {
    if (this.selectedSegment === 'all') {
      return this.groupedOvertimes;
    }
    return this.groupedOvertimes.map(group => ({
      title: group.title,
      items: group.items.filter(item => item.status.toLowerCase() === this.selectedSegment)
    })).filter(group => group.items.length > 0);
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { weekday: 'long', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  formatDuration(hours: number | string): string {
    const val = parseFloat(hours.toString());
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return `${h} jam ${m} mnt`;
  }

  get hasTrend(): boolean {
    return this.summary != null && this.summary.trend_percent != null;
  }

  get trendIcon(): string {
    const t = this.summary?.trend_percent ?? 0;
    return t >= 0 ? 'trending-up-outline' : 'trending-down-outline';
  }

  get trendLabel(): string {
    const t = this.summary?.trend_percent ?? 0;
    return t >= 0
      ? `${t}% lebih banyak dari bulan lalu`
      : `${Math.abs(t)}% lebih sedikit dari bulan lalu`;
  }

  formatStatus(status: string): string {
    if (!status) return 'Menunggu';
    switch (status.toLowerCase()) {
      case 'pending': return 'Menunggu';
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  requestOvertime() {
    this.overtimeService.resetDraft();
    this.router.navigate(['/overtime/request/step1']);
  }
}
