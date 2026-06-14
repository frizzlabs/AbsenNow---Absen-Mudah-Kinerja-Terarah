import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-auth-header-icon',
  template: `
    <div class="icon-container">
      <div class="ring-outer">
        <div class="ring-inner">
          <div class="icon-box">
            <ion-icon [name]="icon"></ion-icon>
          </div>
        </div>
      </div>
      <!-- Add those little floating dots like in the mockup -->
      <div class="dot top-right"></div>
      <div class="dot bottom-left"></div>
    </div>
  `,
  styleUrls: ['./auth-header-icon.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AuthHeaderIconComponent {
  @Input() icon: string = 'shield-checkmark-outline';
}
