import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastController = inject(ToastController);

  return next(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Clear token and user session
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Redirect to login page
        router.navigate(['/auth/login']);

        // Show a friendly toast message
        toastController.create({
          message: 'Sesi Anda telah berakhir. Silakan login kembali.',
          duration: 3000,
          position: 'top',
          color: 'danger'
        }).then(toast => toast.present());
      }
      return throwError(() => error);
    })
  );
};
