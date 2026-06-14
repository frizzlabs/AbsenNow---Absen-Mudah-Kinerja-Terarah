import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-menu-item',
  template: `
    <div class="menu-item">
      <div class="menu-icon" [ngClass]="iconBgClass" [style.color]="iconColor">
        <ion-icon [name]="icon"></ion-icon>
      </div>
      <div class="menu-content">
        <h4 class="text-body-medium-semibold">{{ title }}</h4>
        <p class="text-body-small-regular text-medium" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <ion-icon *ngIf="showChevron" name="chevron-forward-outline" class="chevron"></ion-icon>
    </div>
  `,
  styleUrls: ['./menu-item.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class MenuItemComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() iconBgClass: string = 'bg-blue-light text-blue';
  @Input() iconColor?: string;
  @Input() showChevron: boolean = true;
}
