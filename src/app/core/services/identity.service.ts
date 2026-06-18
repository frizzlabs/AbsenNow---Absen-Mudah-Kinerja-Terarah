import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IdentityService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('auth_token')}`);
  }

  getIdentity(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/identity`, { headers: this.headers() });
  }

  submitIdentity(data: {
    id_type: string;
    id_number: string;
    id_name: string;
    id_expiry?: string;
    photo_front?: File;
    photo_back?: File;
  }): Observable<any> {
    const form = new FormData();
    form.append('id_type', data.id_type);
    form.append('id_number', data.id_number);
    form.append('id_name', data.id_name);
    if (data.id_expiry) form.append('id_expiry', data.id_expiry);
    if (data.photo_front) form.append('photo_front', data.photo_front);
    if (data.photo_back) form.append('photo_back', data.photo_back);
    return this.http.post<any>(`${this.apiUrl}/identity`, form, { headers: this.headers() });
  }
}
