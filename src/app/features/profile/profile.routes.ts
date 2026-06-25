import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'desktop',
    loadComponent: () => import('./desktop-profile/desktop-profile.page').then( m => m.DesktopProfilePage)
  },
  {
    path: 'personal-info',
    loadComponent: () => import('./personal-info/personal-info.page').then( m => m.PersonalInfoPage)
  },
  {
    path: 'personal-info/edit',
    loadComponent: () => import('./edit-personal-info/edit-personal-info.page').then( m => m.EditPersonalInfoPage)
  },
  {
    path: 'identity',
    redirectTo: 'identity/required',
    pathMatch: 'full'
  },
  {
    path: 'identity/required',
    loadComponent: () => import('./identity-required/identity-required.page').then( m => m.IdentityRequiredPage)
  },
  {
    path: 'identity/form',
    loadComponent: () => import('./identity-form/identity-form.page').then( m => m.IdentityFormPage)
  },
  {
    path: 'identity/filled',
    loadComponent: () => import('./identity-filled/identity-filled.page').then( m => m.IdentityFilledPage)
  },
  {
    path: 'identity/confirmed',
    loadComponent: () => import('./identity-confirmed/identity-confirmed.page').then( m => m.IdentityConfirmedPage)
  },
  {
    path: 'job-history',
    loadComponent: () => import('./job-history/job-history.page').then( m => m.JobHistoryPage)
  },  {
    path: 'verification-filled-variant',
    loadComponent: () => import('./pages/verification-filled-variant/verification-filled-variant.page').then( m => m.VerificationFilledVariantPage)
  },
  {
    path: 'language',
    loadComponent: () => import('./language/language.page').then( m => m.LanguageSettingsPage)
  }
];
