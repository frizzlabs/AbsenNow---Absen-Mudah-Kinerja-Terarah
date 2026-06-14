import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-info-row',
  template: `
    <div class="info-item">
      <div class="icon-box">
        <ion-icon [name]="icon"></ion-icon>
      </div>
      <div class="info-content">
        <h4 class="text-body-medium-semibold">{{ title }}</h4>
        <p class="text-body-small-regular text-medium" [innerHTML]="subtitle"></p>
      </div>
    </div>
  `,
  styleUrls: ['./info-row.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InfoRowComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
