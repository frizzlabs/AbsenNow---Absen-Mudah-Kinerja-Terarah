import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProfileUpdate {
  phone?: string;
  personal_email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  uploadAvatar(file: File): Observable<any> {
    const form = new FormData();
    form.append('avatar', file);
    return this.http.post<any>(`${this.apiUrl}/profile/avatar`, form, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('auth_token')}`)
    }).pipe(
      tap(res => {
        if (res?.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  updateProfile(data: ProfileUpdate): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data, {
      headers: this.getHeaders()
    }).pipe(
      tap(res => {
        if (res?.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }
}
