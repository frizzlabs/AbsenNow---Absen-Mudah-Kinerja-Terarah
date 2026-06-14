import { Routes } from '@angular/router';

export const OVERTIME_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'request/step1',
    loadComponent: () => import('./pages/request-step1/request-step1.page').then(m => m.RequestStep1Page)
  },
  {
    path: 'request/step2',
    loadComponent: () => import('./pages/request-step2/request-step2.page').then(m => m.RequestStep2Page)
  },
  {
    path: 'request/success',
    loadComponent: () => import('./pages/success/success.page').then(m => m.SuccessPage)
  }
];
