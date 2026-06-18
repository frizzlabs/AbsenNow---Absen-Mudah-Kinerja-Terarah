import { Routes } from '@angular/router';
import { permissionGuard, nonAdminGuard } from '../../core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'history',
    loadComponent: () => import('./history/history.page').then( m => m.HistoryPage)
  },
  {
    path: 'detail',
    loadComponent: () => import('./detail/detail.page').then( m => m.DetailPage)
  },
  {
    path: 'validation',
    canActivate: [nonAdminGuard],
    loadComponent: () => import('./validation/validation.page').then( m => m.ValidationPage)
  },
  {
    path: 'set-office',
    canActivate: [permissionGuard('office.manage')],
    loadComponent: () => import('./set-office/set-office.page').then( m => m.SetOfficePage)
  },
  {
    path: 'face-validation',
    canActivate: [nonAdminGuard],
    loadComponent: () => import('./face-validation/face-validation.page').then( m => m.FaceValidationPage)
  },
  {
    path: 'qr-validation',
    canActivate: [nonAdminGuard],
    loadComponent: () => import('./qr-validation/qr-validation.page').then( m => m.QrValidationPage)
  },
  {
    path: 'success',
    canActivate: [nonAdminGuard],
    loadComponent: () => import('./success/success.page').then( m => m.SuccessPage)
  },
  {
    path: 'history-filter',
    loadComponent: () => import('./history-filter/history-filter.page').then( m => m.HistoryFilterPage)
  },
  {
    path: 'monthly-summary',
    loadComponent: () => import('./monthly-summary/monthly-summary.page').then( m => m.MonthlySummaryPage)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar.page').then( m => m.CalendarPage)
  },
  {
    path: 'correction/reason',
    loadComponent: () => import('./correction/reason/reason.page').then( m => m.ReasonPage)
  },
  {
    path: 'correction/form',
    loadComponent: () => import('./correction/form/form.page').then( m => m.FormPage)
  },
  {
    path: 'correction/summary',
    loadComponent: () => import('./correction/summary/summary.page').then( m => m.SummaryPage)
  },
  {
    path: 'correction/submitted',
    loadComponent: () => import('./correction/submitted/submitted.page').then( m => m.SubmittedPage)
  },
  {
    path: 'correction/history',
    loadComponent: () => import('./correction/history/history.page').then( m => m.CorrectionHistoryPage)
  },
  {
    path: 'team-dashboard',
    loadComponent: () => import('./team-dashboard/team-dashboard.page').then(m => m.TeamDashboardPage)
  },
  {
    path: 'team-list',
    loadComponent: () => import('./team-list/team-list.page').then(m => m.TeamListPage)
  }
];
