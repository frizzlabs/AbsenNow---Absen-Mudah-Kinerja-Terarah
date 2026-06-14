import { Routes } from '@angular/router';

export const ACTIVITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/list/list.page').then(m => m.ListPage)
  },
  {
    path: 'add',
    loadComponent: () => import('./pages/add/add.page').then(m => m.AddPage)
  },
  {
    path: 'edit',
    loadComponent: () => import('./pages/edit/edit.page').then(m => m.EditPage)
  },
  {
    path: 'detail',
    loadComponent: () => import('./pages/detail/detail.page').then(m => m.DetailPage)
  }
];
