import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-section-card',
  templateUrl: './section-card.component.html',
  styleUrls: ['./section-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class SectionCardComponent {
  @Input() iconName: string = '';
  @Input() title: string = '';
  @Input() badgeText?: string;
  @Input() actionText?: string;
  @Input() showDivider: boolean = true;
}
