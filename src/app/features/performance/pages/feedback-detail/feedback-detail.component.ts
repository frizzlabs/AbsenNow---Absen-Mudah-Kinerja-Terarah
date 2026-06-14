import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BottomNavComponent } from '../../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-feedback-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, PageHeaderComponent, BottomNavComponent],
  templateUrl: './feedback-detail.component.html',
  styleUrls: ['./feedback-detail.component.scss']
})
export class FeedbackDetailComponent {
}
