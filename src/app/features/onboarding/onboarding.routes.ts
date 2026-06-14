import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./onboarding.page').then( m => m.OnboardingPage)
  }
];
