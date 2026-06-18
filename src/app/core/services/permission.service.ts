import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PermissionDraft {
  title: string;
  category: string;
  permission_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  attachment: string | null;
  attachment_name: string | null;
  attachment_size: string | null;
  attachment_type: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = environment.apiUrl;

  // Wizard Draft State
  draftRequest: PermissionDraft = {
    title: '',
    category: 'personal',
    permission_date: '',
    start_time: '',
    end_time: '',
    notes: '',
    attachment: null,
    attachment_name: null,
    attachment_size: null,
    attachment_type: null
  };

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/permission/requests`, {
      headers: this.getHeaders()
    });
  }

  getRequestDetail(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permission/requests/${id}`, {
      headers: this.getHeaders()
    });
  }

  submitRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/permission/request`, data, {
      headers: this.getHeaders()
    });
  }

  resetDraft() {
    this.draftRequest = {
      title: '',
      category: 'personal',
      permission_date: '',
      start_time: '',
      end_time: '',
      notes: '',
      attachment: null,
      attachment_name: null,
      attachment_size: null,
      attachment_type: null
    };
  }
}
