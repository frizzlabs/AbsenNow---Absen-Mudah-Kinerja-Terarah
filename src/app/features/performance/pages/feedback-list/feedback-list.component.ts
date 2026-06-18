import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { FeedbackCardComponent } from '../../../../shared/components/feedback-card/feedback-card.component';
import { PerformanceService } from '../../../../core/services/performance.service';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent, FeedbackCardComponent],
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.scss']
})
export class FeedbackListComponent {
  feedbacks: any[] = [];
  stats = { total: 0, manager: 0, peer: 0 };
  period = '';
  isLoading = true;

  constructor(private performanceService: PerformanceService) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.performanceService.getFeedbacks().subscribe({
      next: (res) => {
        this.period = res.period;
        this.stats = res.stats;
        this.feedbacks = res.feedbacks.map((f: any) => ({
          name: f.reviewer_name,
          role: f.reviewer_role,
          type: f.type === 'manager' ? 'Manager' : 'Peer',
          time: this.relativeTime(f.submitted_at),
          text: f.summary,
          status: f.status === 'acknowledged' ? 'Acknowledged' : 'Action Required',
          showAction: f.type === 'manager',
          borderClass: f.type === 'manager' ? 'border-orange' : 'border-green',
          link: '/performance/feedback-detail',
          queryParams: { id: f.id }
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  private relativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
