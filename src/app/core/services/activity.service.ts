import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ActivityDraft {
  title: string;
  project: string | null;
  project_color: string;
  category: string;
  activity_date: string;
  start_time: string;
  end_time: string;
  description: string | null;
}

export interface ActivitySummary {
  view: string;
  period_start: string;
  period_end: string;
  total_minutes: number;
  work_days: number;
  avg_daily_minutes: number;
  regular_minutes: number;
  overtime_minutes: number;
  activities_count: number;
  weekly_goal_minutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  /** view: daily | weekly | monthly. date: anchor (Y-m-d). */
  getActivities(view: string = 'daily', date?: string): Observable<any[]> {
    let params = new HttpParams().set('view', view);
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<any[]>(`${this.apiUrl}/activities`, {
      headers: this.getHeaders(),
      params
    });
  }

  getActivitiesInRange(start: string, end: string): Observable<any[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<any[]>(`${this.apiUrl}/activities`, {
      headers: this.getHeaders(),
      params
    });
  }

  getSummary(view: string = 'weekly', date?: string): Observable<ActivitySummary> {
    let params = new HttpParams().set('view', view);
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<ActivitySummary>(`${this.apiUrl}/activities/summary`, {
      headers: this.getHeaders(),
      params
    });
  }

  getActivity(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activities/${id}`, {
      headers: this.getHeaders()
    });
  }

  createActivity(data: ActivityDraft): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/activities`, data, {
      headers: this.getHeaders()
    });
  }

  updateActivity(id: number | string, data: Partial<ActivityDraft>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/activities/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteActivity(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/activities/${id}`, {
      headers: this.getHeaders()
    });
  }
}
