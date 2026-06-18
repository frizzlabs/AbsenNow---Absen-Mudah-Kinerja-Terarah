import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent, RouterModule],
  template: `
    <div class="kpi-card" [routerLink]="link ? link : null" [queryParams]="queryParams">
      <div class="flex justify-between items-start mb-3">
        <div class="status-badge" [ngClass]="status.toLowerCase().replace(' ', '-')">
          <div class="dot"></div>
          {{ status }}
        </div>
        <div class="progress-badge">{{ progress }}%</div>
      </div>
      
      <h3 class="title">{{ title }}</h3>
      <p class="desc">{{ description }}</p>
      
      <div class="flex justify-between text-xs font-medium mb-2">
        <span class="target-text">{{ target }}</span>
        <span class="current-text">{{ current }}</span>
      </div>
      
      <app-progress-bar [percentage]="progress" [fillClass]="getFillClass()"></app-progress-bar>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .kpi-card {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      border: 1px solid var(--ion-color-light);
      margin-bottom: 16px;
      text-decoration: none;
      display: block;
    }
    
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .items-start { align-items: flex-start; }
    .mb-3 { margin-bottom: 12px; }
    .mb-2 { margin-bottom: 8px; }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      
      &.completed {
        background: rgba(45, 211, 111, 0.1);
        color: var(--ion-color-success);
        .dot { background: var(--ion-color-success); }
      }
      
      &.on-track {
        background: rgba(26, 86, 219, 0.1);
        color: var(--ion-color-primary);
        .dot { background: var(--ion-color-primary); }
      }
      
      &.at-risk {
        background: rgba(255, 152, 0, 0.1);
        color: var(--ion-color-warning);
        .dot { background: var(--ion-color-warning); }
      }
      
      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
    }
    
    .progress-badge {
      background: var(--ion-color-light);
      color: var(--ion-color-tertiary);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
    }
    
    .title {
      font-size: 16px;
      font-weight: 700;
      color: var(--ion-color-tertiary);
      margin: 0 0 8px 0;
    }
    
    .desc {
      font-size: 14px;
      color: var(--ion-color-medium);
      line-height: 1.5;
      margin: 0 0 16px 0;
    }
    
    .target-text {
      color: var(--ion-color-primary);
    }
    
    .current-text {
      color: var(--ion-color-tertiary);
    }
  `]
})
export class KpiCardComponent {
  @Input() status: string = '';
  @Input() progress: number = 0;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() target: string = '';
  @Input() current: string = '';
  @Input() link: string = '';
  @Input() queryParams: any = null;

  getFillClass() {
    const s = this.status.toLowerCase();
    if (s.includes('completed')) return 'fill-green';
    if (s.includes('at risk')) return 'fill-orange';
    return ''; // default blue
  }
}
