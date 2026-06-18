import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { PerformanceService } from '../../../../core/services/performance.service';

@Component({
  selector: 'app-kpi-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent, ProgressBarComponent],
  templateUrl: './kpi-detail.component.html',
  styleUrls: ['./kpi-detail.component.scss']
})
export class KpiDetailComponent implements OnInit {
  kpi: any = null;
  isLoading = true;

  constructor(private route: ActivatedRoute, private performanceService: PerformanceService) {}

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.performanceService.getKpi(id).subscribe({
        next: (k) => {
          this.kpi = k;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    } else {
      this.isLoading = false;
    }
  }

  get statusLabel(): string {
    return PerformanceService.kpiStatusLabel(this.kpi?.status);
  }
  get statusClass(): string {
    return (this.kpi?.status || '').replace('_', '-');
  }
  get fillClass(): string {
    if (this.kpi?.status === 'completed') return 'fill-green';
    if (this.kpi?.status === 'at_risk') return 'fill-orange';
    return '';
  }
  get targetValue(): string {
    // ambil bagian setelah ":" jika ada, mis. "Target: 5.0%" -> "5.0%"
    const t = this.kpi?.target_label || '';
    return t.includes(':') ? t.split(':')[1].trim() : t;
  }
  get currentValue(): string {
    const c = this.kpi?.current_label || '';
    return c.includes(':') ? c.split(':')[1].trim() : c;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }
  formatShort(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }
}
