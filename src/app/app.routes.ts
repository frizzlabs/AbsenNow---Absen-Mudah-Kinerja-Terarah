import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/splash.page').then( m => m.SplashPage)
  },
  {
    path: 'onboarding',
    loadChildren: () => import('./features/onboarding/onboarding.routes').then( m => m.routes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then( m => m.routes)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'home/default-variant',
    loadComponent: () => import('./home/pages/default-variant/default-variant.page').then( m => m.DefaultVariantPage)
  },
  {
    path: 'home/shortcut-expanded',
    loadComponent: () => import('./home/pages/shortcut-expanded/shortcut-expanded.page').then( m => m.ShortcutExpandedPage)
  },
  {
    path: 'notification',
    loadComponent: () => import('./home/pages/notification-preview/notification-preview.page').then( m => m.NotificationPreviewPage)
  },
  {
    path: 'attendance',
    loadChildren: () => import('./features/attendance/attendance.routes').then( m => m.routes)
  },
  {
    path: 'performance',
    loadChildren: () => import('./features/performance/performance.routes').then(m => m.PERFORMANCE_ROUTES)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.routes').then( m => m.routes)
  },
  {
    path: 'expense',
    loadChildren: () => import('./features/expense/expense.routes').then(m => m.EXPENSE_ROUTES)
  },
  {
    path: 'leave',
    loadChildren: () => import('./features/leave/leave.routes').then(m => m.LEAVE_ROUTES)
  },
  {
    path: 'payslip',
    loadChildren: () => import('./features/payslip/payslip.routes').then(m => m.PAYSLIP_ROUTES)
  },
  {
    path: 'overtime',
    loadChildren: () => import('./features/overtime/overtime.routes').then(m => m.OVERTIME_ROUTES)
  },
  {
    path: 'permission',
    loadChildren: () => import('./features/permission/permission.routes').then(m => m.PERMISSION_ROUTES)
  },
  {
    path: 'timesheet',
    loadChildren: () => import('./features/timesheet/timesheet.routes').then(m => m.TIMESHEET_ROUTES)
  },
  {
    path: 'activity',
    loadChildren: () => import('./features/activity/activity.routes').then(m => m.ACTIVITY_ROUTES)
  },
  {
    path: 'ai-chat',
    loadComponent: () => import('./features/ai-chat/pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'ai-chat/expanded',
    loadComponent: () => import('./features/ai-chat/pages/expanded/expanded.page').then( m => m.ExpandedPage)
  },
  {
    path: 'ai-chat/suggested',
    loadComponent: () => import('./features/ai-chat/pages/suggested/suggested.page').then( m => m.SuggestedPage)
  },
  {
    path: 'ai-chat/document',
    loadComponent: () => import('./features/ai-chat/pages/document/document.page').then( m => m.DocumentPage)
  }
];
