import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getOrganizations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/organizations`, { headers: this.getHeaders() });
  }

  createOrganization(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/organizations`, data, { headers: this.getHeaders() });
  }

  updateOrganization(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/organizations/${id}`, data, { headers: this.getHeaders() });
  }
}
