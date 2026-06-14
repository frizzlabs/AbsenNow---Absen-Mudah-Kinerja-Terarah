import { Routes } from '@angular/router';

export const PERMISSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'request',
    loadComponent: () => import('./pages/request/request.page').then(m => m.RequestPage)
  },
  {
    path: 'review',
    loadComponent: () => import('./pages/review/review.page').then(m => m.ReviewPage)
  },
  {
    path: 'success',
    loadComponent: () => import('./pages/success/success.page').then(m => m.SuccessPage)
  }
];
