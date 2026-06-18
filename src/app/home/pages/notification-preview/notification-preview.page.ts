import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DashboardService, RecentUpdate } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-home-notification-preview',
  templateUrl: './notification-preview.page.html',
  styleUrls: ['./notification-preview.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent]
})
export class NotificationPreviewPage {
  updates: RecentUpdate[] = [];
  isLoading = false;

  constructor(private router: Router, private dashboardService: DashboardService) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.dashboardService.getRecentUpdates(50).subscribe({
      next: (data) => {
        this.updates = data;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  updateColor(color: string): string {
    const map: { [k: string]: string } = {
      green: '#22c55e', blue: '#3b82f6', orange: '#f97316', red: '#ef4444', purple: '#a855f7'
    };
    return map[color] || map['blue'];
  }

  updateBg(color: string): string {
    const hex = this.updateColor(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.12)`;
  }

  relativeTime(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins}m lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}j lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}h lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  openUpdate(update: RecentUpdate) {
    if (!update.link) return;
    const [path, query] = update.link.split('?');
    if (query) {
      const params: any = {};
      query.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        params[k] = v;
      });
      this.router.navigate([path], { queryParams: params });
    } else {
      this.router.navigate([path]);
    }
  }
}
