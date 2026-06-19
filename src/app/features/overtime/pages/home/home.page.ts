import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { OvertimeService, OvertimeSummary } from '../../../../core/services/overtime.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-overtime-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent]
})
export class HomePage {
  selectedSegment = 'all';
  requestsList: any[] = [];
  groupedOvertimes: { title: string; items: any[] }[] = [];
  isLoading = true;

  summary: OvertimeSummary | null = null;

  constructor(
    private router: Router,
    private overtimeService: OvertimeService
  ) {}

  ionViewWillEnter() {
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
        key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  formatDuration(hours: number | string): string {
    const val = parseFloat(hours.toString());
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return `${h}h ${m}m`;
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
      ? `${t}% more than last month`
      : `${Math.abs(t)}% less than last month`;
  }

  formatStatus(status: string): string {
    if (!status) return 'Pending';
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  requestOvertime() {
    this.overtimeService.resetDraft();
    this.router.navigate(['/overtime/request/step1']);
  }
}
