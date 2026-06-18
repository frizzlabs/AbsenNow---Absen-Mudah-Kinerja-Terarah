import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LeaveDraft {
  leave_type: string;
  start_date: string | null;
  end_date: string | null;
  delegate_user_id: number | null;
  delegate_name: string | null;
  reason: string;
  attachment: string | null;
  attachment_name: string | null;
  attachment_size?: string | null;
  attachment_type?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = environment.apiUrl;

  // Wizard Draft State
  draftRequest: LeaveDraft = {
    leave_type: 'annual',
    start_date: null,
    end_date: null,
    delegate_user_id: null,
    delegate_name: null,
    reason: '',
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

  getBalances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leave/balances`, {
      headers: this.getHeaders()
    });
  }

  getRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leave/requests`, {
      headers: this.getHeaders()
    });
  }

  getDelegates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leave/delegates`, {
      headers: this.getHeaders()
    });
  }

  submitRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/leave/request`, data, {
      headers: this.getHeaders()
    });
  }

  resetDraft() {
    this.draftRequest = {
      leave_type: 'annual',
      start_date: null,
      end_date: null,
      delegate_user_id: null,
      delegate_name: null,
      reason: '',
      attachment: null,
      attachment_name: null,
      attachment_size: null,
      attachment_type: null
    };
  }
}
