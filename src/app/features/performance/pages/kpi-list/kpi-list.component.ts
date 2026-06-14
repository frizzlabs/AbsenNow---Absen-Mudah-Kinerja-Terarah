import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-kpi-list',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent, KpiCardComponent],
  templateUrl: './kpi-list.component.html',
  styleUrls: ['./kpi-list.component.scss']
})
export class KpiListComponent {
  kpis = [
    {
      status: 'COMPLETED',
      progress: 20,
      title: 'Increase Sales Conversion',
      description: 'Optimize the checkout flow to improve conversion rates by end of Q1.',
      targetText: 'Target: 5.0%',
      currentText: 'Current: 5.2%',
      link: '/performance/kpi-detail'
    },
    {
      status: 'ON TRACK',
      progress: 15,
      title: 'Team Training Completion',
      description: 'Ensure 100% of the team completes the mandatory security compliance training.',
      targetText: 'Target: 100%',
      currentText: 'Current: 85%',
      link: '/performance/kpi-detail'
    },
    {
      status: 'AT RISK',
      progress: 25,
      title: 'Reduce Churn Rate',
      description: 'Implement new retention strategies to lower monthly customer churn.',
      targetText: 'Target: < 2.0%',
      currentText: 'Current: 2.8%',
      link: '/performance/kpi-detail'
    },
    {
      status: 'COMPLETED',
      progress: 30,
      title: 'Launch Mobile App v2',
      description: 'Release the major update for iOS and Android platforms including dark mode.',
      targetText: 'Target: Feb 28',
      currentText: 'Done: Feb 20',
      link: '/performance/kpi-detail'
    },
    {
      status: 'ON TRACK',
      progress: 10,
      title: 'Customer Feedback Score',
      description: 'Maintain an average CSAT score above 4.5 throughout the quarter.',
      targetText: 'Target: 4.5',
      currentText: 'Current: 4.7',
      link: '/performance/kpi-detail'
    }
  ];
}
