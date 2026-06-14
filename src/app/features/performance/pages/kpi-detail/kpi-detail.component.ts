import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-kpi-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent, ProgressBarComponent],
  templateUrl: './kpi-detail.component.html',
  styleUrls: ['./kpi-detail.component.scss']
})
export class KpiDetailComponent {
}
