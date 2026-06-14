import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-leave-file-card',
  templateUrl: './leave-file-card.component.html',
  styleUrls: ['./leave-file-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class LeaveFileCardComponent {
  @Input() fileName: string = '';
  @Input() fileSize: string = '';
  @Input() fileType: string = '';
  @Input() iconName: string = 'document-text-outline';
}
