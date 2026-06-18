import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  private params(period?: string): HttpParams {
    let p = new HttpParams();
    if (period) p = p.set('period', period);
    return p;
  }

  getOverview(period?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/performance/overview`, {
      headers: this.getHeaders(),
      params: this.params(period)
    });
  }

  getKpis(period?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/performance/kpis`, {
      headers: this.getHeaders(),
      params: this.params(period)
    });
  }

  getKpi(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/performance/kpis/${id}`, {
      headers: this.getHeaders()
    });
  }

  getFeedbacks(period?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/performance/feedbacks`, {
      headers: this.getHeaders(),
      params: this.params(period)
    });
  }

  getFeedback(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/performance/feedbacks/${id}`, {
      headers: this.getHeaders()
    });
  }

  acknowledgeFeedback(id: number | string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/performance/feedbacks/${id}/acknowledge`, {}, {
      headers: this.getHeaders()
    });
  }

  /** Map status mesin (completed/on_track/at_risk) ke label kartu. */
  static kpiStatusLabel(status: string): string {
    const map: { [k: string]: string } = {
      completed: 'COMPLETED',
      on_track: 'ON TRACK',
      at_risk: 'AT RISK'
    };
    return map[status] || status?.toUpperCase();
  }
}
