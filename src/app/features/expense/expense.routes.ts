import { Routes } from '@angular/router';

export const EXPENSE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full'
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/overview.page').then( m => m.OverviewPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./pages/history/history.page').then( m => m.HistoryPage)
  },
  {
    path: 'filter',
    loadComponent: () => import('./pages/filter/filter.page').then( m => m.FilterPage)
  },
  {
    path: 'create/step-1',
    loadComponent: () => import('./pages/create-step1/create-step1.page').then( m => m.CreateStep1Page)
  },
  {
    path: 'create/step-2',
    loadComponent: () => import('./pages/create-step2/create-step2.page').then( m => m.CreateStep2Page)
  },
  {
    path: 'create/step-3',
    loadComponent: () => import('./pages/create-step3/create-step3.page').then( m => m.CreateStep3Page)
  },
  {
    path: 'create/summary',
    loadComponent: () => import('./pages/create-summary/create-summary.page').then( m => m.CreateSummaryPage)
  },
  {
    path: 'create/success',
    loadComponent: () => import('./pages/create-success/create-success.page').then( m => m.CreateSuccessPage)
  },
  {
    path: 'detail',
    loadComponent: () => import('./pages/detail/detail.page').then( m => m.DetailPage)
  },
  {
    path: 'revision',
    loadComponent: () => import('./pages/revision/revision.page').then( m => m.RevisionPage)
  }
];
