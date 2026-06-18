import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OvertimeDraft {
  title: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  attachment: string | null;
  attachment_name: string | null;
  attachment_size: string | null;
  attachment_type: string | null;
}

export interface OvertimeSummary {
  period: string;
  total_approved_hours: number;
  last_month_hours: number;
  trend_percent: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class OvertimeService {
  private apiUrl = environment.apiUrl;

  // Wizard Draft State
  draftRequest: OvertimeDraft = {
    title: '',
    overtime_date: '',
    start_time: '',
    end_time: '',
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

  getRequests(status: string = 'all'): Observable<any[]> {
    let params = new HttpParams();
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    return this.http.get<any[]>(`${this.apiUrl}/overtime/requests`, {
      headers: this.getHeaders(),
      params
    });
  }

  getRequestDetail(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/overtime/requests/${id}`, {
      headers: this.getHeaders()
    });
  }

  getSummary(): Observable<OvertimeSummary> {
    return this.http.get<OvertimeSummary>(`${this.apiUrl}/overtime/summary`, {
      headers: this.getHeaders()
    });
  }

  submitRequest(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/overtime/request`, data, {
      headers: this.getHeaders()
    });
  }

  resetDraft() {
    this.draftRequest = {
      title: '',
      overtime_date: '',
      start_time: '',
      end_time: '',
      reason: '',
      attachment: null,
      attachment_name: null,
      attachment_size: null,
      attachment_type: null
    };
  }
}
