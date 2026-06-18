import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'roles',
    pathMatch: 'full'
  },
  {
    path: 'roles',
    canActivate: [permissionGuard('users.manage')],
    loadComponent: () => import('./pages/roles/roles.page').then(m => m.RolesPage)
  },
  {
    path: 'roles/:id',
    canActivate: [permissionGuard('users.manage')],
    loadComponent: () => import('./pages/role-detail/role-detail.page').then(m => m.RoleDetailPage)
  },
  {
    path: 'users',
    canActivate: [permissionGuard('users.manage')],
    loadComponent: () => import('./pages/users/users.page').then(m => m.AdminUsersPage)
  },
  {
    path: 'corrections',
    canActivate: [permissionGuard('attendance.approve')],
    loadComponent: () => import('./pages/corrections/corrections.page').then(m => m.AdminCorrectionsPage)
  }
];
