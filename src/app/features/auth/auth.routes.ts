import { Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { LoginVerificationPage } from './login-verification/login-verification.page';
import { EmailPage } from './forgot-password/email/email.page';
import { VerificationPage } from './forgot-password/verification/verification.page';
import { NewPasswordPage } from './forgot-password/new-password/new-password.page';
import { CreatePage } from './device-pin/create/create.page';
import { ConfirmPage } from './device-pin/confirm/confirm.page';
import { VerifyPage } from './device-pin/verify/verify.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'login-verification', component: LoginVerificationPage },
  { path: 'forgot-password/email', component: EmailPage },
  { path: 'forgot-password/verification', component: VerificationPage },
  { path: 'forgot-password/new-password', component: NewPasswordPage },
  { path: 'device-pin/create', component: CreatePage },
  { path: 'device-pin/confirm', component: ConfirmPage },
  { path: 'device-pin/verify', component: VerifyPage }
];
