import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="header">
      <button class="back-btn" (click)="goBack()" type="button">
        <ion-icon name="arrow-back-outline"></ion-icon>
      </button>
      <span class="header-title">{{ title }}</span>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./page-header.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() showBack: boolean = false;
  
  constructor(private location: Location) {}
  
  goBack() {
    this.location.back();
  }
}
