import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private roleService: RoleService) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.roleService.clearCache();
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.removeItem('temp_email');
        } else if (response && response.email) {
          localStorage.setItem('temp_email', response.email);
        }
      })
    );
  }

  verifyOtp(otp: string): Observable<any> {
    const email = localStorage.getItem('temp_email');
    return this.http.post<any>(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.roleService.clearCache();
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.removeItem('temp_email');
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  savePin(pin: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/save-pin`, { pin }, { headers });
  }

  verifyPin(email: string, pin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-pin`, { email, pin }).pipe(
      tap(response => {
        if (response && response.access_token) {
          this.roleService.clearCache();
          localStorage.setItem('auth_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email }).pipe(
      tap(res => { if (res?.email) localStorage.setItem('reset_email', res.email); })
    );
  }

  verifyResetOtp(otp: string): Observable<any> {
    const email = localStorage.getItem('reset_email');
    return this.http.post<any>(`${this.apiUrl}/forgot-password/verify-otp`, { email, otp }).pipe(
      tap(res => { if (res?.reset_token) localStorage.setItem('reset_token', res.reset_token); })
    );
  }

  resetPassword(password: string, passwordConfirmation: string): Observable<any> {
    const token = localStorage.getItem('reset_token');
    return this.http.post<any>(`${this.apiUrl}/forgot-password/reset`, {
      reset_token: token,
      password,
      password_confirmation: passwordConfirmation,
    }).pipe(
      tap(() => {
        localStorage.removeItem('reset_email');
        localStorage.removeItem('reset_token');
      })
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('temp_email');
    this.roleService.clearCache();
    // hasPin dan pin_email sengaja TIDAK dihapus agar next login langsung ke PIN verify
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
