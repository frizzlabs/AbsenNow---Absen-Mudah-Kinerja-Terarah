import { Routes } from '@angular/router';

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
    loadComponent: () => import('./validation/validation.page').then( m => m.ValidationPage)
  },
  {
    path: 'face-validation',
    loadComponent: () => import('./face-validation/face-validation.page').then( m => m.FaceValidationPage)
  },
  {
    path: 'qr-validation',
    loadComponent: () => import('./qr-validation/qr-validation.page').then( m => m.QrValidationPage)
  },
  {
    path: 'success',
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
  }
];
