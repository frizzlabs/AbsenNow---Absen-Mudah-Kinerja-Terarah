import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { CircularProgressComponent } from '../../../../shared/components/circular-progress/circular-progress.component';
import { PerformanceService } from '../../../../core/services/performance.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageHeaderComponent,
    BottomNavComponent,
    ProgressBarComponent,
    CircularProgressComponent
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  period = '';
  review: any = null;
  kpiStats = { total: 0, completed: 0, rate: 0 };
  highlights: any[] = [];
  isLoading = true;

  constructor(private router: Router, private performanceService: PerformanceService) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.performanceService.getOverview().subscribe({
      next: (res) => {
        this.period = res.period;
        this.review = res.review;
        this.kpiStats = res.kpi_stats;
        this.highlights = res.feedback_highlights || [];
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  get overallScore(): number {
    return this.review?.overall_score || 0;
  }
  get statusLabel(): string {
    return this.review?.status_label || '';
  }
  get reviewCompletion(): number {
    return this.review?.review_completion || 0;
  }

  relativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 14) return '1w ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  openFeedback(id: number) {
    this.router.navigate(['/performance/feedback-detail'], { queryParams: { id } });
  }
}
