import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** Optional month (1-12) and year filters. */
  getTimesheets(month?: number, year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    if (year) {
      params = params.set('year', year);
    }
    return this.http.get<any[]>(`${this.apiUrl}/timesheets`, {
      headers: this.getHeaders(),
      params
    });
  }

  getTimesheet(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/timesheets/${id}`, {
      headers: this.getHeaders()
    });
  }

  /** Submit a week's activities for approval. weekStart: any date within the week (Y-m-d). */
  submitTimesheet(weekStart: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/timesheets/submit`, { week_start: weekStart }, {
      headers: this.getHeaders()
    });
  }

  resubmitTimesheet(id: number | string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/timesheets/${id}/resubmit`, {}, {
      headers: this.getHeaders()
    });
  }
}
