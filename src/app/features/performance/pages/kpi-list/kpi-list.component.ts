import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';
import { PerformanceService } from '../../../../core/services/performance.service';

@Component({
  selector: 'app-kpi-list',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent, KpiCardComponent],
  templateUrl: './kpi-list.component.html',
  styleUrls: ['./kpi-list.component.scss']
})
export class KpiListComponent {
  kpis: any[] = [];
  stats = { total: 0, completed: 0, rate: 0 };
  period = '';
  isLoading = true;

  constructor(private performanceService: PerformanceService) {}

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.performanceService.getKpis().subscribe({
      next: (res) => {
        this.period = res.period;
        this.stats = res.stats;
        this.kpis = res.kpis.map((k: any) => ({
          status: PerformanceService.kpiStatusLabel(k.status),
          progress: k.achievement_percent,
          title: k.title,
          description: k.description,
          targetText: k.target_label,
          currentText: k.current_label,
          link: '/performance/kpi-detail',
          queryParams: { id: k.id }
        }));
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }
}
