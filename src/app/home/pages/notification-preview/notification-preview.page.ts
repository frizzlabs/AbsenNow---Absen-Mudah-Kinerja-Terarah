import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-home-notification-preview',
  templateUrl: './notification-preview.page.html',
  styleUrls: ['./notification-preview.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, BottomNavComponent]
})
export class NotificationPreviewPage {
  constructor() {}
}
