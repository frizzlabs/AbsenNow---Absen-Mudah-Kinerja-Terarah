import { Routes } from '@angular/router';

export const DINAS_LUAR_ROUTES: Routes = [
  {
    path: 'ajukan',
    loadComponent: () => import('./pages/ajukan/ajukan.page').then(m => m.AjukanPage)
  },
  {
    path: 'confirm',
    loadComponent: () => import('./pages/confirm/confirm.page').then(m => m.ConfirmPage)
  },
  {
    path: 'submitted',
    loadComponent: () => import('./pages/submitted/submitted.page').then(m => m.DinasSubmittedPage)
  },
  {
    path: 'absen',
    loadComponent: () => import('./pages/absen-pick/absen-pick.page').then(m => m.AbsenPickPage)
  },
  {
    path: 'absen/form',
    loadComponent: () => import('./pages/absen-form/absen-form.page').then(m => m.AbsenFormPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then(m => m.DinasHistoryPage)
  },
  {
    path: 'review',
    loadComponent: () => import('./pages/review/review.page').then(m => m.DinasReviewPage)
  },
  {
    path: 'detail',
    loadComponent: () => import('./pages/detail/detail.page').then(m => m.DinasDetailPage)
  },
];
