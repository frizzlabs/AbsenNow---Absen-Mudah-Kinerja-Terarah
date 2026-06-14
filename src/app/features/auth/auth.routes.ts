import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  { path: 'login-verification', loadComponent: () => import('./login-verification/login-verification.page').then(m => m.LoginVerificationPage) },
  { path: 'forgot-password/email', loadComponent: () => import('./forgot-password/email/email.page').then(m => m.EmailPage) },
  { path: 'forgot-password/verification', loadComponent: () => import('./forgot-password/verification/verification.page').then(m => m.VerificationPage) },
  { path: 'forgot-password/new-password', loadComponent: () => import('./forgot-password/new-password/new-password.page').then(m => m.NewPasswordPage) },
  { path: 'device-pin/create', loadComponent: () => import('./device-pin/create/create.page').then(m => m.CreatePage) },
  { path: 'device-pin/confirm', loadComponent: () => import('./device-pin/confirm/confirm.page').then(m => m.ConfirmPage) },
  { path: 'device-pin/verify', loadComponent: () => import('./device-pin/verify/verify.page').then(m => m.VerifyPage) }
];
