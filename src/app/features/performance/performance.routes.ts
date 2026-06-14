import { Routes } from '@angular/router';

export const PERFORMANCE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/overview.component').then(m => m.OverviewComponent)
  },
  {
    path: 'kpi-list',
    loadComponent: () => import('./pages/kpi-list/kpi-list.component').then(m => m.KpiListComponent)
  },
  {
    path: 'kpi-detail',
    loadComponent: () => import('./pages/kpi-detail/kpi-detail.component').then(m => m.KpiDetailComponent)
  },
  {
    path: 'feedback-list',
    loadComponent: () => import('./pages/feedback-list/feedback-list.component').then(m => m.FeedbackListComponent)
  },
  {
    path: 'feedback-detail',
    loadComponent: () => import('./pages/feedback-detail/feedback-detail.component').then(m => m.FeedbackDetailComponent)
  }
];
