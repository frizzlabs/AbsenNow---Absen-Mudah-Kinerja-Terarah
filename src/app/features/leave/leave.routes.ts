import { Routes } from '@angular/router';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.HistoryPage)
  },
  {
    path: 'create/type',
    loadComponent: () => import('./pages/create-type/create-type.page').then(m => m.CreateTypePage)
  },
  {
    path: 'create/dates',
    loadComponent: () => import('./pages/create-dates/create-dates.page').then(m => m.CreateDatesPage)
  },
  {
    path: 'create/delegate',
    loadComponent: () => import('./pages/create-delegate/create-delegate.page').then(m => m.CreateDelegatePage)
  },
  {
    path: 'create/upload',
    loadComponent: () => import('./pages/create-upload/create-upload.page').then(m => m.CreateUploadPage)
  },
  {
    path: 'create/summary',
    loadComponent: () => import('./pages/create-summary/create-summary.page').then(m => m.CreateSummaryPage)
  },
  {
    path: 'create/success',
    loadComponent: () => import('./pages/create-success/create-success.page').then(m => m.CreateSuccessPage)
  }
];
