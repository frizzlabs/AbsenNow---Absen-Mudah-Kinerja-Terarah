import { Routes } from '@angular/router';

export const TIMESHEET_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'weekly',
    pathMatch: 'full'
  },
  {
    path: 'weekly',
    loadComponent: () => import('./pages/weekly/weekly.page').then(m => m.WeeklyPage)
  },
  {
    path: 'monthly',
    loadComponent: () => import('./pages/monthly/monthly.page').then(m => m.MonthlyPage)
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/success/success.page').then(m => m.SuccessPage)
  },
  {
    path: 'approval-status',
    loadComponent: () => import('./pages/approval-status/approval-status.page').then(m => m.ApprovalStatusPage)
  },
  {
    path: 'revision',
    loadComponent: () => import('./pages/revision/revision.page').then(m => m.RevisionPage)
  }
];
