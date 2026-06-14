import { Routes } from '@angular/router';

export const PAYSLIP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'detail',
    loadComponent: () => import('./pages/detail/detail.page').then(m => m.DetailPage)
  }
];
