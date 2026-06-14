import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { CircularProgressComponent } from '../../../../shared/components/circular-progress/circular-progress.component';

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
}
