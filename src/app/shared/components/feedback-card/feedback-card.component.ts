import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-feedback-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  template: `
    <div class="feedback-card" [ngClass]="borderClass" [routerLink]="link ? link : null">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-3">
          <img [src]="avatar" class="avatar" alt="Avatar">
          <div>
            <h3 class="name">{{ name }}</h3>
            <p class="role">{{ role }}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="type-badge" [ngClass]="type.toLowerCase()">{{ type }}</div>
          <span class="time">{{ time }}</span>
        </div>
      </div>
      
      <p class="text">{{ text }}</p>
      
      <div class="flex justify-between items-center mt-3">
        <div class="status-indicator" [ngClass]="status.toLowerCase().replace(' ', '-')">
          <ion-icon [name]="status === 'Acknowledged' ? 'checkmark-outline' : 'ellipse'"></ion-icon>
          {{ status }}
        </div>
        <a *ngIf="showAction" class="action-link">
          Read Full <ion-icon name="arrow-forward-outline"></ion-icon>
        </a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .feedback-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      border: 1px solid var(--ion-color-light);
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
      display: block;
      text-decoration: none;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
      }
      
      &.border-orange::before { background: var(--ion-color-warning); }
      &.border-green::before { background: var(--ion-color-success); }
    }
    
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .justify-between { justify-content: space-between; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .items-end { align-items: flex-end; }
    .gap-1 { gap: 4px; }
    .gap-3 { gap: 12px; }
    .mb-3 { margin-bottom: 12px; }
    .mt-3 { margin-top: 12px; }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .name {
      font-size: 15px;
      font-weight: 600;
      color: var(--ion-color-tertiary);
      margin: 0 0 2px 0;
    }
    
    .role {
      font-size: 13px;
      color: var(--ion-color-medium);
      margin: 0;
    }
    
    .type-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 10px;
      
      &.manager {
        background: rgba(26, 86, 219, 0.1);
        color: var(--ion-color-primary);
      }
      &.peer {
        background: rgba(255, 152, 0, 0.1);
        color: var(--ion-color-warning);
      }
    }
    
    .time {
      font-size: 12px;
      color: var(--ion-color-medium);
    }
    
    .text {
      font-size: 14px;
      color: var(--ion-color-medium);
      line-height: 1.5;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      
      &.action-required {
        background: rgba(255, 152, 0, 0.1);
        color: var(--ion-color-warning);
        ion-icon { font-size: 6px; } /* for the dot */
      }
      &.acknowledged {
        background: rgba(45, 211, 111, 0.1);
        color: var(--ion-color-success);
        ion-icon { font-size: 14px; }
      }
    }
    
    .action-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--ion-color-primary);
      font-size: 13px;
      font-weight: 500;
    }
  `]
})
export class FeedbackCardComponent {
  @Input() avatar: string = 'assets/images/avatar.png';
  @Input() name: string = '';
  @Input() role: string = '';
  @Input() type: string = '';
  @Input() time: string = '';
  @Input() text: string = '';
  @Input() status: string = '';
  @Input() showAction: boolean = false;
  @Input() borderClass: string = 'border-orange';
  @Input() link: string = '';
}
